import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { Camera, ImagePlus } from "lucide-react";

import type { RootState } from "../../app/store";
import { useGetMyClassesQuery } from "../../services/classesApi";
import { useGetPostsQuery } from "../../services/postsApi";

import CreatePostModal from "../../components/posts/CreatePostModal";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States";
import { formatDate } from "../../components/ui/format";

const PAGE_SIZE = 24;

/** גלריה: כל פרסומי התמונה של הכיתה הפעילה, בפריסת "פסיפס". */
function GalleryPage() {
	const selectedClassId = useSelector((state: RootState) => state.class.selectedClassId);
	const { data: classes } = useGetMyClassesQuery();
	const selectedClass = classes?.find((classItem) => classItem.id === selectedClassId);
	const [page, setPage] = useState(1);
	const [pageClassId, setPageClassId] = useState<number | null>(selectedClassId);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const activePage = pageClassId === selectedClassId ? page : 1;

	useEffect(() => {
		if (pageClassId === selectedClassId) return;
		setPageClassId(selectedClassId);
		setPage(1);
	}, [pageClassId, selectedClassId]);

	const { currentData, isLoading, isFetching, isError, refetch } = useGetPostsQuery(
		{ classId: selectedClassId ?? 0, type: "image", sort: "newest", page: activePage, pageSize: PAGE_SIZE },
		{ skip: selectedClassId === null }
	);
	const images = (currentData?.items ?? []).filter((post) => post.imageUrl);
	const totalPages = Number.isInteger(currentData?.totalPages) ? currentData?.totalPages ?? 0 : 0;

	useEffect(() => {
		if (currentData && activePage > Math.max(totalPages, 1)) setPage(Math.max(totalPages, 1));
	}, [activePage, currentData, totalPages]);

	if (selectedClassId === null) {
		return (
			<main className="page">
				<EmptyState
					icon={<Camera size={26} />}
					title="בחרי כיתה כדי לצפות בגלריה"
					action={<Link className="btn btn-primary" to="/my-classes">בחירת כיתה</Link>}
				/>
			</main>
		);
	}

	return (
		<main className="page">
			<PageHeader
				eyebrow="רגעים בתמונה"
				title="גלריה"
				description={
					selectedClass
						? `כל התמונות שפורסמו ב${selectedClass.name}${currentData ? ` · ${currentData.total.toLocaleString("he-IL")} תמונות` : ""}`
						: undefined
				}
				actions={
					<button type="button" className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
						<ImagePlus size={17} aria-hidden="true" />
						הוספת תמונה
					</button>
				}
			/>

			{isLoading || (isFetching && !currentData) ? (
				<LoadingState label="טוענת תמונות..." />
			) : isError ? (
				<ErrorState message="לא הצלחנו לטעון את הגלריה." onRetry={() => refetch()} />
			) : images.length === 0 ? (
				<EmptyState
					icon={<Camera size={26} />}
					title="הגלריה עדיין ריקה"
					text="תמונות שתפרסמו בכיתה יופיעו כאן, יחד עם הסיפור שלהן."
					action={
						<button type="button" className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
							<ImagePlus size={17} aria-hidden="true" />
							להעלאת התמונה הראשונה
						</button>
					}
				/>
			) : (
				<>
					{isFetching && <p className="sr-only" role="status">מעדכנת את הגלריה...</p>}
					<ul className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4" aria-label="תמונות הכיתה">
						{images.map((post, index) => {
							const date = formatDate(post.createdAt, { day: "numeric", month: "short", year: "numeric" });
							return (
								<li key={post.id} className="mb-3 break-inside-avoid sm:mb-4">
									<Link
										to={`/class/${selectedClassId}/posts/${post.id}`}
										className="group relative block overflow-hidden rounded-2xl bg-paper shadow-soft ring-1 ring-line/60"
									>
										<img
											src={post.imageUrl ?? ""}
											alt={post.content?.trim() || post.title || "תמונה מהכיתה"}
											loading="lazy"
											className={`w-full object-cover transition duration-500 group-hover:scale-[1.04] ${
												index % 5 === 0 ? "aspect-[3/4]" : index % 3 === 0 ? "aspect-square" : "aspect-[4/3]"
											}`}
										/>
										<span className="absolute inset-x-0 bottom-0 flex flex-col bg-gradient-to-t from-night/85 via-night/40 to-transparent p-3 pt-12 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
											<span className="truncate text-sm font-bold">{post.title}</span>
											<span className="truncate text-xs text-white/75">
												{post.authorName ?? "משתמשת שנמחקה"}{date ? ` · ${date}` : ""}
											</span>
										</span>
									</Link>
								</li>
							);
						})}
					</ul>
					<Pagination page={activePage} totalPages={totalPages} isLoading={isFetching} onPageChange={setPage} label="ניווט בין עמודי הגלריה" />
				</>
			)}

			{isCreateOpen && (
				<CreatePostModal
					key={selectedClassId}
					classId={selectedClassId}
					initialType="image"
					onClose={() => setIsCreateOpen(false)}
				/>
			)}
		</main>
	);
}

export default GalleryPage;
