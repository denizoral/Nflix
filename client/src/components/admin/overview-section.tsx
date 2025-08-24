import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Film, Users, HardDrive, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewSection() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="overview-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Movies",
      value: (stats as any)?.totalMovies || 0,
      icon: Film,
      color: "text-blue-500",
      testId: "stat-movies"
    },
    {
      title: "Active Users",
      value: (stats as any)?.activeUsers || 0,
      icon: Users,
      color: "text-green-500",
      testId: "stat-users"
    },
    {
      title: "Storage Used",
      value: (stats as any)?.storageUsed || "0 GB",
      icon: HardDrive,
      color: "text-yellow-500",
      testId: "stat-storage"
    },
    {
      title: "Total Views",
      value: (stats as any)?.totalViews || 0,
      icon: Eye,
      color: "text-purple-500",
      testId: "stat-views"
    },
  ];

  return (
    <div className="space-y-6" data-testid="overview-section">
      <h2 className="text-3xl font-bold text-white mb-6">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.testId} className="bg-gray-800 border-gray-700" data-testid={stat.testId}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Server Performance Chart */}
      <Card className="bg-gray-800 border-gray-700" data-testid="performance-chart">
        <CardHeader>
          <CardTitle className="text-white">Server Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <BarChart className="h-16 w-16 mx-auto mb-4" />
              <p>Performance metrics would be displayed here</p>
              <p className="text-sm">Connect to monitoring service for real-time data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BarChart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <path d="m7 11 2-2-2-2"/>
      <path d="m13 17 2-2-2-2"/>
    </svg>
  );
}
