import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const scrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate to home first
    if (location !== '/') {
      setLocation('/#' + sectionId);
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleSectionClick = (sectionId: string) => {
    if (location === '/') {
      scrollToSection(sectionId);
    } else {
      // Navigate to home page with hash
      window.location.href = '/#' + sectionId;
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer hover:text-accent transition-colors">VentriLinks</h1>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => handleSectionClick('how-it-works')} 
                className="text-muted-foreground hover:text-accent transition-colors duration-200"
              >
                How it Works
              </button>
              <button 
                onClick={() => handleSectionClick('features')} 
                className="text-muted-foreground hover:text-accent transition-colors duration-200"
              >
                Features
              </button>
              <button 
                onClick={() => handleSectionClick('testimonials')} 
                className="text-muted-foreground hover:text-accent transition-colors duration-200"
              >
                Testimonials
              </button>
              <Link href="/team">
                <span className="text-muted-foreground hover:text-accent transition-colors duration-200 cursor-pointer">
                  Team
                </span>
              </Link>
              <button 
                onClick={() => handleSectionClick('contact')} 
                className="text-muted-foreground hover:text-accent transition-colors duration-200"
              >
                Contact
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => handleSectionClick('waitlist')}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Join Beta
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t">
              <button 
                onClick={() => handleSectionClick('how-it-works')} 
                className="block px-3 py-2 text-muted-foreground hover:text-accent"
              >
                How it Works
              </button>
              <button 
                onClick={() => handleSectionClick('features')} 
                className="block px-3 py-2 text-muted-foreground hover:text-accent"
              >
                Features
              </button>
              <button 
                onClick={() => handleSectionClick('testimonials')} 
                className="block px-3 py-2 text-muted-foreground hover:text-accent"
              >
                Testimonials
              </button>
              <Link href="/team">
                <span className="block px-3 py-2 text-muted-foreground hover:text-accent cursor-pointer">
                  Team
                </span>
              </Link>
              <button 
                onClick={() => handleSectionClick('contact')} 
                className="block px-3 py-2 text-muted-foreground hover:text-accent"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
