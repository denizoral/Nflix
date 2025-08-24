import { Button } from "@/components/ui/button";
import { Play, Info, Settings } from "lucide-react";
import { Link } from "wouter";
import { type Movie } from "@shared/schema";

interface HeroSectionProps {
  featuredMovie?: Movie;
  onPlay: (movie: Movie) => void;
}

export function HeroSection({ featuredMovie, onPlay }: HeroSectionProps) {
  // If no featured movie, show welcome screen instead of placeholder
  if (!featuredMovie) {
    return (
      <section className="relative h-[70vh] overflow-hidden bg-gradient-to-br from-dotbyte-dark via-gray-900 to-black" data-testid="hero-section">
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 text-white">
              Welcome to DotByte
            </h2>
            <p className="text-base md:text-lg lg:text-xl mb-6 text-gray-200">
              Your personal streaming platform. Upload your videos or scan your directory to get started.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/admin">
                <Button
                  size="lg"
                  className="bg-dotbyte-red text-white hover:bg-red-700 font-semibold px-8"
                  data-testid="hero-admin-btn"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Go to Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const movie = featuredMovie;

  return (
    <section className="relative h-[70vh] overflow-hidden" data-testid="hero-section">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518673109211-d0bf5e22b75c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          <h2 
            className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4" 
            data-testid="hero-title"
          >
            {movie.title}
          </h2>
          <p 
            className="text-base md:text-lg lg:text-xl mb-6 text-gray-200" 
            data-testid="hero-description"
          >
            {movie.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 font-semibold px-8"
              onClick={() => onPlay(movie)}
              data-testid="hero-play-btn"
            >
              <Play className="mr-2 h-5 w-5" />
              Play
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="bg-gray-600/70 text-white hover:bg-gray-600 font-semibold px-8"
              data-testid="hero-info-btn"
            >
              <Info className="mr-2 h-5 w-5" />
              More Info
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
