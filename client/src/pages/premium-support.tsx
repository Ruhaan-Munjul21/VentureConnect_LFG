import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Star, 
  Users, 
  Presentation, 
  Target, 
  DollarSign, 
  CheckCircle, 
  ArrowLeft,
  Crown,
  Rocket,
  Trophy,
  TrendingUp,
  Calendar,
  FileText,
  Lightbulb,
  Award,
  Zap
} from 'lucide-react';

const PremiumFundraisingSupport: React.FC = () => {
  const [, setLocation] = useLocation();
  const [applicationForm, setApplicationForm] = useState({
    companyName: '',
    founderName: '',
    email: '',
    phone: '',
    linkedinProfile: '',
    currentStage: '',
    fundingGoal: '',
    previousFundingRaised: '',
    currentRevenue: '',
    teamSize: '',
    industryFocus: '',
    pitchDeckStatus: '',
    fundraisingTimeline: '',
    specificChallenges: '',
    whyPremiumSupport: '',
    additionalInfo: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setApplicationForm(prev => ({ ...prev, [field]: value }));
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');

      const response = await fetch('/api/premium-support/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationForm)
      });

      if (response.ok) {
        setSubmitted(true);
        console.log('✅ Premium support application submitted successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit application');
      }
    } catch (err) {
      console.error('💥 Error submitting application:', err);
      setError('Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in our Premium Fundraising Support. Our team will review your application and contact you within 2-3 business days.
            </p>
            <Button onClick={() => setLocation('/client/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => setLocation('/client/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Crown className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Premium Fundraising Support</h1>
                <p className="text-sm text-gray-600">High-touch fundraising services for selected startups</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Services Overview */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white mb-6">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                VentriLinks Premium Support
              </CardTitle>
              <CardDescription className="text-purple-100">
                End-to-end fundraising support for high-potential biotech startups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <FileText className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold">Pitch Deck Review</h3>
                  <p className="text-sm text-purple-100">Professional refinement of your pitch materials</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <Users className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold">Warm Introductions</h3>
                  <p className="text-sm text-purple-100">Direct connections to our investor network</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <Presentation className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold">Pitch Coaching</h3>
                  <p className="text-sm text-purple-100">Expert preparation for investor meetings</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <Rocket className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold">Closing Support</h3>
                  <p className="text-sm text-purple-100">End-to-end guidance through deal closure</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  What's Included
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Comprehensive pitch deck review and refinement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Direct warm introductions to 5-10 relevant investors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Dedicated fundraising strategist assignment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Weekly 1:1 coaching sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Mock pitch sessions with feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Due diligence preparation support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Term sheet negotiation guidance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Selection Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span className="text-sm">Series A or later stage biotech companies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span className="text-sm">Strong scientific/clinical validation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span className="text-sm">Experienced management team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span className="text-sm">Significant market opportunity ($1B+ TAM)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span className="text-sm">Clear path to regulatory approval</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span className="text-sm">Commitment to 3-6 month engagement</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Apply for Premium Support
            </CardTitle>
            <CardDescription>
              Complete this application to be considered for our premium fundraising services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitApplication} className="space-y-6">
              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Company Name *</label>
                  <Input
                    value={applicationForm.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Founder/CEO Name *</label>
                  <Input
                    value={applicationForm.founderName}
                    onChange={(e) => handleInputChange('founderName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email *</label>
                  <Input
                    type="email"
                    value={applicationForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Number</label>
                  <Input
                    value={applicationForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">LinkedIn Profile</label>
                <Input
                  value={applicationForm.linkedinProfile}
                  onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              {/* Business Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Current Stage *</label>
                  <Select 
                    value={applicationForm.currentStage}
                    onValueChange={(value) => handleInputChange('currentStage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="series-a">Series A</SelectItem>
                      <SelectItem value="series-b">Series B</SelectItem>
                      <SelectItem value="series-c">Series C+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Funding Goal *</label>
                  <Input
                    value={applicationForm.fundingGoal}
                    onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
                    placeholder="e.g., $10M"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Previous Funding Raised</label>
                  <Input
                    value={applicationForm.previousFundingRaised}
                    onChange={(e) => handleInputChange('previousFundingRaised', e.target.value)}
                    placeholder="e.g., $5M"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Current Annual Revenue</label>
                  <Input
                    value={applicationForm.currentRevenue}
                    onChange={(e) => handleInputChange('currentRevenue', e.target.value)}
                    placeholder="e.g., $2M ARR or Pre-revenue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Team Size</label>
                  <Input
                    value={applicationForm.teamSize}
                    onChange={(e) => handleInputChange('teamSize', e.target.value)}
                    placeholder="e.g., 15 employees"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Industry Focus *</label>
                  <Select 
                    value={applicationForm.industryFocus}
                    onValueChange={(value) => handleInputChange('industryFocus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select focus..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oncology">Oncology</SelectItem>
                      <SelectItem value="immunology">Immunology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="rare-diseases">Rare Diseases</SelectItem>
                      <SelectItem value="digital-health">Digital Health</SelectItem>
                      <SelectItem value="medical-devices">Medical Devices</SelectItem>
                      <SelectItem value="diagnostics">Diagnostics</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fundraising Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Pitch Deck Status *</label>
                  <Select 
                    value={applicationForm.pitchDeckStatus}
                    onValueChange={(value) => handleInputChange('pitchDeckStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="first-draft">First Draft</SelectItem>
                      <SelectItem value="needs-refinement">Needs Refinement</SelectItem>
                      <SelectItem value="ready-to-present">Ready to Present</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fundraising Timeline *</label>
                  <Select 
                    value={applicationForm.fundraisingTimeline}
                    onValueChange={(value) => handleInputChange('fundraisingTimeline', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (0-1 months)</SelectItem>
                      <SelectItem value="short-term">Short-term (1-3 months)</SelectItem>
                      <SelectItem value="medium-term">Medium-term (3-6 months)</SelectItem>
                      <SelectItem value="long-term">Long-term (6+ months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Specific Fundraising Challenges *</label>
                <Textarea
                  value={applicationForm.specificChallenges}
                  onChange={(e) => handleInputChange('specificChallenges', e.target.value)}
                  placeholder="Describe your main challenges in fundraising (e.g., investor targeting, pitch refinement, market positioning)..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Why Premium Support? *</label>
                <Textarea
                  value={applicationForm.whyPremiumSupport}
                  onChange={(e) => handleInputChange('whyPremiumSupport', e.target.value)}
                  placeholder="Why are you interested in premium support? What specific outcomes are you hoping to achieve?"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Additional Information</label>
                <Textarea
                  value={applicationForm.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  placeholder="Any additional information you'd like to share..."
                  rows={3}
                />
              </div>

              {error && (
                <Alert>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setLocation('/client/dashboard')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PremiumFundraisingSupport;