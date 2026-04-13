import { useEffect, useState } from "react";
import { Users, Crown, Calendar, Trash2, RefreshCw, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Player {
  id: number;
  name: string;
  role: string;
}

interface Team {
  id: number;
  name: string;
  captain: string;
  players: Player[];
  createdAt: string;
}

// Move formatDate outside so it's accessible to both components
const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown date';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Separate component for team card
const TeamCard = ({ team, onDelete }: { team: Team; onDelete: (id: number, name: string) => void }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-league-surface rounded-lg hover:bg-league-surface-hover transition-colors">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground">{team.name}</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{team.players?.length || 0} players</Badge>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Team</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{team.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(team.id, team.name)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Crown className="w-3 h-3" />
            <span>Captain: {team.captain}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Created: {formatDate(team.createdAt)}</span>
          </div>
        </div>

        {/* Show player names if available */}
        {team.players && team.players.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">
              Players: {team.players.map(p => p.name).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const UserCreatedTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  const TEAMS_API = "http://localhost:7772/api/teams";

  const fetchTeams = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching teams from backend...');
      
      const response = await fetch(TEAMS_API);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.status}`);
      }
      
      const teamsData = await response.json();
      console.log('✅ Teams fetched from backend:', teamsData);
      
      setTeams(teamsData);
      
    } catch (error) {
      console.error('❌ Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to load teams from server.",
        variant: "destructive", // Fixed: Added comma here
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();

    // Listen for custom event when new team is created
    const handleTeamsUpdated = () => {
      console.log('🔄 Teams updated event received, refreshing...');
      fetchTeams();
    };

    // Method 1: Custom event
    window.addEventListener('teamsUpdated', handleTeamsUpdated);
    
    // Method 2: Global callback
    window.refreshTeamsCallback = fetchTeams;

    // Method 3: Polling (refresh every 10 seconds)
    const interval = setInterval(fetchTeams, 10000);

    return () => {
      window.removeEventListener('teamsUpdated', handleTeamsUpdated);
      clearInterval(interval);
      delete window.refreshTeamsCallback;
    };
  }, []);

  const deleteTeam = async (teamId: number, teamName: string) => {
    try {
      const response = await fetch(`${TEAMS_API}/${teamId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete team: ${response.status}`);
      }
      
      // Remove from local state
      setTeams(prev => prev.filter(team => team.id !== teamId));
      
      toast({
        title: "Team Deleted",
        description: `${teamName} has been deleted successfully.`,
      });
      
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team.",
        variant: "destructive", // Fixed: Added comma here
      });
    }
  };

  // Teams to display based on showAll state
  const displayTeams = showAll ? teams : teams.slice(0, 3);
  const hasMoreTeams = teams.length > 3;

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-league-primary" />
            <span>Your Created Teams</span>
          </CardTitle>
          <Button variant="ghost" size="sm" disabled>
            <RefreshCw className="w-4 h-4 animate-spin" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-league-surface rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-league-primary" />
          <span>Your Created Teams ({teams.length})</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchTeams}
            disabled={loading}
            title="Refresh teams"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {hasMoreTeams && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : 'View All'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No teams found in database</p>
            <p className="text-sm">
              Create a team or click refresh to load existing teams
            </p>
            <Button 
              onClick={fetchTeams} 
              variant="outline" 
              className="mt-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Teams
            </Button>
          </div>
        ) : (
          <div className={`${showAll ? 'max-h-96' : ''}`}>
            {showAll ? (
              <ScrollArea className="h-96">
                <div className="space-y-4 pr-4">
                  {teams.map((team) => (
                    <TeamCard 
                      key={team.id} 
                      team={team} 
                      onDelete={deleteTeam}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="space-y-4">
                {displayTeams.map((team) => (
                  <TeamCard 
                    key={team.id} 
                    team={team} 
                    onDelete={deleteTeam}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};