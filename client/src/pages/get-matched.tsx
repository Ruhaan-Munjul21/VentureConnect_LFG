import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, ArrowLeft, Building2, Loader2, CheckCircle } from 'lucide-react';

export default function GetMatched() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state for all the Airtable fields
  const [formData, setFormData] = useState({
    // Core identification
    'Company Name': '',
    'Contact Name': '',
    'Email': '',
    'Phone': '',
    
    // Company details
    'Sector': '',
    'Stage': '',
    'Funding Goal': '',
    'Description': '',
    
    // Core matching fields
    'Drug Modality': '',
    'Disease Focus': '',
    'Investment Stage': '',
    'Geography': '',
    'Investment Amount': '',
    
    // Additional fields that might be in Airtable
    'Technology Platform': '',
    'Clinical Stage': '',
    'Regulatory Status': '',
    'Team Size': '',
    'Previous Funding': '',
    'Key Partnerships': '',
    'Competitive Advantage': '',
    'Use of Funds': '',
    'Timeline': '',
    'Risk Factors': ''
  });

  // Function to handle navigation back to home
  const handleBackToHome = () => {
    setLocation('/');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Handle form submission to Airtable
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Submitting form data to Airtable...');
      
      // Submit to backend which handles Airtable integration
      const response = await fetch('/api/submit-startup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('Form submitted successfully to Airtable');
        setSuccess(true);
        
        // Show success message for a few seconds then redirect
        setTimeout(() => {
          setLocation('/client/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to submit form. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Application Submitted!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for your interest in VentriLinks. We'll review your application and get back to you soon.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          </CardContent>
        </Card>
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
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={handleBackToHome}
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
            
            {/* Header Navigation Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBackToHome}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Globe className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation button within form */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Building2 className="h-6 w-6" />
              Apply for VentriLinks
            </CardTitle>
            <p className="text-gray-600">
              Tell us about your biotech startup to get matched with the right investors
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium mb-2">
                      Company Name *
                    </label>
                    <Input
                      id="companyName"
                      value={formData['Company Name']}
                      onChange={(e) => handleChange('Company Name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium mb-2">
                      Contact Name *
                    </label>
                    <Input
                      id="contactName"
                      value={formData['Contact Name']}
                      onChange={(e) => handleChange('Contact Name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData['Email']}
                      onChange={(e) => handleChange('Email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      value={formData['Phone']}
                      onChange={(e) => handleChange('Phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Company Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Company Description
                </label>
                <Textarea
                  id="description"
                  value={formData['Description']}
                  onChange={(e) => handleChange('Description', e.target.value)}
                  rows={4}
                  placeholder="Describe your biotech company, technology, and mission..."
                />
              </div>

              {/* Core Matching Fields */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Investment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="drugModality" className="block text-sm font-medium mb-2">
                      Drug Modality *
                    </label>
                    <Select value={formData['Drug Modality']} onValueChange={(value) => handleChange('Drug Modality', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select drug modality..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small Molecule">Small Molecule</SelectItem>
                        <SelectItem value="Biologics">Biologics</SelectItem>
                        <SelectItem value="Gene Therapy">Gene Therapy</SelectItem>
                        <SelectItem value="Cell Therapy">Cell Therapy</SelectItem>
                        <SelectItem value="Medical Device">Medical Device</SelectItem>
                        <SelectItem value="Digital Health">Digital Health</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="diseaseFocus" className="block text-sm font-medium mb-2">
                      Disease Focus *
                    </label>
                    <Input
                      id="diseaseFocus"
                      value={formData['Disease Focus']}
                      onChange={(e) => handleChange('Disease Focus', e.target.value)}
                      placeholder="e.g., Oncology, Neurology, Rare Diseases..."
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="investmentStage" className="block text-sm font-medium mb-2">
                      Investment Stage *
                    </label>
                    <Select value={formData['Investment Stage']} onValueChange={(value) => handleChange('Investment Stage', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                        <SelectItem value="Seed">Seed</SelectItem>
                        <SelectItem value="Series A">Series A</SelectItem>
                        <SelectItem value="Series B">Series B</SelectItem>
                        <SelectItem value="Series C+">Series C+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="geography" className="block text-sm font-medium mb-2">
                      Geography *
                    </label>
                    <Select value={formData['Geography']} onValueChange={(value) => handleChange('Geography', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select geography..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="North America">North America</SelectItem>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="Asia">Asia</SelectItem>
                        <SelectItem value="Global">Global</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="investmentAmount" className="block text-sm font-medium mb-2">
                      Investment Amount *
                    </label>
                    <Select value={formData['Investment Amount']} onValueChange={(value) => handleChange('Investment Amount', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select investment amount..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Under $1M">Under $1M</SelectItem>
                        <SelectItem value="$1M - $5M">$1M - $5M</SelectItem>
                        <SelectItem value="$5M - $25M">$5M - $25M</SelectItem>
                        <SelectItem value="$25M - $100M">$25M - $100M</SelectItem>
                        <SelectItem value="Over $100M">Over $100M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="clinicalStage" className="block text-sm font-medium mb-2">
                      Clinical Stage
                    </label>
                    <Select value={formData['Clinical Stage']} onValueChange={(value) => handleChange('Clinical Stage', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select clinical stage..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Discovery">Discovery</SelectItem>
                        <SelectItem value="Preclinical">Preclinical</SelectItem>
                        <SelectItem value="Phase I">Phase I</SelectItem>
                        <SelectItem value="Phase II">Phase II</SelectItem>
                        <SelectItem value="Phase III">Phase III</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="technologyPlatform" className="block text-sm font-medium mb-2">
                      Technology Platform
                    </label>
                    <Input
                      id="technologyPlatform"
                      value={formData['Technology Platform']}
                      onChange={(e) => handleChange('Technology Platform', e.target.value)}
                      placeholder="Describe your core technology..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="teamSize" className="block text-sm font-medium mb-2">
                      Team Size
                    </label>
                    <Select value={formData['Team Size']} onValueChange={(value) => handleChange('Team Size', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team size..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1-5</SelectItem>
                        <SelectItem value="6-15">6-15</SelectItem>
                        <SelectItem value="16-50">16-50</SelectItem>
                        <SelectItem value="51-100">51-100</SelectItem>
                        <SelectItem value="100+">100+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="previousFunding" className="block text-sm font-medium mb-2">
                      Previous Funding
                    </label>
                    <Input
                      id="previousFunding"
                      value={formData['Previous Funding']}
                      onChange={(e) => handleChange('Previous Funding', e.target.value)}
                      placeholder="e.g., $2M Seed, Bootstrap..."
                    />
                  </div>

                  <div>
                    <label htmlFor="timeline" className="block text-sm font-medium mb-2">
                      Funding Timeline
                    </label>
                    <Select value={formData['Timeline']} onValueChange={(value) => handleChange('Timeline', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="When do you need funding?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Immediately">Immediately</SelectItem>
                        <SelectItem value="Within 3 months">Within 3 months</SelectItem>
                        <SelectItem value="Within 6 months">Within 6 months</SelectItem>
                        <SelectItem value="Within 1 year">Within 1 year</SelectItem>
                        <SelectItem value="Just exploring">Just exploring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="useOfFunds" className="block text-sm font-medium mb-2">
                    Use of Funds
                  </label>
                  <Textarea
                    id="useOfFunds"
                    value={formData['Use of Funds']}
                    onChange={(e) => handleChange('Use of Funds', e.target.value)}
                    rows={3}
                    placeholder="How will you use the investment funds?"
                  />
                </div>
              </div>

              {/* Footer with navigation and submission */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleBackToHome}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
