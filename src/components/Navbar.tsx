import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Train, Home, LineChart, Settings, Users, FileText, Bell, User, LogIn } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: <Home className="w-4 h-4 mr-2" />,
      active: location.pathname === '/dashboard'
    },
    { 
      name: "Trainset Planning", 
      href: "/planning",
      icon: <Train className="w-4 h-4 mr-2" />,
      active: location.pathname.startsWith('/planning')
    },
    { 
      name: "Maintenance", 
      href: "/maintenance",
      icon: <Settings className="w-4 h-4 mr-2" />,
      active: location.pathname.startsWith('/maintenance')
    },
    { 
      name: "Analytics", 
      href: "/analytics",
      icon: <LineChart className="w-4 h-4 mr-2" />,
      active: location.pathname.startsWith('/analytics')
    },
    { 
      name: "Team", 
      href: "/team",
      icon: <Users className="w-4 h-4 mr-2" />,
      active: location.pathname.startsWith('/team')
    },
    { 
      name: "Reports", 
      href: "/reports",
      icon: <FileText className="w-4 h-4 mr-2" />,
      active: location.pathname.startsWith('/reports')
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/30 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Train className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SpeedLine
              </span>
              <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                OPS
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground/80 hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-foreground/70 hover:bg-accent/50 hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground/70 hover:bg-accent/50 hover:text-foreground">
              <User className="h-5 w-5" />
              <span className="sr-only">User Profile</span>
            </Button>
            <div className="h-6 w-px bg-border mx-2"></div>
            <Button variant="outline" className="gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/30 animate-float-up">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
                    item.active 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground/80 hover:bg-accent/50 hover:text-foreground'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
              <div className="pt-2 space-y-2 mt-4 border-t border-border/30">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <User className="h-5 w-5" />
                  Profile
                </Button>
                <Button variant="outline" className="w-full gap-2 mt-4">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle glow effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
    </nav>
  );
};

export default Navbar;