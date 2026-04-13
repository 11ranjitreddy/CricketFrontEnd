import { useState, useEffect } from "react";
import { Plus, Users, Trophy, Calendar, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CreateTeamDialog } from "@/components/CreateTeamDialog";
import { useToast } from "@/hooks/use-toast";

interface TeamPlayer {
  id: string;
  name: string;
  role: string;
  battingStyle?: string;
  bowlingStyle?: string;
}

interface TeamData {
  id: string;
  name: string;
  captain: string;
  players: TeamPlayer[];
  createdAt: string;
}

const Teams = () => {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedTeams = localStorage.getItem('teams');
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }
  }, []);

  const handleTeamCreated = (newTeam: any) => {
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    localStorage.setItem('teams', JSON.stringify(updatedTeams));
    setShowCreateDialog(false);
    toast({
      title: "Team Created",
      description: `${newTeam.name} has been created successfully!`,
    });
  };

  const handleDeleteTeam = (teamId: string) => {
    const updatedTeams = teams.filter(team => team.id !== teamId);
    setTeams(updatedTeams);
    localStorage.setItem('teams', JSON.stringify(updatedTeams));
    toast({
      title: "Team Deleted",
      description: "Team has been deleted successfully!",
    });
  };

  const getTeamStats = (team: TeamData) => {
    const batsmen = team.players.filter(p => p.role === 'Batsman').length;
    const bowlers = team.players.filter(p => p.role === 'Bowler').length;
    const allRounders = team.players.filter(p => p.role === 'All-Rounder').length;
    const wicketKeepers = team.players.filter(p => p.role === 'Wicket Keeper').length;

    return { batsmen, bowlers, allRounders, wicketKeepers };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Teams</h1>
            <p className="text-muted-foreground">Manage your cricket teams and players</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-primary hover:bg-league-primary-dark">
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-league-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-league-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{teams.length}</p>
                  <p className="text-sm text-muted-foreground">Total Teams</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-league-accent/10 rounded-lg">
                  <Trophy className="w-6 h-6 text-league-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{teams.reduce((acc, team) => acc + team.players.length, 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Players</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-league-success/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-league-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {teams.filter(team => team.players.length >= 11).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Match Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-league-warning/10 rounded-lg">
                  <Users className="w-6 h-6 text-league-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {teams.filter(team => team.players.length < 11).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Incomplete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Teams Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first cricket team to get started</p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Team
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const stats = getTeamStats(team);
              return (
                <Card key={team.id} className="shadow-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-foreground">{team.name}</CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteTeam(team.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">{team.captain.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">Captain: {team.captain}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Player Count */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Players</span>
                        <Badge 
                          variant={team.players.length >= 11 ? "default" : "secondary"}
                          className={team.players.length >= 11 ? "bg-league-success" : ""}
                        >
                          {team.players.length}/11
                        </Badge>
                      </div>

                      {/* Role Distribution */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Batsmen: {stats.batsmen}</span>
                          <span className="text-muted-foreground">Bowlers: {stats.bowlers}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">All-Rounders: {stats.allRounders}</span>
                          <span className="text-muted-foreground">WK: {stats.wicketKeepers}</span>
                        </div>
                      </div>

                      {/* Players List */}
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {team.players.slice(0, 5).map((player) => (
                          <div key={player.id} className="flex items-center justify-between text-xs">
                            <span className="text-foreground">{player.name}</span>
                            <Badge variant="outline" className="text-xs">{player.role}</Badge>
                          </div>
                        ))}
                        {team.players.length > 5 && (
                          <p className="text-xs text-muted-foreground">+{team.players.length - 5} more players</p>
                        )}
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(team.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Team Dialog */}
        <CreateTeamDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onTeamCreated={handleTeamCreated}
        />
      </div>
    </div>
  );
};

export default Teams;