import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Movie } from "@shared/schema";
import { Play, Star } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
  size?: "small" | "medium" | "large";
}

export function MovieCard({ movie, onClick, size = "medium" }: MovieCardProps) {
  const sizeClasses = {
    small: "w-full h-48",
    medium: "w-72 h-40",
    large: "w-full h-56",
  };

  const cardSizeClasses = {
    small: "w-full",
    medium: "flex-none w-72",
    large: "w-full",
  };

  // Generate thumbnail URL (placeholder for now)
  const thumbnailUrl = movie.thumbnailPath || 
    `https://images.unsplash.com/photo-1518673109211-d0bf5e22b75c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600&q=80`;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatViews = (views?: number) => {
    if (!views) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <Card 
      className={`${cardSizeClasses[size]} bg-gray-900 border-gray-800 overflow-hidden transition-all duration-300 hover:scale-105 hover:border-gray-600 cursor-pointer group`}
      onClick={() => onClick(movie)}
      data-testid={`movie-card-${movie.id}`}
    >
      <div className="relative">
        <img 
          src={thumbnailUrl}
          alt={`${movie.title} poster`}
          className={`${sizeClasses[size]} object-cover`}
          data-testid={`movie-thumbnail-${movie.id}`}
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Play className="h-12 w-12 text-white" data-testid={`play-icon-${movie.id}`} />
        </div>
        
        {/* Rating Badge */}
        {movie.rating && movie.rating !== "0" && (
          <Badge 
            className="absolute top-2 right-2 bg-yellow-600 text-white"
            data-testid={`rating-${movie.id}`}
          >
            <Star className="h-3 w-3 mr-1" />
            {movie.rating}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-3">
        <h4 
          className="font-semibold text-white mb-1 truncate" 
          data-testid={`movie-title-${movie.id}`}
        >
          {movie.title}
        </h4>
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span data-testid={`movie-duration-${movie.id}`}>
            {formatDuration(movie.duration || undefined)}
          </span>
          <span data-testid={`movie-views-${movie.id}`}>
            {formatViews(movie.views || undefined)} views
          </span>
        </div>
        {movie.genre && (
          <Badge 
            variant="outline" 
            className="mt-2 text-xs border-gray-600 text-gray-300"
            data-testid={`movie-genre-${movie.id}`}
          >
            {movie.genre}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
