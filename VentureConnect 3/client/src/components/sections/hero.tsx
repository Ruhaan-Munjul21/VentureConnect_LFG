import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Hero() {
  const scrollToWaitlist = () => {
    const element = document.getElementById('waitlist');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
            <Button 
              onClick={scrollToWaitlist}
              className="bg-gradient-to-r from-accent to-accent-purple text-accent-foreground px-8 py-4 text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              size="lg"
            >
              Request Early Access
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-accent text-accent px-8 py-4 text-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
              size="lg"
            >
              Watch Demo
            </Button>
          </motion.div>
          
          {/* Trust badges */}
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-8 opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="text-sm font-medium text-muted-foreground">Trusted by 100+ biotech startups</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">$50M+ in funding facilitated</span>
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
              <div className="w-8 h-8 bg-gradient-to-r from-accent to-accent-purple rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">WBV</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Backed by <span className="text-primary font-semibold">WestField Bio Ventures</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Hero image */}
      <div className="absolute bottom-10 right-10 hidden lg:block">
        <motion.img 
          src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
          alt="Biotech laboratory research" 
          className="rounded-2xl shadow-2xl w-80 h-60 object-cover opacity-80"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.8, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />
      </div>
    </section>
  );
}
