import React, { useState, useEffect } from 'react';
import { Building2, Loader2, RefreshCw, Eye, Send, Check, X, Download, Users, Target, TrendingUp, AlertCircle, ChevronDown, ChevronRight, Brain, BarChart3, Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AIRTABLE_API_KEY = 'patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f';
const BASE_ID = 'app768aQ07mCJoyu8';

const TABLES = {
  STARTUP_SUBMISSIONS: 'Startup Submissions',
  VC_DATABASE: 'VC Database', 
  MATCHES: 'Startup-VC Matches (POST GPT PRE-SCAN)'
};

const MATCH_FIELDS = {
  STARTUP_NAME: 'Startup Name',
  VC_NAME: 'VC Name', 
  GPT_FIT: 'GPT fit?',
  MANUALLY_APPROVED: 'Manually Approved?',
  SIMILARITY_SCORE: 'Similarity Score'
};

const SUBMISSION_FIELDS = {
  STARTUP_NAME: 'Startup Name',
  DRUG_MODALITY: 'Drug Modality',
  DISEASE_FOCUS: 'Disease Focus', 
  INVESTMENT_STAGE: 'Investment Stage',
  GEOGRAPHY: 'Geography',
  INVESTMENT_AMOUNT: 'Investment Amount',
  EMAIL: 'Email',
  PITCH_DECK_URL: 'Pitch Deck Public URL'
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

  async updateMatch(recordId: string, fields: Record<string, any>) {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.MATCHES}/${recordId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ fields })
      });
      return response.json();
    } catch (error) {
      console.error('Error updating match:', error);
      return null;
    }
  }
}

const airtable = new AirtableAPI();

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissions, setSubmissions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [vcs, setVCs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCompany, setExpandedCompany] = useState(null);
  
  // Add matching state
  const [isRunningMatch, setIsRunningMatch] = useState(false);
  const [selectedStartups, setSelectedStartups] = useState([]);
  const [matchingStatus, setMatchingStatus] = useState({});
  
  // Add analysis state
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [selectedForAnalysis, setSelectedForAnalysis] = useState([]);
  const [analysisStatus, setAnalysisStatus] = useState({});

  // Add premium applications state
  const [premiumApplications, setPremiumApplications] = useState([]);
  const [loadingPremiumApps, setLoadingPremiumApps] = useState(false);

  // Add debug console logs
  console.log("=== ADMIN COMPONENT LOADED ===");
  console.log("Submissions data:", submissions);
  console.log("Active tab:", activeTab);
  console.log("Selected startups:", selectedStartups);
  console.log("Matching status:", matchingStatus);

  // Add runMatching function
  const runMatching = async (startupId) => {
    console.log("Running matching for startup:", startupId);
    setIsRunningMatch(true);
    setMatchingStatus(prev => ({ ...prev, [startupId]: 'running' }));
    
    try {
      // Step 1: Update the "Run Match" field to checked
      const updateResponse = await fetch('/api/admin/update-startup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupId: startupId,
          runMatch: true
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update startup');
      }
      
      // Step 2: Trigger the matching software
      const matchingResponse = await fetch('/api/admin/run-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupId: startupId
        })
      });
      
      if (matchingResponse.ok) {
        setMatchingStatus(prev => ({ ...prev, [startupId]: 'completed' }));
        alert('Matching completed successfully!');
        // Refresh the data
        await loadData();
      } else {
        throw new Error('Failed to run matching');
      }
    } catch (error) {
      console.error('Error running matching:', error);
      setMatchingStatus(prev => ({ ...prev, [startupId]: 'error' }));
      alert('Error running matching. Please try again.');
    } finally {
      setIsRunningMatch(false);
    }
  };

  // Add batch matching function
  const runPDFAnalysis = async () => {
    if (selectedForAnalysis.length === 0) {
      alert('Please select at least one startup to analyze');
      return;
    }

    try {
      setIsRunningAnalysis(true);
      
      // Update status for selected startups to show they're being analyzed
      const newStatus = {};
      selectedForAnalysis.forEach(id => {
        newStatus[id] = 'analyzing';
      });
      setAnalysisStatus(prev => ({ ...prev, ...newStatus }));

      setDebugInfo(prev => prev + `🔬 Starting PDF analysis for ${selectedForAnalysis.length} startups...\n`);

      // Call the Python analysis script
      const analysisResponse = await fetch('/api/admin/run-pdf-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startupIds: selectedForAnalysis
        })
      });
      
      if (analysisResponse.ok) {
        const result = await analysisResponse.json();
        
        // Update status for all selected startups
        const completedStatus = {};
        selectedForAnalysis.forEach(id => {
          completedStatus[id] = 'completed';
        });
        setAnalysisStatus(prev => ({ ...prev, ...completedStatus }));
        
        setDebugInfo(prev => prev + `✅ PDF analysis completed for ${selectedForAnalysis.length} startups!\n`);
        alert(`PDF analysis completed for ${selectedForAnalysis.length} startups!`);
        setSelectedForAnalysis([]);
        await loadData();
      } else {
        throw new Error('Failed to run PDF analysis');
      }
    } catch (error) {
      console.error('Error running PDF analysis:', error);
      setDebugInfo(prev => prev + `❌ Error: ${error.message}\n`);
      alert('Error running PDF analysis. Please try again.');
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  const runBatchMatching = async () => {
    if (selectedStartups.length === 0) {
      alert('Please select at least one startup');
      return;
    }
    
    console.log("Running batch matching for:", selectedStartups);
    setIsRunningMatch(true);
    
    try {
      // Update all selected startups' "Run Match" field
      const updateResponse = await fetch('/api/admin/batch-update-startups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupIds: selectedStartups,
          runMatch: true
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update startups');
      }
      
      // Run matching for all selected
      const matchingResponse = await fetch('/api/admin/batch-run-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupIds: selectedStartups
        })
      });
      
      if (matchingResponse.ok) {
        // Update status for all selected startups
        const newStatus = {};
        selectedStartups.forEach(id => {
          newStatus[id] = 'completed';
        });
        setMatchingStatus(prev => ({ ...prev, ...newStatus }));
        
        alert(`Matching completed for ${selectedStartups.length} startups!`);
        setSelectedStartups([]);
        await loadData();
      } else {
        throw new Error('Failed to run batch matching');
      }
    } catch (error) {
      console.error('Error running batch matching:', error);
      alert('Error running batch matching. Please try again.');
    } finally {
      setIsRunningMatch(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setDebugInfo('Loading data...\n');
      
      const [submissionsData, matchesData, vcsData] = await Promise.all([
        airtable.getSubmissions(),
        airtable.getMatches(),
        airtable.getVCs()
      ]);
      
      setSubmissions(submissionsData);
      setMatches(matchesData);
      setVCs(vcsData);
      
      setDebugInfo(prev => prev + `✅ Loaded ${submissionsData.length} submissions\n`);
      setDebugInfo(prev => prev + `✅ Loaded ${matchesData.length} matches\n`);
      setDebugInfo(prev => prev + `✅ Loaded ${vcsData.length} VCs\n`);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setDebugInfo(prev => prev + `❌ Error: ${err.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMatch = async (matchId) => {
    try {
      await airtable.updateMatch(matchId, { [MATCH_FIELDS.MANUALLY_APPROVED]: true });
      await loadData();
    } catch (err) {
      console.error('Error approving match:', err);
    }
  };

  const handleRejectMatch = async (matchId) => {
    try {
      await airtable.updateMatch(matchId, { [MATCH_FIELDS.MANUALLY_APPROVED]: false });
      await loadData();
    } catch (err) {
      console.error('Error rejecting match:', err);
    }
  };

  const exportData = () => {
    const dataToExport = {
      submissions: submissions.length,
      matches: matches.length,
      approved: matches.filter(m => m.fields[MATCH_FIELDS.MANUALLY_APPROVED] === true).length
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendMatchesToClient = () => {
    const approvedMatches = matches.filter(match => 
      match.fields[MATCH_FIELDS.MANUALLY_APPROVED] === true
    );
    alert(`Would send ${approvedMatches.length} approved matches to client app`);
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = !searchTerm || 
      (submission.fields[SUBMISSION_FIELDS.STARTUP_NAME] && 
       submission.fields[SUBMISSION_FIELDS.STARTUP_NAME].toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Group matches by startup for the new matches view
  const matchesByStartup = matches.reduce((acc, match) => {
    const startupName = match.fields[MATCH_FIELDS.STARTUP_NAME];
    if (!acc[startupName]) {
      acc[startupName] = [];
    }
    acc[startupName].push(match);
    return acc;
  }, {});

  const startupNames = Object.keys(matchesByStartup);

  const stats = {
    totalSubmissions: submissions.length,
    totalMatches: matches.length,
    approvedMatches: matches.filter(m => m.fields[MATCH_FIELDS.MANUALLY_APPROVED] === true).length,
    gptApprovedMatches: matches.filter(m => m.fields[MATCH_FIELDS.GPT_FIT] === true).length
  };

  const toggleCompanyExpansion = (startupName) => {
    setExpandedCompany(expandedCompany === startupName ? null : startupName);
  };

  // Add this to your admin page component
  const [vcStatus, setVcStatus] = useState<any>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Function to check VC status
  const checkVCStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await fetch('/api/admin/vc-status');
      const data = await response.json();
      if (data.success) {
        setVcStatus(data.data);
      } else {
        alert('Failed to check VC status: ' + data.message);
      }
    } catch (error) {
      console.error('Error checking VC status:', error);
      alert('Error checking VC status');
    } finally {
      setStatusLoading(false);
    }
  };

  // Function to trigger VC sync
  const triggerVCSync = async () => {
    setSyncLoading(true);
    try {
      const response = await fetch('/api/admin/sync-vcs', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert('VC sync completed successfully!');
        // Refresh status after sync
        await checkVCStatus();
      } else {
        alert('VC sync failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error triggering VC sync:', error);
      alert('Error triggering VC sync');
    } finally {
      setSyncLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* VentriLinks Logo and Name - Clickable Home Link */}
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => window.location.href = '/'}
            >
              <img 
                src="/images/1.png" 
                alt="VentriLinks Logo" 
                className="h-8 w-8 mr-2 rounded-full bg-white border border-gray-200 object-cover object-center" 
              />
              <span className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">VentriLinks</span>
              <span className="ml-2 text-lg text-gray-600">Admin</span>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh
              </button>
              <button
                onClick={exportData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={sendMatchesToClient}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Send to Client
              </button>
              <a href="/admin/clients" className="text-blue-600 hover:text-blue-700">Client Management</a>
              <a href="/airtable-test" className="text-blue-600 hover:text-blue-700">Test Airtable</a>
              <a href="/" className="text-blue-600 hover:text-blue-700 flex items-center">
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'submissions', label: 'Submissions', icon: Users },
              { id: 'analysis', label: 'PDF Analysis', icon: Brain },
              { id: 'matches', label: 'Match Validation', icon: Target },
              { id: 'premium', label: 'Premium Applications', icon: Crown },
              { id: 'debug', label: 'Debug', icon: AlertCircle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Submissions</h3>
                <div className="text-3xl font-bold text-blue-600">{stats.totalSubmissions}</div>
                <p className="text-sm text-gray-600">Startups registered</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Matches</h3>
                <div className="text-3xl font-bold text-green-600">{stats.totalMatches}</div>
                <p className="text-sm text-gray-600">Generated matches</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual Approved</h3>
                <div className="text-3xl font-bold text-emerald-600">{stats.approvedMatches}</div>
                <p className="text-sm text-gray-600">Ready to send</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">GPT Approved</h3>
                <div className="text-3xl font-bold text-purple-600">{stats.gptApprovedMatches}</div>
                <p className="text-sm text-gray-600">AI recommendations</p>
              </div>
            </div>
          </div>
        )}

        {/* PDF Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Analysis Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">PDF Analysis & Scoring</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedForAnalysis([])}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={runPDFAnalysis}
                    disabled={isRunningAnalysis || selectedForAnalysis.length === 0}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isRunningAnalysis ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    {isRunningAnalysis ? 'Analyzing...' : 'Run PDF Analysis'}
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Select startups to analyze their pitch decks with AI. This will extract technical details, 
                  score them across 5 categories, and generate comprehensive investment analysis.
                </p>
                <p className="text-xs text-purple-600">
                  {selectedForAnalysis.length} startup(s) selected for analysis
                </p>
              </div>

              {/* Startup List for Analysis */}
              <div className="space-y-2">
                {submissions
                  .filter(sub => sub.fields['Non-Confidential Pitch Deck'])
                  .map(submission => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedForAnalysis.includes(submission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedForAnalysis(prev => [...prev, submission.id]);
                          } else {
                            setSelectedForAnalysis(prev => prev.filter(id => id !== submission.id));
                          }
                        }}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {submission.fields[SUBMISSION_FIELDS.STARTUP_NAME] || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {submission.fields[SUBMISSION_FIELDS.DRUG_MODALITY]} • {submission.fields[SUBMISSION_FIELDS.DISEASE_FOCUS]}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {submission.fields['Overall Score'] && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Score: {submission.fields['Overall Score']}/10
                        </span>
                      )}
                      
                      {analysisStatus[submission.id] === 'analyzing' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Loader2 className="animate-spin h-3 w-3 mr-1" />
                          Analyzing...
                        </span>
                      )}
                      
                      {analysisStatus[submission.id] === 'completed' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Complete
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Batch Selection Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search submissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedStartups.length} selected
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedStartups([])}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear Selection
                  </button>
                  {selectedStartups.length > 0 && (
                    <button
                      onClick={runBatchMatching}
                      disabled={isRunningMatch}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                    >
                      {isRunningMatch ? 'Running...' : `Run Matching (${selectedStartups.length})`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Submissions ({filteredSubmissions.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedStartups.length === filteredSubmissions.length && filteredSubmissions.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStartups(filteredSubmissions.map(s => s.id));
                            } else {
                              setSelectedStartups([]);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Startup Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drug Modality</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disease Focus</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment Stage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Geography</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedStartups.includes(submission.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStartups([...selectedStartups, submission.id]);
                              } else {
                                setSelectedStartups(selectedStartups.filter(id => id !== submission.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {submission.fields[SUBMISSION_FIELDS.STARTUP_NAME] || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.fields[SUBMISSION_FIELDS.EMAIL] || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.fields[SUBMISSION_FIELDS.DRUG_MODALITY] || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.fields[SUBMISSION_FIELDS.DISEASE_FOCUS] || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.fields[SUBMISSION_FIELDS.INVESTMENT_STAGE] || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.fields[SUBMISSION_FIELDS.GEOGRAPHY] || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.fields[SUBMISSION_FIELDS.INVESTMENT_AMOUNT] || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {matchingStatus[submission.id] ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              matchingStatus[submission.id] === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : matchingStatus[submission.id] === 'running'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {matchingStatus[submission.id] === 'completed' ? '✓ Complete' :
                               matchingStatus[submission.id] === 'running' ? '⏳ Running' : '✗ Error'}
                            </span>
                          ) : (
                            <span className="text-gray-500">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => runMatching(submission.id)}
                            disabled={isRunningMatch}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                          >
                            {isRunningMatch ? 'Running...' : 'Run Matching'}
                          </button>
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Match Validation Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Match Validation ({startupNames.length} companies)
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {startupNames.map((startupName) => {
                  const startupMatches = matchesByStartup[startupName];
                  const approvedCount = startupMatches.filter(m => m.fields[MATCH_FIELDS.MANUALLY_APPROVED] === true).length;
                  const pendingCount = startupMatches.filter(m => 
                    m.fields[MATCH_FIELDS.MANUALLY_APPROVED] !== true && 
                    m.fields[MATCH_FIELDS.MANUALLY_APPROVED] !== false
                  ).length;
                  
                  return (
                    <div key={startupName}>
                      {/* Company Row Header */}
                      <div 
                        className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => toggleCompanyExpansion(startupName)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {expandedCompany === startupName ? (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{startupName}</h3>
                              <p className="text-sm text-gray-500">
                                {startupMatches.length} matches • {approvedCount} approved • {pendingCount} pending
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{startupMatches.length} matches</div>
                            <div className="text-sm text-gray-500">{approvedCount} approved</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Matches Table */}
                      {expandedCompany === startupName && (
                        <div className="bg-gray-50">
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    VC Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    GPT Fit
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Manual Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {startupMatches.map((match) => (
                                  <tr key={match.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {match.fields[MATCH_FIELDS.VC_NAME] || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        match.fields[MATCH_FIELDS.GPT_FIT]
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {match.fields[MATCH_FIELDS.GPT_FIT] ? '✓ Yes' : '✗ No'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        match.fields[MATCH_FIELDS.MANUALLY_APPROVED] === true
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : match.fields[MATCH_FIELDS.MANUALLY_APPROVED] === false
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {match.fields[MATCH_FIELDS.MANUALLY_APPROVED] === true 
                                          ? '✓ Approved' 
                                          : match.fields[MATCH_FIELDS.MANUALLY_APPROVED] === false 
                                          ? '✗ Rejected' 
                                          : '⏳ Pending'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                      {match.fields[MATCH_FIELDS.MANUALLY_APPROVED] !== true && (
                                        <button
                                          onClick={() => handleApproveMatch(match.id)}
                                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                                        >
                                          <Check className="h-3 w-3 mr-1" />
                                          Approve
                                        </button>
                                      )}
                                      {match.fields[MATCH_FIELDS.MANUALLY_APPROVED] !== false && (
                                        <button
                                          onClick={() => handleRejectMatch(match.id)}
                                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                                        >
                                          <X className="h-3 w-3 mr-1" />
                                          Reject
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Premium Applications Tab */}
        {activeTab === 'premium' && (
          <PremiumApplicationsPanel 
            applications={premiumApplications}
            loading={loadingPremiumApps}
            onRefresh={loadPremiumApplications}
          />
        )}

        {/* Debug Tab */}
        {activeTab === 'debug' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Debug Information</h2>
            </div>
            <div className="p-6">
              <pre className="bg-gray-50 rounded-lg p-4 text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                {debugInfo || 'No debug information available...'}
              </pre>
            </div>
          </div>
        )}

        {/* VC Database Management */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">VC Database Management</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={checkVCStatus}
                disabled={statusLoading}
                className="flex items-center gap-2"
              >
                {statusLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Check VC Status
              </Button>
              
              <Button 
                onClick={triggerVCSync}
                disabled={syncLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {syncLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Sync VCs from Airtable
              </Button>
            </div>

            {vcStatus && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">VC Database Status</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded">
                    <div className="text-2xl font-bold text-blue-600">{vcStatus.totalVCs}</div>
                    <div className="text-sm text-gray-600">Total VCs</div>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="text-2xl font-bold text-green-600">{vcStatus.withWebsites}</div>
                    <div className="text-sm text-gray-600">VCs with Websites</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Problematic VCs (should have websites):</h4>
                  <div className="space-y-1">
                    {vcStatus.problematicVCs.map((vc: any) => (
                      <div key={vc.name} className={`text-sm p-2 rounded ${vc.website ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {vc.name}: {vc.website ? `✅ ${vc.website}` : '❌ No website'}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Sample VCs with Websites:</h4>
                  <div className="space-y-1">
                    {vcStatus.sampleWithWebsites.map((vc: any) => (
                      <div key={vc.name} className="text-sm text-gray-700">
                        {vc.name}: {vc.website}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for viewing submission details */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedSubmission.fields[SUBMISSION_FIELDS.STARTUP_NAME] || 'Submission Details'}
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <pre className="bg-gray-50 rounded p-4 text-sm">
                {JSON.stringify(selectedSubmission.fields, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Function to load premium applications
  async function loadPremiumApplications() {
    setLoadingPremiumApps(true);
    try {
      // Try to get from dedicated premium table first, fallback to general submissions
      let response;
      try {
        response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Premium%20Support%20Applications`, {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        // Fallback to general submissions table
        const filterFormula = encodeURIComponent(`{Application Type} = "Premium Support"`);
        response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Startup%20Submissions?filterByFormula=${filterFormula}`, {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.ok) {
        const data = await response.json();
        setPremiumApplications(data.records || []);
        console.log('✅ Premium applications loaded:', data.records?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error loading premium applications:', error);
    } finally {
      setLoadingPremiumApps(false);
    }
  }

  // Load premium applications on component mount
  useEffect(() => {
    if (activeTab === 'premium') {
      loadPremiumApplications();
    }
  }, [activeTab]);
}

// Premium Applications Panel Component
function PremiumApplicationsPanel({ applications, loading, onRefresh }: {
  applications: any[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [selectedApp, setSelectedApp] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const updateApplicationStatus = async (appId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Premium%20Support%20Applications/${appId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Application Status': newStatus,
            'Reviewed At': new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        onRefresh(); // Reload applications
        console.log('✅ Application status updated');
      }
    } catch (error) {
      console.error('❌ Error updating application status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 8) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 6) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Premium Support Applications</h2>
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {applications.length} applications
            </span>
          </div>
          <Button onClick={onRefresh} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No premium support applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const fields = app.fields;
              const priorityScore = fields['Priority Score'] || 0;
              
              return (
                <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {fields['Company Name'] || 'Unknown Company'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {fields['Founder Name']} • {fields['Email']}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(priorityScore)}`}>
                        Priority: {priorityScore}/10
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fields['Application Status'])}`}>
                        {fields['Application Status'] || 'Under Review'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Stage:</span>
                      <p className="text-gray-600">{fields['Current Stage']}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Funding Goal:</span>
                      <p className="text-gray-600">{fields['Funding Goal']}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Industry:</span>
                      <p className="text-gray-600">{fields['Industry Focus']}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Timeline:</span>
                      <p className="text-gray-600">{fields['Fundraising Timeline']}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="font-medium text-gray-700">Challenges:</span>
                    <p className="text-gray-600 text-sm mt-1">{fields['Specific Challenges']}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Applied: {new Date(fields['Submitted At']).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedApp(app)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      {fields['Application Status'] !== 'Approved' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateApplicationStatus(app.id, 'Approved')}
                          disabled={updatingStatus}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      )}
                      {fields['Application Status'] !== 'Rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => updateApplicationStatus(app.id, 'Rejected')}
                          disabled={updatingStatus}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedApp.fields['Company Name']} - Premium Application
              </h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Why Premium Support?</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedApp.fields['Why Premium Support']}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Specific Challenges</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedApp.fields['Specific Challenges']}
                  </p>
                </div>

                {selectedApp.fields['Additional Info'] && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selectedApp.fields['Additional Info']}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <span className="font-medium text-gray-700">Previous Funding:</span>
                    <p className="text-gray-600">{selectedApp.fields['Previous Funding Raised'] || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Current Revenue:</span>
                    <p className="text-gray-600">{selectedApp.fields['Current Revenue'] || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Team Size:</span>
                    <p className="text-gray-600">{selectedApp.fields['Team Size'] || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Pitch Deck Status:</span>
                    <p className="text-gray-600">{selectedApp.fields['Pitch Deck Status']}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}