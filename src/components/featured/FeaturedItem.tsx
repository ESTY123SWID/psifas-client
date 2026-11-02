import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ImageOff, Quote } from "lucide-react";

import type { FeaturedItemProps } from "../../types/featured.types";
import type { ReactionType } from "../../types/reaction.types";
import { useGetFeaturedItemQuery } from "../../services/featuredApi";
import { useToggleReactionMutation } from "../../services/reactionsApi";

import ReactionBar from "../reactions/ReactionBar";
import { EmptyState, ErrorState, Skeleton } from "../ui/States";

/** "הזיכרון של היום" — הכרטיס המרכזי של דף הבית. */
function FeaturedItem({ classId }: FeaturedItemProps) {
    const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
    const { currentData: item, isLoading, isFetching, isError, refetch } = useGetFeaturedItemQuery(classId);
    const [toggleReaction, { isLoading: isUpdating, isError: isReactionError }] = useToggleReactionMutation();

    const handleReactionClick = async (reaction: ReactionType) => {
        if (!item || isUpdating) return;
        try {
            await toggleReaction({ classId, postId: item.id, reaction }).unwrap();
        } catch {
            // השגיאה מוצגת למשתמשת למטה
        }
    };

    if (isLoading || (isFetching && !item)) {
        return <section className="card card-accent card-pad"><Skeleton lines={4} /></section>;
    }

    if (isError) {
        return <section className="card"><ErrorState message="לא הצלחנו לטעון את הזיכרון של היום." onRetry={() => refetch()} /></section>;
    }

    const hasContent = item ? (item.type === "quote" ? Boolean(item.text?.trim()) : Boolean(item.imageUrl?.trim())) : false;

    if (!item || !hasContent) {
        return (
            <section className="card card-accent">
                <EmptyState
                    compact
                    icon={<Quote size={40} strokeWidth={1.3} />}
                    title={item ? "התוכן הנבחר אינו זמין כרגע" : "הארכיון עוד ריק"}
                    text="כשיתווסף הזיכרון הראשון, הוא יחכה לכן כאן."
                    action={<Link to={`/class/${classId}/posts`} className="btn btn-brand btn-sm">לפרסומי הכיתה</Link>}
                />
            </section>
        );
    }

    const today = new Date();
    const imageUrl = item.imageUrl?.trim() ?? "";
    const imageError = item.type === "image" && failedImageUrl === imageUrl;
    const hasReactionData = item.reactions !== null && item.reactions !== undefined && item.myReaction !== undefined;

    return (
        <section className="card card-accent flex flex-wrap items-stretch" aria-labelledby="featured-title">
            <div className="flex w-full flex-col items-center justify-center gap-4 border-b border-line px-6 py-9 sm:w-auto sm:min-w-[220px] sm:border-e sm:border-b-0 sm:px-12">
                <span className="text-[13px] tracking-[0.14em] text-ink-soft">הזיכרון של היום</span>
                <span className="font-display text-[5.5rem] leading-none font-light text-ink">{today.getDate()}</span>
                <span className="text-[15px] font-semibold text-ink-2">
                    {today.toLocaleDateString("he-IL", { month: "long" })} · {today.toLocaleDateString("he-IL", { weekday: "long" })}
                </span>
                <span className="bg-mist px-3.5 py-0.5 text-[13px] font-semibold tracking-[0.08em] text-blue">
                    {item.type === "quote" ? "משפט" : "תמונה"}
                </span>
            </div>

            <div className="min-w-0 flex-[1_1_340px] p-6 sm:p-12">
                <h2 id="featured-title" className="sr-only">הזיכרון של היום</h2>
                {item.type === "quote" ? (
                    <blockquote className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.45] font-light text-ink">
                        <span className="text-sand">״</span>{item.text}<span className="text-sand">״</span>
                    </blockquote>
                ) : imageError ? (
                    <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 bg-sand-l text-ink-soft" role="alert">
                        <ImageOff size={28} strokeWidth={1.4} aria-hidden="true" />
                        <span className="text-sm">התמונה אינה זמינה כרגע.</span>
                    </div>
                ) : (
                    <figure>
                        <img
                            key={imageUrl}
                            src={imageUrl}
                            alt={item.text?.trim() || "התמונה הנבחרת של הכיתה"}
                            onError={() => setFailedImageUrl(imageUrl)}
                            className="aspect-[16/10] w-full object-cover"
                        />
                        {item.text?.trim() && <figcaption className="mt-3 text-[15px] font-light text-ink-2">{item.text}</figcaption>}
                    </figure>
                )}

                <div className="mt-7">
                    {hasReactionData ? (
                        <ReactionBar counts={item.reactions} myReaction={item.myReaction} isUpdating={isUpdating} onReactionClick={handleReactionClick} />
                    ) : (
                        <p className="text-sm text-ink-soft">התגובות אינן זמינות כרגע.</p>
                    )}
                    {isReactionError && <p className="mt-2 text-sm text-coral" role="alert">לא הצלחנו לעדכן את התגובה. נסי שוב.</p>}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link to={`/class/${classId}/posts/${item.id}`} className="btn">
                        לעמוד הפרסום
                        <ArrowLeft size={18} aria-hidden="true" />
                    </Link>
                    <Link to={`/class/${classId}/posts`} className="btn btn-secondary">לכל הפרסומים</Link>
                </div>
            </div>
        </section>
    );
}

export default FeaturedItem;
