import { Link } from "react-router";

import type { RecentPostsProps } from "../../types/recentPost.types";
import { useGetRecentPostsQuery } from "../../services/postsApi";

import { formatDate } from "../ui/format";
import { ErrorState, Skeleton } from "../ui/States";

/** רשימה קצרה של הפרסומים האחרונים בכיתה. */
function RecentPosts({ classId }: RecentPostsProps) {
    const { currentData: posts, isLoading, isFetching, isError, refetch } = useGetRecentPostsQuery(classId);

    return (
        <section aria-labelledby="recent-posts-title" className="card card-pad h-full">
            <div className="mb-6 flex items-center justify-between gap-4">
                <h2 id="recent-posts-title" className="section-label">פרסומים אחרונים</h2>
                <Link to={`/class/${classId}/posts`} className="text-sm text-ink-2 underline underline-offset-4 hover:text-blue">לכולם</Link>
            </div>

            {isLoading || (isFetching && !posts) ? (
                <Skeleton lines={4} />
            ) : isError ? (
                <ErrorState message="לא הצלחנו לטעון את הפרסומים." onRetry={() => refetch()} />
            ) : !posts?.length ? (
                <p className="font-light text-ink-soft">עדיין אין פרסומים בכיתה. אפשר להוסיף את הראשון.</p>
            ) : (
                <ul>
                    {posts.slice(0, 5).map((post, index) => {
                        const date = formatDate(post.createdAt, { day: "numeric", month: "short" });
                        return (
                            <li key={post.id}>
                                <Link
                                    to={`/class/${classId}/posts/${post.id}`}
                                    className={`group flex items-center gap-4 py-4 transition-[padding] duration-200 hover:ps-1.5 ${index === 0 ? "pt-0" : "border-t border-line"}`}
                                >
                                    <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${["bg-blue", "bg-sand", "bg-coral"][index % 3]}`} aria-hidden="true" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-semibold transition group-hover:text-blue">
                                            {post.title?.trim() || "פרסום ללא כותרת"}
                                        </span>
                                        <span className="block truncate text-[15px] text-ink-soft">{post.authorName?.trim() || "לא ידוע"}</span>
                                    </span>
                                    {date && <time className="shrink-0 text-[15px] text-ink-soft" dateTime={post.createdAt}>{date}</time>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

export default RecentPosts;
