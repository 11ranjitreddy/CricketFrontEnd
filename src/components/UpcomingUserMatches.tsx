import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Match {
  id: string;
  team1: string | { name: string };
  team2: string | { name: string };
  venue: string;
  date: string;
  time: string;
  status: string;
  overs: number;
}

export const UpcomingUserMatches = () => {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);

  useEffect(() => {
    const savedMatches = localStorage.getItem('cricket-matches');
    if (savedMatches) {
      const allMatches = JSON.parse(savedMatches);
      // Filter for scheduled matches and sort by date
      const upcoming = allMatches
        .filter((match: Match) => match.status === 'scheduled')
        .sort((a: Match, b: Match) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      setUpcomingMatches(upcoming);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const matchDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (matchDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (matchDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return matchDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-league-primary" />
          <span>Upcoming Matches</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingMatches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming matches</p>
            <p className="text-sm">Schedule a match to see it here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMatches.slice(0, 2).map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 bg-league-surface rounded-md">
                <div>
                  <p className="font-medium text-foreground">
                    {typeof match.team1 === 'object' ? match.team1?.name : match.team1} vs {typeof match.team2 === 'object' ? match.team2?.name : match.team2}
                  </p>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(match.date)} at {match.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{match.venue}</span>
                    </div>
                  </div>
                </div>
                <div className="w-3 h-3 bg-league-primary rounded-full"></div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};