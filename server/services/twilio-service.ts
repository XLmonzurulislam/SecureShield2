import twilio from 'twilio';

interface SmsOptions {
  to: string;
  message: string;
}

class TwilioService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromNumber) {
      try {
        this.client = twilio(accountSid, authToken);
        this.fromNumber = fromNumber;
        this.isConfigured = true;
        console.log('Twilio client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Twilio client:', error);
        this.isConfigured = false;
      }
    } else {
      console.log('Twilio credentials not found, running in development mode');
      this.isConfigured = false;
    }
  }

  public async sendSms({ to, message }: SmsOptions): Promise<{
    success: boolean;
    sid?: string;
    error?: string;
  }> {
    // Log message for development/debugging
    console.log(`SMS would be sent to ${to}: ${message}`);

    if (!this.isConfigured || !this.client || !this.fromNumber) {
      return {
        success: false,
        error: 'Twilio not configured, running in development mode'
      };
    }

    try {
      // Format the phone number if it doesn't have a country code
      const formattedNumber = to.startsWith('+') ? to : `+${to}`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedNumber
      });

      return {
        success: true,
        sid: result.sid
      };
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  public isServiceConfigured(): boolean {
    return this.isConfigured;
  }
}

// Export a singleton instance
export const twilioService = new TwilioService();