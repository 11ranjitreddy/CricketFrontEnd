import { Header } from "@/components/Header";
import { UserDashboardStats } from "@/components/UserDashboardStats";
import { QuickActions } from "@/components/QuickActions";
import { UserMatchHistory } from "@/components/UserMatchHistory";
import { UserCreatedTeams } from "@/components/UserCreatedTeams";
import { UpcomingUserMatches } from "@/components/UpcomingUserMatches";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-hero rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome to Sports League</h1>
          <p className="text-white/90 text-lg">
            Manage your leagues, teams, and tournaments with ease
          </p>
        </div>

        {/* Dashboard Stats */}
        <UserDashboardStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <UserMatchHistory />
            <UserCreatedTeams />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <QuickActions />
            
            {/* Upcoming Matches */}
            <UpcomingUserMatches />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
