import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Linkedin, Twitter, Github } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-background border-t border-border/30 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 rail-pattern opacity-5"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 glow-electric">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded"></div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Speedline
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Next-generation metro intelligence platform revolutionizing transit operations 
              with AI-powered automation and precision scheduling.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary/10 hover:text-primary">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary/10 hover:text-primary">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary/10 hover:text-primary">
                <Github className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Platform</h4>
            <ul className="space-y-3">
              {["Dashboard", "Analytics", "Fleet Management", "Scheduling", "Maintenance", "Reports"].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-primary transition-colors hover:underline"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Solutions</h4>
            <ul className="space-y-3">
              {["AI Optimization", "Real-time Monitoring", "Predictive Analytics", "Route Planning", "Energy Management", "Safety Systems"].map((solution) => (
                <li key={solution}>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-primary transition-colors hover:underline"
                  >
                    {solution}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Connect</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span>contact@speedline.ai</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <span>+1 (555) 123-RAIL</span>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <span>Transit Innovation Hub<br />Metro Center, Suite 2400<br />San Francisco, CA 94105</span>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-foreground font-medium">System Status: All Good</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Speedline Technologies. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;