"use client";

import React from "react";
import { ExternalLink, Edit2, Copy, Trash2, Smartphone, Globe, Sparkles } from "lucide-react";
import { AppItem, WebsiteItem } from "@/lib/schemas";
import { StatusBadge } from "./StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TableViewProps {
  items: Array<{ item: AppItem | WebsiteItem; type: "app" | "website" }>;
  onEdit: (item: AppItem | WebsiteItem, type: "app" | "website") => void;
  onDuplicate: (item: AppItem | WebsiteItem, type: "app" | "website") => void;
  onDelete: (item: AppItem | WebsiteItem, type: "app" | "website") => void;
}

export function TableView({ items, onEdit, onDuplicate, onDelete }: TableViewProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs transition-colors">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[280px]">Product & Identifier</TableHead>
            <TableHead className="w-[110px]">Type</TableHead>
            <TableHead className="w-[130px]">Status</TableHead>
            <TableHead className="w-[180px]">Category</TableHead>
            <TableHead className="min-w-[220px]">Description & Pitch</TableHead>
            <TableHead>Tech Stack</TableHead>
            <TableHead className="w-[70px]">Year</TableHead>
            <TableHead className="w-[130px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(({ item, type }) => {
            const isApp = type === "app";
            const title = isApp ? (item as AppItem).appName : (item as WebsiteItem).name;
            const subtitle = isApp ? (item as AppItem).packageName : (item as WebsiteItem).slug;
            const url = isApp ? (item as AppItem).playStoreUrl : (item as WebsiteItem).url;
            const desc = item.description || item.tagline || "";

            return (
              <TableRow key={item.id} className="hover:bg-muted/40 transition-colors border-border">
                {/* Product Name & Icon */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-muted border border-border p-1 shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.iconUrl || "/images/samyukt.png"}
                        alt={title}
                        className="w-full h-full object-contain rounded-xs"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/samyukt.png";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                        <span className="truncate">{title}</span>
                        {item.featured && <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[180px]">
                        {subtitle}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Type */}
                <TableCell>
                  <Badge variant="secondary" className="gap-1 font-normal text-[10px] bg-muted text-muted-foreground border-border">
                    {isApp ? (
                      <Smartphone className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Globe className="w-2.5 h-2.5 text-blue-500 dark:text-blue-400" />
                    )}
                    {isApp ? "Mobile App" : "Web Platform"}
                  </Badge>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>

                {/* Category */}
                <TableCell className="text-muted-foreground text-xs truncate max-w-[160px]">
                  {item.category}
                </TableCell>

                {/* Description Column */}
                <TableCell>
                  <p className="text-xs text-muted-foreground line-clamp-2 max-w-[260px] leading-relaxed">
                    {desc}
                  </p>
                </TableCell>

                {/* Stack */}
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {item.stack?.slice(0, 3).map((st) => (
                      <span
                        key={st}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-muted border border-border text-muted-foreground font-mono"
                      >
                        {st}
                      </span>
                    ))}
                    {(item.stack?.length || 0) > 3 && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        +{(item.stack?.length || 0) - 3}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Year */}
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {item.year}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
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
                      variant="ghost"
                      size="iconSm"
                      onClick={() => onEdit(item, type)}
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => onDelete(item, type)}
                      title="Delete"
                      className="hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
