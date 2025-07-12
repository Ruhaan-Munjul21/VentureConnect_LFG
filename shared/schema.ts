import { pgTable, text, serial, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const waitlistSignups = pgTable("waitlist_signups", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Client companies (therapeutic companies)
export const clientCompanies = pgTable("client_companies", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  email: text("email").notNull().unique(),
  contactName: text("contact_name").notNull(),
  phone: text("phone"),
  sector: text("sector"),
  stage: text("stage"),
  fundingGoal: text("funding_goal"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// VC database
export const vcInvestors = pgTable("vc_investors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  firm: text("firm").notNull(),
  email: text("email"),
  phone: text("phone"),
  linkedin: text("linkedin"),
  website: text("website"),
  investmentFocus: text("investment_focus"),
  investmentStage: text("investment_stage"),
  geography: text("geography"),
  portfolioSize: text("portfolio_size"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Client-VC matches assigned by admin
export const clientMatches = pgTable("client_matches", {
  id: serial("id").primaryKey(),
  clientCompanyId: integer("client_company_id").notNull().references(() => clientCompanies.id),
  vcInvestorId: integer("vc_investor_id").notNull().references(() => vcInvestors.id),
  isUnlocked: boolean("is_unlocked").notNull().default(false), // false = teaser, true = full contact info
  assignedBy: integer("assigned_by").references(() => users.id), // admin who assigned this match
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  notes: text("notes"), // admin notes about this match
  isActive: boolean("is_active").notNull().default(true),
});

// Timeline activities for VC relationships
export const matchActivities = pgTable("match_activities", {
  id: serial("id").primaryKey(),
  clientMatchId: integer("client_match_id").notNull().references(() => clientMatches.id),
  activityType: text("activity_type").notNull(), // initial_contact, email_sent, call_scheduled, meeting_held, pitch_presented, due_diligence, term_sheet, deal_closed, follow_up, etc.
  title: text("title").notNull(),
  description: text("description"),
  activityDate: timestamp("activity_date").notNull(),
  nextAction: text("next_action"),
  nextActionDate: timestamp("next_action_date"),
  status: text("status").notNull().default("completed"), // completed, pending, cancelled
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id), // admin who created the activity
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Progress tracking for client outreach (simplified - now handled by activities)
export const outreachProgress = pgTable("outreach_progress", {
  id: serial("id").primaryKey(),
  clientMatchId: integer("client_match_id").notNull().references(() => clientMatches.id),
  status: text("status").notNull().default("not_contacted"), // not_contacted, contacted, responded, meeting_scheduled, deal_closed
  contactDate: timestamp("contact_date"),
  responseDate: timestamp("response_date"),
  meetingDate: timestamp("meeting_date"),
  notes: text("notes"), // client notes about this outreach
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Client authentication tokens (for email-based login)
export const clientAuthTokens = pgTable("client_auth_tokens", {
  id: serial("id").primaryKey(),
  clientCompanyId: integer("client_company_id").notNull().references(() => clientCompanies.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schema validation schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWaitlistSignupSchema = createInsertSchema(waitlistSignups).pick({
  email: true,
});

export const insertClientCompanySchema = createInsertSchema(clientCompanies).pick({
  companyName: true,
  email: true,
  contactName: true,
  phone: true,
  sector: true,
  stage: true,
  fundingGoal: true,
  description: true,
});

export const insertVCInvestorSchema = createInsertSchema(vcInvestors).pick({
  name: true,
  firm: true,
  email: true,
  phone: true,
  linkedin: true,
  website: true,
  investmentFocus: true,
  investmentStage: true,
  geography: true,
  portfolioSize: true,
  description: true,
});

export const insertClientMatchSchema = createInsertSchema(clientMatches).pick({
  clientCompanyId: true,
  vcInvestorId: true,
  isUnlocked: true,
  assignedBy: true,
  notes: true,
});

export const insertMatchActivitySchema = createInsertSchema(matchActivities).pick({
  clientMatchId: true,
  activityType: true,
  title: true,
  description: true,
  activityDate: true,
  nextAction: true,
  nextActionDate: true,
  status: true,
  notes: true,
  createdBy: true,
});

export const insertOutreachProgressSchema = createInsertSchema(outreachProgress).pick({
  clientMatchId: true,
  status: true,
  contactDate: true,
  responseDate: true,
  meetingDate: true,
  notes: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWaitlistSignup = z.infer<typeof insertWaitlistSignupSchema>;
export type WaitlistSignup = typeof waitlistSignups.$inferSelect;
export type ClientCompany = typeof clientCompanies.$inferSelect;
export type InsertClientCompany = z.infer<typeof insertClientCompanySchema>;
export type VCInvestor = typeof vcInvestors.$inferSelect;
export type InsertVCInvestor = z.infer<typeof insertVCInvestorSchema>;
export type ClientMatch = typeof clientMatches.$inferSelect;
export type InsertClientMatch = z.infer<typeof insertClientMatchSchema>;
export type MatchActivity = typeof matchActivities.$inferSelect;
export type InsertMatchActivity = z.infer<typeof insertMatchActivitySchema>;
export type OutreachProgress = typeof outreachProgress.$inferSelect;
export type InsertOutreachProgress = z.infer<typeof insertOutreachProgressSchema>;
export type ClientAuthToken = typeof clientAuthTokens.$inferSelect;
