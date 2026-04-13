import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trophy, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  captain: string;
  players: any[];
}

interface Tournament {
  id: string;
  name: string;
  format: 'round-robin' | 'knockout' | 'double-elimination';
  teams: Team[];
  startDate: string;
  endDate: string;
  venue: string;
  overs: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: Date;
}

interface TournamentDialogProps {
  onTournamentCreated: (tournament: Tournament) => void;
  trigger?: React.ReactNode;
}

export const TournamentDialog = ({ onTournamentCreated, trigger }: TournamentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [format, setFormat] = useState<Tournament['format']>('round-robin');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [venue, setVenue] = useState("");
  const [overs, setOvers] = useState(20);
  const { toast } = useToast();

  useEffect(() => {
    const savedTeams = JSON.parse(localStorage.getItem('cricket-teams') || '[]');
    setTeams(savedTeams);
  }, []);

  const handleTeamSelection = (teamId: string, checked: boolean) => {
    if (checked) {
      setSelectedTeams([...selectedTeams, teamId]);
    } else {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    }
  };

  const validateTournament = () => {
    if (!tournamentName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter tournament name",
        variant: "destructive"
      });
      return false;
    }

    if (selectedTeams.length < 2) {
      toast({
        title: "Validation Error",
        description: "Please select at least 2 teams",
        variant: "destructive"
      });
      return false;
    }

    if (format === 'knockout' && selectedTeams.length < 4) {
      toast({
        title: "Validation Error",
        description: "Knockout format requires at least 4 teams",
        variant: "destructive"
      });
      return false;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please select start and end dates",
        variant: "destructive"
      });
      return false;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive"
      });
      return false;
    }

    if (!venue.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter venue",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const createTournament = () => {
    if (!validateTournament()) return;

    const tournamentTeams = teams.filter(team => selectedTeams.includes(team.id));
    
    const tournament: Tournament = {
      id: Date.now().toString(),
      name: tournamentName.trim(),
      format,
      teams: tournamentTeams,
      startDate,
      endDate,
      venue: venue.trim(),
      overs,
      status: 'upcoming',
      createdAt: new Date()
    };

    // Save to localStorage
    const existingTournaments = JSON.parse(localStorage.getItem('cricket-tournaments') || '[]');
    existingTournaments.push(tournament);
    localStorage.setItem('cricket-tournaments', JSON.stringify(existingTournaments));

    onTournamentCreated(tournament);
    
    // Reset form
    setTournamentName("");
    setFormat('round-robin');
    setSelectedTeams([]);
    setStartDate("");
    setEndDate("");
    setVenue("");
    setOvers(20);
    setOpen(false);
    
    toast({
      title: "Tournament Created",
      description: `${tournament.name} has been created successfully!`
    });
  };

  const getMinimumTeams = () => {
    switch (format) {
      case 'knockout':
        return 4;
      case 'double-elimination':
        return 3;
      default:
        return 2;
    }
  };

  if (teams.length < getMinimumTeams()) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="success" className="h-auto p-4 flex-col items-start space-y-2">
              <div className="flex items-center space-x-2 w-full">
                <Trophy className="w-5 h-5" />
                <span className="font-medium">New Tournament</span>
              </div>
              <span className="text-xs opacity-80 text-left">Create tournament</span>
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Not Enough Teams</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>You need at least {getMinimumTeams()} teams to create a tournament. Please create more teams first.</p>
            <p className="text-sm text-muted-foreground">
              Current teams: {teams.length} | Required: {getMinimumTeams()}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="success" className="h-auto p-4 flex-col items-start space-y-2">
            <div className="flex items-center space-x-2 w-full">
              <Trophy className="w-5 h-5" />
              <span className="font-medium">New Tournament</span>
            </div>
            <span className="text-xs opacity-80 text-left">Create tournament</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Tournament</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tournamentName">Tournament Name *</Label>
              <Input
                id="tournamentName"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="Enter tournament name"
              />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={(value: Tournament['format']) => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round-robin">Round Robin</SelectItem>
                  <SelectItem value="knockout">Knockout</SelectItem>
                  <SelectItem value="double-elimination">Double Elimination</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue *</Label>
            <Input
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Enter venue"
            />
          </div>

          <div className="space-y-4">
            <Label>Select Teams * (minimum {getMinimumTeams()})</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-4 space-y-2">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={team.id}
                    checked={selectedTeams.includes(team.id)}
                    onCheckedChange={(checked) => handleTeamSelection(team.id, checked as boolean)}
                  />
                  <Label htmlFor={team.id} className="flex-1 cursor-pointer">
                    {team.name} (Captain: {team.captain})
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected teams: {selectedTeams.length} | Format requires: {getMinimumTeams()}+
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createTournament}>
              Create Tournament
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};