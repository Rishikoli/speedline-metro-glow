import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Clock, Database, Shield, TrendingUp, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Optimization",
    description: "Advanced machine learning algorithms optimize train scheduling and resource allocation in real-time.",
    highlight: "99.5% Accuracy"
  },
  {
    icon: Clock,
    title: "Multi-Objective Scheduling",
    description: "Balance multiple priorities including punctuality, energy efficiency, and passenger comfort simultaneously.",
    highlight: "Real-Time Sync"
  },
  {
    icon: Database,
    title: "Integrated Data Sources",
    description: "Seamlessly consolidate data from multiple systems for comprehensive operational insights.",
    highlight: "100+ Sources"
  },
  {
    icon: Shield,
    title: "Explainable AI Logic",
    description: "Transparent decision-making processes with full audit trails and reasoning explanations.",
    highlight: "Full Transparency"
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "Advanced metrics and predictive analytics to optimize fleet performance and maintenance cycles.",
    highlight: "Predictive Insights"
  },
  {
    icon: Zap,
    title: "Feedback Learning",
    description: "Continuous improvement through machine learning feedback loops and operational data analysis.",
    highlight: "Self-Improving"
  }
];

const FeatureCards = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 rail-pattern opacity-10"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-float-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Core Platform Strengths
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how Speedline transforms metro operations with cutting-edge technology 
            and intelligent automation solutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group bg-card/50 backdrop-blur-sm border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 glow-electric animate-float-up"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-accent px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                    {feature.highlight}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;