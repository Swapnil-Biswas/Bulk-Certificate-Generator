import { Award } from "lucide-react";

export function Logo({ className, iconClassName }: { className?: string, iconClassName?: string }) {
  return (
    <div className={className}>
      <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 ring-1 ring-white/10 ${iconClassName || "h-10 w-10"}`}>
        <Award className="h-[60%] w-[60%] text-white" strokeWidth={2.5} />
      </div>
    </div>
  );
}
