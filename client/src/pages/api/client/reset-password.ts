import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, password } = req.body;

    // Forward request to backend server
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    // In production with same domain, use relative URL
    const apiUrl = process.env.NODE_ENV === 'production' && !process.env.BACKEND_URL 
      ? '/api/client/reset-password' 
      : `${backendUrl}/api/client/reset-password`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Reset password API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
}