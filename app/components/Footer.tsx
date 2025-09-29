import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  const payments = [
    { src: "/payments/visa.png", alt: "Visa" },
    { src: "/payments/mastercard.png", alt: "Mastercard" },
    { src: "/payments/paypal.png", alt: "PayPal" },
    { src: "/payments/applepay.png", alt: "Apple Pay" },
    { src: "/payments/googlepay.png", alt: "Google Pay" },
  ];

  return (
    <footer className="mt-auto" style={{}}>
      <div style={{ maxWidth: "var(--container)", marginInline: "auto" }}>
        <div
          className="footerCard"
          style={{ padding: "8.75rem 3.75rem", background: "var(--panel)" }}
        >
          <div
            style={{
              display: "flex",
              gap: "2rem",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                gap: "1.5rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                className="h1"
                style={{ fontSize: "2.25rem", fontWeight: "600" }}
              >
                <span style={{ color: "var(--accent)" }}>Devstock</span>
                <span style={{ color: "var(--foreground)" }}>Hub</span>
              </div>
              <p
                className="muted"
                style={{
                  marginTop: "0.75rem",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                © {year} DevstockHub. All rights reserved.
              </p>

              <ul
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                {payments.map((p) => (
                  <li key={p.alt}>
                    <Image
                      src={p.src}
                      alt={p.alt}
                      width={48}
                      height={30}
                      className="h-11 w-auto object-contain"
                      priority={false}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <FooterCol
              title="Company"
              items={["About Us", "Contact", "Partner"]}
            />
            <FooterCol
              title="Social"
              items={["Instagram", "Twitter", "Facebook", "LinkedIn"]}
            />
            <FooterCol
              title="FAQ"
              items={["Account", "Deliveries", "Orders", "Payments"]}
            />
            <FooterCol
              title="Resources"
              items={["E-books", "Tutorials", "Course", "Blog"]}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div
        style={{
          fontSize: "1.25rem",
          fontWeight: "600",
          color: "var(--foreground)",
        }}
      >
        {title}
      </div>
      <ul
        style={{
          display: "grid",
          gap: "2rem",
          fontSize: "1rem",
          fontWeight: "500",
          color: "var(--muted)",
        }}
      >
        {items.map((i) => (
          <li key={i} style={{ cursor: "not-allowed", userSelect: "none" }}>
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
