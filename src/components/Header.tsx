import { useState } from "react";
import { Bell, User, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/AuthDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const location = useLocation();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleAuthSuccess = (userData: any) => {
    login(userData);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-border shadow-card sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">SL</span>
            </div>
            <span className="text-xl font-bold text-foreground">Sports League</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`font-medium transition-colors ${
                isActive('/') ? 'text-league-primary' : 'text-muted-foreground hover:text-league-primary'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/teams" 
              className={`font-medium transition-colors ${
                isActive('/teams') ? 'text-league-primary' : 'text-muted-foreground hover:text-league-primary'
              }`}
            >
              Teams
            </Link>
            <Link 
              to="/matches" 
              className={`font-medium transition-colors ${
                isActive('/matches') ? 'text-league-primary' : 'text-muted-foreground hover:text-league-primary'
              }`}
            >
              Matches
            </Link>
            <Link 
              to="/tournaments" 
              className={`font-medium transition-colors ${
                isActive('/tournaments') ? 'text-league-primary' : 'text-muted-foreground hover:text-league-primary'
              }`}
            >
              Tournaments
            </Link>
           
          </nav>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center relative">
            <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
            <Input 
              placeholder="Search teams, players..." 
              className="pl-10 w-64 bg-league-surface"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-league-accent rounded-full text-xs"></span>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Welcome, {user?.firstname} {user?.lastname}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Help</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setAuthDialogOpen(true)} variant="outline">
              Sign In
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        onAuthSuccess={handleAuthSuccess}
      />
    </header>
  );
};