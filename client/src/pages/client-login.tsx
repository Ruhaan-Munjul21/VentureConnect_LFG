import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation, Link } from 'wouter';

export default function ClientLogin() {
  const [, setLocation] = useLocation();

  // Function to handle navigation to home with scroll to top
  const navigateToHome = () => {
    setLocation('/');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with VentriLinks logo and navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* VentriLinks Logo and Name - Clickable */}
            <div 
              className="flex items-center cursor-pointer" 
              onClick={navigateToHome}
            >
              <img 
                src="/images/1.png" 
                alt="VentriLinks Logo" 
                className="h-10 w-10 mr-2 rounded-full bg-white border border-gray-200 object-cover object-center" 
                style={{minWidth:'40px'}} 
              />
              <h1 className="text-xl font-bold text-primary hover:text-accent transition-colors">
                VentriLinks
              </h1>
            </div>
            
            <Button variant="outline" onClick={navigateToHome}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Login Form Content */}
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-primary mb-6">
            Client Portal Login
          </h1>
          {/* Login form would go here */}
          <p className="text-center text-muted-foreground">
            Login form will be implemented here
          </p>
        </div>
      </div>
    </div>
  );
}