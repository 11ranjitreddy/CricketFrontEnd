import { useState } from "react";
import { Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateMatchDialog } from "./CreateMatchDialog";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { TournamentDialog } from "./TournamentDialog";
import { Scorecard } from "./Scorecard";
import { QuickMatchDialog } from "./QuickMatchDialog";
import { ProtectedAction } from "./ProtectedAction";

export const QuickActions = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'scorecard'>('dashboard');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const handleMatchCreated = (match: any) => {
    // Convert team objects to team names for consistency
    const formattedMatch = {
      ...match,
      team1: typeof match.team1 === 'object' ? match.team1.name : match.team1,
      team2: typeof match.team2 === 'object' ? match.team2.name : match.team2,
    };
    setSelectedMatch(formattedMatch);
    setCurrentView('scorecard');
  };

  const handleQuickMatchCreated = (match: any) => {
    // Convert team objects to team names for consistency
    const formattedMatch = {
      ...match,
      team1: typeof match.team1 === 'object' ? match.team1.name : match.team1,
      team2: typeof match.team2 === 'object' ? match.team2.name : match.team2,
    };
    setSelectedMatch(formattedMatch);
    setCurrentView('scorecard');
  };

  const handleBackToMatch = () => {
    setCurrentView('dashboard');
    setSelectedMatch(null);
  };

  if (currentView === 'scorecard' && selectedMatch) {
    return <Scorecard match={selectedMatch} onBackToMatch={handleBackToMatch} />;
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-league-primary" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <ProtectedAction actionName="Create Match">
            <CreateMatchDialog onMatchCreated={handleMatchCreated} />
          </ProtectedAction>
          <ProtectedAction actionName="Start Quick Match">
            <QuickMatchDialog onMatchCreated={handleQuickMatchCreated} />
          </ProtectedAction>
          <ProtectedAction actionName="Create Team">
            <CreateTeamDialog onTeamCreated={() => {}} />
          </ProtectedAction>
          <ProtectedAction actionName="Create Tournament">
            <TournamentDialog onTournamentCreated={() => {}} />
          </ProtectedAction>
        </div>
      </CardContent>
    </Card>
  );
};