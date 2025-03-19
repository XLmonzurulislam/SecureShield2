import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupOtpRoutes } from "./otp";
import { insertOrderSchema, updateOrderStatusSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from 'zod-validation-error';
// import { websocketService } from "./services/websocket-service"; // Removed

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to check if user is an admin
function isAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Admin access required" });
}

// Function to check if a user is verified
function isVerified(req: Request, res: Response, next: Function) {
  if (req.user.verified) {
    return next();
  }
  res.status(403).json({ message: "Phone verification required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Set up OTP verification routes
  setupOtpRoutes(app);

  // Get all services
  app.get("/api/services", (req, res) => {
    // For simplicity, we'll return a hardcoded list of services
    const services = [
      {
        id: 1,
        name: "Penetration Testing",
        description: "Identify vulnerabilities in your systems before hackers do.",
        icon: "search",
        price: 2000
      },
      {
        id: 2,
        name: "Vulnerability Assessment",
        description: "Comprehensive scanning and analysis of your network infrastructure.",
        icon: "shield-alt",
        price: 1500
      },
      {
        id: 3,
        name: "Malware Removal",
        description: "Professional detection and elimination of malware and ransomware.",
        icon: "virus-slash",
        price: 1000
      },
      {
        id: 4,
        name: "Security Auditing",
        description: "Thorough examination of your security policies and controls.",
        icon: "laptop-code",
        price: 1800
      },
      {
        id: 5,
        name: "Secure Infrastructure Setup",
        description: "Implementation of secure architecture for your networks and servers.",
        icon: "lock",
        price: 2500
      },
      {
        id: 6,
        name: "Security Training",
        description: "Educational programs to train your employees on security practices.",
        icon: "user-shield",
        price: 1200
      }
    ];

    res.json(services);
  });

  // User routes

  // Get user orders
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrdersByUserId(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  // Create new order
  app.post("/api/orders", isAuthenticated, isVerified, async (req, res, next) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);

      const order = await storage.createOrder({
        ...orderData,
        userId: req.user.id
      });

      // Order created successfully

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Get order by ID (accessible to order owner or admin)
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const order = await storage.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if user is the order owner or an admin
      if (order.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to access this order" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  // Admin routes

  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      // In a real app, we'd implement pagination
      const allUsers = Array.from(storage.users?.values() || []).map(user => {
        // Don't send passwords to the client
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Get all orders (admin only)
  app.get("/api/admin/orders", isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  // Update order status (admin only)
  app.patch("/api/admin/orders/:id/status", isAdmin, async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const { status } = updateOrderStatusSchema.parse({
        id: orderId,
        ...req.body
      });

      const updatedOrder = await storage.updateOrderStatus(orderId, status);

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Removed websocketService.sendOrderUpdate(orderId, updatedOrder.userId, status);

      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Don't allow deleting the current admin
      if (userId === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      const success = await storage.deleteUser(userId);

      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  const httpServer = createServer(app);

  // Removed websocketService.initialize(httpServer);

  return httpServer;
}