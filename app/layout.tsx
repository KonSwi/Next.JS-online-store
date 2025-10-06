import "./global.css";

export const metadata = {
  title: "DevstockHub",
  description: "E-commerce in Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
