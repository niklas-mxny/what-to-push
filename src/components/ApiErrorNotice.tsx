import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export function ApiErrorNotice({ message, hint }: { message: string; hint?: string }) {
  return (
    <Card className="border-danger/30 bg-danger/5">
      <CardContent className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        <div>
          <p className="text-sm font-medium text-foreground">{message}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
