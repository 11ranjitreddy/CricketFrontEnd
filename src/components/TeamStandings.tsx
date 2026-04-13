import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Team {
  position: number;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  change: "up" | "down" | "same";
}

const teams: Team[] = [
  { position: 1, name: "Lightning FC", played: 8, won: 6, drawn: 2, lost: 0, points: 20, change: "same" },
  { position: 2, name: "Thunder United", played: 8, won: 5, drawn: 2, lost: 1, points: 17, change: "up" },
  { position: 3, name: "Storm Rangers", played: 8, won: 4, drawn: 3, lost: 1, points: 15, change: "down" },
  { position: 4, name: "Blaze Athletic", played: 8, won: 4, drawn: 2, lost: 2, points: 14, change: "up" },
  { position: 5, name: "Dynamo City", played: 8, won: 3, drawn: 3, lost: 2, points: 12, change: "same" },
  { position: 6, name: "Phoenix FC", played: 8, won: 2, drawn: 4, lost: 2, points: 10, change: "down" },
];

const getTrendIcon = (change: Team["change"]) => {
  switch (change) {
    case "up": return <TrendingUp className="w-3 h-3 text-league-success" />;
    case "down": return <TrendingDown className="w-3 h-3 text-destructive" />;
    case "same": return <Minus className="w-3 h-3 text-muted-foreground" />;
  }
};

export const TeamStandings = () => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-league-primary" />
          <span>League Standings</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">D</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">Pts</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.position} className="hover:bg-league-surface-hover">
                <TableCell className="font-medium">{team.position}</TableCell>
                <TableCell className="font-semibold">{team.name}</TableCell>
                <TableCell className="text-center">{team.played}</TableCell>
                <TableCell className="text-center">{team.won}</TableCell>
                <TableCell className="text-center">{team.drawn}</TableCell>
                <TableCell className="text-center">{team.lost}</TableCell>
                <TableCell className="text-center font-bold text-league-primary">
                  {team.points}
                </TableCell>
                <TableCell>{getTrendIcon(team.change)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};