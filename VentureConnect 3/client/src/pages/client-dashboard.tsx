import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Users, 
  Target, 
  TrendingUp, 
  Lock, 
  Unlock, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin,
  Calendar,
  MessageSquare,
  LogOut,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface VCInvestor {
  id: number;
  name: string;
  firm: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  investmentFocus?: string;
  investmentStage?: string;
  geography?: string;
  portfolioSize?: string;
  description?: string;
}

interface OutreachProgress {
  id: number;
  status: string;
  contactDate?: string;
  responseDate?: string;
  meetingDate?: string;
  notes?: string;
  updatedAt: string;
}

interface ClientMatch {
  id: number;
  isUnlocked: boolean;
  assignedAt: string;
  notes?: string;
  vcInvestor: VCInvestor;
  progress?: OutreachProgress;
}

interface ClientProfile {
  id: number;
  companyName: string;
  email: string;
  contactName: string;
  phone?: string;
  sector?: string;
  stage?: string;
  fundingGoal?: string;
  description?: string;
}

const STATUS_OPTIONS = [
  { value: 'not_contacted', label: 'Not Contacted', color: 'bg-gray-100 text-gray-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
  { value: 'responded', label: 'Responded', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled', color: 'bg-purple-100 text-purple-800' },
  { value: 'deal_closed', label: 'Deal Closed', color: 'bg-green-100 text-green-800' },
];

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [matches, setMatches] = useState<ClientMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<ClientMatch | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('clientUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [formComplete, setFormComplete] = useState<boolean | null>(null);

  // Remove login form and redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation('/client/login');
      return;
    }
    // Check form completion status
    const checkFormStatus = async () => {
      const token = localStorage.getItem('clientToken');
      if (!token) {
        setLocation('/client/login');
        return;
      }
      try {
        const res = await fetch('/api/client/form-status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.data.isComplete) {
            setLocation('/get-matched');
          } else {
            setFormComplete(true);
          }
        } else {
          setLocation('/get-matched');
        }
      } catch {
        setLocation('/get-matched');
      }
    };
    checkFormStatus();
  }, [user, setLocation]);

  const loadDashboardData = async () => {
    const token = localStorage.getItem('clientToken');
    if (!token) return;

    try {
      setLoading(true);
      const [profileRes, matchesRes] = await Promise.all([
        fetch('/api/client/profile', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/client/matches', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.data);
      }

      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setMatches(matchesData.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data when user is authenticated and form is complete
  useEffect(() => {
    if (user && formComplete) {
      loadDashboardData();
    }
  }, [user, formComplete]);

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('clientUser');
    localStorage.removeItem('googleUser');
    localStorage.removeItem('clientToken');
    setLocation('/client/login');
  }

  if (!user || formComplete === null) {
    // Show nothing or a loading spinner while checking auth/form status
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const updateProgress = async (matchId: number, status: string, notes: string) => {
    const token = localStorage.getItem('clientToken');
    if (!token) return;

    try {
      setUpdatingProgress(true);
      const response = await fetch(`/api/client/matches/${matchId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        await loadDashboardData();
        setProgressDialogOpen(false);
      }
    } catch (err) {
      setError('Failed to update progress');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: matches.length,
      unlocked: matches.filter(m => m.isUnlocked).length,
      contacted: matches.filter(m => m.progress?.status === 'contacted').length,
      responded: matches.filter(m => m.progress?.status === 'responded').length,
      meetings: matches.filter(m => m.progress?.status === 'meeting_scheduled').length,
      deals: matches.filter(m => m.progress?.status === 'deal_closed').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">VentriLinks Client Portal</h1>
                {profile && (
                  <p className="text-sm text-gray-600">{profile.companyName}</p>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Unlock className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.unlocked}</p>
                  <p className="text-sm text-gray-600">Unlocked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.contacted}</p>
                  <p className="text-sm text-gray-600">Contacted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.responded}</p>
                  <p className="text-sm text-gray-600">Responded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.meetings}</p>
                  <p className="text-sm text-gray-600">Meetings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.deals}</p>
                  <p className="text-sm text-gray-600">Deals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {matches.map((match) => (
            <Card key={match.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{match.vcInvestor?.name || "Unknown VC"}</CardTitle>
                    <CardDescription>{match.vcInvestor?.firm || ""}</CardDescription>
                  </div>
                  <Badge variant={match.isUnlocked ? "default" : "secondary"}>
                    {match.isUnlocked ? (
                      <>
                        <Unlock className="h-3 w-3 mr-1" />
                        Unlocked
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Teaser
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Investment Focus</p>
                  <p className="text-sm">{match.vcInvestor?.investmentFocus || 'Not specified'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Stage & Geography</p>
                  <p className="text-sm">
                    {match.vcInvestor?.investmentStage} • {match.vcInvestor?.geography}
                  </p>
                </div>

                {match.progress && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Status</p>
                    <Badge 
                      className={STATUS_OPTIONS.find(s => s.value === match.progress?.status)?.color}
                    >
                      {STATUS_OPTIONS.find(s => s.value === match.progress?.status)?.label}
                    </Badge>
                  </div>
                )}

                {match.isUnlocked && (
                  <div className="space-y-2">
                    {match.vcInvestor?.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <a href={`mailto:${match.vcInvestor.email}`} className="text-blue-600 hover:underline">
                          {match.vcInvestor.email}
                        </a>
                      </div>
                    )}
                    {match.vcInvestor?.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <a href={`tel:${match.vcInvestor.phone}`} className="text-blue-600 hover:underline">
                          {match.vcInvestor.phone}
                        </a>
                      </div>
                    )}
                    {match.vcInvestor?.linkedin && (
                      <div className="flex items-center text-sm">
                        <Linkedin className="h-4 w-4 mr-2 text-gray-400" />
                        <a href={match.vcInvestor.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          LinkedIn
                        </a>
                      </div>
                    )}
                    {match.vcInvestor?.website && (
                      <div className="flex items-center text-sm">
                        <Globe className="h-4 w-4 mr-2 text-gray-400" />
                        <a href={match.vcInvestor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation(`/vc-timeline?matchId=${match.id}`)}
                  >
                    View Timeline
                  </Button>

                  <Button 
                    size="sm"
                    onClick={() => {
                      setSelectedMatch(match);
                      setProgressDialogOpen(true);
                    }}
                  >
                    Update Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {matches.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
              <p className="text-gray-600">
                Your VentriLinks team will assign VC matches to your company soon.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Progress Update Dialog */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Outreach Progress</DialogTitle>
            <DialogDescription>
              Track your progress with {selectedMatch?.vcInvestor.name}
            </DialogDescription>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select 
                  defaultValue={selectedMatch.progress?.status || 'not_contacted'}
                  onValueChange={(value) => {
                    setSelectedMatch({
                      ...selectedMatch,
                      progress: {
                        ...selectedMatch.progress,
                        status: value
                      } as OutreachProgress
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Add notes about your outreach..."
                  value={selectedMatch.progress?.notes || ''}
                  onChange={(e) => {
                    setSelectedMatch({
                      ...selectedMatch,
                      progress: {
                        ...selectedMatch.progress,
                        notes: e.target.value
                      } as OutreachProgress
                    });
                  }}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setProgressDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateProgress(
                    selectedMatch.id, 
                    selectedMatch.progress?.status || 'not_contacted',
                    selectedMatch.progress?.notes || ''
                  )}
                  disabled={updatingProgress}
                >
                  {updatingProgress ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Progress'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 