"use client";

import { Button } from "@/components/ui/button";
import type { TextPageTemplate } from "@/lib/text-pages/types";
import { toast } from "sonner";

interface TemplateOutputProps {
  readonly template: TextPageTemplate | null;
}

function formatTemplate(t: TextPageTemplate): string {
  return `{
  templateId: "${t.templateId}",
  imageKey: "${t.imageKey}",
  textBox: { xPct: ${t.textBox.xPct}, yPct: ${t.textBox.yPct}, wPct: ${t.textBox.wPct}, hPct: ${t.textBox.hPct} },
  align: "${t.align}",
  valign: "${t.valign}",
  font: {
    family: "${t.font.family}",
    minSize: ${t.font.minSize},
    maxSize: ${t.font.maxSize},
    lineHeight: ${t.font.lineHeight},
    color: "${t.font.color}",
  },
  maxLines: ${t.maxLines},
}`;
}

export function TemplateOutput({ template }: TemplateOutputProps) {
  if (!template) {
    return (
      <div className="rounded border border-dashed p-4 text-center text-sm text-muted-foreground">
        Select an image and configure the text box to generate a template.
      </div>
    );
  }

  const code = formatTemplate(template);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Template copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Template Output</h3>
        <Button size="sm" variant="secondary" onClick={handleCopy}>
          Copy to Clipboard
        </Button>
      </div>
      <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">
        <code>{code}</code>
      </pre>
    </div>
  );
}
