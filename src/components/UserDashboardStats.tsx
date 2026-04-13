import { useEffect, useState } from "react";
import { TrendingUp, Users, Trophy, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down";
}

const StatCard = ({ title, value, change, icon, trend }: StatCardProps) => (
  <Card className="shadow-card hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="text-league-primary">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <p className={`text-xs flex items-center space-x-1 ${
        trend === "up" ? "text-league-success" : "text-destructive"
      }`}>
        <TrendingUp className="w-3 h-3" />
        <span>{change}</span>
      </p>
    </CardContent>
  </Card>
);

export const UserDashboardStats = () => {
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalMatches: 0,
    completedMatches: 0,
    upcomingMatches: 0,
  });

  useEffect(() => {
    // Load user's teams from localStorage
    const savedTeams = localStorage.getItem('cricket-teams');
    const teams = savedTeams ? JSON.parse(savedTeams) : [];
    
    // Load user's matches from localStorage  
    const savedMatches = localStorage.getItem('cricket-matches');
    const matches = savedMatches ? JSON.parse(savedMatches) : [];
    
    const completedMatches = matches.filter((match: any) => match.status === 'completed').length;
    const upcomingMatches = matches.filter((match: any) => match.status === 'scheduled').length;
    
    setStats({
      totalTeams: teams.length,
      totalMatches: matches.length,
      completedMatches,
      upcomingMatches,
    });
  }, []);

  const dashboardStats = [
    {
      title: "Teams Created",
      value: stats.totalTeams.toString(),
      change: "Teams you've created",
      icon: <Users className="w-4 h-4" />,
      trend: "up" as const,
    },
    {
      title: "Total Matches",
      value: stats.totalMatches.toString(),
      change: "Matches organized",
      icon: <Trophy className="w-4 h-4" />,
      trend: "up" as const,
    },
    {
      title: "Completed Matches",
      value: stats.completedMatches.toString(),
      change: "Matches finished",
      icon: <Calendar className="w-4 h-4" />,
      trend: "up" as const,
    },
    {
      title: "Upcoming Matches",
      value: stats.upcomingMatches.toString(),
      change: "Matches scheduled",
      icon: <Users className="w-4 h-4" />,
      trend: "up" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {dashboardStats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};