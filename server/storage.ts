import { users, orders, otpCodes } from "@shared/schema";
import type { User, InsertUser, Order, InsertOrder, OtpCode, InsertOtpCode } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // OTP operations
  createOtp(otp: InsertOtpCode): Promise<OtpCode>;
  getOtpByUserAndPhone(userId: number, phone: string): Promise<OtpCode | undefined>;
  verifyOtp(userId: number, phone: string, code: string): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private orders: Map<number, Order>;
  private otpCodes: Map<number, OtpCode>;
  currentUserId: number;
  currentOrderId: number;
  currentOtpId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.orders = new Map();
    this.otpCodes = new Map();
    this.currentUserId = 1;
    this.currentOrderId = 1;
    this.currentOtpId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });

    // Create admin user
    this.createUser({
      name: "Admin User",
      email: "admin@cybershield.com",
      phone: "+1234567890",
      password: "hashed_admin_password",
      verified: true,
      role: "admin"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.getUserByEmail(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const now = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      status, 
      updatedAt: new Date() 
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // OTP operations
  async createOtp(insertOtp: InsertOtpCode): Promise<OtpCode> {
    const id = this.currentOtpId++;
    const now = new Date();
    const otp: OtpCode = { ...insertOtp, id, createdAt: now };
    this.otpCodes.set(id, otp);
    return otp;
  }

  async getOtpByUserAndPhone(userId: number, phone: string): Promise<OtpCode | undefined> {
    return Array.from(this.otpCodes.values()).find(
      (otp) => otp.userId === userId && otp.phone === phone && otp.expiresAt > new Date()
    );
  }

  async verifyOtp(userId: number, phone: string, code: string): Promise<boolean> {
    const otp = await this.getOtpByUserAndPhone(userId, phone);
    
    // Debug logs to help identify issues
    console.log('Verifying OTP:', { userId, phone, providedCode: code });
    console.log('Found OTP:', otp);
    
    if (!otp) {
      console.log('No OTP found for this user and phone');
      return false;
    }
    
    const isMatch = otp.code === code;
    console.log(`OTP Verification ${isMatch ? 'Success' : 'Failed'}: Expected ${otp.code}, Got ${code}`);
    
    return isMatch;
  }
}

export const storage = new MemStorage();
