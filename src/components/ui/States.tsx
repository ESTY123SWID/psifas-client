import type { ReactNode } from "react";
import { CloudOff, RotateCw } from "lucide-react";

/** טבעת טעינה עדינה עם הודעה נגישה. */
export function LoadingState({ label, compact = false }: { label: string; compact?: boolean }) {
    return (
        <div className={`flex flex-col items-center justify-center gap-4 px-5 text-ink-soft ${compact ? "py-8" : "py-20"}`} role="status" aria-live="polite">
            <span aria-hidden="true" className="h-7 w-7 animate-spin rounded-full border-[1.5px] border-line border-t-blue" />
            <span className="text-sm tracking-[0.08em]">{label}</span>
        </div>
    );
}

export function FullPageLoading({ label }: { label: string }) {
    return (
        <main className="flex min-h-[60svh] items-center justify-center px-4">
            <LoadingState label={label} />
        </main>
    );
}

/** שורות שלד רכות בזמן שכרטיס נטען. */
export function Skeleton({ lines = 3 }: { lines?: number }) {
    return (
        <div className="flex flex-col gap-3.5 py-1.5" aria-hidden="true">
            {Array.from({ length: lines }, (_, index) => (
                <span key={index} className="h-3 animate-shimmer rounded-full bg-sand-l" style={{ width: `${92 - index * 14}%` }} />
            ))}
        </div>
    );
}

export function ErrorState({ message, onRetry, children }: { message: string; onRetry?: () => void; children?: ReactNode }) {
    return (
        <div className="flex flex-col items-center px-5 py-10 text-center" role="alert">
            <CloudOff size={34} strokeWidth={1.3} className="text-coral" aria-hidden="true" />
            <p className="mt-4 max-w-md text-[17px] font-light text-ink-2">{message}</p>
            {(onRetry || children) && (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {onRetry && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
                            <RotateCw size={15} aria-hidden="true" />
                            לנסות שוב
                        </button>
                    )}
                    {children}
                </div>
            )}
        </div>
    );
}

export function EmptyState({ icon, title, text, action, compact = false }: { icon: ReactNode; title: string; text?: string; action?: ReactNode; compact?: boolean }) {
    return (
        <div className={`flex flex-col items-center text-center ${compact ? "px-5 py-10" : "px-8 py-20"}`}>
            <span className="text-blue opacity-90" aria-hidden="true">{icon}</span>
            <h2 className={`mt-5 font-display font-normal text-ink ${compact ? "text-2xl" : "text-[2rem]"}`}>{title}</h2>
            {text && <p className="mt-2 max-w-md text-[17px] font-light text-ink-soft">{text}</p>}
            {action && <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>}
        </div>
    );
}
