/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaClient, Prisma } from "@prisma/client";
import { fileURLToPath } from "url";

// --- ESM __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Prisma ---
const prisma = new PrismaClient();

// --- Ścieżka do danych CSV ---
const DATA_DIR = path.join(__dirname, "data");

// ====== CSV helpers ======
function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

type Row = Record<string, string>;

function parseCSV(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length === 0) return [];
  const headers = splitCSVLine(lines[0]).map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cols = splitCSVLine(line);
    const row: Row = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] ?? "").trim();
    });
    return row;
  });
}

function readCSV(file: string): Row[] {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) throw new Error(`Brak pliku: ${p}`);
  return parseCSV(fs.readFileSync(p, "utf8"));
}

// --- helpers ---
function normalizePhone(raw: string | null | undefined): string {
  return String(raw ?? "").replace(/[()\s-]/g, "");
}

// ====== MAIN ======
async function main() {
  // czysty start (zależności!)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.verificationToken.deleteMany();

  // --- categories ---
  const categoriesCsv = readCSV("categories.csv");
  await prisma.category.createMany({
    data: categoriesCsv.map((c) => ({
      name: c.name,
      description: c.description || null,
      imageUrl: c.imageUrl || null,
      exploreInfo: c.exploreInfo || null,
    })),
    skipDuplicates: true,
  });
  const categories = await prisma.category.findMany();
  const catByName = Object.fromEntries(
    categories.map((c) => [c.name.trim(), c])
  );

  // --- brands ---
  const brandsCsv = readCSV("brands.csv");
  await prisma.brand.createMany({
    data: brandsCsv.map((b) => ({
      name: b.name,
      imageUrl: b.imageUrl || null,
    })),
    skipDuplicates: true,
  });
  const brands = await prisma.brand.findMany();
  const brandByName = Object.fromEntries(brands.map((b) => [b.name.trim(), b]));

  // --- products ---
  const productsCsv = readCSV("products.csv");
  type ProductSeed = {
    name: string;
    description: string | null;
    price: Prisma.Decimal; // ważne
    stock: number;
    imageUrl: string | null;
    categoryId: number;
    brandId: number;
  };
  const data: ProductSeed[] = [];
  let skipped = 0;

  productsCsv.forEach((p, idx) => {
    const cat = catByName[(p.categoryName || "").trim()];
    const br = brandByName[(p.brandName || "").trim()];
    if (!cat || !br) {
      console.warn(
        `[SEED] Pomijam wiersz ${idx + 2}: cat="${p.categoryName}" brand="${
          p.brandName
        }"`
      );
      skipped++;
      return;
    }
    const priceStr = (p.price ?? "0.00").trim() || "0.00";
    const stock = Number(p.stock ?? 0);

    data.push({
      name: p.name,
      description: p.description || null,
      price: new Prisma.Decimal(priceStr),
      stock,
      imageUrl: p.imageUrl || null,
      categoryId: cat.id,
      brandId: br.id,
    });
  });

  if (data.length) {
    await prisma.product.createMany({ data });
  }

  // --- test user ---
  const passwordHash = await bcrypt.hash("123456", 10);
  const addressJson = {
    line1: "Testowy 1/2",
    city: "Warszawa",
    province: "Mazowieckie",
    postalCode: "12-345",
    country: "Poland",
  };

  const testUser = await prisma.user.create({
    data: {
      email: "test@example.com",
      phone: normalizePhone("+48 123 456 789"),
      firstName: "Test",
      passwordHash,
      address: JSON.stringify(addressJson),
      avatarUrl: "https://i.ibb.co/G3F0qFSb/avatar.png",
    },
    select: { id: true },
  });

  // --- przykładowe zamówienie ---
  const someProducts = await prisma.product.findMany({
    orderBy: { id: "asc" },
    take: 2,
    select: { id: true, price: true },
  });

  if (someProducts.length > 0) {
    const itemsPayload: {
      productId: number;
      quantity: number;
      priceAtPurchase: Prisma.Decimal;
    }[] = [];

    itemsPayload.push({
      productId: someProducts[0].id,
      quantity: 1,
      priceAtPurchase: new Prisma.Decimal(someProducts[0].price),
    });
    if (someProducts[1]) {
      itemsPayload.push({
        productId: someProducts[1].id,
        quantity: 2,
        priceAtPurchase: new Prisma.Decimal(someProducts[1].price),
      });
    }

    const total = itemsPayload.reduce((s, it) => {
      const n = new Prisma.Decimal(it.priceAtPurchase).toNumber();
      return s + n * it.quantity;
    }, 0);

    await prisma.order.create({
      data: {
        userId: testUser.id,
        status: "COMPLETED",
        totalAmount: new Prisma.Decimal(total.toFixed(2)),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        orderItems: {
          create: itemsPayload.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            priceAtPurchase: it.priceAtPurchase,
          })),
        },
      },
    });
  }

  console.log(
    `Seed OK. categories=${categories.length}, brands=${brands.length}, products=${data.length}, skipped=${skipped}`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
