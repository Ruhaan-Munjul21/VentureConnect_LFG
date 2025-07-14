import { Linkedin, Twitter, Github } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="bg-primary text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">VentriLinks</h3>
            <p className="text-gray-300 mb-6 max-w-md">
              AI-powered matchmaking platform connecting early-stage biotech startups with the right venture capital investors.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-accent transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-accent transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-accent transition-colors">
                <Github className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToSection('how-it-works')} 
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  How it Works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('features')} 
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <Link href="/team">
                  <span className="text-gray-300 hover:text-accent transition-colors cursor-pointer">
                    Team
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 VentriLinks. All rights reserved. | Connecting biotech innovation with capital.
          </p>
        </div>
      </div>
    </footer>
  );
}
