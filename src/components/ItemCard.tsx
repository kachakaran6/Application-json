"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Edit2,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Smartphone,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { AppItem, WebsiteItem } from "@/lib/schemas";
import { StatusBadge } from "./StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: AppItem | WebsiteItem;
  type: "app" | "website";
  index: number;
  total: number;
  isAuthed: boolean;
  onEdit: (item: AppItem | WebsiteItem, type: "app" | "website") => void;
  onDuplicate: (item: AppItem | WebsiteItem, type: "app" | "website") => void;
  onDelete: (item: AppItem | WebsiteItem, type: "app" | "website") => void;
  onMoveUp: (index: number, type: "app" | "website") => void;
  onMoveDown: (index: number, type: "app" | "website") => void;
}

export function ItemCard({
  item,
  type,
  index,
  total,
  isAuthed,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ItemCardProps) {
  const [expandedDesc, setExpandedDesc] = useState(false);
  const isApp = type === "app";
  const app = isApp ? (item as AppItem) : null;
  const web = !isApp ? (item as WebsiteItem) : null;

  const title = isApp ? app!.appName : web!.name;
  const subtitle = isApp ? app!.packageName : web!.slug;
  const url = isApp ? app!.playStoreUrl : web!.url;

  const hasDistinctDescription =
    Boolean(item.description) &&
    item.description.trim().toLowerCase() !== item.tagline?.trim().toLowerCase();

  return (
    <Card className="group relative border-border bg-card hover:border-emerald-500/40 transition-colors shadow-xs flex flex-col justify-between overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Top Header: Icon + Titles + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* App / Website Icon */}
            <div className="relative w-10 h-10 rounded-md bg-muted border border-border p-1.5 shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.iconUrl || "/images/samyukt.png"}
                alt={title}
                className="w-full h-full object-contain rounded-xs"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/samyukt.png";
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-card border border-border flex items-center justify-center">
                {isApp ? (
                  <Smartphone className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Globe className="w-2.5 h-2.5 text-blue-500 dark:text-blue-400" />
                )}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-semibold text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {title}
                </h3>
                {item.featured && (
                  <span title="Featured showcase item" className="text-amber-500 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-500/20" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <StatusBadge status={item.status} />
        </div>

        {/* Category & Year */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <Badge variant="secondary" className="font-normal text-[10px] text-muted-foreground bg-muted border-border">
            {item.category}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono">{item.year}</span>
        </div>

        {/* Tagline */}
        {item.tagline && (
          <p className="text-xs text-foreground/90 font-medium line-clamp-2 leading-relaxed">
            {item.tagline}
          </p>
        )}

        {/* Full Description with Expand/Collapse */}
        {item.description && (
          <div className="space-y-1">
            <p
              className={cn(
                "text-xs text-muted-foreground leading-relaxed",
                !expandedDesc && "line-clamp-2"
              )}
            >
              {item.description}
            </p>
            {hasDistinctDescription && item.description.length > 90 && (
              <button
                onClick={() => setExpandedDesc(!expandedDesc)}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                {expandedDesc ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Highlights */}
        {item.highlights && item.highlights.length > 0 && (
          <div className="pt-2 border-t border-border/60 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
              Highlights
            </span>
            <ul className="space-y-1">
              {item.highlights.slice(0, 2).map((h, i) => (
                <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tech Stack Chips */}
        {item.stack && item.stack.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {item.stack.map((st) => (
              <span
                key={st}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground border border-border"
              >
                {st}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      {/* Card Footer Actions */}
      <div className="px-4 py-2.5 bg-muted/30 border-t border-border flex items-center justify-between text-xs">
        {/* Reorder arrows */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="iconSm"
            disabled={index === 0 || !isAuthed}
            onClick={() => onMoveUp(index, type)}
            title="Move item up"
            className="h-6 w-6"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            disabled={index === total - 1 || !isAuthed}
            onClick={() => onMoveDown(index, type)}
            title="Move item down"
            className="h-6 w-6"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-1">
          {url && (
            <Button
              variant="ghost"
              size="iconSm"
              asChild
              title={isApp ? "Open in Google Play Store" : "Open Website"}
              className="h-7 w-7"
            >
              <a href={url} target="_blank" rel="noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          )}

          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => onDuplicate(item, type)}
            title="Duplicate item"
            className="h-7 w-7"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => onEdit(item, type)}
            title="Edit item"
            className="h-7 w-7"
          >
            <Edit2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </Button>

          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => onDelete(item, type)}
            title="Delete item"
            className="h-7 w-7 hover:text-rose-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
