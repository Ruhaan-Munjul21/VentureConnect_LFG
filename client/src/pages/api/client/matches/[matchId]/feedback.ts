import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the match ID from the URL
    const { matchId } = req.query;

    // Verify the client token
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

    // Get feedback data from request body
    const { matchQuality, feedbackText } = req.body;

    if (!matchQuality) {
      return res.status(400).json({ error: 'Match quality is required' });
    }

    // For now, we'll log the feedback and return success
    // In a real implementation, you'd save this to your database
    const feedbackData = {
      matchId,
      clientEmail,
      matchQuality,
      feedbackText: feedbackText || '',
      submittedAt: new Date().toISOString()
    };

    console.log('💬 FEEDBACK SUBMITTED:', feedbackData);

    // You can add Airtable integration here to save feedback
    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const airtableBaseId = process.env.AIRTABLE_BASE_ID;

    if (airtableApiKey && airtableBaseId) {
      try {
        // Save feedback to Airtable
        const airtableResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Match%20Feedback`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${airtableApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              'Match ID': matchId,
              'Client Email': clientEmail,
              'Match Quality': matchQuality,
              'Feedback Text': feedbackText || '',
              'Submitted At': new Date().toISOString()
            }
          })
        });

        if (airtableResponse.ok) {
          console.log('✅ Feedback saved to Airtable');
        } else {
          console.log('⚠️ Failed to save feedback to Airtable:', airtableResponse.status);
        }
      } catch (error) {
        console.log('⚠️ Error saving feedback to Airtable:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        matchId,
        matchQuality,
        submittedAt: feedbackData.submittedAt
      }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
}
