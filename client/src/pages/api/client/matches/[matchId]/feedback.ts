import { NextApiRequest, NextApiResponse } from 'next';

// Import storage to verify token same way as server routes
import { storage } from '../../../../../server/storage';
import { airtableService } from '../../../../../server/airtable';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🚀 FEEDBACK API CALLED:', {
    method: req.method,
    matchId: req.query.matchId,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  // Allow all methods temporarily for debugging
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed', method: req.method });
  }

  try {
    const { matchId } = req.query;
    console.log('📝 Match ID from query:', matchId);

    const authHeader = req.headers.authorization;
    console.log('🔑 Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    console.log('🔐 Token extracted:', token ? '[PRESENT]' : '[MISSING]');
    
    // Use same authentication as server routes
    const authToken = await storage.getClientAuthToken(token);
    console.log('Auth token found:', !!authToken);
    console.log('Auth token data:', authToken);
    
    if (!authToken) {
      console.log('❌ Invalid or expired token');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get client from Airtable using the stored clientCompanyId
    const startups = await airtableService.getStartups();
    console.log('Total startups found:', startups.length);
    
    // Try to find by the stored clientCompanyId (which should be the Airtable ID)
    let clientCompany = startups.find((startup: any) => {
      console.log('Checking startup ID:', startup.id, 'against stored ID:', authToken.clientCompanyId);
      return startup.id === authToken.clientCompanyId.toString();
    });

    if (!clientCompany) {
      console.log('❌ Client not found by ID, authentication failed');
      return res.status(401).json({ error: 'Client company not found. Please log in again.' });
    }

    console.log('✅ Client found:', clientCompany.id);
    console.log('Client company name:', clientCompany.fields['Startup Name']);

    const clientEmail = clientCompany.fields['Email'];
    const { matchQuality, feedbackText } = req.body;
    console.log('📊 Feedback data:', { matchQuality, feedbackText: !!feedbackText });

    if (!matchQuality) {
      console.log('❌ No match quality provided');
      return res.status(400).json({ error: 'Match quality is required' });
    }

    const allowedOptions = ['Good Match', 'Maybe', 'Not Sure', 'Poor Match'];
    if (!allowedOptions.includes(matchQuality)) {
      console.log('❌ Invalid match quality:', matchQuality);
      return res.status(400).json({ error: 'Invalid match quality option' });
    }

    const feedbackData = {
      matchId,
      clientEmail,
      matchQuality,
      feedbackText: feedbackText || '',
      submittedAt: new Date().toISOString()
    };

    console.log('💬 FEEDBACK SUBMITTED:', feedbackData);

    // Save feedback directly to the match record in Airtable (same as server route)
    const AIRTABLE_API_KEY = 'patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f';
    const BASE_ID = 'app768aQ07mCJoyu8';
    
    // Update the match record with feedback directly using the matchId
    const updateFields = {
      'Startup Says Good': matchQuality,
      'Startup Feedback': feedbackText || ''
    };
    
    console.log('Updating match with fields:', updateFields);
    
    // Update the match in Airtable
    const updateUrl = `https://api.airtable.com/v0/${BASE_ID}/Startup-VC Matches (POST GPT PRE-SCAN)/${matchId}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: updateFields })
    });
    
    console.log('Airtable update response status:', updateResponse.status);
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Failed to update match with feedback:', errorText);
      return res.status(500).json({
        success: false,
        message: "Failed to save feedback",
        details: errorText
      });
    }
    
    console.log('✅ Feedback saved successfully to Airtable');

    console.log('✅ Sending success response');
    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { matchId, matchQuality, submittedAt: feedbackData.submittedAt }
    });

  } catch (error) {
    console.error('💥 FEEDBACK API ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
