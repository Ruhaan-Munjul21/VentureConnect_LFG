import Navigation from "@/components/layout/navigation";
import Hero from "@/components/sections/hero";
import HowItWorks from "@/components/sections/how-it-works";
import Features from "@/components/sections/features";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <HowItWorks />
      <Features />
      <Footer />
    </div>
  );
}
