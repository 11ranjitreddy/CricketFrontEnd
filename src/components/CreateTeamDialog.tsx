import { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: string;
  name: string;
  role: 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
}

interface Team {
  id: string;
  name: string;
  captain: string;
  players: Player[];
  createdAt: Date;
}

interface CreateTeamDialogProps {
  onTeamCreated: (team: Team) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CreateTeamDialog = ({ onTeamCreated, trigger, open: externalOpen, onOpenChange }: CreateTeamDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [teamName, setTeamName] = useState("");
  const [captain, setCaptain] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState<Player['role']>('BATSMAN');
  const { toast } = useToast();

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 11) {
      const player: Player = {
        id: Date.now().toString(), 
        name: newPlayerName.trim(),
        role: newPlayerRole
      };
      setPlayers([...players, player]);
      setNewPlayerName("");
    }
  };

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const createTeam = async () => {
    if (!teamName.trim() || !captain.trim() || players.length < 1) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields and add at least 1 player",
        variant: "destructive"
      });
      return;
    }

    // Prepare team data for backend
    const teamData = {
      name: teamName.trim(),
      captain: captain.trim(),
      players: players.map(player => ({
        name: player.name,
        role: player.role // Already in uppercase
      }))
    };

    try {
      const response = await axios.post("http://localhost:7772/api/teams", teamData);
      const savedTeam = response.data;

      onTeamCreated(savedTeam);

      // Reset form
      setTeamName("");
      setCaptain("");
      setPlayers([]);
      setOpen(false);

      toast({
        title: "Team Created",
        description: `${savedTeam.name} has been created successfully!`
      });
    } catch (error: any) {
      console.error("Error creating team", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create team. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="surface" className="h-auto p-4 flex-col items-start space-y-2">
            <div className="flex items-center space-x-2 w-full">
              <Users className="w-5 h-5" />
              <span className="font-medium">Add Team</span>
            </div>
            <span className="text-xs opacity-80 text-left">Register new team</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name *</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="captain">Captain *</Label>
              <Input
                id="captain"
                value={captain}
                onChange={(e) => setCaptain(e.target.value)}
                placeholder="Enter captain name"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Add Players ({players.length}/11)</Label>
            <div className="flex gap-2">
              <Input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Player name"
                className="flex-1"
              />
              <select
                value={newPlayerRole}
                onChange={(e) => setNewPlayerRole(e.target.value as Player['role'])}
                className="px-3 py-2 border rounded-md"
              >
                <option value="BATSMAN">Batsman</option>
                <option value="BOWLER">Bowler</option>
                <option value="ALL_ROUNDER">All-rounder</option>
                <option value="WICKET_KEEPER">Wicket-keeper</option>
              </select>
              <Button onClick={addPlayer} disabled={players.length >= 11}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {players.length > 0 && (
            <div className="space-y-2">
              <Label>Players Added</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                {players.map((player) => (
                  <div key={player.id} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                    <div>
                      <span className="font-medium">{player.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">({player.role})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlayer(player.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createTeam}>
              Create Team
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};