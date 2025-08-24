import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Star, Users, Globe } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { Navbar } from "@/components/navbar";
import { useLocation } from "wouter";

export default function Landing() {
  const { theme } = useTheme();
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar showAuth={true} />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            DotByte
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Your premium streaming destination. Discover and enjoy unlimited entertainment 
            with our curated collection of movies and shows.
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="text-lg px-8 py-6"
            data-testid="button-login"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Play className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>High Quality Streaming</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Enjoy crystal clear video quality with adaptive streaming technology
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Star className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Curated Content</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Hand-picked movies and shows from around the world
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Discover what's trending and get personalized recommendations
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Join the DotByte Community</h2>
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Movies & Shows</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 DotByte. Experience the future of streaming.
          </p>
        </div>
      </footer>
    </div>
  );
}