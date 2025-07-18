import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🧪 TEST FEEDBACK API CALLED');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { matchId, matchQuality, feedbackText } = req.body;
    
    console.log('📝 Feedback received:', {
      matchId,
      matchQuality,
      feedbackText,
      timestamp: new Date().toISOString()
    });

    // For now, just acknowledge the feedback
    // In production, this would save to a database
    
    res.status(200).json({ 
      success: true, 
      message: 'Feedback received successfully',
      data: {
        matchId,
        matchQuality,
        feedbackText,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process feedback'
    });
  }
}
