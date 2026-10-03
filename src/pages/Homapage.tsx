import Navbar from "@/components/Home/Navbar";
import Hero from "@/components/Home/Hero";
import Features from "@/components/Home/Features";
import Workflow from "@/components/Home/Workflow";
import About from "@/components/Home/About";
import Footer from "@/components/Home/Footer";

export default function Home() {
  return (
    <div className="bg-white text-stone-900 antialiased">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Workflow />
        <About />
      </main>
      <Footer />
    </div>
  );
}
