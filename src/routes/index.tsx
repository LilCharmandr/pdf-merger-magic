import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Download, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { DropZone } from "@/components/pdf-combiner/DropZone";
import { FileList } from "@/components/pdf-combiner/FileList";
import type { CombinerItem } from "@/components/pdf-combiner/FileRow";
import { combineFiles, detectKind } from "@/lib/combine-pdf";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PDF Combiner — Merge PDFs and Images Privately in Your Browser" },
      {
        name: "description",
        content:
          "Bulk upload PDFs and images, drag to reorder, and download a single combined PDF. Runs entirely in your browser — files are never uploaded and are erased when you close the tab.",
      },
      { property: "og:title", content: "PDF Combiner — Merge PDFs and Images Privately" },
      {
        property: "og:description",
        content:
          "Combine PDFs and images into one PDF. Fully client-side, no uploads, purged on exit.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [items, setItems] = useState<CombinerItem[]>([]);
  const [busy, setBusy] = useState(false);
  const itemsRef = useRef<CombinerItem[]>([]);
  itemsRef.current = items;

  const purge = useCallback(() => {
    for (const it of itemsRef.current) {
      if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
    }
    itemsRef.current = [];
  }, []);

  // Purge on tab close / navigation / unmount
  useEffect(() => {
    const onExit = () => purge();
    window.addEventListener("pagehide", onExit);
    window.addEventListener("beforeunload", onExit);
    return () => {
      window.removeEventListener("pagehide", onExit);
      window.removeEventListener("beforeunload", onExit);
      purge();
      setItems([]);
    };
  }, [purge]);

  function addFiles(files: File[]) {
    const accepted: CombinerItem[] = [];
    let rejected = 0;
    for (const file of files) {
      const kind = detectKind(file);
      if (!kind) {
        rejected++;
        continue;
      }
      accepted.push({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        kind,
        previewUrl: kind === "image" ? URL.createObjectURL(file) : undefined,
      });
    }
    if (rejected > 0) {
      toast.error(`${rejected} file${rejected > 1 ? "s" : ""} skipped — only PDF, PNG, JPG, WebP.`);
    }
    if (accepted.length) setItems((prev) => [...prev, ...accepted]);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  function clearAll() {
    for (const it of items) if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
    setItems([]);
  }

  async function handleCombine() {
    if (items.length === 0) return;
    setBusy(true);
    try {
      const bytes = await combineFiles(items.map((i) => i.file));
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "combined.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Combined PDF downloaded.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to combine files.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            PDF Combiner
          </h1>
          <p className="mt-2 text-muted-foreground">
            Merge PDFs and images into a single PDF. Drag to set the order.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Runs in your browser · files are erased when you close this tab
          </div>
        </header>

        <DropZone onFiles={addFiles} />

        {items.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {items.length} file{items.length > 1 ? "s" : ""} · drag to reorder
              </p>
              <Button variant="ghost" size="sm" onClick={clearAll} disabled={busy}>
                <Trash2 className="mr-1.5 h-4 w-4" />
                Clear all
              </Button>
            </div>
            <FileList items={items} onReorder={setItems} onRemove={removeItem} />

            <div className="mt-6 flex justify-end">
              <Button size="lg" onClick={handleCombine} disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Combining…
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Combine & Download
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
