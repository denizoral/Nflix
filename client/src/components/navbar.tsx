import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/theme-context";
import { 
  Monitor, 
  Palette, 
  Sparkles, 
  Square,
  LogOut,
  Settings,
  User
} from "lucide-react";

interface NavbarProps {
  showAuth?: boolean;
}

export function Navbar({ showAuth = false }: NavbarProps) {
  const { user, isAuthenticated, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLogin = () => {
    setLocation("/auth");
  };

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case "dark":
        return <Monitor className="w-4 h-4" />;
      case "material":
        return <Palette className="w-4 h-4" />;
      case "matrix":
        return <Sparkles className="w-4 h-4" />;
      case "flat":
        return <Square className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        <Link href="/" className="text-xl md:text-2xl font-bold text-primary" data-testid="link-home">
          DotByte
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10" data-testid="button-theme">
                {getThemeIcon(theme)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("dark")} data-testid="theme-dark">
                <Monitor className="w-4 h-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("material")} data-testid="theme-material">
                <Palette className="w-4 h-4 mr-2" />
                Material
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("matrix")} data-testid="theme-matrix">
                <Sparkles className="w-4 h-4 mr-2" />
                Matrix
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("flat")} data-testid="theme-flat">
                <Square className="w-4 h-4 mr-2" />
                Flat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Authentication */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.email || undefined} />
                    <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.firstName && user?.lastName && (
                      <p className="font-medium" data-testid="text-user-name">
                        {user.firstName} {user.lastName}
                      </p>
                    )}
                    {user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground" data-testid="text-user-email">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                {user?.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" data-testid="link-admin">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : showAuth ? (
            <Button onClick={handleLogin} data-testid="button-login-nav">
              Sign In
            </Button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}