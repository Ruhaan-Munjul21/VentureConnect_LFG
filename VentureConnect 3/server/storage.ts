import { 
  users, 
  waitlistSignups, 
  clientCompanies,
  vcInvestors,
  clientMatches,
  outreachProgress,
  clientAuthTokens,
  type User, 
  type InsertUser, 
  type WaitlistSignup, 
  type InsertWaitlistSignup,
  type ClientCompany,
  type InsertClientCompany,
  type VCInvestor,
  type InsertVCInvestor,
  type ClientMatch,
  type InsertClientMatch,
  type OutreachProgress,
  type InsertOutreachProgress,
  type ClientAuthToken,
  type MatchActivity,
  type InsertMatchActivity
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Waitlist functionality
  addToWaitlist(signup: InsertWaitlistSignup): Promise<WaitlistSignup>;
  getWaitlistSignup(email: string): Promise<WaitlistSignup | undefined>;
  getWaitlistCount(): Promise<number>;
  getAllWaitlistSignups(): Promise<WaitlistSignup[]>;

  // Client companies
  getClientCompany(id: number): Promise<ClientCompany | undefined>;
  getClientCompanyByEmail(email: string): Promise<ClientCompany | undefined>;
  createClientCompany(company: InsertClientCompany): Promise<ClientCompany>;
  updateClientCompany(id: number, updates: Partial<ClientCompany>): Promise<ClientCompany>;
  deleteClientCompany(id: number): Promise<void>;
  getAllClientCompanies(): Promise<ClientCompany[]>;

  // VC investors
  getVCInvestor(id: number): Promise<VCInvestor | undefined>;
  createVCInvestor(investor: InsertVCInvestor): Promise<VCInvestor>;
  updateVCInvestor(id: number, updates: Partial<VCInvestor>): Promise<VCInvestor>;
  getAllVCInvestors(): Promise<VCInvestor[]>;

  // Client matches
  getClientMatch(id: number): Promise<ClientMatch | undefined>;
  createClientMatch(match: InsertClientMatch): Promise<ClientMatch>;
  updateClientMatch(id: number, updates: Partial<ClientMatch>): Promise<ClientMatch>;
  getClientMatches(clientCompanyId: number): Promise<ClientMatch[]>;
  getAllClientMatches(): Promise<ClientMatch[]>;

  // Outreach progress
  getOutreachProgress(id: number): Promise<OutreachProgress | undefined>;
  createOutreachProgress(progress: InsertOutreachProgress): Promise<OutreachProgress>;
  updateOutreachProgress(id: number, updates: Partial<OutreachProgress>): Promise<OutreachProgress>;
  getOutreachProgressByMatch(clientMatchId: number): Promise<OutreachProgress | undefined>;

  // Client authentication
  createClientAuthToken(clientCompanyId: number, token: string, expiresAt: Date): Promise<ClientAuthToken>;
  getClientAuthToken(token: string): Promise<ClientAuthToken | undefined>;
  deleteClientAuthToken(token: string): Promise<void>;
  cleanupExpiredTokens(): Promise<void>;

  // Match activities (timeline)
  getMatchActivity(id: number): Promise<MatchActivity | undefined>;
  createMatchActivity(activity: InsertMatchActivity): Promise<MatchActivity>;
  updateMatchActivity(id: number, updates: Partial<MatchActivity>): Promise<MatchActivity>;
  getMatchActivities(clientMatchId: number): Promise<MatchActivity[]>;
  deleteMatchActivity(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private waitlistSignups: Map<number, WaitlistSignup>;
  private clientCompanies: Map<number, ClientCompany>;
  private vcInvestors: Map<number, VCInvestor>;
  private clientMatches: Map<number, ClientMatch>;
  private outreachProgress: Map<number, OutreachProgress>;
  private clientAuthTokens: Map<string, ClientAuthToken>;
  private matchActivities: Map<number, MatchActivity>;
  
  private currentUserId: number;
  private currentWaitlistId: number;
  private currentClientCompanyId: number;
  private currentVCInvestorId: number;
  private currentClientMatchId: number;
  private currentOutreachProgressId: number;
  private currentMatchActivityId: number;

  constructor() {
    this.users = new Map();
    this.waitlistSignups = new Map();
    this.clientCompanies = new Map();
    this.vcInvestors = new Map();
    this.clientMatches = new Map();
    this.outreachProgress = new Map();
    this.clientAuthTokens = new Map();
    this.matchActivities = new Map();
    
    this.currentUserId = 1;
    this.currentWaitlistId = 1;
    this.currentClientCompanyId = 1;
    this.currentVCInvestorId = 1;
    this.currentClientMatchId = 1;
    this.currentOutreachProgressId = 1;
    this.currentMatchActivityId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async addToWaitlist(insertSignup: InsertWaitlistSignup): Promise<WaitlistSignup> {
    // Check if email already exists
    const existing = await this.getWaitlistSignup(insertSignup.email);
    if (existing) {
      throw new Error("Email already registered for waitlist");
    }

    const id = this.currentWaitlistId++;
    const signup: WaitlistSignup = {
      ...insertSignup,
      id,
      createdAt: new Date(),
    };
    this.waitlistSignups.set(id, signup);
    return signup;
  }

  async getWaitlistSignup(email: string): Promise<WaitlistSignup | undefined> {
    return Array.from(this.waitlistSignups.values()).find(
      (signup) => signup.email === email,
    );
  }

  async getWaitlistCount(): Promise<number> {
    return this.waitlistSignups.size;
  }

  async getAllWaitlistSignups(): Promise<WaitlistSignup[]> {
    return Array.from(this.waitlistSignups.values());
  }

  async getClientCompany(id: number): Promise<ClientCompany | undefined> {
    return this.clientCompanies.get(id);
  }

  async getClientCompanyByEmail(email: string): Promise<ClientCompany | undefined> {
    return Array.from(this.clientCompanies.values()).find(
      (company) => company.email === email,
    );
  }

  async createClientCompany(insertCompany: InsertClientCompany): Promise<ClientCompany> {
    const id = this.currentClientCompanyId++;
    const now = new Date();
    const company: ClientCompany = {
      ...insertCompany,
      id,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      phone: insertCompany.phone || null,
      sector: insertCompany.sector || null,
      stage: insertCompany.stage || null,
      fundingGoal: insertCompany.fundingGoal || null,
      description: insertCompany.description || null,
    };
    this.clientCompanies.set(id, company);
    return company;
  }

  async updateClientCompany(id: number, updates: Partial<ClientCompany>): Promise<ClientCompany> {
    const company = this.clientCompanies.get(id);
    if (!company) {
      throw new Error("Client company not found");
    }
    const updatedCompany: ClientCompany = {
      ...company,
      ...updates,
      updatedAt: new Date(),
    };
    this.clientCompanies.set(id, updatedCompany);
    return updatedCompany;
  }

  async deleteClientCompany(id: number): Promise<void> {
    this.clientCompanies.delete(id);
  }

  async getAllClientCompanies(): Promise<ClientCompany[]> {
    return Array.from(this.clientCompanies.values());
  }

  async getVCInvestor(id: number): Promise<VCInvestor | undefined> {
    return this.vcInvestors.get(id);
  }

  async createVCInvestor(insertInvestor: InsertVCInvestor): Promise<VCInvestor> {
    const id = this.currentVCInvestorId++;
    const now = new Date();
    const investor: VCInvestor = {
      ...insertInvestor,
      id,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      email: insertInvestor.email || null,
      phone: insertInvestor.phone || null,
      linkedin: insertInvestor.linkedin || null,
      website: insertInvestor.website || null,
      investmentFocus: insertInvestor.investmentFocus || null,
      investmentStage: insertInvestor.investmentStage || null,
      geography: insertInvestor.geography || null,
      portfolioSize: insertInvestor.portfolioSize || null,
      description: insertInvestor.description || null,
    };
    this.vcInvestors.set(id, investor);
    return investor;
  }

  async updateVCInvestor(id: number, updates: Partial<VCInvestor>): Promise<VCInvestor> {
    const investor = this.vcInvestors.get(id);
    if (!investor) {
      throw new Error("VC investor not found");
    }
    const updatedInvestor: VCInvestor = {
      ...investor,
      ...updates,
      updatedAt: new Date(),
    };
    this.vcInvestors.set(id, updatedInvestor);
    return updatedInvestor;
  }

  async getAllVCInvestors(): Promise<VCInvestor[]> {
    return Array.from(this.vcInvestors.values());
  }

  async getClientMatch(id: number): Promise<ClientMatch | undefined> {
    return this.clientMatches.get(id);
  }

  async createClientMatch(insertMatch: InsertClientMatch): Promise<ClientMatch> {
    const id = this.currentClientMatchId++;
    const now = new Date();
    const match: ClientMatch = {
      ...insertMatch,
      id,
      assignedAt: now,
      isActive: true,
      isUnlocked: insertMatch.isUnlocked || false,
      assignedBy: insertMatch.assignedBy || null,
      notes: insertMatch.notes || null,
    };
    this.clientMatches.set(id, match);
    return match;
  }

  async updateClientMatch(id: number, updates: Partial<ClientMatch>): Promise<ClientMatch> {
    const match = this.clientMatches.get(id);
    if (!match) {
      throw new Error("Client match not found");
    }
    const updatedMatch: ClientMatch = {
      ...match,
      ...updates,
    };
    this.clientMatches.set(id, updatedMatch);
    return updatedMatch;
  }

  async getClientMatches(clientCompanyId: number): Promise<ClientMatch[]> {
    return Array.from(this.clientMatches.values()).filter(
      (match) => match.clientCompanyId === clientCompanyId && match.isActive
    );
  }

  async getAllClientMatches(): Promise<ClientMatch[]> {
    return Array.from(this.clientMatches.values());
  }

  async getOutreachProgress(id: number): Promise<OutreachProgress | undefined> {
    return this.outreachProgress.get(id);
  }

  async createOutreachProgress(insertProgress: InsertOutreachProgress): Promise<OutreachProgress> {
    const id = this.currentOutreachProgressId++;
    const now = new Date();
    const progress: OutreachProgress = {
      ...insertProgress,
      id,
      createdAt: now,
      updatedAt: now,
      status: insertProgress.status || "not_contacted",
      notes: insertProgress.notes || null,
      contactDate: insertProgress.contactDate || null,
      responseDate: insertProgress.responseDate || null,
      meetingDate: insertProgress.meetingDate || null,
    };
    this.outreachProgress.set(id, progress);
    return progress;
  }

  async updateOutreachProgress(id: number, updates: Partial<OutreachProgress>): Promise<OutreachProgress> {
    const progress = this.outreachProgress.get(id);
    if (!progress) {
      throw new Error("Outreach progress not found");
    }
    const updatedProgress: OutreachProgress = {
      ...progress,
      ...updates,
      updatedAt: new Date(),
    };
    this.outreachProgress.set(id, updatedProgress);
    return updatedProgress;
  }

  async getOutreachProgressByMatch(clientMatchId: number): Promise<OutreachProgress | undefined> {
    return Array.from(this.outreachProgress.values()).find(
      (progress) => progress.clientMatchId === clientMatchId
    );
  }

  async createClientAuthToken(clientCompanyId: number, token: string, expiresAt: Date): Promise<ClientAuthToken> {
    const authToken: ClientAuthToken = {
      id: Date.now(), // Simple ID generation
      clientCompanyId,
      token,
      expiresAt,
      createdAt: new Date(),
    };
    this.clientAuthTokens.set(token, authToken);
    return authToken;
  }

  async getClientAuthToken(token: string): Promise<ClientAuthToken | undefined> {
    const authToken = this.clientAuthTokens.get(token);
    if (!authToken) return undefined;
    
    // Check if token is expired
    if (authToken.expiresAt < new Date()) {
      this.clientAuthTokens.delete(token);
      return undefined;
    }
    
    return authToken;
  }

  async deleteClientAuthToken(token: string): Promise<void> {
    this.clientAuthTokens.delete(token);
  }

  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    const tokensToDelete: string[] = [];
    this.clientAuthTokens.forEach((authToken, token) => {
      if (authToken.expiresAt < now) {
        tokensToDelete.push(token);
      }
    });
    tokensToDelete.forEach(token => {
      this.clientAuthTokens.delete(token);
    });
  }

  // Match activities (timeline)
  async getMatchActivity(id: number): Promise<MatchActivity | undefined> {
    return this.matchActivities.get(id);
  }

  async createMatchActivity(insertActivity: InsertMatchActivity): Promise<MatchActivity> {
    const id = this.currentMatchActivityId++;
    const now = new Date();
    const activity: MatchActivity = {
      ...insertActivity,
      id,
      createdAt: now,
      updatedAt: now,
      status: insertActivity.status || "completed",
      description: insertActivity.description || null,
      notes: insertActivity.notes || null,
      nextAction: insertActivity.nextAction || null,
      nextActionDate: insertActivity.nextActionDate || null,
      createdBy: insertActivity.createdBy || null,
    };
    this.matchActivities.set(id, activity);
    return activity;
  }

  async updateMatchActivity(id: number, updates: Partial<MatchActivity>): Promise<MatchActivity> {
    const activity = this.matchActivities.get(id);
    if (!activity) {
      throw new Error("Match activity not found");
    }
    const updatedActivity: MatchActivity = {
      ...activity,
      ...updates,
      updatedAt: new Date(),
    };
    this.matchActivities.set(id, updatedActivity);
    return updatedActivity;
  }

  async getMatchActivities(clientMatchId: number): Promise<MatchActivity[]> {
    return Array.from(this.matchActivities.values()).filter(
      (activity) => activity.clientMatchId === clientMatchId
    );
  }

  async deleteMatchActivity(id: number): Promise<void> {
    this.matchActivities.delete(id);
  }
}

export const storage = new MemStorage();
