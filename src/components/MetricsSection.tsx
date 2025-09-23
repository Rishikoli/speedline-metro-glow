import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, MapPin, Users, Zap, TrendingUp } from "lucide-react";

const metrics = [
  {
    icon: Clock,
    title: "Punctuality Rate",
    value: 99.5,
    suffix: "%",
    description: "On-time performance across all routes",
    color: "text-green-400"
  },
  {
    icon: MapPin,
    title: "Active Trainsets",
    value: 40,
    suffix: "+",
    description: "Currently operational fleet units",
    color: "text-primary"
  },
  {
    icon: Users,
    title: "Daily Passengers",
    value: 2.4,
    suffix: "M",
    description: "Average daily ridership",
    color: "text-accent"
  },
  {
    icon: Zap,
    title: "Energy Efficiency",
    value: 87,
    suffix: "%",
    description: "Optimized power consumption",
    color: "text-yellow-400"
  },
  {
    icon: BarChart3,
    title: "System Reliability",
    value: 99.8,
    suffix: "%",
    description: "Uptime across all network segments",
    color: "text-green-400"
  },
  {
    icon: TrendingUp,
    title: "Performance Index",
    value: 94,
    suffix: "/100",
    description: "Overall operational excellence score",
    color: "text-primary"
  }
];

const CounterAnimation = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const duration = 2000;
    const increment = end / (duration / 50);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start * 10) / 10);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="font-bold text-4xl md:text-5xl">
      {count.toFixed(suffix.includes('%') || suffix.includes('/') ? 1 : 0)}{suffix}
    </span>
  );
};

const MetricsSection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 rail-pattern opacity-5"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-float-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Performance Metrics
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time insights into system performance, efficiency metrics, and operational excellence indicators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {metrics.map((metric, index) => (
            <Card 
              key={index}
              className="group bg-card/50 backdrop-blur-sm border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 glow-electric animate-counter-up"
              style={{animationDelay: `${index * 0.15}s`}}
            >
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors w-fit">
                  <metric.icon className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold text-muted-foreground">
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className={`${metric.color} transition-colors group-hover:text-primary`}>
                  <CounterAnimation target={metric.value} suffix={metric.suffix} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Indicator */}
        <div className="mt-16 text-center animate-float-up" style={{animationDelay: "1s"}}>
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary/10 border border-primary/20 glow-electric">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-foreground font-semibold">All Systems Operational</span>
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;