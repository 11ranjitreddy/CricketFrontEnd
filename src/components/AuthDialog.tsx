import { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: (user: { id: string; email: string }) => void;
  actionMessage?: string;
}

export const AuthDialog = ({ open, onOpenChange, onAuthSuccess, actionMessage }: AuthDialogProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({ identifier: '' });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({ identifier: '' });
    setOtp('');
    setOtpSent(false);
    setIsSignUp(false);
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, identifier: e.target.value });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  const handleRequestOtp = async () => {
    if (!formData.identifier.trim()) {
      toast({ title: "Error", description: "Please enter email or mobile number", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const type = isSignUp ? 'signup' : 'signin';
      const response = await axios.post('http://localhost:7771/api/auth/send-otp', {
        emailOrMobile: formData.identifier,
        type
      });

      if (response.status === 200) {
        setOtpSent(true);
        toast({ title: "Success", description: "OTP sent successfully!" });
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to send OTP", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      toast({ title: "Error", description: "Please enter a valid 6-digit OTP", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const type = isSignUp ? 'signup' : 'signin';
      const response = await axios.post('http://localhost:7771/api/auth/verify-otp', {
        emailOrMobile: formData.identifier,
        otp,
        type
      });
      
      if (response.status === 200) {
        const userData = response.data.user || { 
          id: Date.now().toString(), 
          email: formData.identifier 
        };
        
        onAuthSuccess(userData);
        toast({ 
          title: "Success", 
          description: isSignUp ? "Account created successfully!" : "Signed in successfully!" 
        });
        
        resetForm();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Invalid OTP", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpSent) {
      handleVerifyOtp();
    } else {
      handleRequestOtp();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => { onOpenChange(newOpen); if (!newOpen) resetForm(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {otpSent ? 'Enter OTP' : (isSignUp ? 'Sign Up' : (actionMessage || 'Sign In'))}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!otpSent ? (
            <div>
              <Label htmlFor="identifier">Email or Mobile Number</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter Email or Phone"
                value={formData.identifier}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                required
                className="w-full text-center tracking-widest"
              />
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-primary"
          >
            {isLoading ? 'Processing...' : otpSent ? 'Verify OTP' : 'Request OTP'}
          </Button>

          {!otpSent && (
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="text-sm text-league-primary hover:underline"
              >
                {isSignUp ? "Already have an account? Sign In" : "New to Cricket Manager? Sign Up"}
              </button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};