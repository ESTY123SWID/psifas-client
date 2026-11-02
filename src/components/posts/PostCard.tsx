import { useState } from "react";
import { Link } from "react-router";
import { ImageOff } from "lucide-react";

import type { PostCardProps } from "../../types/posts.types";
import type { ReactionType } from "../../types/reaction.types";
import { useToggleReactionMutation } from "../../services/reactionsApi";

import Avatar from "../ui/Avatar";
import { formatDate } from "../ui/format";
import ReactionBar from "../reactions/ReactionBar";
import PostManagementActions from "./PostManagementActions";

function PostCard({ classId, currentUserId, canManageClassPosts, post }: PostCardProps) {
    const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
    const [toggleReaction, { isLoading: isUpdating, isError: isReactionError }] = useToggleReactionMutation();

    const handleReactionClick = async (reaction: ReactionType) => {
        if (isUpdating) return;
        try {
            await toggleReaction({ classId, postId: post.id, reaction }).unwrap();
        } catch {
            // השגיאה מוצגת למשתמשת בתחתית הכרטיס.
        }
    };

    const title = post.title?.trim() || "פרסום ללא כותרת";
    const authorName = post.authorName?.trim() || "משתמשת שנמחקה";
    const content = post.content?.trim() || "";
    const imageUrl = post.imageUrl?.trim() || "";
    const date = formatDate(post.createdAt);
    const imageHasError = imageUrl !== "" && failedImageUrl === imageUrl;
    const hasReactionData = post.reactions !== null && post.reactions !== undefined && post.myReaction !== undefined;

    return (
        <article className="card group flex flex-col transition duration-300 hover:border-line-strong hover:shadow-lift">
            {post.type === "image" && (
                imageUrl === "" || imageHasError ? (
                    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-sand-l text-ink-soft" role="img" aria-label="התמונה אינה זמינה">
                        <ImageOff size={28} strokeWidth={1.4} aria-hidden="true" />
                        <span className="text-sm">התמונה אינה זמינה כרגע.</span>
                    </div>
                ) : (
                    <div className="overflow-hidden bg-sand-l">
                        <img
                            src={imageUrl}
                            alt={content || title}
                            loading="lazy"
                            onError={() => setFailedImageUrl(imageUrl)}
                            className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        />
                    </div>
                )
            )}

            <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold tracking-[0.18em] text-ink-soft">{post.type === "quote" ? "משפט" : "תמונה"}</p>
                    <PostManagementActions classId={classId} currentUserId={currentUserId} canManageClassPosts={canManageClassPosts} post={post} />
                </div>

                <h2 className="mt-1 font-display text-[1.4rem] leading-snug font-normal">
                    <Link to={`/class/${classId}/posts/${post.id}`} className="transition hover:text-blue">{title}</Link>
                </h2>

                {post.type === "quote" ? (
                    content ? (
                        <blockquote className="mt-4 border-s-2 border-sand ps-4 font-display text-lg leading-[1.6] font-light text-ink-2">
                            {content}
                        </blockquote>
                    ) : (
                        <p className="mt-4 text-sm text-ink-soft">תוכן הפרסום אינו זמין כרגע.</p>
                    )
                ) : (
                    content && <p className="mt-3 font-light text-ink-2">{content}</p>
                )}

                <div className="mt-6 flex items-center gap-3">
                    <Avatar name={authorName} size="sm" />
                    <div className="min-w-0 text-sm leading-5">
                        <p className="truncate font-semibold">{authorName}</p>
                        {date ? (
                            <time className="text-ink-soft" dateTime={post.createdAt ?? undefined}>{date}</time>
                        ) : (
                            <p className="text-ink-soft">תאריך לא זמין</p>
                        )}
                    </div>
                </div>

                <div className="pt-5">
                    <div className="border-t border-line pt-5">
                        {hasReactionData ? (
                            <ReactionBar counts={post.reactions} myReaction={post.myReaction} isUpdating={isUpdating} onReactionClick={handleReactionClick} />
                        ) : (
                            <p className="text-sm text-ink-soft">התגובות אינן זמינות כרגע.</p>
                        )}
                        {isReactionError && <p className="mt-2 text-sm text-coral" role="alert">לא הצלחנו לעדכן את התגובה. נסי שוב.</p>}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default PostCard;
