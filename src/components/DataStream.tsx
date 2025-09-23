import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Clock, Database, Train } from "lucide-react";

const streamData = [
  { icon: Train, text: "Trainset T-401 approaching Platform 3", type: "info", priority: "normal" },
  { icon: CheckCircle, text: "Fitness Certificate validated for Fleet Unit 28", type: "success", priority: "normal" },
  { icon: AlertTriangle, text: "Scheduled maintenance window: 02:00-04:00", type: "warning", priority: "high" },
  { icon: Database, text: "Real-time data sync completed across 15 stations", type: "info", priority: "normal" },
  { icon: Activity, text: "System optimization: 12% efficiency improvement", type: "success", priority: "high" },
  { icon: Clock, text: "Peak hour schedule adjustment activated", type: "info", priority: "normal" },
  { icon: Train, text: "Emergency braking system test successful", type: "success", priority: "normal" },
  { icon: AlertTriangle, text: "Weather advisory: High winds detected", type: "warning", priority: "medium" },
];

const DataStream = () => {
  const [currentItems, setCurrentItems] = useState([0, 1, 2]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentItems(prev => {
          const next = prev.map(index => (index + 3) % streamData.length);
          return next;
        });
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400 border-green-400/30';
      case 'warning': return 'text-yellow-400 border-yellow-400/30';
      case 'info': return 'text-primary border-primary/30';
      default: return 'text-muted-foreground border-border';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <section className="py-16 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 data-stream opacity-20"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12 animate-float-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Real-Time Operations Stream
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Live monitoring of metro operations, maintenance alerts, and system performance metrics
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-border/30 p-8 glow-electric">
            <div className="space-y-4">
              {currentItems.map((itemIndex, index) => {
                const item = streamData[itemIndex];
                return (
                  <div
                    key={`${itemIndex}-${index}`}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 hover:bg-card/50 ${getTypeColor(item.type)} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                  >
                    <div className="relative">
                      <item.icon className="w-6 h-6" />
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getPriorityIndicator(item.priority)} animate-pulse`}></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{item.text}</p>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stream Indicator */}
            <div className="flex items-center justify-center mt-6 pt-6 border-t border-border/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Live Data Stream Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataStream;