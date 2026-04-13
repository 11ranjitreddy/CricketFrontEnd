import { useState } from "react";
import { User, Edit, Save, Camera, Trophy, Calendar, Users, Target, LogIn, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const defaultProfile = {
    id: '1',
    name: user ? `${user.firstname} ${user.lastname}` : 'Cricket Enthusiast',
    email: user?.email || 'user@cricket.com',
    phone: user?.phone || '+1 234 567 8900',
    bio: 'Passionate cricket player and league organizer',
    role: 'League Manager',
    joinDate: '2024-01-01',
    stats: {
      teamsCreated: 5,
      matchesPlayed: 23,
      tournamentsWon: 2,
      totalRuns: 1250,
    },
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully!",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof typeof profile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Cricket Manager</h2>
              <p className="text-muted-foreground">Sign in to access your profile and manage your cricket teams</p>
            </div>
            <Button onClick={() => setShowAuthDialog(true)} className="w-full bg-gradient-primary">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In / Sign Up
            </Button>
          </CardContent>
        </Card>

        <AuthDialog 
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          onAuthSuccess={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground">Manage your cricket profile and settings</p>
          </div>
          <div className="flex space-x-2">
            {!isEditing ? (
              <>
                <Button onClick={() => setIsEditing(true)} className="bg-gradient-primary hover:bg-league-primary-dark">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" onClick={() => { logout(); toast({ title: "Logged out" }); }}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave} className="bg-gradient-primary hover:bg-league-primary-dark">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Profile Card & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-card">
              <CardContent className="pt-6 text-center">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-foreground mt-4">{profile.name}</h2>
                <Badge className="bg-league-primary text-white">{profile.role}</Badge>
                <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mt-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
            {/* Stats Card */}
            <Card className="shadow-card mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-league-accent" />
                  <span>Cricket Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div><p className="text-2xl font-bold text-league-primary">{profile.stats.teamsCreated}</p><p className="text-xs text-muted-foreground">Teams Created</p></div>
                  <div><p className="text-2xl font-bold text-league-accent">{profile.stats.matchesPlayed}</p><p className="text-xs text-muted-foreground">Matches Played</p></div>
                  <div><p className="text-2xl font-bold text-league-success">{profile.stats.tournamentsWon}</p><p className="text-xs text-muted-foreground">Tournaments Won</p></div>
                  <div><p className="text-2xl font-bold text-league-warning">{profile.stats.totalRuns}</p><p className="text-xs text-muted-foreground">Total Runs</p></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {['name','email','phone','role','bio'].map((field:any)=>(
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>{field.charAt(0).toUpperCase()+field.slice(1)}</Label>
                    {isEditing ? (
                      field==='bio' ? 
                      <Textarea rows={3} className="bg-league-surface resize-none"
                        value={editedProfile[field]} 
                        onChange={(e)=>handleInputChange(field, e.target.value)} /> :
                      <Input className="bg-league-surface" value={editedProfile[field]} onChange={(e)=>handleInputChange(field, e.target.value)} />
                    ) : (
                      <p className="text-foreground">{profile[field]}</p>
                    )}
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
