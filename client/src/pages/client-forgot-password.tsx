import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

export default function ClientForgotPassword() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Direct to support email for password reset
    window.location.href = `mailto:support@ventrilinks.com?subject=Password Reset Request&body=Hi,%0D%0A%0D%0AI need help resetting my password for my VentriLinks account.%0D%0A%0D%0AEmail: ${encodeURIComponent(email)}%0D%0A%0D%0AThank you!`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Header with proper navigation */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* VentriLinks Logo and Name - Clickable Home Link */}
            <div 
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => setLocation('/')}
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
            
            {/* Header Navigation Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation('/')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with proper spacing for fixed header */}
      <div className="flex flex-col items-center w-full pt-20">
        <img src="/images/1.png" alt="VentriLinks Logo" className="h-28 w-28 mb-4 rounded-full bg-white border border-gray-200 object-cover" style={{minWidth:'112px', objectPosition:'center'}} />
        
        {!success ? (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll help you reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your-email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full">
                  Contact Support
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button
                  variant="link"
                  onClick={() => setLocation('/client/login')}
                  className="text-blue-600 hover:text-blue-800 font-medium p-0 h-auto inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}