import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLocation, Link } from "wouter";

export default function Hero() {
  const [, setLocation] = useLocation();

  const handleGetMatched = () => {
    setLocation('/get-matched');
  };

  return (
    <section className="relative min-h-screen flex items-center molecular-bg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50"></div>
      
      {/* Floating molecular elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-accent rounded-full animate-float"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-accent-purple rounded-full animate-float" style={{animationDelay: "-2s"}}></div>
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-accent rounded-full animate-float" style={{animationDelay: "-4s"}}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-primary mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Supercharge Your{" "}
            <span className="gradient-text">Biotech Fundraising</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            AI-matched capital connections for early-stage drug development startups. 
            Find the right investors, faster.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/get-matched">
              <Button 
                className="bg-gradient-to-r from-accent to-accent-purple text-accent-foreground px-8 py-4 text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                Get Matched
              </Button>
            </Link>
          </motion.div>
          
          {/* Trust badges */}
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-8 opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="text-sm font-medium text-muted-foreground">Connecting biotech startups with the right VCs</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Streamlining biotech-VC matchmaking</span>
            </div>
          </motion.div>

          {/* Incubator Badge */}
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="inline-flex items-center bg-white/90 rounded-full px-6 py-3 shadow-lg">
              <img src="/images/westfield.png" alt="Westfield Bio Ventures" className="w-8 h-8 rounded-full object-contain mr-3 bg-white border border-gray-200" />
              <span className="text-sm font-medium text-muted-foreground">
                Backed by <span className="text-primary font-semibold">WestField Bio Ventures</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Hero image */}
      {/* Removed the scientist/lab image and its container for a cleaner layout */}
    </section>
  );
}