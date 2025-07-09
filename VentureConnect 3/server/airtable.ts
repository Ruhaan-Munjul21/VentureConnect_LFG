const AIRTABLE_API_KEY = 'patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f';
const BASE_ID = 'app768aQ07mCJoyu8';

const TABLES = {
  STARTUP_SUBMISSIONS: 'Startup Submissions',
  VC_DATABASE: 'VC Database', 
  MATCHES: 'Startup-VC Matches (POST GPT PRE-SCAN)'
};

const SUBMISSION_FIELDS = {
  STARTUP_NAME: 'Startup Name',
  DRUG_MODALITY: 'Drug Modality',
  DISEASE_FOCUS: 'Disease Focus', 
  INVESTMENT_STAGE: 'Investment Stage',
  GEOGRAPHY: 'Geography',
  INVESTMENT_AMOUNT: 'Investment Amount',
  EMAIL: 'Email',
  PITCH_DECK_URL: 'Pitch Deck Public URL',
  CONTACT_NAME: 'Contact Name',
  PHONE: 'Phone Number',
  DESCRIPTION: 'Company Description',
  PASSWORD: 'Password Hash',
  FORM_COMPLETED: 'Form Completed',
  GOOGLE_USER_ID: 'Google User ID',
  GOOGLE_NAME: 'Google Name'
};

const VC_FIELDS = {
  NAME: 'VC/Investor Name',
  FIRM: 'Firm',
  EMAIL: 'Email',
  PHONE: 'Phone',
  LINKEDIN: 'LinkedIn',
  WEBSITE: 'Website URL',
  INVESTMENT_FOCUS: 'Investment Focus',
  INVESTMENT_STAGE: 'Investment Stage',
  GEOGRAPHY: 'Geography',
  PORTFOLIO_SIZE: 'Portfolio Size',
  DESCRIPTION: 'Description'
};

const MATCH_FIELDS = {
  STARTUP_NAME: 'Startup Name',
  VC_NAME: 'VC Name', 
  GPT_FIT: 'GPT fit?',
  MANUALLY_APPROVED: 'Manually Approved?',
  SIMILARITY_SCORE: 'Similarity Score',
  CLIENT_ACCESS: 'Client Access'
};

export class AirtableService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `https://api.airtable.com/v0/${BASE_ID}`;
    this.headers = {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  // Startup Submissions CRUD
  async getStartups() {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.STARTUP_SUBMISSIONS}`, {
        headers: this.headers
      });
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching startups:', error);
      return [];
    }
  }

  async getStartup(recordId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.STARTUP_SUBMISSIONS}/${recordId}`, {
        headers: this.headers
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching startup:', error);
      return null;
    }
  }

  async createStartup({ email, companyName, passwordHash }: { email: string, companyName: string, passwordHash: string }) {
    const fields: any = {
      [SUBMISSION_FIELDS.EMAIL]: email,
      [SUBMISSION_FIELDS.PASSWORD]: passwordHash,
    };
    
    // Only set startup name if it's not empty
    if (companyName && companyName.trim() !== '') {
      fields[SUBMISSION_FIELDS.STARTUP_NAME] = companyName;
    }
    
    const url = `${this.baseUrl}/Startup%20Submissions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ fields }),
    });
    if (!response.ok) {
      const error = await response.text();
      console.error('Airtable create startup error response:', error);
      return null;
    }
    const data = await response.json();
    return data;
  }

  async updateStartup(recordId: string, fields: Record<string, any>) {
    try {
      console.log('Updating startup with ID:', recordId);
      console.log('Update fields:', fields);
      
      const encodedTableName = encodeURIComponent(TABLES.STARTUP_SUBMISSIONS);
      const url = `${this.baseUrl}/${encodedTableName}/${recordId}`;
      console.log('Update URL:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ fields })
      });
      
      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Airtable update error response:', errorText);
        throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Update successful:', result);
      return result;
    } catch (error) {
      console.error('Error updating startup:', error);
      return null;
    }
  }

  async deleteStartup(recordId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.STARTUP_SUBMISSIONS}/${recordId}`, {
        method: 'DELETE',
        headers: this.headers
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting startup:', error);
      return false;
    }
  }

  // Find startup by email
  async findStartupByEmail(email: string) {
    try {
      const startups = await this.getStartups();
      return startups.find((startup: any) => {
        const fields = startup.fields;
        return fields.Email && fields.Email.toLowerCase() === email.toLowerCase();
      });
    } catch (error) {
      console.error('Error finding startup by email:', error);
      return null;
    }
  }

  // Upsert startup by email - update existing or create new
  async upsertStartupByEmail(email: string, fields: Record<string, any>) {
    try {
      // First try to find existing record by email
      const existingStartup = await this.findStartupByEmail(email);
      
      if (existingStartup) {
        // Update existing record
        console.log('Updating existing startup record for email:', email);
        return await this.updateStartup(existingStartup.id, fields);
      } else {
        // Create new record
        console.log('Creating new startup record for email:', email);
        return await this.createStartup({
          email: email,
          companyName: fields[SUBMISSION_FIELDS.STARTUP_NAME] || 'New Company',
          passwordHash: fields[SUBMISSION_FIELDS.PASSWORD] || `form_${Date.now()}`
        });
      }
    } catch (error) {
      console.error('Error upserting startup by email:', error);
      return null;
    }
  }

  // VC Database CRUD
  async getVCs() {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.VC_DATABASE}`, {
        headers: this.headers
      });
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching VCs:', error);
      return [];
    }
  }

  async getVC(recordId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.VC_DATABASE}/${recordId}`, {
        headers: this.headers
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching VC:', error);
      return null;
    }
  }

  async createVC(fields: Record<string, any>) {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.VC_DATABASE}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ fields })
      });
      return response.json();
    } catch (error) {
      console.error('Error creating VC:', error);
      return null;
    }
  }

  async updateVC(recordId: string, fields: Record<string, any>) {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.VC_DATABASE}/${recordId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ fields })
      });
      return response.json();
    } catch (error) {
      console.error('Error updating VC:', error);
      return null;
    }
  }

  async deleteVC(recordId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.VC_DATABASE}/${recordId}`, {
        method: 'DELETE',
        headers: this.headers
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting VC:', error);
      return false;
    }
  }

  // Matches CRUD
  async getMatches() {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.MATCHES}`, {
        headers: this.headers
      });
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  }

  async getMatch(recordId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.MATCHES}/${recordId}`, {
        headers: this.headers
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching match:', error);
      return null;
    }
  }

  async createMatch(fields: Record<string, any>) {
    try {
      console.log('Creating match with fields:', fields);
      
      const encodedTableName = encodeURIComponent(TABLES.MATCHES);
      const url = `${this.baseUrl}/${encodedTableName}`;
      console.log('Create match URL:', url);
      console.log('Request headers:', this.headers);
      console.log('Request body:', JSON.stringify({ fields }));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ fields })
      });
      
      console.log('Create match response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Airtable create match error response:', errorText);
        throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Create match successful:', result);
      return result;
    } catch (error) {
      console.error('Error creating match:', error);
      return null;
    }
  }

  async updateMatch(recordId: string, fields: Record<string, any>) {
    try {
      if (fields['Client Access'] !== undefined && fields['Client Access'] !== null) {
        fields['Client Access'] = fields['Client Access'] === 'Unlocked' || fields['Client Access'] === 'Locked'
          ? fields['Client Access']
          : (String(fields['Client Access']).toLowerCase() === 'unlocked' ? 'Unlocked' : 'Locked');
      }
      const encodedTableName = encodeURIComponent(TABLES.MATCHES);
      const url = `${this.baseUrl}/${encodedTableName}/${recordId}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ fields })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating match:', error);
      return null;
    }
  }

  async deleteMatch(recordId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${TABLES.MATCHES}/${recordId}`, {
        method: 'DELETE',
        headers: this.headers
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting match:', error);
      return false;
    }
  }

  // Form completion checking
  checkFormCompletion(startup: any) {
    const requiredFields = [
      SUBMISSION_FIELDS.STARTUP_NAME,
      SUBMISSION_FIELDS.DRUG_MODALITY,
      SUBMISSION_FIELDS.DISEASE_FOCUS,
      SUBMISSION_FIELDS.INVESTMENT_STAGE,
      SUBMISSION_FIELDS.GEOGRAPHY
    ];

    const missingFields: string[] = [];
    const fields = startup.fields || {};

    requiredFields.forEach(fieldName => {
      const value = fields[fieldName];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(fieldName);
      }
    });

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      completedFields: requiredFields.filter(field => !missingFields.includes(field))
    };
  }

  // Mark form as completed
  async markFormCompleted(recordId: string) {
    return this.updateStartup(recordId, {
      [SUBMISSION_FIELDS.FORM_COMPLETED]: true
    });
  }

  // Helper methods to transform data between Airtable and our schema
  transformStartupToClient(record: any) {
    return {
      id: record.id,
      companyName: record.fields[SUBMISSION_FIELDS.STARTUP_NAME] || '',
      email: record.fields[SUBMISSION_FIELDS.EMAIL] || '',
      contactName: record.fields[SUBMISSION_FIELDS.CONTACT_NAME] || '',
      phone: record.fields[SUBMISSION_FIELDS.PHONE] || null,
      sector: record.fields[SUBMISSION_FIELDS.DRUG_MODALITY] || null,
      stage: record.fields[SUBMISSION_FIELDS.INVESTMENT_STAGE] || null,
      fundingGoal: record.fields[SUBMISSION_FIELDS.INVESTMENT_AMOUNT] || null,
      description: record.fields[SUBMISSION_FIELDS.DESCRIPTION] || null,
      isActive: true,
      createdAt: record.createdTime,
      updatedAt: record.fields.lastModifiedTime || record.createdTime
    };
  }

  transformVCToInvestor(record: any) {
    return {
      id: record.id,
      name: record.fields[VC_FIELDS.NAME] || '',
      firm: record.fields[VC_FIELDS.FIRM] || '',
      email: record.fields[VC_FIELDS.EMAIL] || null,
      phone: record.fields[VC_FIELDS.PHONE] || null,
      linkedin: record.fields[VC_FIELDS.LINKEDIN] || null,
      website: record.fields[VC_FIELDS.WEBSITE] || null,
      investmentFocus: record.fields[VC_FIELDS.INVESTMENT_FOCUS] || null,
      investmentStage: record.fields[VC_FIELDS.INVESTMENT_STAGE] || null,
      geography: record.fields[VC_FIELDS.GEOGRAPHY] || null,
      portfolioSize: record.fields[VC_FIELDS.PORTFOLIO_SIZE] || null,
      description: record.fields[VC_FIELDS.DESCRIPTION] || null,
      isActive: true,
      createdAt: record.createdTime,
      updatedAt: record.fields.lastModifiedTime || record.createdTime
    };
  }

  transformMatchToClientMatch(record: any) {
    return {
      id: record.id,
      startupName: record.fields[MATCH_FIELDS.STARTUP_NAME] || '',
      vcName: record.fields[MATCH_FIELDS.VC_NAME] || '',
      gptFit: record.fields[MATCH_FIELDS.GPT_FIT] || false,
      manuallyApproved: record.fields[MATCH_FIELDS.MANUALLY_APPROVED] || false,
      similarityScore: record.fields[MATCH_FIELDS.SIMILARITY_SCORE] || 0,
      clientAccess: record.fields[MATCH_FIELDS.CLIENT_ACCESS] || 'locked',
      isActive: true,
      createdAt: record.createdTime,
      updatedAt: record.fields.lastModifiedTime || record.createdTime
    };
  }

  transformClientToStartupFields(client: any) {
    const fields: Record<string, any> = {};
    if (client.companyName) fields[SUBMISSION_FIELDS.STARTUP_NAME] = client.companyName;
    if (client.email) fields[SUBMISSION_FIELDS.EMAIL] = client.email;
    if (client.sector) fields[SUBMISSION_FIELDS.DRUG_MODALITY] = client.sector;
    if (client.stage) fields[SUBMISSION_FIELDS.INVESTMENT_STAGE] = client.stage;
    if (client.fundingGoal) fields[SUBMISSION_FIELDS.INVESTMENT_AMOUNT] = client.fundingGoal;
    // Only send fields that exist in Airtable
    return fields;
  }

  transformInvestorToVCFields(investor: any) {
    const fields: Record<string, any> = {};
    
    if (investor.name) fields[VC_FIELDS.NAME] = investor.name;
    if (investor.website) fields[VC_FIELDS.WEBSITE] = investor.website;
    if (investor.investmentStage) fields[VC_FIELDS.INVESTMENT_STAGE] = investor.investmentStage;
    if (investor.geography) fields[VC_FIELDS.GEOGRAPHY] = investor.geography;
    
    // Note: Firm, Email, Phone, LinkedIn, Investment Focus, Portfolio Size, and Description fields don't exist
    // so we skip them to avoid API errors
    
    return fields;
  }

  transformClientMatchToMatchFields(match: any) {
    const fields: Record<string, any> = {};
    if (match.startupName) fields['Startup Name'] = match.startupName;
    if (match.vcName) fields['VC Name'] = match.vcName;
    if (typeof match.gptFit !== 'undefined') fields['GPT fit?'] = match.gptFit;
    if (typeof match.manuallyApproved !== 'undefined') fields['Manually Approved?'] = match.manuallyApproved;
    // Always send Client Access as 'Locked' or 'Unlocked'
    if (typeof match.clientAccess !== 'undefined' && match.clientAccess !== null) {
      fields['Client Access'] = match.clientAccess === 'Unlocked' || match.clientAccess === 'Locked'
        ? match.clientAccess
        : (String(match.clientAccess).toLowerCase() === 'unlocked' ? 'Unlocked' : 'Locked');
    }
    return fields;
  }
}

export const airtableService = new AirtableService(); 