import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function OtpVerificationForm({ phone, onSuccess }: { phone: string; onSuccess: () => void }) {
  const { verifyOtpMutation, requestOtpMutation } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Effect for the countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setResendDisabled(false);
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft]);

  // Handle input change
  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key press
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Focus previous input on backspace when current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const completeCode = code.join("");
    
    if (completeCode.length !== 6) {
      toast({
        title: "Incomplete code",
        description: "Please enter the complete 6-digit code",
        variant: "destructive"
      });
      return;
    }

    console.log("Submitting OTP verification with:", { phone, code: completeCode });
    
    verifyOtpMutation.mutate(
      { phone, code: completeCode },
      {
        onSuccess: () => {
          toast({
            title: "Success!",
            description: "Your phone has been verified successfully.",
            variant: "default"
          });
          onSuccess();
        },
        onError: (error) => {
          console.error("OTP verification error:", error);
          toast({
            title: "Verification failed",
            description: error.message || "Failed to verify OTP code. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  // Handle resend code
  const handleResendCode = () => {
    requestOtpMutation.mutate(
      { phone },
      {
        onSuccess: (data) => {
          setTimeLeft(60);
          setResendDisabled(true);
          
          // If code is included in response (development mode), set it
          if (data.code) {
            console.log("Development mode: Received OTP code:", data.code);
            // Split the code into an array of individual digits and pad to 6 digits if needed
            const codeArray = data.code.toString().padStart(6, '0').split("");
            console.log("Setting code array:", codeArray);
            setCode(codeArray);
          }
        }
      }
    );
  };

  return (
    <Card className="max-w-md mx-auto bg-white">
      <CardHeader className="bg-primary py-4 px-6">
        <CardTitle className="text-white text-2xl font-bold">Verify Your Phone</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <p className="mb-6 text-gray-600">
          We've sent a 6-digit verification code to <span className="font-semibold">{phone}</span>. 
          Enter it below to verify your account.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={code[index] || ""}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md"
                required
              />
            ))}
          </div>
          
          <div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-light"
              disabled={verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600">
              Didn't receive the code? <span className="font-semibold">{timeLeft}</span>s
            </p>
            <Button 
              type="button" 
              variant="link"
              className="text-primary hover:underline mt-1"
              disabled={resendDisabled || requestOtpMutation.isPending}
              onClick={handleResendCode}
            >
              {requestOtpMutation.isPending ? "Sending..." : "Resend Code"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
