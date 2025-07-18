import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Globe, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';

export default function GetMatched() {
  const [user, setUser] = useState<any>(null);
  const [formStatus, setFormStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Check form completion status when user is logged in
  useEffect(() => {
    if (user) {
      checkFormStatus();
    }
  }, [user]);

  // Listen for Airtable form submissions
  useEffect(() => {
    const handleAirtableMessage = async (event: MessageEvent) => {
      // Check if this is an Airtable form submission message
      if (event.data && event.data.type === 'airtable-form-submission') {
        console.log('Airtable form submission received:', event.data);
        
        try {
          // Determine the email to use for the submission
          let submissionEmail = user?.email;
          
          // If user is not authenticated, check if form data contains email
          if (!submissionEmail && event.data.formData && event.data.formData.email) {
            submissionEmail = event.data.formData.email;
          }
          
          // If still no email, show error
          if (!submissionEmail) {
            console.error('No email available for form submission');
            alert('Please sign in with Google before submitting the form, or include your email in the form.');
            return;
          }
          
          // Call our backend endpoint to handle the submission
          const response = await fetch('/api/client/form-submission', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: submissionEmail,
              ...event.data.formData
            })
          });

          if (response.ok) {
            console.log('Form submission processed successfully');
            const responseData = await response.json();
            
            // If user was not authenticated but form was submitted successfully,
            // create a session and redirect to dashboard
            if (!user) {
              console.log('Manual form submission - creating session and redirecting to dashboard');
              
              // Use the new manual form submission endpoint that creates a session
              try {
                const manualResponse = await fetch('/api/client/manual-form-submission', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: submissionEmail,
                    ...event.data.formData
                  })
                });
                
                if (manualResponse.ok) {
                  const manualData = await manualResponse.json();
                  if (manualData.token) {
                    localStorage.setItem('clientToken', manualData.token);
                    localStorage.setItem('clientUser', JSON.stringify({ 
                      email: submissionEmail,
                      id: manualData.data.numericId 
                    }));
                    console.log('Manual form submission successful, redirecting to dashboard');
                    window.location.href = '/client/dashboard';
                    return;
                  }
                }
              } catch (manualError) {
                console.log('Manual form submission failed:', manualError);
              }
              
              // If manual submission fails, redirect to login page with instructions
              alert('Form submitted successfully! You can now sign in with your email to access your dashboard.');
              window.location.href = '/client/login';
            } else {
              // User was authenticated - redirect to dashboard to see updated state
                console.log('Form updated successfully, redirecting to dashboard');
                window.location.href = '/client/dashboard';
            }
          } else {
            console.error('Failed to process form submission');
            const errorData = await response.json();
            alert(`Form submission failed: ${errorData.message}`);
          }
        } catch (error) {
          console.error('Error processing form submission:', error);
          alert('Error submitting form. Please try again.');
        }
      }
    };

    // Add event listener for Airtable messages
    window.addEventListener('message', handleAirtableMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleAirtableMessage);
    };
  }, [user]);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      const storedUser = localStorage.getItem('clientUser');
      
      if (token) {
        // Verify token is valid by calling profile API
        const response = await fetch('/api/client/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
          // Check form status for authenticated users
          checkFormStatus();
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('clientToken');
          localStorage.removeItem('clientUser');
          setUser(null);
        }
      } else if (storedUser) {
        // Fallback to stored user if no token
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFormStatus = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      if (!token) return;

      const response = await fetch('/api/client/form-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormStatus(data.data);
        
        // In the simplified flow, we don't redirect based on form completion
        // Users can always access the dashboard and see the appropriate state
      }
    } catch (error) {
      console.error('Error checking form status:', error);
    }
  };



  function handleLogout() {
    setUser(null);
    setFormStatus(null);
    localStorage.removeItem('clientUser');
    localStorage.removeItem('clientToken');
  }

  // Handle form submission detection
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Listen for Airtable form submission messages
      if (event.data && event.data.type === 'airtable-form-submitted') {
        // Mark form as complete and redirect
        markFormComplete();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const markFormComplete = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      if (!token) return;

      const response = await fetch('/api/client/mark-form-complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Redirect to client portal
        window.location.href = '/client/dashboard';
      } else {
        const data = await response.json();
        if (data.data && data.data.missingFields) {
          console.error(`Form incomplete. Please fill out: ${data.data.missingFields.join(', ')}`);
        }
      }
    } catch (error) {
      console.error('Error marking form complete:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header matching Client Portal */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* VentriLinks Logo and Name - Clickable Home Link */}
              <div 
                className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={() => {
                  setLocation('/');
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
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
              
              {/* Header Navigation Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setLocation('/');
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Globe className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </header>

        {/* Sign in form content */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
            {/* VentriLinks icon */}
            <div className="flex justify-center mb-6">
              <img 
                src="/images/1.png" 
                alt="VentriLinks Logo" 
                className="h-16 w-16 rounded-full bg-white border border-gray-200 object-cover object-center" 
              />
            </div>
            
            <h2 className="text-2xl font-bold mb-6 text-center">Sign in to Access Beta</h2>
            
            {/* Email Login */}
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Sign in with your email and password to access the form
              </p>
              <button 
                onClick={() => setLocation('/client/login')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In with Email
              </button>
              
              {/* Don't have an account link */}
              <div className="mt-6 text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => setLocation('/client/login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create an account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Always render the form, but show warning if incomplete
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">VentriLinks</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.email}
            </span>
            <button onClick={handleLogout} className="text-blue-600 hover:text-blue-700">Sign out</button>
          </div>
        </div>
      </div>

      {/* Warning if form incomplete */}
      {formStatus && !formStatus.isComplete && (
        <div className="min-h-[200px] bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
              <p className="text-gray-600">
                Please complete your startup profile to access the client portal
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">Missing Information</h3>
              <p className="text-yellow-800 mb-4">
                The following fields need to be completed in your startup profile:
              </p>
              <ul className="list-disc list-inside text-yellow-800 space-y-1">
                {formStatus.missingFields.map((field: string) => (
                  <li key={field} className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  if (formRef.current) {
                    formRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Complete Form
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-12" ref={formRef}>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get Matched with VCs That Want to Fund You
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Our AI analyzes 2,000+ investor profiles to find VCs actively seeking startups like yours
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-600 mb-8">
            <span className="text-green-600">✓ Results in 24-48 hours</span>
            <span className="text-green-600">✓ Free sample matches</span>
            <span className="text-green-600">✓ No spam guarantee</span>
          </div>
        </div>
                
        {/* Better styled form container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-8 border-b border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Tell us about your startup
            </h3>
            <p className="text-gray-600">
              This information helps us find VCs that are actively looking for companies like yours
            </p>
          </div>
                    
          <div className="p-0 relative">
            {/* Overlay to hide Airtable branding */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-white z-10 pointer-events-none"></div>
                        
            <iframe
              src="https://airtable.com/embed/app768aQ07mCJoyu8/shrlLG8nRtAkRbXVn?backgroundColor=transparent"
              width="100%"
              height="800"
              frameBorder="0"
              style={{
                background: 'transparent',
                border: 'none'
              }}
            />
          </div>
        </div>
                
        {/* Next steps info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h4 className="text-lg font-semibold text-blue-900 mb-2">What happens next?</h4>
          <p className="text-blue-800 mb-4">
            After you submit this form, our team will review your information and create VC matches for your company. 
            You'll be automatically redirected to the client portal to view your matches.
          </p>
          <div className="flex items-center text-sm text-blue-700">
            <span className="mr-2">🔗</span>
            <span>You'll be redirected to the <a href="/client/dashboard" className="underline font-medium">Client Portal</a> after form submission</span>
          </div>
        </div>
                
        {/* Trust indicators below */}
        <div className="text-center mt-8">
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>🔒 Confidential & Secure</span>
            <span>🚀 Used by 500+ biotech founders</span>
            <span>⚡ AI-powered matching</span>
          </div>
        </div>
      </div>
    </div>
  );
}
