import express from "express";
import type { Request, Response } from "express";
import { storage } from "../storage";
import { airtableService } from "../airtable";
import { 
  insertClientCompanySchema, 
  insertOutreachProgressSchema,
  insertMatchActivitySchema,
  type InsertClientCompany,
  type InsertOutreachProgress,
  type InsertMatchActivity
} from "@shared/schema";
import crypto from "crypto";

// Import SUBMISSION_FIELDS from airtable.ts to ensure consistency
const { SUBMISSION_FIELDS } = require("../airtable");

const router = express.Router();

// Middleware to authenticate client requests
const authenticateClient = async (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication token required" 
    });
  }

  try {
    const authToken = await storage.getClientAuthToken(token);
    if (!authToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired token" 
      });
    }

    // Get client from Airtable instead of local storage
    const startups = await airtableService.getStartups();
    const clientCompany = startups.find((startup: any) => {
      // Convert Airtable string ID to numeric ID for comparison
      const startupNumericId = parseInt(startup.id.replace(/[^0-9]/g, '')) || Date.now();
      return startupNumericId === authToken.clientCompanyId;
    });

    if (!clientCompany) {
      return res.status(401).json({ 
        success: false, 
        message: "Client company not found" 
      });
    }

    // Attach client info to request
    (req as any).clientCompany = airtableService.transformStartupToClient(clientCompany);
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Authentication failed" 
    });
  }
};

// POST /api/client/register - Register a new client account
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, companyName } = req.body;
    if (!email || !password || !companyName) {
      return res.status(400).json({ success: false, message: "Email, password, and company name are required" });
    }
    // Get all startups and check for existing record with same email+company
    const startups = await airtableService.getStartups();
    const existing = startups.find((startup: any) => {
      const transformed = airtableService.transformStartupToClient(startup);
      return (
        transformed.email?.toLowerCase() === email.toLowerCase() &&
        transformed.companyName?.toLowerCase() === companyName.toLowerCase()
      );
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "Account already exists for this company" });
    }
    // Create new record
    const newRecord = await airtableService.createStartup({
      email,
      companyName,
      passwordHash: password,
    });
    if (!newRecord) {
      return res.status(500).json({ success: false, message: "Failed to create account" });
    }
    // Optionally, auto-login after registration (issue token)
    return res.status(201).json({ success: true, message: "Account created successfully" });
  } catch (err) {
    console.error("Error in /register:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/client/login - Email and password authentication
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, companyName } = req.body;
    
    if (!email || !password || !companyName) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and company name are required"
      });
    }

    console.log('Login attempt for email:', email);

    // Get all startups and find by email+company
    const startups = await airtableService.getStartups();
    console.log('Found startups:', startups.length);
    
    const clientCompany = startups.find((startup: any) => {
      const transformed = airtableService.transformStartupToClient(startup);
      console.log('Checking startup:', transformed.companyName, 'email:', transformed.email);
      return (
        transformed.email?.toLowerCase() === email.toLowerCase() &&
        transformed.companyName?.toLowerCase() === companyName.toLowerCase()
      );
    });

    if (!clientCompany) {
      console.log('No client found for email:', email);
      return res.status(404).json({
        success: false,
        message: "No account found for this email and company"
      });
    }

    const storedPassword = clientCompany.fields['Password Hash'];
    
    if (!storedPassword || storedPassword !== password) {
      console.log('Invalid password for client:', clientCompany.companyName);
      return res.status(401).json({
        success: false,
        message: "Invalid email, company, or password"
      });
    }

    // Password is valid (or was just set) - generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Convert Airtable string ID to numeric ID for storage system
    const numericId = parseInt(clientCompany.id.replace(/[^0-9]/g, '')) || Date.now();

    await storage.createClientAuthToken(numericId, token, expiresAt);

    res.json({
      success: true,
      message: "Login successful",
      token: token,
      expiresAt: expiresAt
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process login request"
    });
  }
});

// POST /api/client/oauth-login - Handle Google OAuth login
router.post("/oauth-login", async (req: Request, res: Response) => {
  try {
    const { email, name, googleUserId } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    console.log('OAuth login attempt for email:', email);
    console.log('Google user ID:', googleUserId);
    console.log('Name:', name);

    // First, try to find existing startup by email
    const existingStartup = await airtableService.findStartupByEmail(email);
    
    if (existingStartup) {
      console.log('Found existing startup record, updating with Google info:', existingStartup.id);
      
      // Update existing record with Google information
      const updateFields: Record<string, any> = {
        [SUBMISSION_FIELDS.GOOGLE_USER_ID]: googleUserId,
        [SUBMISSION_FIELDS.GOOGLE_NAME]: name
      };

      // If no password hash exists, create one
      if (!existingStartup.fields[SUBMISSION_FIELDS.PASSWORD]) {
        updateFields[SUBMISSION_FIELDS.PASSWORD] = `google_${Date.now()}`;
      }

      const result = await airtableService.updateStartup(existingStartup.id, updateFields);
      
      if (!result) {
        return res.status(500).json({
          success: false,
          message: "Failed to update existing startup with Google info"
        });
      }

      console.log('Successfully updated existing startup with Google info for email:', email);
      
      // Generate session token
      const token = crypto.randomBytes(32).toString('hex'); // Changed from jwt.sign
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Convert Airtable string ID to numeric ID for storage system
      const numericId = parseInt(existingStartup.id.replace(/[^0-9]/g, '')) || Date.now();

      await storage.createClientAuthToken(numericId, token, expiresAt); // Changed to createClientAuthToken

      return res.json({
        success: true,
        message: "OAuth login successful - updated existing record",
        token: token,
        expiresAt: expiresAt,
        data: {
          id: existingStartup.id,
          email: email,
          companyName: existingStartup.fields[SUBMISSION_FIELDS.STARTUP_NAME] || 'Unknown Company',
          googleUserId: googleUserId,
          googleName: name
        }
      });
    } else {
      console.log('No existing startup found, creating new one for email:', email);
      
      // Create new startup record with MINIMAL info - NO startup name
      const result = await airtableService.createStartup({
        email: email,
        companyName: '', // Leave startup name EMPTY - user will fill in form
        passwordHash: `google_${Date.now()}`
      });
      
      if (!result) {
        return res.status(500).json({
          success: false,
          message: "Failed to create new startup record"
        });
      }

      const recordId = result.records ? result.records[0].id : result.id;
      console.log('Successfully created new startup record for email:', email, 'ID:', recordId);
      
      // Update the record with Google user info ONLY
      if (googleUserId || name) {
        const googleFields: Record<string, any> = {};
        if (googleUserId) googleFields[SUBMISSION_FIELDS.GOOGLE_USER_ID] = googleUserId;
        if (name) googleFields[SUBMISSION_FIELDS.GOOGLE_NAME] = name;
        
        await airtableService.updateStartup(recordId, googleFields);
      }

      // Generate session token
      const token = crypto.randomBytes(32).toString('hex'); // Changed from jwt.sign
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Convert Airtable string ID to numeric ID for storage system
      const numericId = parseInt(recordId.replace(/[^0-9]/g, '')) || Date.now();

      await storage.createClientAuthToken(numericId, token, expiresAt); // Changed to createClientAuthToken

      return res.json({
        success: true,
        message: "OAuth login successful - created new record",
        token: token,
        expiresAt: expiresAt,
        data: {
          id: recordId,
          email: email,
          companyName: '', // Return empty name - user will fill in form
          googleUserId: googleUserId,
          googleName: name
        }
      });
    }
  } catch (error) {
    console.error('Error in OAuth login:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// GET /api/client/profile - Get client company profile
router.get("/profile", authenticateClient, async (req: Request, res: Response) => {
  try {
    const clientCompany = (req as any).clientCompany;
    
    res.json({
      success: true,
      data: {
        id: clientCompany.id,
        companyName: clientCompany.companyName,
        email: clientCompany.email,
        contactName: clientCompany.contactName,
        phone: clientCompany.phone,
        sector: clientCompany.sector,
        stage: clientCompany.stage,
        fundingGoal: clientCompany.fundingGoal,
        description: clientCompany.description,
        isFormComplete: airtableService.checkFormCompletion(clientCompany).isComplete
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile"
    });
  }
});

// GET /api/client/matches - Get all matches for the client
router.get("/matches", authenticateClient, async (req: Request, res: Response) => {
  try {
    const clientCompany = (req as any).clientCompany;
    console.log('Fetching matches for client:', clientCompany.companyName);
    
    // Get matches from Airtable
    const matches = await airtableService.getMatches();
    const vcs = await airtableService.getVCs();
    
    console.log('All matches from Airtable:', matches.length);
    
    // Filter matches for this client and only Unlocked
    const clientMatches = matches
      .map((record: any) => {
        const transformed = airtableService.transformMatchToClientMatch(record);
        console.log('Transformed match:', transformed.startupName, 'Client Access:', transformed.clientAccess);
        return transformed;
      })
      .filter((match: any) => {
        const isClientMatch = match.startupName === clientCompany.companyName;
        const isUnlocked = match.clientAccess === 'Unlocked';
        console.log(`Match ${match.startupName}: client=${isClientMatch}, unlocked=${isUnlocked}`);
        return isClientMatch && isUnlocked;
      });
    
    console.log('Found unlocked matches for client:', clientMatches.length);
    
    // Get detailed information for each match
    const matchesWithDetails = clientMatches.map((match: any) => {
      const vc = vcs.find((v: any) => v.fields['VC/Investor Name'] === match.vcName);
      return {
        ...match,
        vcInvestor: vc ? airtableService.transformVCToInvestor(vc) : null
      };
    });
    
    res.json({ success: true, data: matchesWithDetails });
  } catch (error) {
    console.error('Error fetching client matches:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch matches' });
  }
});

// GET /api/client/matches/:id - Get specific match details
router.get("/matches/:id", authenticateClient, async (req: Request, res: Response) => {
  try {
    const clientCompany = (req as any).clientCompany;
    const matchId = parseInt(req.params.id);
    
    const match = await storage.getClientMatch(matchId);
    if (!match || match.clientCompanyId !== clientCompany.id) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
      });
    }

    const vcInvestor = await storage.getVCInvestor(match.vcInvestorId);
    const progress = await storage.getOutreachProgressByMatch(match.id);

    res.json({
      success: true,
      data: {
        id: match.id,
        isUnlocked: match.isUnlocked,
        assignedAt: match.assignedAt,
        notes: match.notes,
        vcInvestor: vcInvestor ? {
          id: vcInvestor.id,
          name: vcInvestor.name,
          firm: vcInvestor.firm,
          // Only include contact info if unlocked
          ...(match.isUnlocked ? {
            email: vcInvestor.email,
            phone: vcInvestor.phone,
            linkedin: vcInvestor.linkedin,
            website: vcInvestor.website
          } : {}),
          investmentFocus: vcInvestor.investmentFocus,
          investmentStage: vcInvestor.investmentStage,
          geography: vcInvestor.geography,
          portfolioSize: vcInvestor.portfolioSize,
          description: vcInvestor.description
        } : null,
        progress: progress ? {
          id: progress.id,
          status: progress.status,
          contactDate: progress.contactDate,
          responseDate: progress.responseDate,
          meetingDate: progress.meetingDate,
          notes: progress.notes,
          updatedAt: progress.updatedAt
        } : null
      }
    });
  } catch (error) {
    console.error("Match fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch match details"
    });
  }
});

// POST /api/client/matches/:id/progress - Update outreach progress
router.post("/matches/:id/progress", authenticateClient, async (req: Request, res: Response) => {
  try {
    const clientCompany = (req as any).clientCompany;
    const matchId = parseInt(req.params.id);
    
    const match = await storage.getClientMatch(matchId);
    if (!match || match.clientCompanyId !== clientCompany.id) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
      });
    }

    const validatedData = insertOutreachProgressSchema.parse({
      ...req.body,
      clientMatchId: matchId
    });

    // Check if progress already exists
    const existingProgress = await storage.getOutreachProgressByMatch(matchId);
    
    let progress;
    if (existingProgress) {
      progress = await storage.updateOutreachProgress(existingProgress.id, validatedData);
    } else {
      progress = await storage.createOutreachProgress(validatedData);
    }

    res.json({
      success: true,
      message: "Progress updated successfully",
      data: progress
    });
  } catch (error) {
    console.error("Progress update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress"
    });
  }
});

// POST /api/client/logout - Logout (invalidate token)
router.post("/logout", authenticateClient, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      await storage.deleteClientAuthToken(token);
    }
    
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout"
    });
  }
});

// GET /api/client/form-status - Check if user's form is complete
router.get("/form-status", authenticateClient, async (req: Request, res: Response) => {
  try {
    const clientCompany = (req as any).clientCompany;
    
    // Get the startup record from Airtable
    const startup = await airtableService.getStartup(clientCompany.id);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found"
      });
    }

    const formStatus = airtableService.checkFormCompletion(startup);
    
    return res.json({
      success: true,
      data: {
        isComplete: formStatus.isComplete,
        missingFields: formStatus.missingFields,
        completedFields: formStatus.completedFields,
        companyName: clientCompany.companyName
      }
    });
  } catch (error) {
    console.error('Error checking form status:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// POST /api/client/mark-form-complete - Mark form as completed
router.post("/mark-form-complete", authenticateClient, async (req: Request, res: Response) => {
  try {
    const clientCompany = (req as any).clientCompany;
    
    // Get the startup record from Airtable
    const startup = await airtableService.getStartup(clientCompany.id);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found"
      });
    }

    // Check if form is actually complete before marking it
    const formStatus = airtableService.checkFormCompletion(startup);
    if (!formStatus.isComplete) {
      return res.status(400).json({
        success: false,
        message: "Form is not complete",
        data: {
          missingFields: formStatus.missingFields
        }
      });
    }

    // Mark form as completed
    await airtableService.markFormCompleted(clientCompany.id);
    
    return res.json({
      success: true,
      message: "Form marked as completed"
    });
  } catch (error) {
    console.error('Error marking form complete:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// POST /api/client/form-submission - Handle Airtable form submissions
router.post("/form-submission", async (req: Request, res: Response) => {
  try {
    const { email, ...formData } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    console.log('=== FORM SUBMISSION RECEIVED ===');
    console.log('Email:', email);
    console.log('Form data:', formData);
    console.log('User authenticated:', !!req.headers.authorization);

    // First, try to find existing record by email
    const existingStartup = await airtableService.findStartupByEmail(email);
    
    if (existingStartup) {
      console.log('✅ Found existing startup record, updating:', existingStartup.id);
      console.log('Existing record fields:', existingStartup.fields);
      
      // Transform form data to Airtable fields - ONLY business fields
      const fields: Record<string, any> = {};
      
      // Map ONLY business fields (not authentication fields)
      if (formData.startupName) fields[SUBMISSION_FIELDS.STARTUP_NAME] = formData.startupName;
      if (formData.drugModality) fields[SUBMISSION_FIELDS.DRUG_MODALITY] = formData.drugModality;
      if (formData.diseaseFocus) fields[SUBMISSION_FIELDS.DISEASE_FOCUS] = formData.diseaseFocus;
      if (formData.investmentStage) fields[SUBMISSION_FIELDS.INVESTMENT_STAGE] = formData.investmentStage;
      if (formData.geography) fields[SUBMISSION_FIELDS.GEOGRAPHY] = formData.geography;
      if (formData.investmentAmount) fields[SUBMISSION_FIELDS.INVESTMENT_AMOUNT] = formData.investmentAmount;
      if (formData.contactName) fields[SUBMISSION_FIELDS.CONTACT_NAME] = formData.contactName;
      if (formData.phone) fields[SUBMISSION_FIELDS.PHONE] = formData.phone;
      if (formData.description) fields[SUBMISSION_FIELDS.DESCRIPTION] = formData.description;
      if (formData.pitchDeckUrl) fields[SUBMISSION_FIELDS.PITCH_DECK_URL] = formData.pitchDeckUrl;

      console.log('Business fields to update:', fields);

      // Update existing record with business fields only
      const result = await airtableService.updateStartup(existingStartup.id, fields);
      
      if (!result) {
        console.error('❌ Failed to update existing startup record');
        return res.status(500).json({
          success: false,
          message: "Failed to update existing startup record"
        });
      }

      console.log('✅ Successfully updated existing startup record for email:', email);
      console.log('Updated record:', result);
      
      return res.json({
        success: true,
        message: "Form submission updated existing record successfully",
        data: {
          email: email,
          recordId: existingStartup.id,
          updated: result
        }
      });
    } else {
      console.log('❌ No existing record found, creating new one for email:', email);
      
      // Create new record with form data
      const fields: Record<string, any> = {
        [SUBMISSION_FIELDS.EMAIL]: email
      };

      // Map form fields to Airtable fields
      if (formData.startupName) fields[SUBMISSION_FIELDS.STARTUP_NAME] = formData.startupName;
      if (formData.drugModality) fields[SUBMISSION_FIELDS.DRUG_MODALITY] = formData.drugModality;
      if (formData.diseaseFocus) fields[SUBMISSION_FIELDS.DISEASE_FOCUS] = formData.diseaseFocus;
      if (formData.investmentStage) fields[SUBMISSION_FIELDS.INVESTMENT_STAGE] = formData.investmentStage;
      if (formData.geography) fields[SUBMISSION_FIELDS.GEOGRAPHY] = formData.geography;
      if (formData.investmentAmount) fields[SUBMISSION_FIELDS.INVESTMENT_AMOUNT] = formData.investmentAmount;
      if (formData.contactName) fields[SUBMISSION_FIELDS.CONTACT_NAME] = formData.contactName;
      if (formData.phone) fields[SUBMISSION_FIELDS.PHONE] = formData.phone;
      if (formData.description) fields[SUBMISSION_FIELDS.DESCRIPTION] = formData.description;
      if (formData.pitchDeckUrl) fields[SUBMISSION_FIELDS.PITCH_DECK_URL] = formData.pitchDeckUrl;

      console.log('Fields for new record:', fields);

      // Create new record
      const result = await airtableService.createStartup({
        email: email,
        companyName: formData.startupName || 'New Company',
        passwordHash: `form_${Date.now()}` // Temporary password for form-only users
      });
      
      if (!result) {
        console.error('❌ Failed to create new startup record');
        return res.status(500).json({
          success: false,
          message: "Failed to create new startup record"
        });
      }

      const recordId = result.records ? result.records[0].id : result.id;
      console.log('✅ Successfully created new startup record for email:', email, 'ID:', recordId);
      console.log('Created record:', result);
      
      return res.json({
        success: true,
        message: "Form submission created new record successfully",
        data: {
          email: email,
          recordId: recordId,
          created: result
        }
      });
    }
  } catch (error) {
    console.error('❌ Error handling form submission:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// POST /api/client/manual-form-submission - Handle manual form submissions with auto-login
router.post("/manual-form-submission", async (req: Request, res: Response) => {
  try {
    const { email, ...formData } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    console.log('=== MANUAL FORM SUBMISSION RECEIVED ===');
    console.log('Email:', email);
    console.log('Form data:', formData);

    // Check if record already exists
    const existingStartup = await airtableService.findStartupByEmail(email);
    
    let recordId: string;
    let isNewRecord = false;
    
    if (existingStartup) {
      console.log('✅ Found existing startup record, updating:', existingStartup.id);
      recordId = existingStartup.id;
      
      // Update with business fields only
      const fields: Record<string, any> = {};
      
      // Map ONLY business fields (not authentication fields)
      if (formData.startupName) fields[SUBMISSION_FIELDS.STARTUP_NAME] = formData.startupName;
      if (formData.drugModality) fields[SUBMISSION_FIELDS.DRUG_MODALITY] = formData.drugModality;
      if (formData.diseaseFocus) fields[SUBMISSION_FIELDS.DISEASE_FOCUS] = formData.diseaseFocus;
      if (formData.investmentStage) fields[SUBMISSION_FIELDS.INVESTMENT_STAGE] = formData.investmentStage;
      if (formData.geography) fields[SUBMISSION_FIELDS.GEOGRAPHY] = formData.geography;
      if (formData.investmentAmount) fields[SUBMISSION_FIELDS.INVESTMENT_AMOUNT] = formData.investmentAmount;
      if (formData.contactName) fields[SUBMISSION_FIELDS.CONTACT_NAME] = formData.contactName;
      if (formData.phone) fields[SUBMISSION_FIELDS.PHONE] = formData.phone;
      if (formData.description) fields[SUBMISSION_FIELDS.DESCRIPTION] = formData.description;
      if (formData.pitchDeckUrl) fields[SUBMISSION_FIELDS.PITCH_DECK_URL] = formData.pitchDeckUrl;

      const result = await airtableService.updateStartup(recordId, fields);
      if (!result) {
        return res.status(500).json({
          success: false,
          message: "Failed to update existing startup record"
        });
      }
    } else {
      console.log('❌ No existing record found, creating new one for email:', email);
      isNewRecord = true;
      
      // Create new record with form data
      const fields: Record<string, any> = {
        [SUBMISSION_FIELDS.EMAIL]: email
      };
      
      // Map form fields to Airtable fields
      if (formData.startupName) fields[SUBMISSION_FIELDS.STARTUP_NAME] = formData.startupName;
      if (formData.drugModality) fields[SUBMISSION_FIELDS.DRUG_MODALITY] = formData.drugModality;
      if (formData.diseaseFocus) fields[SUBMISSION_FIELDS.DISEASE_FOCUS] = formData.diseaseFocus;
      if (formData.investmentStage) fields[SUBMISSION_FIELDS.INVESTMENT_STAGE] = formData.investmentStage;
      if (formData.geography) fields[SUBMISSION_FIELDS.GEOGRAPHY] = formData.geography;
      if (formData.investmentAmount) fields[SUBMISSION_FIELDS.INVESTMENT_AMOUNT] = formData.investmentAmount;
      if (formData.contactName) fields[SUBMISSION_FIELDS.CONTACT_NAME] = formData.contactName;
      if (formData.phone) fields[SUBMISSION_FIELDS.PHONE] = formData.phone;
      if (formData.description) fields[SUBMISSION_FIELDS.DESCRIPTION] = formData.description;
      if (formData.pitchDeckUrl) fields[SUBMISSION_FIELDS.PITCH_DECK_URL] = formData.pitchDeckUrl;

      const result = await airtableService.createStartup({
        email: email,
        companyName: formData.startupName || '',
        passwordHash: `manual_${Date.now()}`
      });
      
      if (!result) {
        return res.status(500).json({
          success: false,
          message: "Failed to create new startup record"
        });
      }

      recordId = result.records ? result.records[0].id : result.id;
    }

    // Generate session token for immediate access
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Convert Airtable string ID to numeric ID for storage system
    const numericId = parseInt(recordId.replace(/[^0-9]/g, '')) || Date.now();

    await storage.createClientAuthToken(numericId, token, expiresAt);

    console.log('✅ Manual form submission successful for email:', email);
    console.log('Record ID:', recordId);
    console.log('Numeric ID for storage:', numericId);
    console.log('Session token created');

    return res.json({
      success: true,
      message: isNewRecord ? "Account created and form submitted successfully" : "Form updated successfully",
      token: token,
      expiresAt: expiresAt,
      data: {
        email: email,
        recordId: recordId,
        numericId: numericId,
        isNewRecord: isNewRecord
      }
    });
  } catch (error) {
    console.error('❌ Error handling manual form submission:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});


// GET /api/client/test-connection - Test endpoint to verify Google auth and form submission connection
router.get("/test-connection", async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Email parameter is required"
      });
    }

    console.log('=== TESTING CONNECTION FOR EMAIL ===');
    console.log('Email:', email);

    // Check if record exists
    const existingStartup = await airtableService.findStartupByEmail(email);
    
    if (existingStartup) {
      console.log('✅ Found existing record:', existingStartup.id);
      console.log('Record fields:', existingStartup.fields);
      
      return res.json({
        success: true,
        message: "Record found",
        data: {
          exists: true,
          recordId: existingStartup.id,
          hasGoogleInfo: !!(existingStartup.fields[SUBMISSION_FIELDS.GOOGLE_USER_ID] || existingStartup.fields[SUBMISSION_FIELDS.GOOGLE_NAME]),
          hasFormData: !!(existingStartup.fields[SUBMISSION_FIELDS.STARTUP_NAME] || existingStartup.fields[SUBMISSION_FIELDS.DRUG_MODALITY]),
          fields: existingStartup.fields
        }
      });
    } else {
      console.log('❌ No record found for email:', email);
      
      return res.json({
        success: true,
        message: "No record found",
        data: {
          exists: false,
          email: email
        }
      });
    }
  } catch (error) {
    console.error('❌ Error testing connection:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Timeline Activities Management
// GET /api/client/matches/:id/activities - Get all activities for a match
router.get("/matches/:id/activities", authenticateClient, async (req: Request, res: Response) => {
  try {
    const clientCompany = (req as any).clientCompany;
    const matchId = parseInt(req.params.id);
    
    const match = await storage.getClientMatch(matchId);
    if (!match || match.clientCompanyId !== clientCompany.id) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
      });
    }

    const activities = await storage.getMatchActivities(matchId);
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error("Activities fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities"
    });
  }
});

// POST /api/client/matches/:id/activities - Create new activity
router.post("/matches/:id/activities", authenticateClient, async (req: Request, res: Response) => {
  try {
    const clientCompany = (req as any).clientCompany;
    const matchId = parseInt(req.params.id);
    
    const match = await storage.getClientMatch(matchId);
    if (!match || match.clientCompanyId !== clientCompany.id) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
      });
    }

    const validatedData = insertMatchActivitySchema.parse({
      ...req.body,
      clientMatchId: matchId
    });

    const activity = await storage.createMatchActivity(validatedData);
    res.json({
      success: true,
      message: "Activity created successfully",
      data: activity
    });
  } catch (error) {
    console.error("Activity creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create activity"
    });
  }
});

// PUT /api/client/matches/:id/activities/:activityId - Update activity
router.put("/matches/:id/activities/:activityId", authenticateClient, async (req: Request, res: Response) => {
  try {
    const clientCompany = (req as any).clientCompany;
    const matchId = parseInt(req.params.id);
    const activityId = parseInt(req.params.activityId);
    
    const match = await storage.getClientMatch(matchId);
    if (!match || match.clientCompanyId !== clientCompany.id) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
      });
    }

    const activity = await storage.getMatchActivity(activityId);
    if (!activity || activity.clientMatchId !== matchId) {
      return res.status(404).json({
        success: false,
        message: "Activity not found"
      });
    }

    const updates = req.body;
    const updatedActivity = await storage.updateMatchActivity(activityId, updates);
    
    res.json({
      success: true,
      message: "Activity updated successfully",
      data: updatedActivity
    });
  } catch (error) {
    console.error("Activity update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update activity"
    });
  }
});

// DELETE /api/client/matches/:id/activities/:activityId - Delete activity
router.delete("/matches/:id/activities/:activityId", authenticateClient, async (req: Request, res: Response) => {
  try {
    const clientCompany = (req as any).clientCompany;
    const matchId = parseInt(req.params.id);
    const activityId = parseInt(req.params.activityId);
    
    const match = await storage.getClientMatch(matchId);
    if (!match || match.clientCompanyId !== clientCompany.id) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
      });
    }

    const activity = await storage.getMatchActivity(activityId);
    if (!activity || activity.clientMatchId !== matchId) {
      return res.status(404).json({
        success: false,
        message: "Activity not found"
      });
    }

    await storage.deleteMatchActivity(activityId);
    
    res.json({
      success: true,
      message: "Activity deleted successfully"
    });
  } catch (error) {
    console.error("Activity deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete activity"
    });
  }
});

export default router; 