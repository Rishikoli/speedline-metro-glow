import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { runOrchestrator } from "@/agents/orchestrator";
import { defaultConstraints, mockFleet } from "@/agents/mockData";
import { AgentHealth, AgentOutput, GlobalConstraints, InductionPlan } from "@/agents/types";

const severityColor: Record<AgentOutput["findings"][number]["severity"], string> = {
  info: "bg-primary/15 text-primary border border-primary/30",
  warn: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  critical: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const statusPill: Record<AgentHealth["status"], string> = {
  ok: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  warn: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  critical: "bg-red-500/20 text-red-300 border border-red-500/30",
};

export default function ConsolePage() {
  const [constraints, setConstraints] = useState<GlobalConstraints>(defaultConstraints);
  const [agentOutputs, setAgentOutputs] = useState<AgentOutput[] | null>(null);
  const [plan, setPlan] = useState<InductionPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const fleet = useMemo(() => mockFleet, []);

  const onRun = async () => {
    setLoading(true);
    try {
      const { agentOutputs, plan } = await runOrchestrator({ fleet, constraints });
      setAgentOutputs(agentOutputs);
      setPlan(plan);
    } finally {
      setLoading(false);
    }
  };

  const health: AgentHealth[] | null = useMemo(() => {
    if (!agentOutputs) return null;
    const now = new Date();
    return agentOutputs.map((a) => {
      const counts = a.findings.reduce(
        (acc, f) => {
          if (f.severity === "info") acc.info += 1;
          if (f.severity === "warn") acc.warn += 1;
          if (f.severity === "critical") acc.critical += 1;
          return acc;
        },
        { info: 0, warn: 0, critical: 0 }
      );
      const status: AgentHealth["status"] = counts.critical > 0 ? "critical" : counts.warn > 0 ? "warn" : "ok";
      const summary =
        status === "ok"
          ? "Healthy"
          : status === "warn"
          ? "Warnings present"
          : "Critical issues present";
      return { agent: a.agent, status, findingCounts: counts, lastRun: now, summary };
    });
  }, [agentOutputs]);

  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Supervisor Console
          </h1>
          <Button onClick={onRun} className="glow-pulse" disabled={loading}>
            {loading ? "Running..." : "Run Orchestrator"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card/60 backdrop-blur glow-electric">
            <CardHeader>
              <CardTitle>Constraints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Max Service</label>
                  <Input
                    type="number"
                    value={constraints.maxService}
                    onChange={(e) => setConstraints({ ...constraints, maxService: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Min Standby</label>
                  <Input
                    type="number"
                    value={constraints.minStandby}
                    onChange={(e) => setConstraints({ ...constraints, minStandby: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Cleaning Bay Capacity</label>
                  <Input
                    type="number"
                    value={constraints.cleaningBayCapacity}
                    onChange={(e) => setConstraints({ ...constraints, cleaningBayCapacity: Number(e.target.value) })}
                  />
                </div>
              </div>
              <Separator className="my-2" />
              <div className="text-sm text-muted-foreground">
                Adjust constraints to simulate different operating conditions.
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-card/60 backdrop-blur glow-electric">
            <CardHeader>
              <CardTitle>Fleet Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground">
                    <tr className="border-b border-border/30">
                      <th className="text-left py-2">Trainset</th>
                      <th className="text-right py-2">KM</th>
                      <th className="text-left py-2">Fitness</th>
                      <th className="text-right py-2">Work Orders</th>
                      <th className="text-right py-2">Branding Hrs (7d)</th>
                      <th className="text-left py-2">Cleaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fleet.map((t) => (
                      <tr key={t.id} className="border-b border-border/20">
                        <td className="py-2 font-medium">{t.id}</td>
                        <td className="py-2 text-right tabular-nums">{t.km.toLocaleString()}</td>
                        <td className="py-2 text-left">
                          {t.fitnessValidUntil.toLocaleDateString()} {t.fitnessValidUntil < new Date() && (
                            <Badge variant="secondary" className="ml-2 bg-red-500/20 text-red-300 border border-red-500/30">Expired</Badge>
                          )}
                        </td>
                        <td className="py-2 text-right tabular-nums">{t.openWorkOrders}</td>
                        <td className="py-2 text-right tabular-nums">{t.brandingCommittedHoursNext7d}</td>
                        <td className="py-2">{t.cleaningRequired ? "Required" : "OK"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="bg-card/60 backdrop-blur glow-electric">
            <CardHeader>
              <CardTitle>Agents Health</CardTitle>
            </CardHeader>
            <CardContent>
              {!health ? (
                <div className="text-sm text-muted-foreground">Run the orchestrator to compute current agent health.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {health.map((h) => (
                    <div key={h.agent} className="p-4 rounded-lg border border-border/30 bg-background/40">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold capitalize">{h.agent.replace("-", " ")}</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusPill[h.status]}`}>{h.status.toUpperCase()}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{h.summary}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">info {h.findingCounts.info}</Badge>
                        <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">warn {h.findingCounts.warn}</Badge>
                        <Badge variant="secondary" className="bg-red-500/20 text-red-300 border border-red-500/30">critical {h.findingCounts.critical}</Badge>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-2">last run: {h.lastRun.toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card/60 backdrop-blur glow-electric">
            <CardHeader>
              <CardTitle>Agent Outputs</CardTitle>
            </CardHeader>
            <CardContent>
              {!agentOutputs ? (
                <div className="text-muted-foreground text-sm">Run the orchestrator to view agent findings and recommendations.</div>
              ) : (
                <Tabs defaultValue={agentOutputs[0]?.agent}>
                  <TabsList className="flex flex-wrap">
                    {agentOutputs.map((a) => (
                      <TabsTrigger key={a.agent} value={a.agent} className="capitalize">{a.agent.replace("-", " ")}</TabsTrigger>
                    ))}
                  </TabsList>
                  {agentOutputs.map((a) => (
                    <TabsContent key={a.agent} value={a.agent} className="space-y-4">
                      <div className="space-y-2">
                        {a.findings.length === 0 && (
                          <div className="text-sm text-muted-foreground">No findings.</div>
                        )}
                        {a.findings.map((f, i) => (
                          <div key={i} className={`px-3 py-2 rounded ${severityColor[f.severity]}`}>
                            <div className="font-medium">{f.title}</div>
                            <div className="text-sm opacity-90">{f.message}</div>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Recommendations</div>
                        <div className="space-y-2">
                          {a.recommendations.length === 0 && (
                            <div className="text-sm text-muted-foreground">No recommendations.</div>
                          )}
                          {a.recommendations.map((r, i) => (
                            <div key={i} className="text-sm">
                              <Badge variant="outline" className="mr-2 capitalize">{r.action}</Badge>
                              <span className="font-mono">{r.trainsetId ?? "-"}</span>
                              <span className="ml-2 text-muted-foreground">w={r.weight}</span>
                              <span className="ml-2">{r.rationale}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-card/60 backdrop-blur glow-electric">
            <CardHeader>
              <CardTitle>Induction Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {!plan ? (
                <div className="text-muted-foreground text-sm">Run the orchestrator to generate a plan.</div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Generated at {plan.generatedAt.toLocaleString()}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-muted-foreground">
                        <tr className="border-b border-border/30">
                          <th className="text-left py-2">Trainset</th>
                          <th className="text-left py-2">Role</th>
                          <th className="text-right py-2">Score</th>
                          <th className="text-left py-2">Reasons</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.assignments.map((a) => (
                          <tr key={a.trainsetId} className="border-b border-border/20">
                            <td className="py-2 font-medium">{a.trainsetId}</td>
                            <td className="py-2 capitalize">{a.role}</td>
                            <td className="py-2 text-right tabular-nums">{a.score}</td>
                            <td className="py-2 text-left">
                              <ul className="list-disc list-inside text-muted-foreground">
                                {a.reasons.map((r, i) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Objective Notes</div>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {plan.objectiveNotes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
