import express from "express";
import type { Request, Response } from "express";

const router = express.Router();

// Mock data - replace with actual database queries
const mockStartups = [
  {
    id: "1",
    companyName: "BioNova Therapeutics",
    founderName: "Dr. Sarah Chen",
    email: "sarah@bionova.com",
    phone: "+1-555-0123",
    sector: "Biotechnology",
    stage: "Series A",
    fundingGoal: "$15M",
    description: "Developing novel cancer immunotherapies using engineered T-cells",
    submittedAt: "2024-07-06T10:30:00Z",
    status: "new"
  },
  {
    id: "2",
    companyName: "GeneTech Solutions",
    founderName: "Michael Rodriguez",
    email: "mike@genetech.io",
    phone: "+1-555-0124",
    sector: "Gene Therapy",
    stage: "Seed",
    fundingGoal: "$5M",
    description: "CRISPR-based gene editing platform for rare diseases",
    submittedAt: "2024-07-05T14:22:00Z",
    status: "reviewed"
  },
  {
    id: "3",
    companyName: "NeuroLink Biotech",
    founderName: "Dr. Emily Johnson",
    email: "emily@neurolink.bio",
    sector: "Neuroscience",
    stage: "Series B",
    fundingGoal: "$25M",
    description: "Brain-computer interfaces for neurological disorders",
    submittedAt: "2024-07-04T09:15:00Z",
    status: "matched"
  }
];

// GET /api/admin/startups - Get all startup applications
router.get("/startups", (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: mockStartups,
      count: mockStartups.length
    });
  } catch (error) {
    console.error("Error fetching startups:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch startup applications"
    });
  }
});

// PUT /api/admin/startups/:id/status - Update startup status
router.put("/startups/:id/status", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['new', 'reviewed', 'matched', 'contacted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    // For demo purposes, just return success
    res.json({
      success: true,
      message: "Status updated successfully"
    });
  } catch (error) {
    console.error("Error updating startup status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update startup status"
    });
  }
});

// GET /api/admin/stats - Get dashboard statistics
router.get("/stats", (req: Request, res: Response) => {
  try {
    const stats = {
      total: mockStartups.length,
      new: mockStartups.filter(s => s.status === 'new').length,
      reviewed: mockStartups.filter(s => s.status === 'reviewed').length,
      matched: mockStartups.filter(s => s.status === 'matched').length,
      contacted: mockStartups.filter(s => s.status === 'contacted').length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics"
    });
  }
});

// POST /api/admin/export - Export data to CSV
router.post("/export", (req: Request, res: Response) => {
  try {
    const csvHeaders = "Company,Founder,Email,Phone,Sector,Stage,Funding Goal,Status,Submitted At\n";
    const csvData = mockStartups.map(startup => 
      `"${startup.companyName}","${startup.founderName}","${startup.email}","${startup.phone || ''}","${startup.sector}","${startup.stage}","${startup.fundingGoal}","${startup.status}","${startup.submittedAt}"`
    ).join('\n');
    
    const csv = csvHeaders + csvData;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="startup_applications.csv"');
    res.send(csv);
  } catch (error) {
    console.error("Error exporting data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export data"
    });
  }
});

export default router;
