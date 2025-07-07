import Navigation from "@/components/layout/navigation";
import Hero from "@/components/sections/hero";
import HowItWorks from "@/components/sections/how-it-works";
import Features from "@/components/sections/features";
import Testimonials from "@/components/sections/testimonials";
import Waitlist from "@/components/sections/waitlist";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Waitlist />
      <Footer />
    </div>
  );
}
