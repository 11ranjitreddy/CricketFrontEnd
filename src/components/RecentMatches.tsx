import { Clock, MapPin, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: "live" | "upcoming" | "completed";
  time: string;
  venue: string;
}

const matches: Match[] = [
  {
    id: "1",
    homeTeam: "Lightning FC",
    awayTeam: "Thunder United",
    homeScore: 2,
    awayScore: 1,
    status: "completed",
    time: "2 hours ago",
    venue: "Central Stadium"
  },
  {
    id: "2", 
    homeTeam: "Storm Rangers",
    awayTeam: "Blaze Athletic",
    homeScore: 1,
    awayScore: 1,
    status: "live",
    time: "45' 2nd Half",
    venue: "West Field"
  },
  {
    id: "3",
    homeTeam: "Dynamo City",
    awayTeam: "Phoenix FC",
    status: "upcoming",
    time: "Tomorrow 3:00 PM",
    venue: "Sports Complex"
  }
];

const getStatusColor = (status: Match["status"]) => {
  switch (status) {
    case "live": return "bg-league-success text-white";
    case "upcoming": return "bg-league-primary text-white";
    case "completed": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

export const RecentMatches = () => {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-league-primary" />
          <span>Recent Matches</span>
        </CardTitle>
        <Button variant="ghost" size="sm">View All</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="flex items-center justify-between p-4 bg-league-surface rounded-lg hover:bg-league-surface-hover transition-colors">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-foreground">{match.homeTeam}</span>
                  <span className="text-muted-foreground">vs</span>
                  <span className="font-semibold text-foreground">{match.awayTeam}</span>
                </div>
                <Badge className={getStatusColor(match.status)}>
                  {match.status.toUpperCase()}
                </Badge>
              </div>
              
              {match.homeScore !== undefined && match.awayScore !== undefined && (
                <div className="text-2xl font-bold text-league-primary mb-2">
                  {match.homeScore} - {match.awayScore}
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{match.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{match.venue}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};