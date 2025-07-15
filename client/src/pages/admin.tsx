import React, { useState, useEffect } from 'react';
import { Building2, Loader2, RefreshCw, Eye, Send, Check, X, Download, Users, Target, TrendingUp, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

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
              { id: 'matches', label: 'Match Validation', icon: Target },
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
}