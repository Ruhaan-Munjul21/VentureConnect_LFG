import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, RefreshCw, LogOut } from 'lucide-react';

export default function ClientTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const testClientLogin = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Test 1: Login
      const loginResponse = await fetch('/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'sarah@bionova.com' })
      });
      
      const loginData = await loginResponse.json();
      
      if (!loginData.success) {
        throw new Error(`Login failed: ${loginData.message}`);
      }
      
      const token = loginData.token;
      setTestResults(prev => ({ ...prev, login: { success: true, token } }));
      
      // Test 2: Profile
      const profileResponse = await fetch('/api/client/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profileData = await profileResponse.json();
      
      if (!profileData.success) {
        throw new Error(`Profile failed: ${profileData.message}`);
      }
      
      setTestResults(prev => ({ ...prev, profile: { success: true, data: profileData.data } }));
      
      // Test 3: Matches
      const matchesResponse = await fetch('/api/client/matches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const matchesData = await matchesResponse.json();
      
      if (!matchesData.success) {
        throw new Error(`Matches failed: ${matchesData.message}`);
      }
      
      setTestResults(prev => ({ ...prev, matches: { success: true, data: matchesData.data } }));
      
      setSuccess('✅ All client portal tests passed! The system is working correctly.');
      
    } catch (err: any) {
      console.error('Test error:', err);
      setError(`Test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults({});
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Portal Test</h1>
          <p className="text-gray-600">Testing the complete client authentication and data flow</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-4 mb-8">
          <Button onClick={testClientLogin} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Client Tests
              </>
            )}
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/client/login'}>
            Go to Client Login
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Login Test</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.login ? (
                <div className="text-green-600">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Passed
                  <div className="text-xs text-gray-500 mt-2">
                    Token: {testResults.login.token?.substring(0, 20)}...
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Not tested</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Test</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.profile ? (
                <div className="text-green-600">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Passed
                  <div className="text-xs text-gray-500 mt-2">
                    Company: {testResults.profile.data?.companyName}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Not tested</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matches Test</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.matches ? (
                <div className="text-green-600">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Passed
                  <div className="text-xs text-gray-500 mt-2">
                    {testResults.matches.data?.length || 0} matches found
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Not tested</div>
              )}
            </CardContent>
          </Card>
        </div>

        {testResults.profile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profile Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(testResults.profile.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {testResults.matches && (
          <Card>
            <CardHeader>
              <CardTitle>Matches Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(testResults.matches.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 