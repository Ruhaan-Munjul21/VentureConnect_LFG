import { users, waitlistSignups, type User, type InsertUser, type WaitlistSignup, type InsertWaitlistSignup } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Waitlist functionality
  addToWaitlist(signup: InsertWaitlistSignup): Promise<WaitlistSignup>;
  getWaitlistSignup(email: string): Promise<WaitlistSignup | undefined>;
  getWaitlistCount(): Promise<number>;
  getAllWaitlistSignups(): Promise<WaitlistSignup[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private waitlistSignups: Map<number, WaitlistSignup>;
  private currentUserId: number;
  private currentWaitlistId: number;

  constructor() {
    this.users = new Map();
    this.waitlistSignups = new Map();
    this.currentUserId = 1;
    this.currentWaitlistId = 1;
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
}

export const storage = new MemStorage();
