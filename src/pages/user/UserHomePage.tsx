import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router";
import { ImageIcon, Quote } from "lucide-react";

import type { RootState } from "../../app/store";
import type { CreatePostType } from "../../types/createPost.types";
import { useGetMyClassesQuery } from "../../services/classesApi";
import { useGetPostsQuery } from "../../services/postsApi";

import FeaturedItem from "../../components/featured/FeaturedItem";
import RecentPosts from "../../components/posts/RecentPosts";
import ClassMembersPreview from "../../components/members/ClassMembersPreview";
import CreatePostModal from "../../components/posts/CreatePostModal";
import { ErrorState, FullPageLoading } from "../../components/ui/States";

function getGreeting(hour: number): string {
    if (hour >= 5 && hour < 12) return "בוקר טוב";
    if (hour >= 12 && hour < 17) return "צהריים טובים";
    if (hour >= 17 && hour < 21) return "ערב טוב";
    return "לילה טוב";
}

/** שורת סיכום חמה וקצרה: כמה זיכרונות כבר יש בארכיון. */
function summaryLine(total: number | undefined): string {
    if (total === undefined) return "רגע, אוספות את מה שחדש בכיתה…";
    if (total === 0) return "הארכיון עוד ריק — אולי את תוסיפי את הזיכרון הראשון?";
    if (total === 1) return "בארכיון כבר יש זיכרון אחד. מה תוסיפי היום?";
    return `בארכיון כבר ${total.toLocaleString("he-IL")} זיכרונות. מה תוסיפי היום?`;
}

function HomePage() {
    const [createType, setCreateType] = useState<CreatePostType | null>(null);
    const user = useSelector((state: RootState) => state.auth.user);
    const selectedClassId = useSelector((state: RootState) => state.class.selectedClassId);
    const { data: classes, isLoading, isError, refetch } = useGetMyClassesQuery();

    const skip = selectedClassId === null;
    const classId = selectedClassId ?? 0;
    const { currentData: allPosts } = useGetPostsQuery({ classId, sort: "newest", page: 1, pageSize: 1 }, { skip });
    const { currentData: imagePosts } = useGetPostsQuery({ classId, type: "image", sort: "newest", page: 1, pageSize: 4 }, { skip });

    if (isLoading) return <FullPageLoading label="טוענת את דף הבית..." />;

    if (isError) {
        return (
            <main className="page">
                <ErrorState message="לא הצלחנו לטעון את פרטי הכיתה." onRetry={() => refetch()} />
            </main>
        );
    }

    if (!classes?.length) return <Navigate to="/my-classes" replace />;

    const selectedClass = classes.find((classItem) => classItem.id === selectedClassId);
    if (selectedClassId === null || !selectedClass) return <FullPageLoading label="מעדכנת את הכיתה הפעילה..." />;

    const firstName = user?.name?.trim().split(/\s+/)[0] || "";
    const images = (imagePosts?.items ?? []).filter((post) => post.imageUrl);

    return (
        <main className="page">
            <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
                <div className="min-w-0">
                    <p className="mb-3.5 text-[13px] font-semibold tracking-[0.14em] text-blue">{selectedClass.name}</p>
                    <h1 className="page-title">
                        {getGreeting(new Date().getHours())}{firstName ? `, ${firstName}` : ""}
                    </h1>
                    <p className="page-sub mt-2 mb-12">{summaryLine(allPosts?.total)}</p>

                    <FeaturedItem classId={selectedClassId} />

                    <div className="mt-7 grid gap-7 md:grid-cols-2">
                        <RecentPosts classId={selectedClassId} />

                        <section className="card card-pad" aria-labelledby="share-title">
                            <h2 id="share-title" className="section-label mb-6">שתפי רגע מהכיתה</h2>
                            <p className="mb-6 font-light text-ink-2">
                                משפט שנאמר בשיעור או תמונה מהטיול — כל רגע קטן הופך לחלק מהסיפור המשותף.
                            </p>
                            <div className="space-y-3">
                                {([
                                    { type: "quote", icon: Quote, label: "משפט חדש", hint: "ציטוט, בדיחה או רגע מילולי" },
                                    { type: "image", icon: ImageIcon, label: "תמונה חדשה", hint: "צילום עם כמה מילים" },
                                ] as const).map(({ type, icon: Icon, label, hint }) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setCreateType(type)}
                                        className="group flex w-full items-center gap-4 border border-line bg-paper px-4 py-3.5 text-right transition hover:border-ink"
                                    >
                                        <Icon size={20} strokeWidth={1.6} className="shrink-0 text-blue" aria-hidden="true" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block font-semibold">{label}</span>
                                            <span className="block text-sm text-ink-soft">{hint}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    {images.length > 0 && (
                        <section className="card card-pad mt-7" aria-labelledby="recent-images-title">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <h2 id="recent-images-title" className="section-label">תמונות אחרונות</h2>
                                <Link to="/gallery" className="text-sm text-ink-2 underline underline-offset-4 hover:text-blue">לגלריה</Link>
                            </div>
                            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {images.map((post) => (
                                    <li key={post.id}>
                                        <Link to={`/class/${selectedClassId}/posts/${post.id}`} className="group block">
                                            <span className="block overflow-hidden bg-sand-l">
                                                <img
                                                    src={post.imageUrl ?? ""}
                                                    alt={post.content?.trim() || post.title || "תמונה מהכיתה"}
                                                    loading="lazy"
                                                    className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                                                />
                                            </span>
                                            <span className="mt-2 block truncate text-sm font-semibold transition group-hover:text-blue">{post.title}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <ClassMembersPreview classId={selectedClassId} className={selectedClass.name} />
            </div>

            {createType && (
                <CreatePostModal
                    key={`${selectedClassId}:${createType}`}
                    classId={selectedClassId}
                    initialType={createType}
                    onClose={() => setCreateType(null)}
                />
            )}
        </main>
    );
}

export default HomePage;
