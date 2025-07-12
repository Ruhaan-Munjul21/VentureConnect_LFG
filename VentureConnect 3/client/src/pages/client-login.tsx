import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Building2, Lock } from 'lucide-react';

export default function ClientLogin() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [startupName, setStartupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Debug logging
    console.log('=== FRONTEND LOGIN DEBUG ===');
    console.log('Form values:');
    console.log('- email:', email, '(length:', email.length, ')');
    console.log('- password:', password ? '[FILLED]' : '[EMPTY]', '(length:', password.length, ')');
    console.log('Request payload:', { email, password });
    
    // Check if any field is empty
    if (!email.trim() || !password.trim()) {
      console.log('❌ Form validation failed - empty fields detected');
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    console.log('✅ Form validation passed');
    
    try {
      const requestBody = { email, password };
      console.log('Sending request to /api/client/login');
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      if (data.success) {
        console.log('✅ Login successful! Setting auth state and redirecting...');
        if (data.token) {
          // Store token
          localStorage.setItem('clientToken', data.token);
          
          // Store user info (we'll get this from the profile endpoint)
          const userInfo = {
            email: email,
            token: data.token,
            loginTime: new Date().toISOString()
          };
          localStorage.setItem('clientUser', JSON.stringify(userInfo));
          
          console.log('LOGIN: Saving user data:', userInfo);
          console.log('LOGIN: Using identifier:', userInfo.email);
          console.log('LOGIN: Token stored:', data.token);
          console.log('LOGIN: User data stored in localStorage');
          
          console.log('✅ Auth state set, redirecting to dashboard...');
          setSuccess('Login successful! Redirecting to dashboard...');
          
          // Immediate redirect without timeout
          console.log('🚀 Redirecting to dashboard...');
          console.log('Current location before redirect:', window.location.pathname);
          setLocation('/client/dashboard');
          console.log('✅ setLocation called');
          setTimeout(() => {
            console.log('Current location after redirect:', window.location.pathname);
          }, 100);
        } else {
          setError('Login successful but no token received');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form event:', e);
    console.log('Form target:', e.target);
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Debug logging
    console.log('=== FRONTEND REGISTRATION DEBUG ===');
    console.log('Form values:');
    console.log('- email:', email, '(length:', email.length, ')');
    console.log('- password:', password ? '[FILLED]' : '[EMPTY]', '(length:', password.length, ')');
    console.log('- startupName:', startupName, '(length:', startupName.length, ')');
    console.log('Request payload:', { email, password, startupName });
    
    // Check if any field is empty
    if (!email.trim() || !password.trim() || !startupName.trim()) {
      console.log('❌ Form validation failed - empty fields detected');
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    console.log('✅ Form validation passed');
    
    try {
      const requestBody = { email, password, startupName };
      console.log('Sending request to /api/client/register');
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('/api/client/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      if (data.success) {
        console.log('✅ Registration successful! Setting auth state and redirecting...');
        if (data.token) {
          // Store token
          localStorage.setItem('clientToken', data.token);
          
          // Store user info
          const userInfo = {
            email: email,
            startupName: startupName,
            token: data.token,
            loginTime: new Date().toISOString()
          };
          localStorage.setItem('clientUser', JSON.stringify(userInfo));
          
          console.log('REGISTER: Saving user data:', userInfo);
          console.log('REGISTER: Using identifier:', userInfo.email);
          console.log('REGISTER: Startup name:', userInfo.startupName);
          console.log('REGISTER: Token stored:', data.token);
          console.log('REGISTER: User data stored in localStorage');
          
          console.log('✅ Auth state set, redirecting to dashboard...');
          setSuccess('Account created! Redirecting to dashboard...');
          
          // Immediate redirect without timeout
          console.log('🚀 Redirecting to dashboard...');
          console.log('Current location before redirect:', window.location.pathname);
          setLocation('/client/dashboard');
          console.log('✅ setLocation called');
          setTimeout(() => {
            console.log('Current location after redirect:', window.location.pathname);
          }, 100);
        } else {
          setSuccess('Account created! You can now log in.');
          setMode('login');
        }
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center w-full">
        <img src="/images/1.png" alt="VentriLinks Logo" className="h-28 w-28 mb-4 rounded-full bg-white border border-gray-200 object-cover" style={{minWidth:'112px', objectPosition:'center'}} />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Client Portal</CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Sign in with your email and password to access your VC matches'
                : 'Create an account to access your VC matches'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4 gap-2">
              <Button variant={mode === 'login' ? 'default' : 'outline'} onClick={() => setMode('login')} disabled={mode === 'login'}>Login</Button>
              <Button variant={mode === 'register' ? 'default' : 'outline'} onClick={() => setMode('register')} disabled={mode === 'register'}>Create Account</Button>
            </div>
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
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

              {mode === 'register' && (
                <div className="space-y-2">
                  <label htmlFor="startupName" className="text-sm font-medium">Startup Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="startupName"
                      type="text"
                      placeholder="Your startup name"
                      value={startupName}
                      onChange={(e) => setStartupName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Don't have access?{' '}
                <a
                  href="/get-matched"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Apply for VentriLinks
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 