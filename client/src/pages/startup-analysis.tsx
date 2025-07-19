import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Building2,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Shield,
  Trophy,
  ArrowLeft
} from 'lucide-react';

interface AnalysisData {
  overallScore: number;
  technologyScore: number;
  marketScore: number;
  teamScore: number;
  technologyReasoning: string;
  marketReasoning: string;
  teamReasoning: string;
  analysisSummary: string;
  competitiveDifferentiation: string;
  investmentThesis: string;
  therapeuticFocus: string;
}

const StartupAnalysisDashboard: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startupName, setStartupName] = useState('');
  const [error, setError] = useState('');

  // Get startup token from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    if (!token) {
      setError('Invalid access token');
      setLoading(false);
      return;
    }

    try {
      // Call API to get startup analysis data
      const response = await fetch(`/api/startup/analysis?token=${token}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analysis data');
      }

      const data = await response.json();
      setAnalysisData(data);
      setStartupName(data.startupName || 'Your Company');
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setError('Failed to load analysis data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-blue-600 bg-blue-100';
    if (score >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading your analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || 'No analysis data available'}</AlertDescription>
        </Alert>
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
                onClick={() => setLocation('/')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Brain className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{startupName}</h1>
                <p className="text-sm text-gray-600">AI Investment Analysis</p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Powered by VentriLinks AI
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score Card */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Overall Investment Score</CardTitle>
            <CardDescription>Comprehensive AI assessment across all categories</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4">
              <span className="text-4xl font-bold">{analysisData.overallScore}</span>
              <span className="text-xl">/10</span>
            </div>
            <div className="text-xl font-semibold text-gray-900 mb-2">
              {getScoreDescription(analysisData.overallScore)}
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your startup has been evaluated across technology innovation, market opportunity, 
              team strength, and competitive positioning using advanced AI analysis.
            </p>
          </CardContent>
        </Card>

        {/* Category Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Technology',
              score: analysisData.technologyScore,
              icon: Brain,
              reasoning: analysisData.technologyReasoning,
              description: 'Innovation, IP, and technical differentiation'
            },
            {
              title: 'Market',
              score: analysisData.marketScore,
              icon: TrendingUp,
              reasoning: analysisData.marketReasoning,
              description: 'Market size, timing, and opportunity assessment'
            },
            {
              title: 'Team',
              score: analysisData.teamScore,
              icon: Users,
              reasoning: analysisData.teamReasoning,
              description: 'Leadership experience and execution capability'
            }
          ].map((category, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <category.icon className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                  <Badge className={getScoreColor(category.score)}>
                    {category.score}/10
                  </Badge>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={category.score * 10} className="mb-3" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  {category.reasoning}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Analysis Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Strengths & Opportunities */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-800">Key Strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisData.analysisSummary && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Platform Innovation</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {analysisData.analysisSummary.includes('CORE TECHNOLOGY:') 
                        ? analysisData.analysisSummary.split('CORE TECHNOLOGY:')[1]?.split('\n')[0]
                        : 'Advanced technology platform with strong differentiation potential'}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Competitive Advantage</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {analysisData.competitiveDifferentiation.substring(0, 200)}...
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Therapeutic Focus</h4>
                  <Badge variant="outline" className="text-blue-600">
                    {analysisData.therapeuticFocus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Thesis */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-800">Investment Thesis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {analysisData.investmentThesis}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Validated by investor funding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Strong market opportunity</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Differentiated technology approach</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-purple-800">Comprehensive Analysis Summary</CardTitle>
            </div>
            <CardDescription>
              Detailed AI-powered evaluation of your startup's investment potential
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {analysisData.analysisSummary}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Alert className="mt-6">
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>Next Steps:</strong> This analysis provides valuable insights for investor presentations 
            and strategic planning. Consider using these findings to refine your pitch deck and 
            address any identified areas for improvement.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default StartupAnalysisDashboard;