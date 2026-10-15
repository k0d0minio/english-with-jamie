"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { addBlock, deleteBlock, moveBlock, updateBlock } from "@/actions/blocks";
import { BlockForm } from "@/components/block-form";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import type { Block } from "@/lib/db/schema";

export function BlockEditor({ lessonId, blocks }: { lessonId: number; blocks: Block[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [adding, setAdding] = useState<"slide" | "exercise">("slide");

  return (
    <div className="space-y-4">
      {blocks.map((b, i) => (
        <Card key={b.id} className="p-0">
          <div className="flex items-center gap-2 px-4 py-3">
            <button type="button" onClick={() => setOpen(open === b.id ? null : b.id)} className="flex flex-1 items-center gap-2 text-left">
              {open === b.id ? <ChevronDown className="h-4 w-4 text-muted" /> : <ChevronRight className="h-4 w-4 text-muted" />}
              <span className="w-6 text-sm text-muted">{i + 1}</span>
              <Badge tone={b.kind === "slide" ? "neutral" : "accent"}>{b.kind}</Badge>
              <span className="font-medium">{b.data.title}</span>
              {b.data.kind === "exercise" ? <span className="text-xs text-muted">{b.data.items.length} items</span> : null}
            </button>
            <Button variant="ghost" size="icon" type="button" aria-label="Move up" disabled={i === 0} onClick={() => moveBlock(b.id, "up")}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" type="button" aria-label="Move down" disabled={i === blocks.length - 1} onClick={() => moveBlock(b.id, "down")}>
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              variant="danger"
              size="icon"
              type="button"
              aria-label="Delete"
              onClick={() => {
                if (confirm(`Delete "${b.data.title}"?`)) deleteBlock(b.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {open === b.id ? (
            <div className="border-t border-line px-4 py-4">
              <BlockForm action={updateBlock.bind(null, b.id)} block={b} />
            </div>
          ) : null}
        </Card>
      ))}

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Add</span>
          {(["slide", "exercise"] as const).map((k) => (
            <Button key={k} type="button" size="sm" variant={adding === k ? "default" : "outline"} onClick={() => setAdding(k)}>
              {k}
            </Button>
          ))}
        </div>
        <BlockForm key={adding} action={addBlock.bind(null, lessonId)} kind={adding} />
      </Card>
    </div>
  );
}
