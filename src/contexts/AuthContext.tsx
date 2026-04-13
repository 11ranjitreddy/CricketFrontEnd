import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
  otpSent: boolean;
  login: (user: User) => void;
  logout: () => void;
  requestOtp: (identifier: string, type: 'signin' | 'signup') => Promise<void>;
  verifyOtp: (identifier: string, otp: string, type: 'signin' | 'signup') => Promise<boolean>;
  setOtpSent: (sent: boolean) => void;
  setError: (error: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    // Check for saved user on app start
    const savedUser = localStorage.getItem('cricket-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('cricket-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setOtpSent(false);
    setError('');
    localStorage.removeItem('cricket-user');
  };

  const requestOtp = async (identifier: string, type: 'signin' | 'signup') => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:7771/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrMobile: identifier, type }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = { message: 'Invalid server response' };
      }

      if (response.ok) {
        setOtpSent(true);
        setError('');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Server error. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (identifier: string, otp: string, type: 'signin' | 'signup') => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:7771/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrMobile: identifier, otp, type }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = data.user || { 
          id: Date.now().toString(), 
          email: identifier 
        };
        login(userData);
        setOtpSent(false);
        return true;
      } else {
        setError(data.message || 'Invalid OTP');
        return false;
      }
    } catch (err) {
      setError('Server error. Try again later.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    otpSent,
    login,
    logout,
    requestOtp,
    verifyOtp,
    setOtpSent,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};