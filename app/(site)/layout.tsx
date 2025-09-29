import Header from "../components/Header";
import Footer from "../components/Footer";
import CartToaster from "@/app/components/ui/CartToaster";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main
        className="container"
        style={{
          padding: "0 2.5rem 5rem",
        }}
      >
        {children}
      </main>
      <Footer />
      <CartToaster />
    </>
  );
}
