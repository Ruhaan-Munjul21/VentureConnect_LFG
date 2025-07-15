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
  AlertCircle,
  FileText
} from 'lucide-react';
import { useRef } from 'react';


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
  vcName?: string; // Add vcName field from backend
  vcInvestor: VCInvestor;
  progress?: OutreachProgress;
  matchReasoning?: string; // Add matchReasoning field
  portfolioReasoning?: string; // Add portfolioReasoning field
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

// CountdownTimer component
const CountdownTimer = ({ submissionTime }: { submissionTime: string }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const submission = new Date(submissionTime);
      const now = new Date();
      const twentyFourHoursLater = new Date(submission.getTime() + 24 * 60 * 60 * 1000);
      const timeDiff = twentyFourHoursLater.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setIsExpired(true);
        setTimeRemaining('00:00:00');
        return;
      }

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [submissionTime]);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Processing Your Matches
        </h3>
        <p className="text-blue-700 mb-4">
          Our AI is analyzing thousands of VCs to find your perfect matches
        </p>
        {!isExpired ? (
          <div className="bg-white rounded-lg p-4 border border-blue-300">
            <p className="text-sm text-blue-600 mb-2">Time remaining:</p>
            <div className="text-3xl font-mono font-bold text-blue-900">
              {timeRemaining}
            </div>
            <p className="text-xs text-blue-500 mt-2">
              Results will be ready within 24 hours
            </p>
          </div>
        ) : (
          <div className="bg-green-100 rounded-lg p-4 border border-green-300">
            <p className="text-green-800 font-semibold">
              ✅ Processing Complete! Check your matches below.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ClientDashboard() {
  console.log('=== CLIENT DASHBOARD COMPONENT LOADED ===');
  console.log('Dashboard component rendering...');
  
  // Move modal state hooks to the top
  const [reasoningModalOpen, setReasoningModalOpen] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState<string | null>(null);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [currentPortfolioReasoning, setCurrentPortfolioReasoning] = useState<string | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedMatchForFeedback, setSelectedMatchForFeedback] = useState<ClientMatch | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [matches, setMatches] = useState<ClientMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<ClientMatch | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [user, setUser] = useState(() => {
    console.log('=== INITIALIZING USER STATE ===');
    try {
    const stored = localStorage.getItem('clientUser');
      console.log('Stored user data:', stored);
      const parsed = stored ? JSON.parse(stored) : null;
      console.log('Parsed user data:', parsed);
      return parsed;
    } catch (err) {
      console.error('Error parsing user data:', err);
      return null;
    }
  });
  
  // Dashboard state management
  const [submissionTime, setSubmissionTime] = useState<string | null>(null);
  const [dashboardState, setDashboardState] = useState<'form-incomplete' | 'processing' | 'results-ready'>('form-incomplete');
  const [formStatus, setFormStatus] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: get core fields
  const CORE_FIELDS = [
    'Drug Modality',
    'Disease Focus',
    'Investment Stage',
    'Geography',
    'Investment Amount',
  ];

  // Helper: format time remaining
  function formatTime(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  console.log('=== DASHBOARD STATE DEBUG ===');
  console.log('User state:', user);
  console.log('Dashboard state:', dashboardState);
  console.log('Loading state:', loading);
  console.log('Error state:', error);
  console.log('Client token:', localStorage.getItem('clientToken'));
  console.log('Client user:', localStorage.getItem('clientUser'));

    // Check authentication - NO VERIFICATION GATES
  useEffect(() => {
      console.log('=== DASHBOARD AUTH CHECK ===');
      console.log('User state:', user);
      console.log('Client token:', localStorage.getItem('clientToken'));
      console.log('Client user:', localStorage.getItem('clientUser'));
      
    if (!user) {
        console.log('❌ No user state, redirecting to login');
        setLocation('/client/login');
        return;
      }
      
      console.log('✅ User authenticated, checking dashboard state...');
      // User is authenticated - DIRECT ACCESS to dashboard
      // No form verification, no gates, just check state
      checkDashboardState();
  }, [user, setLocation]);

  const loadDashboardData = async () => {
    const token = localStorage.getItem('clientToken');
    if (!token) return;

    try {
      setLoading(true);
      console.log('Loading dashboard data...');
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
          console.log('Profile data loaded:', profileData.data);
          console.log('=== PROFILE API RESPONSE DEBUG ===');
          console.log('Profile response status:', profileRes.status);
          console.log('Profile response headers:', profileRes.headers);
          console.log('Profile raw data:', profileData);
          console.log('Profile data type:', typeof profileData);
          console.log('Profile data keys:', Object.keys(profileData || {}));
          console.log('Profile data.data keys:', Object.keys(profileData.data || {}));
          console.log('Profile company name:', profileData.data?.companyName);
          console.log('Profile email:', profileData.data?.email);
        setProfile(profileData.data);
        } else {
          console.log('Profile request failed:', profileRes.status);
          console.log('Profile error response:', await profileRes.text());
      }

      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        console.log('=== MATCHES DEBUG ===');
        console.log('Raw matches response:', matchesData);
        console.log('Matches data array:', matchesData.data);
        console.log('Number of matches:', matchesData.data?.length || 0);
        
        // Debug each match
        if (matchesData.data && matchesData.data.length > 0) {
          matchesData.data.forEach((match: any, index: number) => {
            console.log(`Match ${index + 1}:`, {
              id: match.id,
              vcName: match.vcName,
              isUnlocked: match.isUnlocked,
              clientAccess: match.clientAccess,
              startupName: match.startupName,
              fullMatch: match
            });
          });
        }
        
        setMatches(matchesData.data);
      } else {
        console.log('Matches request failed:', matchesRes.status);
        const errorText = await matchesRes.text();
        console.log('Matches error response:', errorText);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      console.log('Setting loading to false after loading data');
      setLoading(false);
    }
  };

    // Update checkDashboardState to store formStatus and handle timer
    const checkDashboardState = async () => {
      console.log('=== CHECKING DASHBOARD STATE ===');
      const token = localStorage.getItem('clientToken');
      console.log('Token available:', !!token);
      
      if (!token) {
        console.log('❌ No token found, cannot check dashboard state');
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching form status from /api/client/form-status...');
        const res = await fetch('/api/client/form-status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Form status response:', res);
        const data = await res.json();
        setFormStatus(data.data);
        console.log('Form status data:', data);
        console.log('Form completion status:', data.data?.isComplete);
        console.log('Form completion time:', data.data?.completionTime);
        console.log('Submission time:', data.data?.submissionTime);
        
        // Store submission time for timer
        if (data.data?.submissionTime) {
          setSubmissionTime(data.data.submissionTime);
        }
        
        if (res.ok) {
          if (!data.data.isComplete) {
            // Check core fields
            const missingCore = CORE_FIELDS.filter(f => (data.data.missingFields || []).includes(f));
            console.log('Missing core fields:', missingCore);
            if (missingCore.length === 0) {
              // All core fields filled but form not marked complete - show processing
              console.log('⏳ All core fields complete, but form not marked complete - showing processing');
              setDashboardState('processing');
            } else {
              setDashboardState('form-incomplete');
            }
            loadDashboardData();
          } else {
            // Form is complete - check if admin has released matches
            console.log('✅ Form is complete, checking for admin-released matches...');
            
            // Load and check matches
            const matchesResponse = await fetch('/api/client/matches', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (matchesResponse.ok) {
              const matchesData = await matchesResponse.json();
              const hasUnlockedMatches = matchesData.data && matchesData.data.length > 0;
              
              console.log('Has unlocked matches from admin:', hasUnlockedMatches);
              console.log('Number of unlocked matches:', matchesData.data?.length || 0);
              
              if (hasUnlockedMatches) {
                // Admin has released matches - show them immediately
                console.log('🎉 Admin has released matches, showing results');
                setMatches(matchesData.data);
                setDashboardState('results-ready');
              } else {
                // Form complete but admin hasn't released matches yet - show processing with timer
                const submissionTime = data.data.submissionTime;
                if (submissionTime) {
                  const now = new Date();
                  const submission = new Date(submissionTime);
                  const twentyFourHoursLater = new Date(submission.getTime() + 24 * 60 * 60 * 1000);
                  
                  console.log('Timer check - waiting for admin to release matches:', {
                    now: now.toISOString(),
                    submission: submission.toISOString(),
                    twentyFourHoursLater: twentyFourHoursLater.toISOString(),
                    isBeforeTwentyFourHours: now < twentyFourHoursLater
                  });
                  
                  if (now < twentyFourHoursLater) {
                    // Still within 24 hours - show processing timer
                    console.log('⏱️ Within 24 hours, waiting for admin to release matches');
                    setDashboardState('processing');
                    const remainingTime = twentyFourHoursLater.getTime() - now.getTime();
                    setTimeRemaining(remainingTime);
                  } else {
                    // 24 hours passed - show "no matches" message
                    console.log('⏰ 24 hours passed, admin has not released matches');
                    setDashboardState('results-ready');
                    setMatches([]); // Ensure empty matches
                  }
                } else {
                  // No submission time - show processing indefinitely until admin releases
                  console.log('📋 No submission time, showing processing until admin releases');
                  setDashboardState('processing');
                }
              }
            } else {
              // Error fetching matches - show processing
              console.log('❌ Error fetching matches, showing processing');
              setDashboardState('processing');
            }
          }
        } else {
          console.log('Form status check failed, defaulting to form-needed');
          setDashboardState('form-incomplete');
          setError(data.message || 'Failed to check form status');
          loadDashboardData();
        }
      } catch (error) {
        console.error('Error checking dashboard state:', error);
        let errorMsg = 'Unknown error';
        if (error && typeof error === 'object' && 'message' in error) {
          errorMsg = (error as Error).message;
        } else if (typeof error === 'string') {
          errorMsg = error;
        }
        setError('Error checking dashboard state: ' + errorMsg);
        setDashboardState('form-incomplete');
        loadDashboardData();
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    // Enhanced timer effect - check for admin-released matches periodically
    useEffect(() => {
      if (dashboardState === 'processing' && timeRemaining !== null) {
        const interval = setInterval(async () => {
          // Check for admin-released matches every 10 seconds
          const token = localStorage.getItem('clientToken');
          if (token) {
            try {
              const matchesResponse = await fetch('/api/client/matches', {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (matchesResponse.ok) {
                const matchesData = await matchesResponse.json();
                const hasUnlockedMatches = matchesData.data && matchesData.data.length > 0;
                
                if (hasUnlockedMatches) {
                  console.log('🎉 Admin released matches! Switching to results');
                  setMatches(matchesData.data);
                  setDashboardState('results-ready');
                  clearInterval(interval);
                  return;
                }
              }
            } catch (error) {
              console.log('Error checking for admin-released matches:', error);
            }
          }
          
          // Update countdown timer
          setTimeRemaining(prev => {
            if (prev === null) return null;
            if (prev <= 1000) {
              console.log('⏰ 24 hour timer expired, showing results (even if no matches)');
              setDashboardState('results-ready');
              setMatches([]); // Ensure empty matches after timer
              clearInterval(interval);
              return null;
            }
            return prev - 1000;
          });
        }, 10000); // Check every 10 seconds instead of every second
        
        return () => clearInterval(interval);
      }
    }, [dashboardState, timeRemaining]);

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('clientUser');
    localStorage.removeItem('clientToken');
    setLocation('/client/login');
  }

    if (!user) {
      console.log('🚨 No user found, redirecting to login');
      return null;
    }

    // Remove the early return for form-incomplete - let it render normally
    console.log('⏳ Dashboard state: form-incomplete - will render UI');

  if (loading) {
      console.log('⏳ Data loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

    if (error) {
      console.log('❌ Dashboard error:', error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-700">{error}</p>
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

    // Remove getStatusStats function and all stats-related code

    // ADD DEBUGGING LOGS FOR RENDER
    console.log('=== DASHBOARD RENDER DEBUG ===');
    console.log('Profile state:', profile);
    console.log('Profile company name:', profile?.companyName);
    console.log('Profile email:', profile?.email);
    console.log('Dashboard state:', dashboardState);
    console.log('Loading state:', loading);
    console.log('Error state:', error);

    function openMatchReasoning(reasoning: string) {
      setCurrentReasoning(reasoning);
      setReasoningModalOpen(true);
    }

  // Add manual override button for testing
  const forceShowResults = () => {
    console.log('🔧 MANUAL OVERRIDE: Forcing results-ready state');
    setDashboardState('results-ready');
  };

  // Add this debug log before rendering the matches grid
  if (matches.length > 0) {
    console.log('=== RENDERING MATCHES DEBUG ===');
    console.log('All matches being rendered:', matches);
    console.log('Match details:', matches.map(m => ({
      id: m.id,
      vcName: m.vcInvestor?.name || m.vcName,
      isUnlocked: m.isUnlocked
    })));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* VentriLinks Logo and Name - Clickable Home Link */}
            <div 
              className="flex items-center cursor-pointer" 
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
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => {
                setLocation('/');
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }}>
                Back to Home
              </Button>
              {/* Other header buttons */}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
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

          {/* Startup Profile Information */}
          {profile && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <img src="/images/1.png" alt="VentriLinks Logo" className="h-10 w-10 object-cover rounded-full mr-2 bg-white border border-gray-200" style={{objectPosition:'center'}} />
                  Startup Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Company Name</p>
                    <p className="text-lg">{profile.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-lg">{profile.email}</p>
                  </div>
                  {profile.sector && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sector</p>
                      <p className="text-lg">{profile.sector}</p>
                      </div>
                    )}
                  {profile.stage && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stage</p>
                      <p className="text-lg">{profile.stage}</p>
                      </div>
                    )}
                  {profile.fundingGoal && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Funding Goal</p>
                      <p className="text-lg">{profile.fundingGoal}</p>
                      </div>
                    )}
                  {profile.description && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-600">Description</p>
                      <p className="text-lg">{profile.description}</p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dashboard State Content */}
          {dashboardState === 'form-incomplete' && (
            (() => {
              console.log('🎯 RENDERING FORM-INCOMPLETE UI');
              return (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <Target className="h-16 w-16 text-blue-600 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Ready to Find Your Matches?
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Fill out your startup details to get matched with the right investors.
                    </p>
                    {/* Show missing core fields */}
                    {formStatus && (
                      <div className="mb-4">
                        <div className="font-semibold text-red-700">Missing Core Fields:</div>
                        <ul className="text-red-600">
                          {CORE_FIELDS.filter(f => (formStatus.missingFields || []).includes(f)).map(f => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button 
                      onClick={() => setLocation('/get-matched')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                    >
                      Fill Out Startup Form
                    </Button>
                  </div>
                </div>
              );
            })()
          )}

          {dashboardState === 'processing' && submissionTime && (
            <CountdownTimer submissionTime={submissionTime} />
          )}

          {dashboardState === 'results-ready' && (
            <>
              {/* Section Title and Feedback Invitation */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-primary mb-4">Top Matched Investors (Up to 50)</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                  If any matches seem off, please let us know which ones and why—your input helps us improve our matching algorithm.
                </p>
              </div>

              {/* Matches Grid */}
              <div className="matches-grid grid justify-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto p-5">
                {matches.map((match) => {
                  return (
                    <Card key={match.id} className="hover:shadow-lg transition-shadow">
                      <CardContent>
                        <div className="match-card flex flex-col p-5 border border-gray-200 rounded-lg bg-white shadow-sm mb-4 gap-3 w-full max-w-md mx-auto">
                          {/* VC Name as Hyperlink to Website */}
                          <h3 className="text-lg font-bold mb-1">
                            {match.vcInvestor?.website ? (
                              <a 
                                href={match.vcInvestor.website.startsWith('http') ? match.vcInvestor.website : `https://${match.vcInvestor.website}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-bold"
                                title={`Visit ${match.vcInvestor?.name || match.vcName} website`}
                              >
                                {match.vcInvestor?.name || match.vcName || "Unknown VC"}
                              </a>
                            ) : (
                              <span className="text-gray-900">{match.vcInvestor?.name || match.vcName || "Unknown VC"}</span>
                            )}
                          </h3>
                          <p className="text-gray-700 mb-2">{match.vcInvestor?.firm || ""}</p>
                          <div className="match-info mb-3">
                            <p>Investment Focus: {match.vcInvestor?.investmentFocus || "Biotech"}</p>
                            <p>Stage: {match.vcInvestor?.investmentStage || "Early to Growth"}</p>
                            <p>Geography: {match.vcInvestor?.geography || "US"}</p>
                            {match.vcInvestor?.website && (
                              <p className="text-sm text-blue-600 mt-2">
                                🌐 <a 
                                  href={match.vcInvestor.website.startsWith('http') ? match.vcInvestor.website : `https://${match.vcInvestor.website}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  Visit Website
                                </a>
                              </p>
                            )}
                          </div>
                          <div className="match-actions flex flex-col gap-3 items-start">
                            {(match.matchReasoning || match.portfolioReasoning) && (
                              <a
                                href="#"
                                onClick={e => { 
                                  e.preventDefault(); 
                                  const combinedReasoning = [
                                    match.matchReasoning && `Match Analysis:\n${match.matchReasoning}`,
                                    match.portfolioReasoning && `\nPortfolio Analysis:\n${match.portfolioReasoning}`
                                  ].filter(Boolean).join('\n');
                                  openMatchReasoning(combinedReasoning);
                                }}
                                className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                              >
                                <span>🧬</span> Why this match?
                              </a>
                            )}
                            {/* Leave Feedback Button */}
                            <Button
                              onClick={() => openFeedbackDialog(match)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm font-medium flex items-center gap-1"
                              size="sm"
                            >
                              <span>💬</span> Leave Feedback
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Match Feedback</DialogTitle>
            <DialogDescription>
              Help us improve our algorithm by sharing your thoughts about this match with {selectedMatchForFeedback?.vcInvestor?.name || selectedMatchForFeedback?.vcName}
            </DialogDescription>
          </DialogHeader>
          {selectedMatchForFeedback && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">How good is this match?</label>
                <Select 
                  value={feedbackForm.matchQuality}
                  onValueChange={(value) => setFeedbackForm(prev => ({ ...prev, matchQuality: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select match quality..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Good Match">Good Match</SelectItem>
                    <SelectItem value="Poor Match">Poor Match</SelectItem>
                    <SelectItem value="Maybe">Maybe</SelectItem>
                    <SelectItem value="Not Sure">Not Sure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Additional feedback (optional)</label>
                <Textarea
                  placeholder="Tell us why this match works or doesn't work for your startup..."
                  value={feedbackForm.feedbackText}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, feedbackText: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => submitFeedback(
                    selectedMatchForFeedback.id.toString(), 
                    feedbackForm.matchQuality,
                    feedbackForm.feedbackText
                  )}
                  disabled={submittingFeedback || !feedbackForm.matchQuality}
                >
                  {submittingFeedback ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Match Reasoning Modal */}
      <Dialog open={reasoningModalOpen} onOpenChange={setReasoningModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Match Analysis</DialogTitle>
            <DialogDescription>
              Comprehensive analysis including match reasoning and portfolio insights
            </DialogDescription>
          </DialogHeader>
          <div className="text-blue-900 whitespace-pre-line text-base leading-relaxed max-h-96 overflow-y-auto">
            {currentReasoning}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="secondary" onClick={() => setReasoningModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}