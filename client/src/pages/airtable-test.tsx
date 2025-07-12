import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const AIRTABLE_API_KEY = 'patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f';
const BASE_ID = 'app768aQ07mCJoyu8';

const TABLES = {
  STARTUP_SUBMISSIONS: 'Startup Submissions',
  VC_DATABASE: 'VC Database', 
  MATCHES: 'Startup-VC Matches (POST GPT PRE-SCAN)'
};

class AirtableAPI {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `https://api.airtable.com/v0/${BASE_ID}`;
    this.headers = {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  async getSubmissions() {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.STARTUP_SUBMISSIONS}`, {
        headers: this.headers
      });
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  }

  async getMatches() {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.MATCHES}`, {
        headers: this.headers
      });
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  }

  async getVCs() {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.VC_DATABASE}`, {
        headers: this.headers
      });
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching VCs:', error);
      return [];
    }
  }
}

const airtable = new AirtableAPI();

export default function AirtableTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [data, setData] = useState<any>({});

  const testConnection = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const [submissions, matches, vcs] = await Promise.all([
        airtable.getSubmissions(),
        airtable.getMatches(),
        airtable.getVCs()
      ]);
      
      setData({
        submissions: submissions.length,
        matches: matches.length,
        vcs: vcs.length,
        sampleSubmission: submissions[0] || null,
        sampleMatch: matches[0] || null,
        sampleVC: vcs[0] || null
      });
      
      setSuccess(`✅ Successfully connected to Airtable! Found ${submissions.length} submissions, ${matches.length} matches, and ${vcs.length} VCs.`);
      
    } catch (err) {
      console.error('Error testing connection:', err);
      setError('Failed to connect to Airtable. Please check your API key and base ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Airtable Connection Test</h1>
          <p className="text-gray-600">Testing connection to your Airtable base</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{data.submissions || 0}</div>
              <p className="text-sm text-gray-600">Startup submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{data.matches || 0}</div>
              <p className="text-sm text-gray-600">VC matches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>VCs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{data.vcs || 0}</div>
              <p className="text-sm text-gray-600">VC investors</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.sampleSubmission && (
            <Card>
              <CardHeader>
                <CardTitle>Sample Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
                  {JSON.stringify(data.sampleSubmission, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {data.sampleMatch && (
            <Card>
              <CardHeader>
                <CardTitle>Sample Match</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
                  {JSON.stringify(data.sampleMatch, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 flex space-x-4">
          <Button onClick={testConnection} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/admin/client-management'}>
            Go to Client Management
          </Button>
        </div>
      </div>
    </div>
  );
} 