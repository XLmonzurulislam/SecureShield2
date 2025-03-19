import { storage } from "./storage";
import { Express } from "express";
import { randomInt } from "crypto";
import { ZodError } from "zod";
import { fromZodError } from 'zod-validation-error';
import { otpVerificationSchema } from "@shared/schema";
import { twilioService } from "./services/twilio-service";

// Generate a random 6-digit OTP code
function generateOtpCode(): string {
  return randomInt(100000, 999999).toString();
}

export function setupOtpRoutes(app: Express) {
  // Request OTP for phone verification
  app.post("/api/request-otp", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      // Generate OTP code and calculate expiration time (10 minutes)
      const code = generateOtpCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      
      // Store OTP
      await storage.createOtp({
        userId: req.user.id,
        phone,
        code,
        expiresAt
      });

      // Always log the code for debugging
      console.log(`OTP Code for ${phone}: ${code}`);
      
      // Try to send SMS via Twilio if configured
      const smsMessage = `Your CyberShield verification code is: ${code}. Valid for 10 minutes.`;
      const smsResult = await twilioService.sendSms({
        to: phone,
        message: smsMessage
      });
      
      // In development mode or if Twilio fails, include the code in the response
      if (!twilioService.isServiceConfigured() || !smsResult.success) {
        return res.status(200).json({ 
          message: "OTP sent to your phone (development mode)", 
          code, // This will be removed in production with Twilio configured
          expiresAt 
        });
      }
      
      // In production with Twilio configured and successful SMS delivery
      res.status(200).json({ 
        message: "OTP sent to your phone", 
        expiresAt 
      });
    } catch (error) {
      next(error);
    }
  });

  // Verify OTP
  app.post("/api/verify-otp", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const verificationData = otpVerificationSchema.parse(req.body);
      
      // Verify OTP
      const isValid = await storage.verifyOtp(
        req.user.id,
        verificationData.phone,
        verificationData.code
      );

      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired OTP code" });
      }

      // Mark user as verified
      const updatedUser = await storage.updateUser(req.user.id, { 
        verified: true 
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return success
      res.status(200).json({ 
        message: "Phone verified successfully",
        verified: true
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
}
