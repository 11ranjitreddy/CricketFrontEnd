import { useState, useEffect } from "react";
import { Plus, Calendar, Trophy, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateMatchDialog } from "@/components/CreateMatchDialog";
import { QuickMatchDialog } from "@/components/QuickMatchDialog";
import { Scorecard } from "@/components/Scorecard";
import { useToast } from "@/hooks/use-toast";

interface MatchData {
  id: string;
  team1: string;
  team2: string;
  overs: number;
  venue: string;
  date?: string;
  time?: string;
  status: 'scheduled' | 'live' | 'completed';
  tossWinner?: string;
  tossDecision?: string;
  result?: string;
  createdAt: string;
}

const Matches = () => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQuickMatchDialog, setShowQuickMatchDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'scorecard'>('list');
  const { toast } = useToast();

  useEffect(() => {
    const savedMatches = localStorage.getItem('cricket-matches');
    if (savedMatches) {
      setMatches(JSON.parse(savedMatches));
    }
  }, []);

  const handleMatchCreated = (newMatch: any) => {
    // Convert team objects to team names for consistency
    const formattedMatch = {
      ...newMatch,
      team1: typeof newMatch.team1 === 'object' ? newMatch.team1.name : newMatch.team1,
      team2: typeof newMatch.team2 === 'object' ? newMatch.team2.name : newMatch.team2,
    };
    const updatedMatches = [...matches, formattedMatch];
    setMatches(updatedMatches);
    localStorage.setItem('cricket-matches', JSON.stringify(updatedMatches));
    setShowCreateDialog(false);
    setShowQuickMatchDialog(false);
    toast({
      title: "Match Created",
      description: `${formattedMatch.team1} vs ${formattedMatch.team2} has been scheduled!`,
    });
  };

  const handleStartMatch = (match: MatchData) => {
    const updatedMatch = { ...match, status: 'live' as const };
    const updatedMatches = matches.map(m => m.id === match.id ? updatedMatch : m);
    setMatches(updatedMatches);
    localStorage.setItem('cricket-matches', JSON.stringify(updatedMatches));
    setSelectedMatch(updatedMatch);
    setCurrentView('scorecard');
  };

  const handleBackToMatches = () => {
    setCurrentView('list');
    setSelectedMatch(null);
  };

  const getMatchesByStatus = (status: string) => {
    return matches.filter(match => match.status === status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-league-warning';
      case 'live': return 'bg-league-success';
      case 'completed': return 'bg-league-primary';
      default: return 'bg-muted';
    }
  };

  if (currentView === 'scorecard' && selectedMatch) {
    return <Scorecard match={selectedMatch} onBackToMatch={handleBackToMatches} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Matches</h1>
            <p className="text-muted-foreground">Manage and track your cricket matches</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowQuickMatchDialog(true)} 
              variant="outline"
              className="border-league-primary text-league-primary hover:bg-league-primary hover:text-white"
            >
              <Clock className="w-4 h-4 mr-2" />
              Quick Match
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-primary hover:bg-league-primary-dark">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Match
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-league-primary/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-league-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{matches.length}</p>
                  <p className="text-sm text-muted-foreground">Total Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-league-success/10 rounded-lg">
                  <Trophy className="w-6 h-6 text-league-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{getMatchesByStatus('live').length}</p>
                  <p className="text-sm text-muted-foreground">Live Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-league-warning/10 rounded-lg">
                  <Clock className="w-6 h-6 text-league-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{getMatchesByStatus('scheduled').length}</p>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
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
                  <p className="text-2xl font-bold text-foreground">{getMatchesByStatus('completed').length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matches Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Matches</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <MatchesList matches={matches} onStartMatch={handleStartMatch} />
          </TabsContent>
          <TabsContent value="live" className="mt-6">
            <MatchesList matches={getMatchesByStatus('live')} onStartMatch={handleStartMatch} />
          </TabsContent>
          <TabsContent value="scheduled" className="mt-6">
            <MatchesList matches={getMatchesByStatus('scheduled')} onStartMatch={handleStartMatch} />
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            <MatchesList matches={getMatchesByStatus('completed')} onStartMatch={handleStartMatch} />
          </TabsContent>
        </Tabs>

        {/* Create Match Dialogs */}
        <CreateMatchDialog 
          onMatchCreated={handleMatchCreated}
        />
        <QuickMatchDialog 
          onMatchCreated={handleMatchCreated}
        />
      </div>
    </div>
  );
};

// Matches List Component
interface MatchesListProps {
  matches: MatchData[];
  onStartMatch: (match: MatchData) => void;
}

const MatchesList = ({ matches, onStartMatch }: MatchesListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-league-warning';
      case 'live': return 'bg-league-success';
      case 'completed': return 'bg-league-primary';
      default: return 'bg-muted';
    }
  };

  if (matches.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Matches Found</h3>
          <p className="text-muted-foreground">Create your first match to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((match) => (
        <Card key={match.id} className="shadow-card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Badge className={`${getStatusColor(match.status)} text-white`}>
                {match.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">{match.overs} overs</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Teams */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{match.team1}</p>
                  </div>
                  <div className="text-muted-foreground">vs</div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{match.team2}</p>
                  </div>
                </div>
              </div>

              {/* Match Details */}
              <div className="space-y-2 text-sm">
                {match.date && match.time && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{match.date} at {match.time}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{match.venue}</span>
                </div>
                {match.tossWinner && (
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {match.tossWinner} won toss, chose to {match.tossDecision}
                    </span>
                  </div>
                )}
                {match.result && (
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-league-accent" />
                    <span className="text-foreground font-medium">{match.result}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t">
                {match.status === 'scheduled' && (
                  <Button 
                    onClick={() => onStartMatch(match)}
                    className="w-full bg-gradient-primary hover:bg-league-primary-dark"
                  >
                    Start Match
                  </Button>
                )}
                {match.status === 'live' && (
                  <Button 
                    onClick={() => onStartMatch(match)}
                    className="w-full bg-league-success hover:bg-league-success/90"
                  >
                    Continue Match
                  </Button>
                )}
                {match.status === 'completed' && (
                  <Button variant="outline" className="w-full">
                    View Scorecard
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

export default Matches;