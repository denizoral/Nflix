import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import { type Movie } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function MoviesSection() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: movies, isLoading } = useQuery({
    queryKey: ["/api/movies"],
  });

  const scanMoviesMutation = useMutation({
    mutationFn: () => apiRequest("GET", "/api/movies/scan"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      toast({
        title: "Success",
        description: "Movie directory scanned successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to scan movie directory",
        variant: "destructive",
      });
    },
  });

  const deleteMovieMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/movies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      toast({
        title: "Success",
        description: "Movie deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete movie",
        variant: "destructive",
      });
    },
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="space-y-6" data-testid="movies-section">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Movie Management</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => scanMoviesMutation.mutate()}
            disabled={scanMoviesMutation.isPending}
            variant="outline"
            data-testid="scan-movies-btn"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${scanMoviesMutation.isPending ? 'animate-spin' : ''}`} />
            Scan Directory
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-movie-btn">
                <Plus className="mr-2 h-4 w-4" />
                Add Movie
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Add New Movie</DialogTitle>
              </DialogHeader>
              <MovieForm 
                onSuccess={() => setIsAddDialogOpen(false)} 
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700" data-testid="movies-table-card">
        <CardHeader>
          <CardTitle className="text-white">Movie Library</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading movies...</div>
          ) : !movies || (movies as any[]).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No movies found.</p>
              <p className="text-sm mt-2">Try scanning your movie directory or uploading new files.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Title</TableHead>
                    <TableHead className="text-gray-300">Duration</TableHead>
                    <TableHead className="text-gray-300">Size</TableHead>
                    <TableHead className="text-gray-300">Views</TableHead>
                    <TableHead className="text-gray-300">Genre</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(movies as Movie[]).map((movie: Movie) => (
                    <TableRow key={movie.id} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="text-white font-medium" data-testid={`movie-title-${movie.id}`}>
                        {movie.title}
                      </TableCell>
                      <TableCell className="text-gray-300" data-testid={`movie-duration-${movie.id}`}>
                        {formatDuration(movie.duration || undefined)}
                      </TableCell>
                      <TableCell className="text-gray-300" data-testid={`movie-size-${movie.id}`}>
                        {formatFileSize(movie.fileSize || undefined)}
                      </TableCell>
                      <TableCell className="text-gray-300" data-testid={`movie-views-${movie.id}`}>
                        {movie.views?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell data-testid={`movie-genre-${movie.id}`}>
                        {movie.genre && (
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {movie.genre}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingMovie(movie)}
                            className="text-blue-400 hover:text-blue-300"
                            data-testid={`edit-movie-${movie.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMovieMutation.mutate(movie.id)}
                            disabled={deleteMovieMutation.isPending}
                            className="text-red-400 hover:text-red-300"
                            data-testid={`delete-movie-${movie.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Movie Dialog */}
      <Dialog open={!!editingMovie} onOpenChange={() => setEditingMovie(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Movie</DialogTitle>
          </DialogHeader>
          <MovieForm 
            movie={editingMovie}
            onSuccess={() => setEditingMovie(null)} 
            onCancel={() => setEditingMovie(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface MovieFormProps {
  movie?: Movie | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function MovieForm({ movie, onSuccess, onCancel }: MovieFormProps) {
  const [formData, setFormData] = useState({
    title: movie?.title || "",
    description: movie?.description || "",
    genre: movie?.genre || "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (movie) {
        return apiRequest("PUT", `/api/movies/${movie.id}`, data);
      } else {
        return apiRequest("POST", "/api/movies", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      toast({
        title: "Success",
        description: movie ? "Movie updated successfully" : "Movie created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: movie ? "Failed to update movie" : "Failed to create movie",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="movie-form">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-gray-700 border-gray-600 text-white"
          required
          data-testid="movie-title-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-gray-700 border-gray-600 text-white"
          rows={3}
          data-testid="movie-description-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="genre">Genre</Label>
        <Input
          id="genre"
          value={formData.genre}
          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
          className="bg-gray-700 border-gray-600 text-white"
          data-testid="movie-genre-input"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="cancel-movie-btn"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saveMutation.isPending}
          data-testid="save-movie-btn"
        >
          {saveMutation.isPending ? "Saving..." : movie ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
