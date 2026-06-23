import { SeoAnalysisResult } from "@/lib/seo-utils";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  result: SeoAnalysisResult;
}

export function SeoAnalysisPanel({ result }: Props) {
  const { score, checks, stats } = result;
  const color = score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-medium">SEO Score</span>
          <span className={`text-2xl font-bold ${color}`}>{score}/100</span>
        </div>
        <Progress value={score} className="h-2" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">Words</div><div className="font-semibold">{stats.word_count}</div></div>
        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">H2/H3</div><div className="font-semibold">{stats.h2}/{stats.h3}</div></div>
        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">Readability</div><div className="font-semibold">{stats.readability}</div></div>
        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">Int. links</div><div className="font-semibold">{stats.internal_links}</div></div>
        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">Ext. links</div><div className="font-semibold">{stats.external_links}</div></div>
        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">Imgs (alt)</div><div className="font-semibold">{stats.images - stats.images_missing_alt}/{stats.images}</div></div>
      </div>

      <ul className="space-y-1.5 text-sm">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2">
            {c.pass ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
            <span className={c.pass ? "text-foreground" : "text-muted-foreground"}>
              {c.label}{c.value !== undefined && <span className="ml-1 text-xs text-muted-foreground">({c.value})</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
