import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Building2, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function ClientLogin() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, companyName }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Login successful! Redirecting to dashboard...');
        if (data.token) {
          localStorage.setItem('clientToken', data.token);
          setTimeout(() => setLocation('/client/dashboard'), 2000);
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
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/client/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, companyName }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Account created! You can now log in.');
        setMode('login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add Google login handler with debug logging
  async function handleGoogleLoginSuccess(credentialResponse: any) {
    console.log('[GoogleLogin] Handler called', credentialResponse);
    if (!credentialResponse.credential) {
      setError('Google sign-in failed: No credential');
      console.error('[GoogleLogin] No credential');
      return;
    }
    const decoded: any = jwtDecode(credentialResponse.credential);
    console.log('[GoogleLogin] Decoded JWT:', decoded);
    // Send to backend for session/cookie
    try {
      const resp = await fetch('/api/client/oauth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: decoded.email,
          name: decoded.name,
          googleUserId: decoded.sub
        })
      });
      const data = await resp.json();
      console.log('[GoogleLogin] /api/client/oauth-login response:', data);
      if (data.success && data.token) {
        localStorage.setItem('clientToken', data.token);
        // Immediately check form status
        console.log('[GoogleLogin] Checking form status...');
        const statusResp = await fetch('/api/client/form-status', {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        console.log('[GoogleLogin] /api/client/form-status status:', statusResp.status);
        if (statusResp.ok) {
          const statusData = await statusResp.json();
          console.log('[GoogleLogin] /api/client/form-status response:', statusData);
          if (statusData.data && statusData.data.isComplete) {
            console.log('[GoogleLogin] Form complete, redirecting to /client/dashboard');
            window.location.href = '/client/dashboard';
          } else {
            console.log('[GoogleLogin] Form incomplete, redirecting to /get-matched');
            window.location.href = '/get-matched';
          }
        } else {
          setError('Failed to check form status');
          console.error('[GoogleLogin] Failed to check form status');
        }
      } else {
        setError(data.message || 'Google login failed');
        console.error('[GoogleLogin] OAuth login failed:', data);
      }
    } catch (err) {
      setError('Network error during Google login');
      console.error('[GoogleLogin] Network error:', err);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Client Portal</CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Sign in with your company email, company name, and password to access your VC matches'
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
              <label htmlFor="email" className="text-sm font-medium">Company Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your-company@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Your Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
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
          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => setError('Google sign-in failed')}
            />
          </div>
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
  );
} 