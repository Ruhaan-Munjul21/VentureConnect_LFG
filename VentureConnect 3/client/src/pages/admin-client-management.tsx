import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Users, 
  Target, 
  Plus, 
  Mail, 
  Phone, 
  Lock, 
  Unlock, 
  Edit, 
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Eye,
  Send,
  RefreshCw,
  Save,
  X,
  Link
} from 'lucide-react';

interface ClientCompany {
  id: number;
  companyName: string;
  email: string;
  contactName: string;
  phone?: string;
  sector?: string;
  stage?: string;
  fundingGoal?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VCInvestor {
  id: number;
  name: string;
  firm: string;
  email?: string;
  phone?: string;
  investmentFocus?: string;
  investmentStage?: string;
  geography?: string;
  isActive: boolean;
}

interface ClientMatch {
  id: string;
  startupName: string;
  vcName: string;
  gptFit: boolean;
  manuallyApproved: boolean;
  similarityScore: number;
  clientAccess: 'Locked' | 'Unlocked';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminClientManagement() {
  const [submissions, setSubmissions] = useState<ClientCompany[]>([]);
  const [matches, setMatches] = useState<ClientMatch[]>([]);
  const [vcs, setVCs] = useState<VCInvestor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedStartup, setExpandedStartup] = useState<string | null>(null);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [editingStartup, setEditingStartup] = useState<ClientCompany | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMatch, setShowAddMatch] = useState<string | null>(null);

  // New company form
  const [newCompany, setNewCompany] = useState({
    companyName: '',
    email: '',
    contactName: '',
    phone: '',
    sector: '',
    stage: '',
    fundingGoal: '',
    description: ''
  });

  // Edit company form
  const [editCompany, setEditCompany] = useState({
    companyName: '',
    email: '',
    contactName: '',
    phone: '',
    sector: '',
    stage: '',
    fundingGoal: '',
    description: ''
  });

  // Add match form
  const [newMatch, setNewMatch] = useState({
    startupName: '',
    vcName: '',
    gptFit: false,
    manuallyApproved: true,
    clientAccess: 'Locked' as 'Locked' | 'Unlocked'
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 2 * 60 * 1000); // 2 minutes
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [submissionsRes, matchesRes, vcsRes] = await Promise.all([
        fetch('/api/admin/clients'),
        fetch('/api/admin/matches'),
        fetch('/api/admin/vcs')
      ]);

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setSubmissions(submissionsData.data);
      }

      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setMatches(matchesData.data);
      }

      if (vcsRes.ok) {
        const vcsData = await vcsRes.json();
        setVCs(vcsData.data);
      }
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompany)
      });

      if (response.ok) {
        setSuccess('Company created successfully!');
        setShowCreateCompany(false);
        setNewCompany({
          companyName: '',
          email: '',
          contactName: '',
          phone: '',
          sector: '',
          stage: '',
          fundingGoal: '',
          description: ''
        });
        await loadData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create company');
      }
    } catch (err) {
      setError('Failed to create company');
    }
  };

  const startEditCompany = (startup: ClientCompany) => {
    setEditCompany({
      companyName: startup.companyName,
      email: startup.email,
      contactName: startup.contactName,
      phone: startup.phone || '',
      sector: startup.sector || '',
      stage: startup.stage || '',
      fundingGoal: startup.fundingGoal || '',
      description: startup.description || ''
    });
    setEditingStartup(startup);
  };

  const saveEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStartup) return;

    try {
      const response = await fetch(`/api/admin/clients/${editingStartup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCompany)
      });

      if (response.ok) {
        setSuccess('Company updated successfully!');
        setEditingStartup(null);
        await loadData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update company');
      }
    } catch (err) {
      setError('Failed to update company');
    }
  };

  const deleteCompany = async (startup: ClientCompany) => {
    if (!confirm(`Are you sure you want to delete ${startup.companyName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/clients/${startup.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Company deleted successfully!');
        await loadData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete company');
      }
    } catch (err) {
      setError('Failed to delete company');
    }
  };

  const toggleMatchAccess = async (matchId: string, currentAccess: string) => {
    try {
      const response = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientAccess: currentAccess === 'Unlocked' ? 'Locked' : 'Unlocked' })
      });

      if (response.ok) {
        setSuccess(`Match ${currentAccess === 'Unlocked' ? 'locked' : 'unlocked'} successfully!`);
        await loadData();
      } else {
        setError('Failed to update match access');
      }
    } catch (err) {
      setError('Failed to update match access');
    }
  };

  const getStartupMatches = (clientId: number) => {
    return matches.filter(match => match.startupName === submissions.find(s => s.id === clientId)?.companyName);
  };

  const getMatchStats = (clientId: number) => {
    const startupMatches = getStartupMatches(clientId);
    return {
      total: startupMatches.length,
      locked: startupMatches.filter(m => m.clientAccess === 'Locked').length,
      unlocked: startupMatches.filter(m => m.clientAccess === 'Unlocked').length
    };
  };

  const filteredSubmissions = submissions.filter(submission => {
    const companyName = submission.companyName || '';
    const email = submission.email || '';
    const contactName = submission.contactName || '';
    const searchLower = searchTerm.toLowerCase();
    
    return companyName.toLowerCase().includes(searchLower) || 
           email.toLowerCase().includes(searchLower) ||
           contactName.toLowerCase().includes(searchLower);
  });

  const addMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddMatch) return;

    try {
      console.log('Creating match with data:', newMatch);
      
      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMatch)
      });

      const responseData = await response.json();
      console.log('Match creation response:', responseData);

      if (response.ok) {
        setSuccess('Match created successfully!');
        setShowAddMatch(null);
        setNewMatch({
          startupName: '',
          vcName: '',
          gptFit: false,
          manuallyApproved: true,
          clientAccess: 'Locked'
        });
        await loadData();
      } else {
        setError(responseData.message || 'Failed to create match');
      }
    } catch (err) {
      console.error('Error creating match:', err);
      setError('Failed to create match');
    }
  };

  const startAddMatch = (startup: ClientCompany) => {
    setNewMatch({
      startupName: startup.companyName,
      vcName: '',
      gptFit: false,
      manuallyApproved: true,
      clientAccess: 'Locked'
    });
    setShowAddMatch(startup.id.toString());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading client management data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Client Management</h1>
                <p className="text-sm text-gray-600">Manage startup companies and their VC access</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={async () => { setLoading(true); await loadData(); setLoading(false); }} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />} Refresh
              </Button>
              <Button onClick={() => window.location.href = '/admin'}>
                Back to Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Startup Companies</h2>
            <p className="text-gray-600">Manage {submissions.length} companies</p>
          </div>
          <Dialog open={showCreateCompany} onOpenChange={setShowCreateCompany}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Startup Company</DialogTitle>
                <DialogDescription>
                  Create a new startup company entry
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={createCompany} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Company Name *</label>
                    <Input
                      value={newCompany.companyName}
                      onChange={(e) => setNewCompany({...newCompany, companyName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={newCompany.email}
                      onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Contact Name</label>
                    <Input
                      value={newCompany.contactName}
                      onChange={(e) => setNewCompany({...newCompany, contactName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={newCompany.phone}
                      onChange={(e) => setNewCompany({...newCompany, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Sector</label>
                    <Input
                      value={newCompany.sector}
                      onChange={(e) => setNewCompany({...newCompany, sector: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stage</label>
                    <Input
                      value={newCompany.stage}
                      onChange={(e) => setNewCompany({...newCompany, stage: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Funding Goal</label>
                    <Input
                      value={newCompany.fundingGoal}
                      onChange={(e) => setNewCompany({...newCompany, fundingGoal: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Company Description</label>
                  <Textarea
                    value={newCompany.description}
                    onChange={(e) => setNewCompany({...newCompany, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateCompany(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Company</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search companies by name, email, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Companies List */}
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => {
            const stats = getMatchStats(submission.id);
            const isExpanded = expandedStartup === submission.companyName;
            const startupMatches = getStartupMatches(submission.id);

            return (
              <Card key={submission.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedStartup(isExpanded ? null : submission.companyName)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg">{submission.companyName}</CardTitle>
                        <CardDescription className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {submission.email}
                          </span>
                          {submission.contactName && (
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {submission.contactName}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Matches</div>
                        <div className="text-lg font-semibold">{stats.total}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Unlocked</div>
                        <div className="text-lg font-semibold text-green-600">{stats.unlocked}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Locked</div>
                        <div className="text-lg font-semibold text-orange-600">{stats.locked}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            startAddMatch(submission);
                          }}
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditCompany(submission);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCompany(submission);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="border-t bg-gray-50">
                    {/* Company Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-white rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Sector</label>
                        <p className="text-sm">{submission.sector || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Stage</label>
                        <p className="text-sm">{submission.stage || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Funding Goal</label>
                        <p className="text-sm">{submission.fundingGoal || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-sm">{submission.phone || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* VC Matches */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">VC Matches ({startupMatches.length})</h4>
                        <Button
                          size="sm"
                          onClick={() => startAddMatch(submission)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Match
                        </Button>
                      </div>
                      {startupMatches.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No VC matches found for this company</p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => startAddMatch(submission)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Match
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {startupMatches.map((match) => {
                            return (
                              <div key={match.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <h5 className="font-medium">{match.vcName}</h5>
                                    <Badge className={match.clientAccess === 'Unlocked' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                      {match.clientAccess === 'Unlocked' ? (
                                        <>
                                          <Unlock className="h-3 w-3 mr-1" />
                                          Unlocked
                                        </>
                                      ) : (
                                        <>
                                          <Lock className="h-3 w-3 mr-1" />
                                          Locked
                                        </>
                                      )}
                                    </Badge>
                                    {match.manuallyApproved && (
                                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                                        Approved
                                      </Badge>
                                    )}
                                    {match.gptFit && (
                                      <Badge variant="outline" className="text-green-600 border-green-600">
                                        GPT Fit
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Similarity Score: {Number(match.similarityScore || 0).toFixed(2)}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleMatchAccess(match.id, match.clientAccess)}
                                  >
                                    {match.clientAccess === 'Unlocked' ? 'Lock' : 'Unlock'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      // TODO: Implement view details
                                      console.log('View match details:', match);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {filteredSubmissions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'No startup companies have been submitted yet.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Company Dialog */}
      <Dialog open={!!editingStartup} onOpenChange={() => setEditingStartup(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Startup Company</DialogTitle>
            <DialogDescription>
              Update the startup company information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEditCompany} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  value={editCompany.companyName}
                  onChange={(e) => setEditCompany({...editCompany, companyName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={editCompany.email}
                  onChange={(e) => setEditCompany({...editCompany, email: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Contact Name</label>
                <Input
                  value={editCompany.contactName}
                  onChange={(e) => setEditCompany({...editCompany, contactName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={editCompany.phone}
                  onChange={(e) => setEditCompany({...editCompany, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Sector</label>
                <Input
                  value={editCompany.sector}
                  onChange={(e) => setEditCompany({...editCompany, sector: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stage</label>
                <Input
                  value={editCompany.stage}
                  onChange={(e) => setEditCompany({...editCompany, stage: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Funding Goal</label>
                <Input
                  value={editCompany.fundingGoal}
                  onChange={(e) => setEditCompany({...editCompany, fundingGoal: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Company Description</label>
              <Textarea
                value={editCompany.description}
                onChange={(e) => setEditCompany({...editCompany, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingStartup(null)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Match Dialog */}
      <Dialog open={!!showAddMatch} onOpenChange={() => setShowAddMatch(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add VC Match</DialogTitle>
            <DialogDescription>
              Create a new match between a startup and VC investor
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addMatch} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Startup Name</label>
                <Input
                  value={newMatch.startupName}
                  onChange={(e) => setNewMatch({...newMatch, startupName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">VC Name</label>
                <Select
                  value={newMatch.vcName}
                  onValueChange={(value) => setNewMatch({...newMatch, vcName: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a VC" />
                  </SelectTrigger>
                  <SelectContent>
                    {vcs
                      .filter((vc) => vc.name && vc.name.trim() !== '')
                      .map((vc) => (
                        <SelectItem key={vc.id} value={vc.name}>
                          {vc.name} - {vc.firm || 'Unknown Firm'}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Client Access</label>
                <Select
                  value={newMatch.clientAccess}
                  onValueChange={(value: 'Locked' | 'Unlocked') => setNewMatch({...newMatch, clientAccess: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Locked">Locked</SelectItem>
                    <SelectItem value="Unlocked">Unlocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="gptFit"
                  checked={newMatch.gptFit}
                  onChange={(e) => setNewMatch({...newMatch, gptFit: e.target.checked})}
                />
                <label htmlFor="gptFit" className="text-sm">GPT Fit</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="manuallyApproved"
                  checked={newMatch.manuallyApproved}
                  onChange={(e) => setNewMatch({...newMatch, manuallyApproved: e.target.checked})}
                />
                <label htmlFor="manuallyApproved" className="text-sm">Manually Approved</label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowAddMatch(null)}>
                Cancel
              </Button>
              <Button type="submit">
                <Link className="h-4 w-4 mr-2" />
                Create Match
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 