import { useState, useEffect } from "react";
import { Plus, Trophy, Calendar, Users, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TournamentDialog } from "@/components/TournamentDialog";
import { useToast } from "@/hooks/use-toast";

interface TournamentData {
  id: string;
  name: string;
  format: string;
  teams: string[];
  startDate: string;
  endDate: string;
  venue: string;
  overs: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  currentRound?: string;
  winner?: string;
  createdAt: string;
}

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<TournamentData[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedTournaments = localStorage.getItem('tournaments');
    if (savedTournaments) {
      setTournaments(JSON.parse(savedTournaments));
    }
  }, []);

  const handleTournamentCreated = (newTournament: any) => {
    const updatedTournaments = [...tournaments, newTournament];
    setTournaments(updatedTournaments);
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    setShowCreateDialog(false);
    toast({
      title: "Tournament Created",
      description: `${newTournament.name} has been created successfully!`,
    });
  };

  const getTournamentsByStatus = (status: string) => {
    return tournaments.filter(tournament => tournament.status === status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-league-warning';
      case 'ongoing': return 'bg-league-success';
      case 'completed': return 'bg-league-primary';
      default: return 'bg-muted';
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'Round Robin': return 'bg-blue-500';
      case 'Knockout': return 'bg-red-500';
      case 'League + Knockout': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateProgress = (tournament: TournamentData) => {
    if (tournament.status === 'completed') return 100;
    if (tournament.status === 'upcoming') return 0;
    // For ongoing tournaments, calculate based on current round
    // This is a simplified calculation
    return 45; // Placeholder
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Tournaments</h1>
            <p className="text-muted-foreground">Organize and manage cricket tournaments</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-primary hover:bg-league-primary-dark">
            <Plus className="w-4 h-4 mr-2" />
            Create Tournament
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-league-primary/10 rounded-lg">
                  <Trophy className="w-6 h-6 text-league-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{tournaments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Tournaments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-league-success/10 rounded-lg">
                  <Clock className="w-6 h-6 text-league-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{getTournamentsByStatus('ongoing').length}</p>
                  <p className="text-sm text-muted-foreground">Ongoing</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-league-warning/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-league-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{getTournamentsByStatus('upcoming').length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
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
                  <p className="text-2xl font-bold text-foreground">{getTournamentsByStatus('completed').length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tournaments Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Tournaments</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <TournamentsList tournaments={tournaments} />
          </TabsContent>
          <TabsContent value="ongoing" className="mt-6">
            <TournamentsList tournaments={getTournamentsByStatus('ongoing')} />
          </TabsContent>
          <TabsContent value="upcoming" className="mt-6">
            <TournamentsList tournaments={getTournamentsByStatus('upcoming')} />
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            <TournamentsList tournaments={getTournamentsByStatus('completed')} />
          </TabsContent>
        </Tabs>

        {/* Create Tournament Dialog */}
        <TournamentDialog 
          onTournamentCreated={handleTournamentCreated}
        />
      </div>
    </div>
  );
};

// Tournaments List Component
interface TournamentsListProps {
  tournaments: TournamentData[];
}

const TournamentsList = ({ tournaments }: TournamentsListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-league-warning';
      case 'ongoing': return 'bg-league-success';
      case 'completed': return 'bg-league-primary';
      default: return 'bg-muted';
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'Round Robin': return 'bg-blue-500';
      case 'Knockout': return 'bg-red-500';
      case 'League + Knockout': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateProgress = (tournament: TournamentData) => {
    if (tournament.status === 'completed') return 100;
    if (tournament.status === 'upcoming') return 0;
    return 45; // Placeholder for ongoing tournaments
  };

  if (tournaments.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Tournaments Found</h3>
          <p className="text-muted-foreground">Create your first tournament to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tournaments.map((tournament) => (
        <Card key={tournament.id} className="shadow-card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                {tournament.status.toUpperCase()}
              </Badge>
              <Badge className={`${getFormatColor(tournament.format)} text-white`}>
                {tournament.format}
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold text-foreground">{tournament.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Tournament Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{tournament.teams.length} teams</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {tournament.startDate} - {tournament.endDate}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{tournament.venue}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{tournament.overs} overs</span>
                </div>
              </div>

              {/* Progress */}
              {tournament.status === 'ongoing' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">{calculateProgress(tournament)}%</span>
                  </div>
                  <Progress value={calculateProgress(tournament)} className="h-2" />
                  {tournament.currentRound && (
                    <p className="text-xs text-muted-foreground">Current: {tournament.currentRound}</p>
                  )}
                </div>
              )}

              {/* Winner */}
              {tournament.winner && (
                <div className="flex items-center space-x-2 p-2 bg-league-success/10 rounded-md">
                  <Trophy className="w-4 h-4 text-league-success" />
                  <span className="text-sm font-medium text-foreground">Winner: {tournament.winner}</span>
                </div>
              )}

              {/* Teams */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Participating Teams:</p>
                <div className="flex flex-wrap gap-1">
                  {tournament.teams.slice(0, 3).map((team, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {team}
                    </Badge>
                  ))}
                  {tournament.teams.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{tournament.teams.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t">
                {tournament.status === 'upcoming' && (
                  <Button className="w-full bg-gradient-primary hover:bg-league-primary-dark">
                    Start Tournament
                  </Button>
                )}
                {tournament.status === 'ongoing' && (
                  <Button className="w-full bg-league-success hover:bg-league-success/90">
                    Manage Tournament
                  </Button>
                )}
                {tournament.status === 'completed' && (
                  <Button variant="outline" className="w-full">
                    View Results
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Tournaments;