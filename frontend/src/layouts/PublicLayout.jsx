import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* Website Navbar */}
      <Navbar />

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Website Footer */}
      <Footer />
    </div>
  );
}
