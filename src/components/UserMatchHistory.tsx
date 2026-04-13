import { useEffect, useState } from "react";
import { Clock, MapPin, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Match {
  id: string;
  team1: string | { name: string };
  team2: string | { name: string };
  venue: string;
  date: string;
  time: string;
  status: string;
  overs: number;
  tossWinner?: string | { name: string };
  tossDecision?: string;
}

export const UserMatchHistory = () => {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const savedMatches = localStorage.getItem('cricket-matches');
    if (savedMatches) {
      const allMatches = JSON.parse(savedMatches);
      // Sort by date, most recent first
      const sortedMatches = allMatches.sort((a: Match, b: Match) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setMatches(sortedMatches);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-league-success text-white";
      case "scheduled": return "bg-league-primary text-white";
      case "completed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-league-primary" />
          <span>Your Match History</span>
        </CardTitle>
        <Button variant="ghost" size="sm">View All</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No matches created yet</p>
            <p className="text-sm">Create your first match to start tracking!</p>
          </div>
        ) : (
          matches.slice(0, 3).map((match) => (
            <div key={match.id} className="flex items-center justify-between p-4 bg-league-surface rounded-lg hover:bg-league-surface-hover transition-colors">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                     <span className="font-semibold text-foreground">
                       {typeof match.team1 === 'object' ? match.team1?.name : match.team1}
                     </span>
                     <span className="text-muted-foreground">vs</span>
                     <span className="font-semibold text-foreground">
                       {typeof match.team2 === 'object' ? match.team2?.name : match.team2}
                     </span>
                  </div>
                  <Badge className={getStatusColor(match.status)}>
                    {match.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(match.date)} at {match.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{match.venue}</span>
                  </div>
                </div>
                
                {match.tossWinner && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Toss: {typeof match.tossWinner === 'object' ? match.tossWinner?.name : match.tossWinner} won, chose to {match.tossDecision}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};