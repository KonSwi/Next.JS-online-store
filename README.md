# 🛒 Next.js Online Store

Projekt zaliczeniowy — sklep internetowy stworzony w **Next.js 14 (App Router)** zgodnie z makietą w [Figma](https://www.figma.com/design/qGSQCoBIGALuQ4Af5hrsiz/Exam_Next?node-id=1486-15478&t=aQBYwg9XpWvedRIG-1).

Hasło do pliku Figma: **Exam-Next-JS**

---

## 🚀 Funkcjonalności

- System logowania i rejestracji z użyciem **NextAuth.js**
- Strona główna z karuzelą kategorii i sekcją rekomendacji
- Lista produktów z filtrowaniem i sortowaniem
- Strona szczegółów produktu
- Koszyk zakupowy (backend + API)
- Proces checkoutu i finalizacji zamówienia
- Panel użytkownika z historią zamówień
- Obsługa **Prisma ORM + PostgreSQL**
- Dane początkowe inicjalizowane przez `prisma/seed.js`

---

## 🛠️ Stos technologiczny

- [Next.js 14](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/) (baza danych lokalnie)
- [NextAuth.js](https://next-auth.js.org/)

---

## 📦 Uruchomienie lokalne

1. Sklonuj repozytorium:

   ```bash
   git clone <link_do_repo>
   cd nextJS-online-store
   ```

2. Zainstaluj zależności:

   ```bash
   npm install
   ```

3. Uruchom bazę w Dockerze:

   ```bash
   docker-compose up -d
   ```

4. Wykonaj migracje i seed:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start aplikacji:
   ```bash
   npm run dev
   ```
   Aplikacja uruchomi się na [http://localhost:3000](http://localhost:3000)

---

## 🧪 Dane testowe

- **E-mail**: `test@example.com`
- **Telefon**: `+48123456789`
- **Hasło**: `123456`

---
