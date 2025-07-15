import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Phone, 
  Users, 
  Target,
  TrendingUp,
  FileText,
  MessageSquare,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';

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

interface MatchActivity {
  id: number;
  clientMatchId: number;
  activityType: string;
  title: string;
  description?: string;
  activityDate: string;
  nextAction?: string;
  nextActionDate?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientMatch {
  id: number;
  isUnlocked: boolean;
  assignedAt: string;
  notes?: string;
  vcInvestor: VCInvestor;
}

const ACTIVITY_TYPES = [
  { value: 'initial_contact', label: 'Initial Contact', icon: Mail, color: 'bg-blue-100 text-blue-800' },
  { value: 'email_sent', label: 'Email Sent', icon: Mail, color: 'bg-blue-100 text-blue-800' },
  { value: 'call_scheduled', label: 'Call Scheduled', icon: Phone, color: 'bg-green-100 text-green-800' },
  { value: 'call_held', label: 'Call Held', icon: Phone, color: 'bg-green-100 text-green-800' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled', icon: Calendar, color: 'bg-purple-100 text-purple-800' },
  { value: 'meeting_held', label: 'Meeting Held', icon: Users, color: 'bg-purple-100 text-purple-800' },
  { value: 'pitch_presented', label: 'Pitch Presented', icon: Target, color: 'bg-orange-100 text-orange-800' },
  { value: 'due_diligence', label: 'Due Diligence', icon: FileText, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'term_sheet', label: 'Term Sheet', icon: TrendingUp, color: 'bg-red-100 text-red-800' },
  { value: 'deal_closed', label: 'Deal Closed', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'follow_up', label: 'Follow Up', icon: MessageSquare, color: 'bg-gray-100 text-gray-800' },
  { value: 'other', label: 'Other', icon: Clock, color: 'bg-gray-100 text-gray-800' }
];

const STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
];

export default function VCTimeline() {
  const [location, setLocation] = useLocation();
  const [match, setMatch] = useState<ClientMatch | null>(null);
  const [activities, setActivities] = useState<MatchActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [editingActivity, setEditingActivity] = useState<MatchActivity | null>(null);

  // New activity form
  const [newActivity, setNewActivity] = useState({
    activityType: '',
    title: '',
    description: '',
    activityDate: new Date().toISOString().split('T')[0],
    nextAction: '',
    nextActionDate: '',
    status: 'completed',
    notes: ''
  });

  // Get match ID from URL
  const matchId = new URLSearchParams(window.location.search).get('matchId');

  useEffect(() => {
    if (matchId) {
      loadTimelineData();
    }
  }, [matchId]);

  const loadTimelineData = async () => {
    const token = localStorage.getItem('clientToken');
    if (!token || !matchId) return;

    try {
      setLoading(true);
      const [matchRes, activitiesRes] = await Promise.all([
        fetch(`/api/client/matches/${matchId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/client/matches/${matchId}/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (matchRes.ok) {
        const matchData = await matchRes.json();
        setMatch(matchData.data);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData.data);
      }
    } catch (err) {
      setError('Failed to load timeline data');
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('clientToken');
    if (!token || !matchId) return;

    try {
      const response = await fetch(`/api/client/matches/${matchId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newActivity)
      });

      if (response.ok) {
        setShowAddActivity(false);
        setNewActivity({
          activityType: '',
          title: '',
          description: '',
          activityDate: new Date().toISOString().split('T')[0],
          nextAction: '',
          nextActionDate: '',
          status: 'completed',
          notes: ''
        });
        await loadTimelineData();
      } else {
        setError('Failed to add activity');
      }
    } catch (err) {
      setError('Failed to add activity');
    }
  };

  const updateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    const token = localStorage.getItem('clientToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/client/matches/${matchId}/activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newActivity)
      });

      if (response.ok) {
        setEditingActivity(null);
        setNewActivity({
          activityType: '',
          title: '',
          description: '',
          activityDate: new Date().toISOString().split('T')[0],
          nextAction: '',
          nextActionDate: '',
          status: 'completed',
          notes: ''
        });
        await loadTimelineData();
      } else {
        setError('Failed to update activity');
      }
    } catch (err) {
      setError('Failed to update activity');
    }
  };

  const deleteActivity = async (activityId: number) => {
    const token = localStorage.getItem('clientToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/client/matches/${matchId}/activities/${activityId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        await loadTimelineData();
      } else {
        setError('Failed to delete activity');
      }
    } catch (err) {
      setError('Failed to delete activity');
    }
  };

  const getActivityIcon = (activityType: string) => {
    const activity = ACTIVITY_TYPES.find(a => a.value === activityType);
    return activity ? activity.icon : Clock;
  };

  const getActivityColor = (activityType: string) => {
    const activity = ACTIVITY_TYPES.find(a => a.value === activityType);
    return activity ? activity.color : 'bg-gray-100 text-gray-800';
  };

  const getProgressPercentage = () => {
    if (activities.length === 0) return 0;
    const completed = activities.filter(a => a.status === 'completed').length;
    return Math.round((completed / activities.length) * 100);
  };

  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p>Match not found</p>
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
            {/* VentriLinks Logo and Name - Clickable Home Link */}
            <div 
              className="flex items-center cursor-pointer mr-4" 
              onClick={() => setLocation('/')}
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
              <div>
                <h1 className="text-xl font-semibold text-gray-900">VC Timeline</h1>
                <p className="text-sm text-gray-600">{match.vcInvestor.name} - {match.vcInvestor.firm}</p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setLocation('/client/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
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

        {/* VC Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              {match.vcInvestor.name} - {match.vcInvestor.firm}
            </CardTitle>
            <CardDescription>
              Investment Focus: {match.vcInvestor.investmentFocus || 'Not specified'} • 
              Stage: {match.vcInvestor.investmentStage || 'Not specified'} • 
              Geography: {match.vcInvestor.geography || 'Not specified'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  {match.vcInvestor.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`mailto:${match.vcInvestor.email}`} className="text-blue-600 hover:underline">
                        {match.vcInvestor.email}
                      </a>
                    </div>
                  )}
                  {match.vcInvestor.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`tel:${match.vcInvestor.phone}`} className="text-blue-600 hover:underline">
                        {match.vcInvestor.phone}
                      </a>
                    </div>
                  )}
                  {match.vcInvestor.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={match.vcInvestor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Progress Overview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{getProgressPercentage()}%</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-2" />
                  <div className="text-sm text-gray-600">
                    {activities.length} total activities • {activities.filter(a => a.status === 'completed').length} completed
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Timeline</h2>
            <Badge variant="outline">
              {sortedActivities.length} activities
            </Badge>
          </div>

          {sortedActivities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
                <p className="text-gray-600 mb-4">
                  Start building your relationship timeline by adding your first activity.
                </p>
                <Button onClick={() => setShowAddActivity(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Activity
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedActivities.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.activityType);
                const activityColor = getActivityColor(activity.activityType);
                const statusColor = STATUS_OPTIONS.find(s => s.value === activity.status)?.color || 'bg-gray-100 text-gray-800';

                return (
                  <Card key={activity.id} className="relative">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full ${activityColor}`}>
                          <ActivityIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{activity.title}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(activity.activityDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={statusColor}>
                                {STATUS_OPTIONS.find(s => s.value === activity.status)?.label}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingActivity(activity);
                                  setNewActivity({
                                    activityType: activity.activityType,
                                    title: activity.title,
                                    description: activity.description || '',
                                    activityDate: activity.activityDate.split('T')[0],
                                    nextAction: activity.nextAction || '',
                                    nextActionDate: activity.nextActionDate ? activity.nextActionDate.split('T')[0] : '',
                                    status: activity.status,
                                    notes: activity.notes || ''
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteActivity(activity.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-700 mt-2">{activity.description}</p>
                          )}
                          {activity.nextAction && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-900">Next Action:</p>
                              <p className="text-sm text-blue-700">{activity.nextAction}</p>
                              {activity.nextActionDate && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Due: {new Date(activity.nextActionDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                          {activity.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <strong>Notes:</strong> {activity.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Activity Dialog */}
      <Dialog open={!!editingActivity} onOpenChange={() => setEditingActivity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
            <DialogDescription>
              Update the details of this timeline activity
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={updateActivity} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Activity Type</label>
                <Select value={newActivity.activityType} onValueChange={(value) => setNewActivity({...newActivity, activityType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={newActivity.status} onValueChange={(value) => setNewActivity({...newActivity, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newActivity.title}
                onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newActivity.description}
                onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Activity Date</label>
                <Input
                  type="date"
                  value={newActivity.activityDate}
                  onChange={(e) => setNewActivity({...newActivity, activityDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Next Action Date</label>
                <Input
                  type="date"
                  value={newActivity.nextActionDate}
                  onChange={(e) => setNewActivity({...newActivity, nextActionDate: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Next Action</label>
              <Input
                value={newActivity.nextAction}
                onChange={(e) => setNewActivity({...newActivity, nextAction: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newActivity.notes}
                onChange={(e) => setNewActivity({...newActivity, notes: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingActivity(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Activity</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}