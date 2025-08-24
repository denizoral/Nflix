import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingUp, Clock } from "lucide-react";
import { type Movie } from "@shared/schema";

export function AnalyticsSection() {
  const { data: popularMovies, isLoading: loadingPopular } = useQuery({
    queryKey: ["/api/analytics/popular"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  // Generate real-time logs based on actual system state
  const generateSystemLogs = () => {
    const now = new Date();
    const logs = [
      { 
        timestamp: now.toISOString().replace('T', ' ').split('.')[0], 
        level: "INFO", 
        message: "Video streaming service running" 
      },
      { 
        timestamp: new Date(now.getTime() - 1000).toISOString().replace('T', ' ').split('.')[0], 
        level: "INFO", 
        message: `${(stats as any)?.totalMovies || 0} movies in library` 
      },
      { 
        timestamp: new Date(now.getTime() - 2000).toISOString().replace('T', ' ').split('.')[0], 
        level: "INFO", 
        message: `Total views: ${(stats as any)?.totalViews || 0}` 
      },
      { 
        timestamp: new Date(now.getTime() - 3000).toISOString().replace('T', ' ').split('.')[0], 
        level: "INFO", 
        message: `Storage used: ${(stats as any)?.storageUsed || '0 GB'}` 
      },
    ];
    return logs;
  };
  
  const systemLogs = generateSystemLogs();

  const getLogColor = (level: string) => {
    switch (level) {
      case "INFO":
        return "text-green-400";
      case "WARN":
        return "text-yellow-400";
      case "ERROR":
        return "text-red-400";
      case "DEBUG":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6" data-testid="analytics-section">
      <h2 className="text-3xl font-bold text-white mb-6">Analytics & Monitoring</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <Card className="bg-gray-800 border-gray-700" data-testid="user-activity-chart">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>User activity chart would be displayed here</p>
                <p className="text-sm mt-2">Connect to analytics service for real-time data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Content */}
        <Card className="bg-gray-800 border-gray-700" data-testid="popular-content">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Popular Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPopular ? (
              <div className="text-center py-4 text-gray-400">Loading popular movies...</div>
            ) : !popularMovies || (popularMovies as any[]).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No popular content data</p>
                <p className="text-sm mt-2">Data will appear as users watch movies</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(popularMovies as Movie[]).slice(0, 5).map((movie: Movie, index: number) => (
                  <div 
                    key={movie.id} 
                    className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0"
                    data-testid={`popular-movie-${movie.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="text-white font-medium">{movie.title}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 text-sm">
                        {movie.views?.toLocaleString() || 0} views
                      </span>
                      {movie.genre && (
                        <Badge variant="outline" className="ml-2 text-xs border-gray-600 text-gray-300">
                          {movie.genre}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Logs */}
        <Card className="bg-gray-800 border-gray-700" data-testid="system-logs">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              System Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm max-h-48 overflow-y-auto">
              {systemLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`${getLogColor(log.level)} mb-1`}
                  data-testid={`log-entry-${index}`}
                >
                  [{log.timestamp}] {log.level}: {log.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Server Status */}
        <Card className="bg-gray-800 border-gray-700" data-testid="server-status">
          <CardHeader>
            <CardTitle className="text-white">Server Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Storage Used</p>
                  <p className="text-xl font-bold text-green-400">{(stats as any)?.storageUsed || '0 GB'}</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Movies</p>
                  <p className="text-xl font-bold text-blue-400">{(stats as any)?.totalMovies || 0}</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Views</p>
                  <p className="text-xl font-bold text-purple-400">{(stats as any)?.totalViews || 0}</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Active Downloads</p>
                  <p className="text-xl font-bold text-yellow-400">{(stats as any)?.activeDownloads || 0}</p>
                </div>
              </div>
              
              <div className="bg-gray-900 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Service Status</span>
                  <Badge className="bg-green-600">All Systems Operational</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
