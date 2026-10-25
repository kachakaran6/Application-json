"use client";

import React from "react";
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
  const isApp = type === "app";
  const app = isApp ? (item as AppItem) : null;
  const web = !isApp ? (item as WebsiteItem) : null;

  const title = isApp ? app!.appName : web!.name;
  const subtitle = isApp ? app!.packageName : web!.slug;
  const url = isApp ? app!.playStoreUrl : web!.url;

  return (
    <Card className="group relative flex flex-col justify-between border-border bg-[#1C1C1C] hover:border-[#383838] transition-colors rounded-lg overflow-hidden">
      <CardContent className="p-4 flex flex-col justify-between flex-1">
        {/* Top Header */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* App Icon */}
              <div className="relative w-11 h-11 rounded-md bg-[#141414] border border-border flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.iconUrl || "/images/samyukt.png"}
                  alt={title}
                  className="w-full h-full object-contain rounded"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/samyukt.png";
                  }}
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded bg-[#1C1C1C] border border-border flex items-center justify-center">
                  {isApp ? (
                    <Smartphone className="w-2.5 h-2.5 text-brand" />
                  ) : (
                    <Globe className="w-2.5 h-2.5 text-blue-400" />
                  )}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-semibold text-foreground truncate group-hover:text-brand transition-colors">
                    {title}
                  </h3>
                  {item.featured && (
                    <span title="Featured showcase item" className="text-amber-400 shrink-0">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-400/20" />
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
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
            <Badge variant="secondary" className="font-normal text-[10px] text-muted-foreground bg-[#141414]">
              {item.category}
            </Badge>
            <span className="text-[10px] text-muted-foreground font-mono">{item.year}</span>
          </div>

          {/* Tagline */}
          {item.tagline && (
            <p className="mt-2 text-xs text-foreground/90 font-medium line-clamp-1">
              {item.tagline}
            </p>
          )}

          {/* Description */}
          {item.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Highlights */}
          {item.highlights && item.highlights.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-border/60 space-y-1">
              {item.highlights.slice(0, 2).map((hl, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-brand shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{hl}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tech Stack Pills */}
          {item.stack && item.stack.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {item.stack.map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-[#141414] text-muted-foreground border border-border/80 font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
          {/* Reordering */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="iconSm"
              disabled={index === 0}
              onClick={() => onMoveUp(index, type)}
              title="Move Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="iconSm"
              disabled={index === total - 1}
              onClick={() => onMoveDown(index, type)}
              title="Move Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
            <span className="text-[10px] text-muted-foreground font-mono ml-1">#{index + 1}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {url && (
              <Button
                variant="ghost"
                size="iconSm"
                asChild
                title={isApp ? "Play Store" : "Visit Website"}
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
              title="Duplicate"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(item, type)}
              className="h-7 px-2.5 text-[11px] gap-1"
            >
              <Edit2 className="w-3 h-3 text-brand" />
              <span>Edit</span>
            </Button>

            <Button
              variant="destructive"
              size="iconSm"
              onClick={() => onDelete(item, type)}
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
