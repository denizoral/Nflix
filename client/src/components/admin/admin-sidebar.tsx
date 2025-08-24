import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Film, 
  Upload, 
  Download, 
  ChartScatter,
  X 
} from "lucide-react";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClose: () => void;
}

const sidebarItems = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "movies", label: "Movies", icon: Film },
  { id: "upload", label: "Upload", icon: Upload },
  { id: "downloader", label: "Downloader", icon: Download },
  { id: "analytics", label: "ChartScatter", icon: ChartScatter },
];

export function AdminSidebar({ activeSection, onSectionChange, onClose }: AdminSidebarProps) {
  return (
    <nav className="w-64 bg-gray-800 min-h-screen" data-testid="admin-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white md:hidden"
          data-testid="close-sidebar-btn"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left px-4 py-2 transition-colors",
                activeSection === item.id
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
              onClick={() => onSectionChange(item.id)}
              data-testid={`nav-${item.id}`}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
