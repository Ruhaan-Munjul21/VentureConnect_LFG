import express from "express";
import type { Request, Response } from "express";
import { airtableService } from "../airtable";

const router = express.Router();

// GET /api/admin/startups - Get all startup applications from Airtable
router.get("/startups", async (req: Request, res: Response) => {
  try {
    const startups = await airtableService.getStartups();
    const transformedStartups = startups.map((record: any) => airtableService.transformStartupToClient(record));
    
    res.json({
      success: true,
      data: transformedStartups,
      count: transformedStartups.length
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

// GET /api/admin/stats - Get dashboard statistics from Airtable
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const startups = await airtableService.getStartups();
    const matches = await airtableService.getMatches();
    
    const stats = {
      total: startups.length,
      new: startups.filter((s: any) => !s.fields['Status'] || s.fields['Status'] === 'new').length,
      reviewed: startups.filter((s: any) => s.fields['Status'] === 'reviewed').length,
      matched: startups.filter((s: any) => s.fields['Status'] === 'matched').length,
      contacted: startups.filter((s: any) => s.fields['Status'] === 'contacted').length
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

// POST /api/admin/export - Export data to CSV from Airtable
router.post("/export", async (req: Request, res: Response) => {
  try {
    const startups = await airtableService.getStartups();
    const csvHeaders = "Company,Founder,Email,Phone,Sector,Stage,Funding Goal,Status,Submitted At\n";
    const csvData = startups.map((startup: any) => {
      const fields = startup.fields;
      return `"${fields['Startup Name'] || ''}","${fields['Contact Name'] || ''}","${fields['Email'] || ''}","${fields['Phone Number'] || ''}","${fields['Drug Modality'] || ''}","${fields['Investment Stage'] || ''}","${fields['Investment Amount'] || ''}","${fields['Status'] || ''}","${startup.createdTime}"`;
    });
    
    const csv = csvHeaders + csvData.join('\n');
    
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

// Client Companies Management - Now using Airtable
// GET /api/admin/clients - Get all client companies from Airtable
router.get("/clients", async (req: Request, res: Response) => {
  try {
    const startups = await airtableService.getStartups();
    const transformedClients = startups.map((record: any) => airtableService.transformStartupToClient(record));
    
    res.json({
      success: true,
      data: transformedClients,
      count: transformedClients.length
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client companies"
    });
  }
});

// POST /api/admin/clients - Create new client company in Airtable
router.post("/clients", async (req: Request, res: Response) => {
  try {
    const fields = airtableService.transformClientToStartupFields(req.body);
    const result = await airtableService.createStartup(fields);
    
    if (result && result.records) {
      const client = airtableService.transformStartupToClient(result.records[0]);
      res.json({
        success: true,
        message: "Client company created successfully",
        data: client
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to create client company"
      });
    }
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create client company"
    });
  }
});

// PUT /api/admin/clients/:id - Update client company in Airtable
router.put("/clients/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('Updating client with ID:', id);
    console.log('Update data:', req.body);
    
    const fields = airtableService.transformClientToStartupFields(req.body);
    console.log('Transformed fields:', fields);
    
    const result = await airtableService.updateStartup(id, fields);
    console.log('Update result:', result);
    
    if (result && result.records && result.records.length > 0) {
      const client = airtableService.transformStartupToClient(result.records[0]);
      res.json({
        success: true,
        message: "Client company updated successfully",
        data: client
      });
    } else {
      console.error('Update failed - no result or no records');
      res.status(400).json({
        success: false,
        message: "Failed to update client company - no result returned"
      });
    }
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update client company"
    });
  }
});

// DELETE /api/admin/clients/:id - Delete client company from Airtable
router.delete("/clients/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const success = await airtableService.deleteStartup(id);
    
    if (success) {
      res.json({
        success: true,
        message: "Client company deleted successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to delete client company"
      });
    }
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(400).json({
      success: false,
      message: "Failed to delete client company"
    });
  }
});

// VC Investors Management - Now using Airtable
// GET /api/admin/vcs - Get all VC investors from Airtable
router.get("/vcs", async (req: Request, res: Response) => {
  try {
    const vcs = await airtableService.getVCs();
    const transformedVCs = vcs.map((record: any) => airtableService.transformVCToInvestor(record));
    
    res.json({
      success: true,
      data: transformedVCs,
      count: transformedVCs.length
    });
  } catch (error) {
    console.error("Error fetching VCs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch VC investors"
    });
  }
});

// POST /api/admin/vcs - Create new VC investor in Airtable
router.post("/vcs", async (req: Request, res: Response) => {
  try {
    const fields = airtableService.transformInvestorToVCFields(req.body);
    const result = await airtableService.createVC(fields);
    
    if (result && result.records) {
      const vc = airtableService.transformVCToInvestor(result.records[0]);
      res.json({
        success: true,
        message: "VC investor created successfully",
        data: vc
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to create VC investor"
      });
    }
  } catch (error) {
    console.error("Error creating VC:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create VC investor"
    });
  }
});

// Client Matches Management - Now using Airtable
// GET /api/admin/matches - Get all client matches from Airtable
router.get("/matches", async (req: Request, res: Response) => {
  try {
    const matches = await airtableService.getMatches();
    const transformedMatches = matches.map((record: any) => airtableService.transformMatchToClientMatch(record));
    
    res.json({
      success: true,
      data: transformedMatches,
      count: transformedMatches.length
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client matches"
    });
  }
});

// POST /api/admin/matches - Create new client match in Airtable
router.post("/matches", async (req: Request, res: Response) => {
  try {
    console.log('Creating match with data:', req.body);
    
    const fields = airtableService.transformClientMatchToMatchFields(req.body);
    console.log('Transformed match fields:', fields);
    
    const result = await airtableService.createMatch(fields);
    console.log('Create match result:', result);
    
    // Airtable returns a single object, not a records array
    if (result && result.id) {
      const match = airtableService.transformMatchToClientMatch(result);
      res.json({
        success: true,
        message: "Client match created successfully",
        data: match
      });
    } else {
      console.error('Match creation failed - no result or no id');
      res.status(400).json({
        success: false,
        message: "Failed to create client match - no result returned"
      });
    }
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create client match"
    });
  }
});

// PUT /api/admin/matches/:id - Update client match in Airtable
router.put("/matches/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('Updating match with ID:', id);
    console.log('Update data:', req.body);
    
    const fields = airtableService.transformClientMatchToMatchFields(req.body);
    console.log('Transformed match fields:', fields);
    
    const result = await airtableService.updateMatch(id, fields);
    console.log('Update match result:', result);
    
    if (result && result.records && result.records.length > 0) {
      const match = airtableService.transformMatchToClientMatch(result.records[0]);
      res.json({
        success: true,
        message: "Match updated successfully",
        data: match
      });
    } else {
      console.error('Match update failed - no result or no records');
      res.status(400).json({
        success: false,
        message: "Failed to update match - no result returned"
      });
    }
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update match"
    });
  }
});

export default router;
