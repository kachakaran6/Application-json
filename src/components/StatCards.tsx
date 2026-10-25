"use client";

import React from "react";
import { Smartphone, Globe, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { RegistryData } from "@/lib/schemas";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardsProps {
  registry: RegistryData | null;
  onRefresh: () => void;
  refreshing: boolean;
}

export function StatCards({ registry, onRefresh, refreshing }: StatCardsProps) {
  if (!registry) return null;

  const totalApps = registry.apps.length;
  const totalWebsites = registry.websites.length;
  const allItems = [...registry.apps, ...registry.websites];
  const productionCount = allItems.filter(
    (i) => i.status === "production" || i.status === "published"
  ).length;
  const pipelineCount = allItems.filter(
    (i) => i.status === "coming_soon" || i.status === "in_progress" || i.status === "closed_testing"
  ).length;
  const featuredCount = allItems.filter((i) => i.featured).length;

  const stats = [
    {
      label: "Mobile Applications",
      value: totalApps,
      sub: "Android packages",
      icon: <Smartphone className="w-4 h-4 text-brand" />,
      highlight: "hover:border-brand/40",
    },
    {
      label: "Web Platforms",
      value: totalWebsites,
      sub: "Live web apps",
      icon: <Globe className="w-4 h-4 text-blue-400" />,
      highlight: "hover:border-blue-500/40",
    },
    {
      label: "Production Active",
      value: productionCount,
      sub: "Publicly launched",
      icon: <CheckCircle2 className="w-4 h-4 text-brand" />,
      highlight: "hover:border-brand/40",
    },
    {
      label: "Testing / Pipeline",
      value: pipelineCount,
      sub: "In progress / preview",
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      highlight: "hover:border-amber-500/40",
    },
    {
      label: "Featured Showcases",
      value: featuredCount,
      sub: "Homepage spotlights",
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      highlight: "hover:border-amber-500/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s, idx) => (
        <Card
          key={s.label}
          className={`border-border bg-[#1C1C1C] transition-colors ${s.highlight} ${
            idx === 4 ? "col-span-2 sm:col-span-1" : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">{s.label}</span>
              <div className="w-7 h-7 rounded bg-[#141414] border border-border flex items-center justify-center">
                {s.icon}
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {s.value}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">{s.sub}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
