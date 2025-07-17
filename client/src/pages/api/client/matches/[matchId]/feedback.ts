import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { matchId } = req.query;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT secret not configured' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret) as any;
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const clientEmail = decoded.email;
    const { matchQuality, feedbackText } = req.body;

    if (!matchQuality) {
      return res.status(400).json({ error: 'Match quality is required' });
    }

    const allowedOptions = ['Good Match', 'Maybe', 'Not Sure', 'Poor Match'];
    if (!allowedOptions.includes(matchQuality)) {
      return res.status(400).json({ error: 'Invalid match quality option' });
    }

    console.log('💬 FEEDBACK SUBMITTED:', {
      matchId,
      clientEmail,
      matchQuality,
      feedbackText: feedbackText || '',
      submittedAt: new Date().toISOString()
    });

    // Save to Airtable
    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const airtableBaseId = process.env.BASE_ID;

    if (airtableApiKey && airtableBaseId) {
      try {
        const searchResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Client%20Matches?filterByFormula=AND({Match ID}='${matchId}',{Client Email}='${clientEmail}')`, {
          headers: {
            'Authorization': `Bearer ${airtableApiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          if (searchData.records && searchData.records.length > 0) {
            const recordId = searchData.records[0].id;
            await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Client%20Matches/${recordId}`, {
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
          }
        }
      } catch (error) {
        console.log('⚠️ Error saving feedback to Airtable:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { matchId, matchQuality }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
}
