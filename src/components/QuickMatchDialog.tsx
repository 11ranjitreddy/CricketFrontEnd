import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  captain: string;
  players: any[];
}

interface QuickMatchDialogProps {
  onMatchCreated: (match: any) => void;
}

export const QuickMatchDialog = ({ onMatchCreated }: QuickMatchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [team1Id, setTeam1Id] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const [overs, setOvers] = useState(5);
  const { toast } = useToast();

  useEffect(() => {
    const savedTeams = JSON.parse(localStorage.getItem('cricket-teams') || '[]');
    setTeams(savedTeams);
  }, []);

  const startQuickMatch = () => {
    if (!team1Id || !team2Id || team1Id === team2Id) {
      toast({
        title: "Validation Error",
        description: "Please select two different teams",
        variant: "destructive"
      });
      return;
    }

    const team1 = teams.find(t => t.id === team1Id)!;
    const team2 = teams.find(t => t.id === team2Id)!;
    
    // Random toss
    const tossWinner = Math.random() > 0.5 ? team1 : team2;
    const tossDecision = Math.random() > 0.5 ? 'bat' : 'bowl';

    const match = {
      id: Date.now().toString(),
      team1,
      team2,
      overs,
      tossWinner: tossWinner.name,
      tossDecision,
      status: 'live',
      venue: 'Quick Match Ground',
      createdAt: new Date()
    };

    // Save to localStorage
    const existingMatches = JSON.parse(localStorage.getItem('cricket-matches') || '[]');
    existingMatches.push(match);
    localStorage.setItem('cricket-matches', JSON.stringify(existingMatches));

    onMatchCreated(match);
    
    // Reset form
    setTeam1Id("");
    setTeam2Id("");
    setOvers(5);
    setOpen(false);
    
    toast({
      title: "Quick Match Started",
      description: `${team1.name} vs ${team2.name} - ${tossWinner.name} won the toss and chose to ${tossDecision}!`
    });
  };

  if (teams.length < 2) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="accent" className="h-auto p-4 flex-col items-start space-y-2">
            <div className="flex items-center space-x-2 w-full">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Quick Match</span>
            </div>
            <span className="text-xs opacity-80 text-left">Start instant match</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Need More Teams</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>You need at least 2 teams to start a quick match. Please create teams first.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" className="h-auto p-4 flex-col items-start space-y-2">
          <div className="flex items-center space-x-2 w-full">
            <Zap className="w-5 h-5" />
            <span className="font-medium">Quick Match</span>
          </div>
          <span className="text-xs opacity-80 text-left">Start instant match</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Match Setup</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Team 1</Label>
            <Select value={team1Id} onValueChange={setTeam1Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select Team 1" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Team 2</Label>
            <Select value={team2Id} onValueChange={setTeam2Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select Team 2" />
              </SelectTrigger>
              <SelectContent>
                {teams.filter(t => t.id !== team1Id).map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Overs (Quick Format)</Label>
            <Select value={overs.toString()} onValueChange={(value) => setOvers(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Overs</SelectItem>
                <SelectItem value="5">5 Overs</SelectItem>
                <SelectItem value="10">10 Overs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium mb-1">Quick Match Features:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Automatic toss</li>
              <li>• Instant start</li>
              <li>• No venue setup required</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={startQuickMatch}>
              Start Quick Match
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};