import Navbar from "@/components/Home/Navbar";
import Hero from "@/components/Home/Hero";
import Features from "@/components/Home/Features";
import About from "@/components/Home/About";
import Footer from "@/components/Home/Footer";
import Mission from "@/components/Home/mission";

export default function Home() {
  return (
    <div className="bg-gray-50 text-gray-800">
      <Navbar />
      <Hero />
      <Features />
      <Mission/>
      <About />
      <Footer />
    </div>
  );
}