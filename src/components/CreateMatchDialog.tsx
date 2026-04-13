import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateTeamDialog } from "./CreateTeamDialog";

interface Team {
  id: number;
  name: string;
  captain: string;
  players: any[];
  createdAt: string;
}

interface Match {
  id: number;
  team1: Team;
  team2: Team;
  overs: number;
  tossWinner: string;
  tossDecision: 'BAT' | 'BOWL';
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  venue: string;
  createdAt: string;
}

interface CreateMatchDialogProps {
  onMatchCreated: (match: Match) => void;
  trigger?: React.ReactNode;
}

// Updated API URLs for separate services
const TEAM_SERVICE_URL = "http://localhost:7772/api";
const MATCH_SERVICE_URL = "http://localhost:7773/api";

export const CreateMatchDialog = ({ onMatchCreated, trigger }: CreateMatchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [team1Id, setTeam1Id] = useState<number | "">("");
  const [team2Id, setTeam2Id] = useState<number | "">("");
  const [overs, setOvers] = useState(20);
  const [venue, setVenue] = useState("");
  const [tossWinnerId, setTossWinnerId] = useState<number | "">("");
  const [tossDecision, setTossDecision] = useState<'BAT' | 'BOWL'>('BAT');
  const [showToss, setShowToss] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      // Load teams from Team Service (port 7772)
      const response = await fetch(`${TEAM_SERVICE_URL}/teams`);
      if (response.ok) {
        const teamsData = await response.json();
        setTeams(teamsData);
      } else {
        throw new Error('Failed to load teams');
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      toast({
        title: "Error",
        description: "Failed to load teams from server",
        variant: "destructive"
      });
    }
  };

  const handleTeamCreated = (team: Team) => {
    loadTeams();
  };

  const proceedToToss = () => {
    if (!team1Id || !team2Id || team1Id === team2Id || !venue.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select different teams and enter venue",
        variant: "destructive"
      });
      return;
    }
    setShowToss(true);
  };

  const createMatch = async () => {
    if (!tossWinnerId || !tossDecision) {
      toast({
        title: "Validation Error",
        description: "Please complete toss details",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const team1 = teams.find(t => t.id === team1Id)!;
      const team2 = teams.find(t => t.id === team2Id)!;
      const tossWinner = teams.find(t => t.id === tossWinnerId)!;

      // Updated match data structure for Match Service
      const matchData = {
        team1Id: team1Id,  // Changed from team1: { id: team1Id }
        team2Id: team2Id,  // Changed from team2: { id: team2Id }
        overs: overs,
        tossWinner: tossWinner.name,
        tossDecision: tossDecision,
        status: 'UPCOMING',
        venue: venue.trim()
      };

      // Create match in Match Service (port 7773)
      const response = await fetch(`${MATCH_SERVICE_URL}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create match');
      }

      const createdMatch: Match = await response.json();

      onMatchCreated(createdMatch);
      
      // Reset form
      setTeam1Id("");
      setTeam2Id("");
      setVenue("");
      setTossWinnerId("");
      setTossDecision('BAT');
      setShowToss(false);
      setOpen(false);
      
      toast({
        title: "Match Created",
        description: `Match between ${team1.name} and ${team2.name} has been scheduled!`
      });

    } catch (error: any) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create match",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (teams.length < 2) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="league" className="h-auto p-4 flex-col items-start space-y-2">
              <div className="flex items-center space-x-2 w-full">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create Match</span>
              </div>
              <span className="text-xs opacity-80 text-left">Schedule a new match</span>
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Teams First</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>You need at least 2 teams to create a match. Please create teams first.</p>
            <div className="flex justify-center">
              <CreateTeamDialog onTeamCreated={handleTeamCreated} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="league" className="h-auto p-4 flex-col items-start space-y-2">
            <div className="flex items-center space-x-2 w-full">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create Match</span>
            </div>
            <span className="text-xs opacity-80 text-left">Schedule a new match</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{showToss ? "Toss Details" : "Create New Match"}</DialogTitle>
        </DialogHeader>
        
        {!showToss ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Team 1</Label>
              <Select 
                value={team1Id.toString()} 
                onValueChange={(value) => setTeam1Id(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Team 1" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Team 2</Label>
              <Select 
                value={team2Id.toString()} 
                onValueChange={(value) => setTeam2Id(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Team 2" />
                </SelectTrigger>
                <SelectContent>
                  {teams.filter(t => t.id !== team1Id).map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Overs</Label>
              <Select value={overs.toString()} onValueChange={(value) => setOvers(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Overs</SelectItem>
                  <SelectItem value="10">10 Overs</SelectItem>
                  <SelectItem value="20">20 Overs</SelectItem>
                  <SelectItem value="50">50 Overs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Venue</Label>
              <Input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Enter venue"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={proceedToToss}>
                Proceed to Toss
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Toss Winner</Label>
              <Select 
                value={tossWinnerId.toString()} 
                onValueChange={(value) => setTossWinnerId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select toss winner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={team1Id.toString()}>
                    {teams.find(t => t.id === team1Id)?.name}
                  </SelectItem>
                  <SelectItem value={team2Id.toString()}>
                    {teams.find(t => t.id === team2Id)?.name}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Toss Decision</Label>
              <Select value={tossDecision} onValueChange={(value: 'BAT' | 'BOWL') => setTossDecision(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAT">Choose to Bat</SelectItem>
                  <SelectItem value="BOWL">Choose to Bowl</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowToss(false)}>
                Back
              </Button>
              <Button onClick={createMatch} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Start Match"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};