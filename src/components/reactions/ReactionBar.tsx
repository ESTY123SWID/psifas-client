import type { ReactionBarProps, ReactionType } from "../../types/reaction.types";

const reactions: { type: ReactionType; emoji: string; label: string }[] = [
    { type: "like", emoji: "👍", label: "אהבתי" },
    { type: "love", emoji: "❤️", label: "לב" },
    { type: "laugh", emoji: "😂", label: "צחוק" },
    { type: "adore", emoji: "😍", label: "מתה על זה" },
    { type: "touched", emoji: "🥹", label: "מרגש" },
    { type: "wow", emoji: "😮", label: "וואו" },
    { type: "applause", emoji: "👏", label: "מחיאות כפיים" },
    { type: "fire", emoji: "🔥", label: "אש" },
];

function ReactionBar({ counts, myReaction, isUpdating, onReactionClick }: ReactionBarProps) {
    const selectedReaction = myReaction ?? null;

    const handleReactionClick = (reaction: ReactionType) => {
        if (isUpdating) return;
        // תגובה אחת לכל משתמשת: לחיצה על התגובה שלך מסירה אותה.
        if (selectedReaction !== null && selectedReaction !== reaction) return;
        onReactionClick(reaction);
    };

    return (
        <div className="flex flex-wrap gap-1.5" aria-label="תגובות לפרסום" role="group">
            {reactions.map(({ type, emoji, label }) => {
                const count = counts?.[type];
                const hasCount = typeof count === "number" && Number.isSafeInteger(count) && count >= 0;
                const isSelected = selectedReaction === type;
                const isBlocked = selectedReaction !== null && !isSelected;

                return (
                    <button
                        key={type}
                        type="button"
                        title={isBlocked ? "אפשר לבחור תגובה אחת. הסירי קודם את התגובה שלך." : label}
                        onClick={() => handleReactionClick(type)}
                        disabled={isUpdating || isBlocked}
                        aria-pressed={isSelected}
                        aria-label={hasCount ? `${label} ${emoji} - ${count} תגובות` : `${label} ${emoji} - מספר התגובות אינו זמין`}
                        className={`inline-flex h-8 items-center gap-1 border px-2.5 text-sm transition disabled:cursor-not-allowed ${
                            isSelected
                                ? "border-blue bg-mist font-semibold text-blue"
                                : "border-line bg-surface text-ink-2 hover:border-ink disabled:opacity-40 disabled:hover:border-line"
                        }`}
                    >
                        <span className="text-[15px] leading-none">{emoji}</span>
                        {hasCount ? count > 0 && <span className="text-xs tabular-nums">{count}</span> : <span className="text-xs">?</span>}
                    </button>
                );
            })}
        </div>
    );
}

export default ReactionBar;
