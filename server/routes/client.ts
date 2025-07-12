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
import { SUBMISSION_FIELDS } from "../airtable.js";

const router = express.Router();

// Middleware to authenticate client requests
const authenticateClient = async (req: Request, res: Response, next: any) => {
  console.log('=== AUTHENTICATE CLIENT MIDDLEWARE ===');
  const token = req.headers.authorization?.replace('Bearer ', '');
  console.log('Authorization header:', req.headers.authorization);
  console.log('Extracted token:', token ? '[PRESENT]' : '[MISSING]');
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ 
      success: false, 
      message: "Authentication token required" 
    });
  }

  try {
    console.log('Looking up token in storage...');
    const authToken = await storage.getClientAuthToken(token);
    console.log('Auth token found:', !!authToken);
    console.log('Auth token data:', authToken);
    
    if (!authToken) {
      console.log('❌ Invalid or expired token');
      return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired token" 
      });
    }

    // Get client from Airtable using the stored clientCompanyId
    const startups = await airtableService.getStartups();
    console.log('Total startups found:', startups.length);
    
    // Try to find by the stored clientCompanyId (which should be the Airtable ID)
    let clientCompany = startups.find((startup: any) => {
      console.log('Checking startup ID:', startup.id, 'against stored ID:', authToken.clientCompanyId);
      return startup.id === authToken.clientCompanyId.toString();
    });

    // If not found by exact ID match, try to find by email (fallback)
    if (!clientCompany) {
      console.log('Client not found by ID, trying to find by email...');
      // This is a fallback - we need to get the email from the token or session
      // For now, we'll return an error and ask user to re-login
      console.log('❌ Client not found by ID, authentication failed');
      return res.status(401).json({ 
        success: false, 
        message: "Client company not found. Please log in again." 
      });
    }

    console.log('✅ Client found:', clientCompany.id);
    console.log('Client company name:', clientCompany.fields['Startup Name']);

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

// POST /api/client/register - Register a new startup account
router.post("/register", async (req: Request, res: Response) => {
  try {
    console.log('=== REGISTRATION REQUEST DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { email, password, startupName } = req.body;
    
    console.log('Extracted values:');
    console.log('- email:', email, '(type:', typeof email, ')');
    console.log('- password:', password ? '[FILLED]' : '[EMPTY]', '(type:', typeof password, ')');
    console.log('- startupName:', startupName, '(type:', typeof startupName, ')');
    
    // Trim whitespace from all fields
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();
    const trimmedStartupName = startupName?.trim();
    
    console.log('After trimming:');
    console.log('- email:', trimmedEmail);
    console.log('- password:', trimmedPassword ? '[FILLED]' : '[EMPTY]');
    console.log('- startupName:', trimmedStartupName);
    
    if (!trimmedEmail || !trimmedPassword || !trimmedStartupName) {
      console.log('Validation failed:');
      console.log('- email valid:', !!trimmedEmail);
      console.log('- password valid:', !!trimmedPassword);
      console.log('- startupName valid:', !!trimmedStartupName);
      return res.status(400).json({ success: false, message: "Email, password, and startup name are required" });
    }
    
    // Get all startups and check for existing record with same email OR startup name
    const startups = await airtableService.getStartups();
    const existingByEmail = startups.find((startup: any) => {
      const transformed = airtableService.transformStartupToClient(startup);
      return transformed.email?.toLowerCase() === trimmedEmail.toLowerCase();
    });
    
    const existingByStartupName = startups.find((startup: any) => {
      const transformed = airtableService.transformStartupToClient(startup);
      return transformed.companyName?.toLowerCase() === trimmedStartupName.toLowerCase();
    });
    
    console.log('REGISTER: Looking for existing record with email:', trimmedEmail);
    console.log('REGISTER: Looking for existing record with startup name:', trimmedStartupName);
    console.log('REGISTER: Found existing by email:', !!existingByEmail);
    console.log('REGISTER: Found existing by startup name:', !!existingByStartupName);
    
    if (existingByEmail) {
      console.log('REGISTER: Existing record found by email:', existingByEmail.id);
      return res.status(409).json({ success: false, message: "Account already exists for this email" });
    }
    
    if (existingByStartupName) {
      console.log('REGISTER: Existing record found by startup name:', existingByStartupName.id);
      return res.status(409).json({ success: false, message: "Startup name already exists" });
    }
    
    // Create new record with startup info
    console.log('Creating startup account for:', trimmedEmail, 'startup:', trimmedStartupName);
    console.log('REGISTER: Will CREATE new record with email:', trimmedEmail);
    console.log('REGISTER: Will CREATE new record with startup name:', trimmedStartupName);
    
    const newRecord = await airtableService.createStartup({
      email: trimmedEmail,
      companyName: trimmedStartupName, // Use startup name as primary identifier
      passwordHash: trimmedPassword,
    });
    
    if (!newRecord) {
      console.error('Failed to create startup account for:', email);
      return res.status(500).json({ success: false, message: "Failed to create account" });
    }
    
    console.log('Successfully created startup account for:', email);
    console.log('REGISTER: New record created:', newRecord.id || newRecord.records?.[0]?.id);
    
    // Auto-login after registration (issue token)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store the actual Airtable ID, not a converted numeric ID
    const airtableId = newRecord.records?.[0]?.id || newRecord.id;
    
    console.log('REGISTER: Using identifier:', trimmedEmail);
    console.log('REGISTER: Will create auth token for Airtable ID:', airtableId);
    
    await storage.createClientAuthToken(airtableId, token, expiresAt);
    
    console.log('REGISTER: Auth token created successfully');
    console.log('REGISTER: Token:', token.substring(0, 20) + '...');
    
    return res.status(201).json({ 
      success: true, 
      message: "Startup account created successfully",
      token: token,
      expiresAt: expiresAt
    });
  } catch (err) {
    console.error("Error in /register:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/client/login - Email and password authentication
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    console.log("=== LOGIN ATTEMPT DEBUG ===");
    console.log("Email:", email);
    console.log("Password provided:", !!password);
    console.log("Password length:", password?.length);
    console.log("Password value:", password ? '[HIDDEN]' : '[EMPTY]');
    
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Get all startups and find by email only
    const startups = await airtableService.getStartups();
    console.log('Found startups:', startups.length);
    
    const clientCompany = startups.find((startup: any) => {
      const transformed = airtableService.transformStartupToClient(startup);
      console.log('Checking startup:', transformed.companyName, 'email:', transformed.email);
      return transformed.email?.toLowerCase() === email.toLowerCase();
    });

    console.log("User found:", !!clientCompany);
    if (clientCompany) {
      console.log("User ID:", clientCompany.id);
      console.log("User startup name:", clientCompany.fields['Startup Name']);
      console.log("User email:", clientCompany.fields['Email']);
    }

    if (!clientCompany) {
      console.log('❌ No client found for email:', email);
      return res.status(404).json({
        success: false,
        message: "No account found for this email"
      });
    }

    const storedPassword = clientCompany.fields['Password'];
    console.log("Stored password hash:", storedPassword ? '[PRESENT]' : '[MISSING]');
    console.log("Stored password length:", storedPassword?.length);
    
    if (!storedPassword) {
      console.log('❌ No stored password for client:', clientCompany.fields['Startup Name'] || 'Unknown');
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    
    // Simple string comparison (since passwords are stored as plain text in Airtable)
    const passwordMatch = storedPassword === password;
    console.log("Password match:", passwordMatch);
    console.log("Input password:", password);
    console.log("Stored password:", storedPassword);
    
    if (!passwordMatch) {
      console.log('❌ Invalid password for client:', clientCompany.fields['Startup Name'] || 'Unknown');
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    console.log('✅ Password is valid - generating token');

    // Password is valid - generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store the actual Airtable ID, not a converted numeric ID
    const airtableId = clientCompany.id;

    console.log('LOGIN: Found existing startup record:', clientCompany.id);
    console.log('LOGIN: Startup name:', clientCompany.fields['Startup Name']);
    console.log('LOGIN: Email:', clientCompany.fields['Email']);
    console.log('LOGIN: Using identifier:', email);
    console.log('LOGIN: Will create auth token for Airtable ID:', airtableId);

    await storage.createClientAuthToken(airtableId, token, expiresAt);

    console.log('LOGIN: Auth token created successfully');
    console.log('LOGIN: Token:', token.substring(0, 20) + '...');

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
      console.log(`Looking for VC with name: "${match.vcName}"`);
      console.log(`Available VC names:`, vcs.map((v: any) => v.fields['VC/Investor Name']).slice(0, 5));
      const vc = vcs.find((v: any) => v.fields['VC/Investor Name'] === match.vcName);
      console.log(`Found VC:`, vc ? 'YES' : 'NO');
      console.log(`VC object:`, vc);
      const vcInvestor = vc ? airtableService.transformVCToInvestor(vc) : {
        id: null,
        name: match.vcName, // Use the vcName as fallback
        firm: '',
        email: null,
        phone: null,
        linkedin: null,
        website: null,
        investmentFocus: null,
        investmentStage: null,
        geography: null,
        portfolioSize: null,
        description: null,
        isActive: true,
        createdAt: null,
        updatedAt: null
      };
      console.log(`Transformed vcInvestor:`, vcInvestor);
      return {
        ...match,
        vcInvestor: vcInvestor
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
    console.log("=== CHECKING CORE 5 FIELDS FOR EMAIL GROUP ===");
    console.log("Email being checked:", clientCompany.email);

    // Get ALL records with this exact email
    const allStartups = await airtableService.getStartups();
    const userEmail = clientCompany.email?.toLowerCase();
    const emailRecords = allStartups.filter((rec: any) => {
      const recEmail = rec.fields['Email']?.toLowerCase();
      return recEmail === userEmail;
    });
    console.log(`Found ${emailRecords.length} records for email: ${userEmail}`);

    // The EXACT 5 core fields we need
    const REQUIRED_FIELDS = [
      'Drug Modality',
      'Disease Focus',
      'Investment Stage',
      'Geography',
      'Investment Amount'
    ];

    // Track which fields we've found across ALL records
    const foundFields = new Set<string>();

    emailRecords.forEach((record: any, idx: number) => {
      console.log(`Record ${idx + 1}:`, record.id || 'no-id');
      REQUIRED_FIELDS.forEach(field => {
        const value = record.fields[field];
        if (value && value !== '' && value !== null && value !== undefined) {
          foundFields.add(field);
          console.log(`✅ Found ${field}: "${value}" in record ${idx + 1}`);
        }
      });
    });

    const foundFieldsArray = Array.from(foundFields);
    const missingFields = REQUIRED_FIELDS.filter(field => !foundFields.has(field));
    const allFieldsFound = foundFields.size === 5;

    console.log("Found fields across all records:", foundFieldsArray);
    console.log("Missing fields:", missingFields);
    console.log("All 5 core fields complete:", allFieldsFound);

    // Find the earliest completion time among all records with this email
    let completionTime: string | null = null;
    if (allFieldsFound) {
      for (const rec of emailRecords) {
        const recTime = rec.fields['Form Completed Time'];
        if (recTime && (!completionTime || new Date(recTime) < new Date(completionTime))) {
          completionTime = recTime;
        }
      }
    }

    // Find the earliest Created Time among all records with this email
    let submissionTime: string | null = null;
    if (emailRecords.length > 0) {
      for (const rec of emailRecords) {
        const created = rec.fields['Created Time'];
        if (created && (!submissionTime || new Date(created) < new Date(submissionTime))) {
          submissionTime = created;
        }
      }
    }

    return res.json({
      success: true,
      data: {
        isComplete: allFieldsFound,
        foundFields: foundFieldsArray,
        missingFields,
        companyName: clientCompany.companyName,
        completionTime: completionTime || null,
        submissionTime: submissionTime || null,
        totalRecords: emailRecords.length
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
    let { email, startupName, ...formData } = req.body;
    // Always trim and lowercase for comparison
    email = email?.trim().toLowerCase();
    startupName = startupName?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    if (!startupName) {
      return res.status(400).json({
        success: false,
        message: "Startup name is required"
      });
    }

    console.log('=== FORM SUBMISSION RECEIVED (NO VERIFICATION) ===');
    console.log('Email:', email);
    console.log('Startup Name:', startupName);
    console.log('Form data:', formData);

    // Try to find existing record by email (case-insensitive)
    let existingStartup = await airtableService.findStartupByEmail(email);
    if (!existingStartup) {
      console.log('FORM: No existing record found by email, trying startup name...');
      // If not found by email, try by startup name (case-insensitive)
      existingStartup = await airtableService.findStartupByName(startupName);
      if (existingStartup) {
        console.log('✅ Found existing startup record by startup name:', existingStartup.id);
        console.log('FORM: Found existing record:', existingStartup.fields);
      } else {
        console.log('FORM: No existing record found by startup name either');
      }
    } else {
      console.log('✅ Found existing startup record by email:', existingStartup.id);
      console.log('FORM: Found existing record:', existingStartup.fields);
    }

    // Prepare fields to update (use original case for storage)
    const fields: Record<string, any> = {};
    fields[SUBMISSION_FIELDS.STARTUP_NAME] = req.body.startupName?.trim();
    fields[SUBMISSION_FIELDS.EMAIL] = req.body.email?.trim();
    if (formData.drugModality) fields[SUBMISSION_FIELDS.DRUG_MODALITY] = formData.drugModality;
    if (formData.diseaseFocus) fields[SUBMISSION_FIELDS.DISEASE_FOCUS] = formData.diseaseFocus;
    if (formData.investmentStage) fields[SUBMISSION_FIELDS.INVESTMENT_STAGE] = formData.investmentStage;
    if (formData.geography) fields[SUBMISSION_FIELDS.GEOGRAPHY] = formData.geography;
    if (formData.investmentAmount) fields[SUBMISSION_FIELDS.INVESTMENT_AMOUNT] = formData.investmentAmount;
    if (formData.contactName) fields[SUBMISSION_FIELDS.CONTACT_NAME] = formData.contactName;
    if (formData.phone) fields[SUBMISSION_FIELDS.PHONE] = formData.phone;
    if (formData.description) fields[SUBMISSION_FIELDS.DESCRIPTION] = formData.description;
    if (formData.pitchDeckUrl) fields[SUBMISSION_FIELDS.PITCH_DECK_URL] = formData.pitchDeckUrl;
    // Mark form as completed with timestamp
    fields[SUBMISSION_FIELDS.FORM_COMPLETED] = true;
    fields[SUBMISSION_FIELDS.FORM_COMPLETED_TIME] = new Date().toISOString();

    if (existingStartup) {
      // Update existing record
      console.log('🔄 Updating existing startup record:', existingStartup.id);
      const result = await airtableService.updateStartup(existingStartup.id, fields);
      if (!result) {
        console.error('❌ Failed to update existing startup record');
        return res.status(500).json({
          success: false,
          message: "Failed to update existing startup record"
        });
      }
      console.log('✅ Successfully updated startup record:', existingStartup.id);
      return res.json({
        success: true,
        message: "Form submission updated existing record successfully",
        data: {
          email: req.body.email?.trim(),
          startupName: req.body.startupName?.trim(),
          recordId: existingStartup.id,
          updated: result,
          completionTime: new Date().toISOString()
        }
      });
    } else {
      // Create new record
      console.log('🆕 No existing record found, creating new startup record');
      const result = await airtableService.createStartup({
        email: req.body.email?.trim(),
        companyName: req.body.startupName?.trim(),
        passwordHash: `form_${Date.now()}`
      });
      if (!result) {
        console.error('❌ Failed to create new startup record');
        return res.status(500).json({
          success: false,
          message: "Failed to create new startup record"
        });
      }
      console.log('✅ Successfully created new startup record:', result.id || result.records?.[0]?.id);
      return res.json({
        success: true,
        message: "Form submission created new record successfully",
        data: {
          email: req.body.email?.trim(),
          startupName: req.body.startupName?.trim(),
          recordId: result.id || result.records?.[0]?.id,
          completionTime: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error("Error in /form-submission:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
