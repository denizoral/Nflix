import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { MovieCard } from "@/components/movie-card";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { type Movie } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Film, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: movies, isLoading } = useQuery({
    queryKey: ["/api/movies"],
  });

  const { data: popularMovies } = useQuery({
    queryKey: ["/api/analytics/popular"],
  });

  const recordViewMutation = useMutation({
    mutationFn: (movieId: string) => apiRequest("POST", `/api/movies/${movieId}/view`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/popular"] });
    },
  });

  const handlePlayMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsPlayerOpen(true);
    recordViewMutation.mutate(movie.id);
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedMovie(null);
  };

  // Get featured movie (most viewed or first movie)
  const featuredMovie = (popularMovies as Movie[])?.[0] || (movies as Movie[])?.[0];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300" data-testid="home-page">
      <Navbar />
      
      <main className="pt-16 md:pt-20">
        {/* Hero Section */}
        <HeroSection 
          featuredMovie={featuredMovie}
          onPlay={handlePlayMovie}
        />

        {/* Movie Sections */}
        <div className="space-y-8 px-4 py-8">
          {/* Trending Now */}
          <section data-testid="trending-section">
            <h3 className="text-xl md:text-2xl font-bold mb-4 px-4">Trending Now</h3>
            {isLoading ? (
              <div className="flex space-x-4 px-4 pb-4 overflow-x-auto">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-none w-48 md:w-72 h-40 md:h-60 bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : movies && (movies as Movie[]).length > 0 ? (
              <div className="relative overflow-x-auto">
                <div className="flex space-x-4 px-4 pb-4">
                  {(movies as Movie[]).slice(0, 8).map((movie: Movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onClick={handlePlayMovie}
                      size="medium"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 px-4">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                    <Film className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Movies Yet</h3>
                  <p className="text-gray-400 mb-6">
                    Get started by uploading movies or scanning your directory in the admin panel.
                  </p>
                  {user?.isAdmin && (
                    <Link href="/admin">
                      <Button className="bg-primary hover:bg-primary/90">
                        <Settings className="w-4 h-4 mr-2" />
                        Go to Admin Panel
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Popular Movies Section */}
          <section data-testid="popular-section">
            <h3 className="text-xl md:text-2xl font-bold mb-4 px-4">Popular Movies</h3>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : popularMovies && (popularMovies as Movie[]).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4">
                {(popularMovies as Movie[]).map((movie: Movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onClick={handlePlayMovie}
                    size="small"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 px-4">
                <p>No popular movies yet.</p>
                <p className="text-sm mt-2">Movies will appear here as they gain views.</p>
              </div>
            )}
          </section>

          {/* All Movies */}
          {movies && (movies as Movie[]).length > 8 && (
            <section data-testid="all-movies-section">
              <h3 className="text-xl md:text-2xl font-bold mb-4 px-4">All Movies</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4">
                {(movies as Movie[]).slice(8).map((movie: Movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onClick={handlePlayMovie}
                    size="small"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Video Player Modal */}
      <VideoPlayer
        isOpen={isPlayerOpen}
        onClose={handleClosePlayer}
        movie={selectedMovie}
      />
    </div>
  );
}
