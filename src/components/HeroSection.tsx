import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import heroTrain from "@/assets/hero-train.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 rail-pattern opacity-20"></div>
      
      {/* Motion Lines Effect */}
      <div className="absolute inset-0 motion-lines"></div>
      
      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Image */}
          <div className="relative mb-12 animate-float-up">
            <img 
              src={heroTrain} 
              alt="Speedline futuristic metro train" 
              className="w-full h-[400px] object-cover rounded-2xl glow-electric"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent rounded-2xl"></div>
          </div>

          {/* Headlines */}
          <div className="space-y-6 mb-12 animate-float-up" style={{animationDelay: "0.2s"}}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="text-primary w-8 h-8" />
              <span className="text-primary font-semibold tracking-wider uppercase">
                Next-Gen Metro Intelligence
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              Speedline
            </h1>
            
            <h2 className="text-2xl md:text-4xl font-semibold text-foreground/90 leading-relaxed max-w-4xl mx-auto">
              AI-Powered Train Induction Planning
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Revolutionizing metro operations with intelligent automation, 
              real-time optimization, and precision scheduling
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-float-up" style={{animationDelay: "0.4s"}}>
            <Button variant="hero" size="lg" className="glow-pulse">
              Start Your Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-primary/30 hover:border-primary text-primary hover:bg-primary/10">
              Watch Overview
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 animate-slide-in-right" style={{animationDelay: "0.6s"}}>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary glow-pulse">99.5%</div>
              <div className="text-muted-foreground">Punctuality Rate</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-accent glow-pulse">40+</div>
              <div className="text-muted-foreground">Active Trainsets</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary glow-pulse">24/7</div>
              <div className="text-muted-foreground">Real-Time Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Stream Background */}
      <div className="absolute bottom-0 left-0 right-0 h-32 data-stream opacity-30"></div>
    </section>
  );
};

export default HeroSection;