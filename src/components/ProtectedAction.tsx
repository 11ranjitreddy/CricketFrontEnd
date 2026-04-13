import { useState, ReactNode, cloneElement, isValidElement } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/AuthDialog";

interface ProtectedActionProps {
  children: ReactNode;
  actionName?: string;
  onSuccess?: () => void;
}

export const ProtectedAction = ({ children, actionName, onSuccess }: ProtectedActionProps) => {
  const { isAuthenticated, login } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleAuthSuccess = (userData: any) => {
    login(userData);
    setAuthDialogOpen(false);
    onSuccess?.();
  };

  const handleClick = (originalOnClick?: () => void) => {
    if (isAuthenticated) {
      originalOnClick?.();
    } else {
      setAuthDialogOpen(true);
    }
  };

  // Clone the child element and intercept its onClick
  const wrappedChildren = isValidElement(children) 
    ? cloneElement(children as React.ReactElement, {
        onClick: () => handleClick(children.props.onClick)
      })
    : children;

  return (
    <>
      {wrappedChildren}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        onAuthSuccess={handleAuthSuccess}
        actionMessage={actionName ? `Sign in to ${actionName.toLowerCase()}` : "Sign in to continue"}
      />
    </>
  );
};