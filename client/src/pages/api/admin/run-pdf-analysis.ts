import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { startupIds } = req.body;

    if (!startupIds || !Array.isArray(startupIds) || startupIds.length === 0) {
      return res.status(400).json({ error: 'Invalid startup IDs provided' });
    }

    console.log('🔬 Starting PDF analysis for startup IDs:', startupIds);

    // Path to the Python analysis script (adjust path as needed)
    const scriptPath = path.join(process.cwd(), '..', 'run_analysis_background.py');
    
    // Run the Python script
    const pythonProcess = spawn('python3', [scriptPath], {
      cwd: path.join(process.cwd(), '..'),
      env: { ...process.env }
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('Python output:', text);
    });

    pythonProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.error('Python error:', text);
    });

    // Set up timeout (10 minutes)
    const timeout = setTimeout(() => {
      pythonProcess.kill('SIGTERM');
      console.log('⏰ Python process timed out after 10 minutes');
    }, 10 * 60 * 1000);

    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      console.log(`Python process exited with code ${code}`);
      
      if (code === 0) {
        console.log('✅ PDF analysis completed successfully');
        res.status(200).json({ 
          success: true, 
          message: `PDF analysis completed for ${startupIds.length} startup(s)`,
          output: output,
          startupIds: startupIds
        });
      } else {
        console.error('❌ PDF analysis failed');
        res.status(500).json({ 
          error: 'PDF analysis failed', 
          code: code,
          output: output,
          errorOutput: errorOutput
        });
      }
    });

    pythonProcess.on('error', (error) => {
      clearTimeout(timeout);
      console.error('❌ Error spawning Python process:', error);
      res.status(500).json({ error: 'Failed to start PDF analysis process' });
    });

  } catch (error) {
    console.error('❌ Error in PDF analysis endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}