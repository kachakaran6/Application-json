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
    <div className="rounded-lg border border-border bg-[#1C1C1C] overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-[#171717] hover:bg-[#171717]">
            <TableHead className="w-[300px]">Product & Identifier</TableHead>
            <TableHead className="w-[120px]">Type</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead className="w-[200px]">Category</TableHead>
            <TableHead>Tech Stack</TableHead>
            <TableHead className="w-[80px]">Year</TableHead>
            <TableHead className="w-[130px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(({ item, type }) => {
            const isApp = type === "app";
            const title = isApp ? (item as AppItem).appName : (item as WebsiteItem).name;
            const subtitle = isApp ? (item as AppItem).packageName : (item as WebsiteItem).slug;
            const url = isApp ? (item as AppItem).playStoreUrl : (item as WebsiteItem).url;

            return (
              <TableRow key={item.id} className="hover:bg-[#202020] transition-colors border-border">
                {/* Product Name & Icon */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#141414] border border-border p-1 shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.iconUrl || "/images/samyukt.png"}
                        alt={title}
                        className="w-full h-full object-contain rounded-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/samyukt.png";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                        <span className="truncate">{title}</span>
                        {item.featured && <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
                        {subtitle}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Type */}
                <TableCell>
                  <Badge variant="secondary" className="gap-1 font-normal text-[10px] bg-[#141414]">
                    {isApp ? (
                      <Smartphone className="w-2.5 h-2.5 text-brand" />
                    ) : (
                      <Globe className="w-2.5 h-2.5 text-blue-400" />
                    )}
                    {isApp ? "Mobile App" : "Web Platform"}
                  </Badge>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>

                {/* Category */}
                <TableCell className="text-muted-foreground text-xs truncate max-w-[180px]">
                  {item.category}
                </TableCell>

                {/* Stack */}
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[240px]">
                    {item.stack?.slice(0, 3).map((st) => (
                      <span
                        key={st}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-[#141414] border border-border text-muted-foreground font-mono"
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
                      <Edit2 className="w-3.5 h-3.5 text-brand" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => onDelete(item, type)}
                      title="Delete"
                      className="hover:text-rose-400"
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
