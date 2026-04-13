import { TrendingUp, Users, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

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

export const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalMatches: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const TEAMS_API = "http://localhost:7772/api/teams";
  const MATCHES_API = "http://localhost:2025/khelega/matches";

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setDebugInfo(['Starting data fetch...']);
      
      // Test Teams API
      addDebugInfo(`Fetching teams from: ${TEAMS_API}`);
      
      let teamsData = [];
      try {
        const teamsResponse = await fetch(TEAMS_API);
        addDebugInfo(`Teams API Response - Status: ${teamsResponse.status} ${teamsResponse.statusText}`);
        
        if (!teamsResponse.ok) {
          addDebugInfo(`Teams API Error: ${teamsResponse.status} - ${teamsResponse.statusText}`);
          throw new Error(`HTTP ${teamsResponse.status}`);
        }
        
        const teamsText = await teamsResponse.text();
        addDebugInfo(`Teams Response length: ${teamsText.length} characters`);
        
        if (teamsText) {
          teamsData = JSON.parse(teamsText);
          addDebugInfo(`Teams JSON parsed successfully. Data type: ${Array.isArray(teamsData) ? 'Array' : typeof teamsData}`);
        } else {
          addDebugInfo('Teams API returned empty response');
        }
      } catch (teamsError) {
        addDebugInfo(`Teams fetch error: ${teamsError.message}`);
      }

      // Test Matches API
      addDebugInfo(`Fetching matches from: ${MATCHES_API}`);
      
      let matchesData = [];
      try {
        const matchesResponse = await fetch(MATCHES_API);
        addDebugInfo(`Matches API Response - Status: ${matchesResponse.status} ${matchesResponse.statusText}`);
        
        if (matchesResponse.ok) {
          const matchesText = await matchesResponse.text();
          addDebugInfo(`Matches Response length: ${matchesText.length} characters`);
          
          if (matchesText) {
            matchesData = JSON.parse(matchesText);
            addDebugInfo(`Matches JSON parsed successfully`);
          }
        }
      } catch (matchesError) {
        addDebugInfo(`Matches fetch error: ${matchesError.message}`);
      }

      // Calculate stats
      const totalTeams = Array.isArray(teamsData) ? teamsData.length : 0;
      const totalMatches = Array.isArray(matchesData) ? matchesData.length : 0;

      addDebugInfo(`Final counts - Teams: ${totalTeams}, Matches: ${totalMatches}`);

      setStats({
        totalTeams,
        totalMatches,
      });

      setLastUpdated(new Date());
      addDebugInfo('Data fetch completed successfully');

    } catch (error) {
      addDebugInfo(`Overall fetch error: ${error.message}`);
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const dashboardStats = [
    {
      title: "Total Teams",
      value: loading ? "..." : stats.totalTeams.toString(),
      change: lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Loading...",
      icon: <Users className="w-4 h-4" />,
      trend: "up" as const,
    },
    {
      title: "Total Matches",
      value: loading ? "..." : stats.totalMatches.toString(),
      change: lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Loading...",
      icon: <Calendar className="w-4 h-4" />,
      trend: stats.totalMatches > 0 ? "up" as const : "down" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Stats</h2>
        <Button onClick={fetchDashboardData} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-xs font-mono p-2 bg-gray-100 rounded">
                {info}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};