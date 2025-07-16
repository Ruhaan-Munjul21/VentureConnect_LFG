import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, ArrowLeft, Building2, Loader2 } from 'lucide-react';

export default function GetMatched() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    contactName: '',
    phone: '',
    sector: '',
    stage: '',
    fundingGoal: '',
    description: '',
    drugModality: '',
    diseaseFocus: '',
    investmentStage: '',
    geography: '',
    investmentAmount: ''
  });

  // Function to handle navigation back to home
  const handleBackToHome = () => {
    setLocation('/');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/client/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setLocation('/client/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit form');
      }
    } catch (err) {
      setError('An error occurred while submitting the form');
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Get Matched with VCs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  Form submitted successfully! Redirecting to your dashboard...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium mb-2">
                    Company Name *
                  </label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
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
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium mb-2">
                    Contact Name
                  </label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Company Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Company Description
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Tell us about your company..."
                />
              </div>

              {/* Core Matching Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="drugModality" className="block text-sm font-medium mb-2">
                    Drug Modality *
                  </label>
                  <Select value={formData.drugModality} onValueChange={(value) => setFormData(prev => ({ ...prev, drugModality: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select drug modality..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small-molecule">Small Molecule</SelectItem>
                      <SelectItem value="biologics">Biologics</SelectItem>
                      <SelectItem value="gene-therapy">Gene Therapy</SelectItem>
                      <SelectItem value="cell-therapy">Cell Therapy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="diseaseFocus" className="block text-sm font-medium mb-2">
                    Disease Focus *
                  </label>
                  <Input
                    id="diseaseFocus"
                    value={formData.diseaseFocus}
                    onChange={(e) => setFormData(prev => ({ ...prev, diseaseFocus: e.target.value }))}
                    placeholder="e.g., Oncology, Neurology..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="investmentStage" className="block text-sm font-medium mb-2">
                    Investment Stage *
                  </label>
                  <Select value={formData.investmentStage} onValueChange={(value) => setFormData(prev => ({ ...prev, investmentStage: value }))}>
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
                  <label htmlFor="geography" className="block text-sm font-medium mb-2">
                    Geography *
                  </label>
                  <Select value={formData.geography} onValueChange={(value) => setFormData(prev => ({ ...prev, geography: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select geography..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north-america">North America</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="investmentAmount" className="block text-sm font-medium mb-2">
                  Investment Amount *
                </label>
                <Select value={formData.investmentAmount} onValueChange={(value) => setFormData(prev => ({ ...prev, investmentAmount: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment amount..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-1m">Under $1M</SelectItem>
                    <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                    <SelectItem value="5m-25m">$5M - $25M</SelectItem>
                    <SelectItem value="25m-100m">$25M - $100M</SelectItem>
                    <SelectItem value="over-100m">Over $100M</SelectItem>
                  </SelectContent>
                </Select>
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
                    className="flex items-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? 'Submitting...' : 'Get Matched'}
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
