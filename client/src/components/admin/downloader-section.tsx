import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, ExternalLink } from "lucide-react";
import { type Download as DownloadType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function DownloaderSection() {
  const [downloadUrl, setDownloadUrl] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: downloads, isLoading } = useQuery({
    queryKey: ["/api/downloads"],
  });

  const createDownloadMutation = useMutation({
    mutationFn: (url: string) => {
      const filename = url.split('/').pop() || 'downloaded_video.mp4';
      return apiRequest("POST", "/api/downloads", { url, filename });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
      setDownloadUrl("");
      toast({
        title: "Success",
        description: "Download started successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start download",
        variant: "destructive",
      });
    },
  });

  const deleteDownloadMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/downloads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
      toast({
        title: "Success",
        description: "Download removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove download",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadUrl.trim()) return;
    
    try {
      new URL(downloadUrl); // Validate URL
      createDownloadMutation.mutate(downloadUrl);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600";
      case "downloading":
        return "bg-blue-600";
      case "failed":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="space-y-6" data-testid="downloader-section">
      <h2 className="text-3xl font-bold text-white mb-6">URL Downloader</h2>

      {/* Download Form */}
      <Card className="bg-gray-800 border-gray-700" data-testid="download-form">
        <CardHeader>
          <CardTitle className="text-white">Download from URL</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="download-url" className="text-gray-300">
                Video URL
              </Label>
              <div className="flex space-x-3">
                <Input
                  id="download-url"
                  type="url"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="flex-1 bg-gray-700 border-gray-600 text-white"
                  required
                  data-testid="download-url-input"
                />
                <Button
                  type="submit"
                  disabled={createDownloadMutation.isPending || !downloadUrl.trim()}
                  data-testid="start-download-btn"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Enter a direct URL to a video file. The system will download it and automatically add it to your library.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supported: Direct links to MP4, AVI, MKV files. HTTPS URLs recommended.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Downloads List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Downloads */}
        <Card className="bg-gray-800 border-gray-700" data-testid="active-downloads">
          <CardHeader>
            <CardTitle className="text-white">Download Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4 text-gray-400">Loading downloads...</div>
            ) : !downloads || (downloads as any[]).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No downloads found</p>
                <p className="text-sm mt-2">Start a download using the form above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(downloads as DownloadType[])
                  .filter((download: DownloadType) => download.status !== "completed")
                  .map((download: DownloadType) => (
                    <div 
                      key={download.id} 
                      className="bg-gray-700 p-4 rounded-lg"
                      data-testid={`download-${download.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white text-sm font-medium truncate">
                              {download.filename}
                            </span>
                            <Badge className={getStatusColor(download.status)}>
                              {download.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 truncate">
                            {download.url}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDownloadMutation.mutate(download.id)}
                          className="text-red-400 hover:text-red-300"
                          data-testid={`delete-download-${download.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {download.status === "downloading" && (
                        <>
                          <Progress 
                            value={download.progress} 
                            className="mb-2"
                            data-testid={`download-progress-${download.id}`}
                          />
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{download.speed || "Calculating speed..."}</span>
                            <span>{download.eta || "Calculating time..."}</span>
                          </div>
                        </>
                      )}
                      
                      {download.fileSize && (
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                          <span>
                            {download.downloadedSize ? 
                              `${formatFileSize(download.downloadedSize)} / ${formatFileSize(download.fileSize)}` :
                              formatFileSize(download.fileSize)
                            }
                          </span>
                          <span>
                            {download.progress || 0}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Downloads */}
        <Card className="bg-gray-800 border-gray-700" data-testid="completed-downloads">
          <CardHeader>
            <CardTitle className="text-white">Recent Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            {downloads && (downloads as DownloadType[]).filter((download: DownloadType) => download.status === "completed").length > 0 ? (
              <div className="space-y-3">
                {(downloads as DownloadType[])
                  .filter((download: DownloadType) => download.status === "completed")
                  .slice(0, 5)
                  .map((download: DownloadType) => (
                    <div 
                      key={download.id} 
                      className="flex justify-between items-center bg-gray-700 p-3 rounded-lg"
                      data-testid={`completed-download-${download.id}`}
                    >
                      <div className="flex-1">
                        <span className="text-white text-sm font-medium block truncate">
                          {download.filename}
                        </span>
                        <span className="text-xs text-gray-400">
                          {download.createdAt ? new Date(download.createdAt).toLocaleDateString() : "Unknown date"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-600">Completed</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(download.url, '_blank')}
                          className="text-blue-400 hover:text-blue-300"
                          data-testid={`view-source-${download.id}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="h-12 w-12 mx-auto mb-4 opacity-50">✓</div>
                <p>No completed downloads</p>
                <p className="text-sm mt-2">Completed downloads will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
