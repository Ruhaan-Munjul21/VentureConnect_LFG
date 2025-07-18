import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Forward request to backend server
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/client/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Forgot password API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process request',
    });
  }
}