import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

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
    const jwtSecret = process.env.JWT_SECRET;
    console.log('🔐 JWT Secret present:', !!jwtSecret);
    
    if (!jwtSecret) {
      console.log('❌ JWT secret not configured');
      return res.status(500).json({ error: 'JWT secret not configured' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret) as any;
      console.log('✅ Token verified for email:', decoded.email);
    } catch (error) {
      console.log('❌ Token verification failed:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }

    const clientEmail = decoded.email;
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

    // Save to Airtable
    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const airtableBaseId = process.env.BASE_ID;
    console.log('🗄️ Airtable config:', { hasApiKey: !!airtableApiKey, hasBaseId: !!airtableBaseId });

    if (airtableApiKey && airtableBaseId) {
      try {
        console.log('🔍 Searching for existing record...');
        const searchResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Client%20Matches?filterByFormula=AND({Match ID}='${matchId}',{Client Email}='${clientEmail}')`, {
          headers: {
            'Authorization': `Bearer ${airtableApiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log('📋 Search results:', { recordCount: searchData.records?.length || 0 });
          
          if (searchData.records && searchData.records.length > 0) {
            const recordId = searchData.records[0].id;
            console.log('🔄 Updating record:', recordId);
            
            const updateResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Client%20Matches/${recordId}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${airtableApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                fields: {
                  'Startup Says Good': matchQuality,
                  'Startup Feedback': feedbackText || ''
                }
              })
            });

            if (updateResponse.ok) {
              console.log('✅ Airtable record updated successfully');
            } else {
              console.log('❌ Failed to update Airtable record:', updateResponse.status);
            }
          } else {
            console.log('⚠️ No matching record found in Airtable');
          }
        } else {
          console.log('❌ Airtable search failed:', searchResponse.status);
        }
      } catch (error) {
        console.log('⚠️ Error saving feedback to Airtable:', error);
      }
    } else {
      console.log('⚠️ Airtable not configured, skipping save');
    }

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
