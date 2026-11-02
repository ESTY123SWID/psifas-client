import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";

import type { InviteCodePanelProps } from "../../types/class.types";
import { useGetClassInviteCodeQuery, useRegenerateClassInviteCodeMutation } from "../../services/classesApi";
import { ErrorState, Skeleton } from "../ui/States";

function InviteCodePanel({ classId }: InviteCodePanelProps) {
    const [copyMessage, setCopyMessage] = useState("");
    const { data, isLoading, isFetching, isError, refetch } = useGetClassInviteCodeQuery(classId);
    const [regenerate, { isLoading: isRegenerating, isError: isRegenerateError }] = useRegenerateClassInviteCodeMutation();
    const inviteCode = data?.inviteCode?.trim() ?? "";

    const handleCopy = async () => {
        if (!inviteCode) return;
        try {
            await navigator.clipboard.writeText(inviteCode);
            setCopyMessage("קוד ההצטרפות הועתק.");
        } catch {
            setCopyMessage("לא ניתן להעתיק כרגע. אפשר להעתיק את הקוד ידנית.");
        }
    };

    const handleRegenerate = async () => {
        if (isRegenerating) return;
        setCopyMessage("");
        try {
            await regenerate({ classId }).unwrap();
        } catch {
            // הודעת השגיאה מוצגת באזור הקוד.
        }
    };

    return (
        <section className="card card-accent card-pad" aria-labelledby={`invite-${classId}`}>
            <h2 id={`invite-${classId}`} className="section-label mb-5">קוד הצטרפות</h2>

            {isLoading || isFetching ? (
                <Skeleton lines={2} />
            ) : isError ? (
                <ErrorState message="לא הצלחנו לטעון את קוד ההצטרפות." onRetry={() => refetch()} />
            ) : inviteCode ? (
                <div className="flex items-stretch gap-2">
                    <output
                        aria-label="קוד ההצטרפות"
                        dir="ltr"
                        className="flex flex-1 items-center justify-center border border-line bg-sand-l px-4 py-3 font-mono text-2xl font-semibold tracking-[0.3em] text-blue"
                    >
                        {inviteCode}
                    </output>
                    <button type="button" onClick={handleCopy} className="btn btn-secondary h-auto px-4" aria-label="העתקת קוד" title="העתקת קוד">
                        <Copy size={18} aria-hidden="true" />
                    </button>
                </div>
            ) : (
                <p className="font-light text-ink-soft">קוד ההצטרפות אינו זמין כרגע.</p>
            )}
            {copyMessage && <p className="mt-2 text-sm text-teal" role="status">{copyMessage}</p>}

            <p className="mt-5 text-sm font-light text-ink-2">שולחות את הקוד לחברות הכיתה. קוד חדש מבטל את הקודם.</p>
            <button type="button" onClick={handleRegenerate} disabled={isRegenerating} className="btn btn-ghost btn-sm mt-3 -ms-3">
                <RefreshCw size={15} className={isRegenerating ? "animate-spin" : ""} aria-hidden="true" />
                {isRegenerating ? "יוצרת קוד חדש..." : "יצירת קוד חדש"}
            </button>
            {isRegenerateError && <p className="alert-error mt-3" role="alert">לא הצלחנו ליצור קוד חדש. נסי שוב.</p>}
        </section>
    );
}

export default InviteCodePanel;
