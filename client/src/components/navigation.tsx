import { useState } from "react";
import { Link } from "wouter";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Search, Bell, Settings, Menu } from "lucide-react";

export function Navigation() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const themeOptions = [
    { value: "dark", label: "Dark Theme", icon: "🌙" },
    { value: "material", label: "Material Design", icon: "🧊" },
    { value: "matrix", label: "Matrix Theme", icon: "💻" },
    { value: "flat", label: "Flat Design", icon: "⬜" },
  ] as const;

  return (
    <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/">
            <h1 className="text-2xl font-bold text-dotbyte-red cursor-pointer" data-testid="logo">
              DotByte
            </h1>
          </Link>
          <ul className="hidden md:flex space-x-6">
            <li>
              <Link href="/" className="hover:text-gray-300 transition-colors" data-testid="nav-home">
                Home
              </Link>
            </li>
            <li>
              <Link href="/movies" className="hover:text-gray-300 transition-colors" data-testid="nav-movies">
                Movies
              </Link>
            </li>
            <li>
              <Link href="/tv" className="hover:text-gray-300 transition-colors" data-testid="nav-tv">
                TV Shows
              </Link>
            </li>
            <li>
              <Link href="/my-list" className="hover:text-gray-300 transition-colors" data-testid="nav-mylist">
                My List
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2" data-testid="theme-switcher">
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-gray-900 border-gray-700">
              {themeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`cursor-pointer ${
                    theme === option.value ? "bg-gray-800" : ""
                  }`}
                  data-testid={`theme-option-${option.value}`}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className="p-2" data-testid="search-btn">
            <Search className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" className="p-2 hidden md:block" data-testid="notifications-btn">
            <Bell className="h-4 w-4" />
          </Button>

          <div className="w-8 h-8 bg-dotbyte-red rounded-full flex items-center justify-center" data-testid="user-avatar">
            <span className="text-sm font-semibold">U</span>
          </div>

          {/* Admin Access */}
          <Link href="/admin">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:text-gray-300 transition-colors"
              data-testid="admin-access"
              title="Admin Dashboard"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-sm border-t border-gray-800" data-testid="mobile-menu">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link href="/" className="block py-2 hover:text-gray-300 transition-colors">
              Home
            </Link>
            <Link href="/movies" className="block py-2 hover:text-gray-300 transition-colors">
              Movies
            </Link>
            <Link href="/tv" className="block py-2 hover:text-gray-300 transition-colors">
              TV Shows
            </Link>
            <Link href="/my-list" className="block py-2 hover:text-gray-300 transition-colors">
              My List
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
