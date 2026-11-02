import { useEffect, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "../../app/store";
import { setSelectedClassId } from "../../features/classes/classSlice";
import type {
	PostAuthorFilter,
	PostListEmptyState,
	PostTypeFilter,
	PostsSort,
} from "../../types/posts.types";
import {
	DEFAULT_POST_AUTHOR_FILTER,
	DEFAULT_POSTS_SORT,
	DEFAULT_POST_TYPE_FILTER,
} from "../../types/posts.types";

import { useGetMyClassesQuery } from "../../services/classesApi";
import { useGetPostsQuery } from "../../services/postsApi";

import CreatePostModal from "../../components/posts/CreatePostModal";
import PostFilters from "../../components/posts/PostFilters";
import PostList from "../../components/posts/PostList";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import { ErrorState, LoadingState } from "../../components/ui/States";
import { Plus } from "lucide-react";

const POSTS_PAGE_SIZE = 10;

function MyPostsPage() {
	const dispatch = useDispatch();
	const selectedClassId = useSelector(
		(state: RootState) => state.class.selectedClassId
	);
	const user = useSelector((state: RootState) => state.auth.user);

	const {
		data: classes,
		isLoading: isClassesLoading,
		isError: isClassesError,
		refetch: refetchClasses,
	} = useGetMyClassesQuery();
	const selectedClass = classes?.find(
		(classItem) => classItem.id === selectedClassId
	);
	const activeClassId =
		isClassesError
			? null
			: selectedClass?.id ?? null;

	const [typeFilter, setTypeFilter] = useState<PostTypeFilter>(
		DEFAULT_POST_TYPE_FILTER
	);
	const [authorFilter, setAuthorFilter] = useState<PostAuthorFilter>(
		DEFAULT_POST_AUTHOR_FILTER
	);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [sort, setSort] = useState<PostsSort>(DEFAULT_POSTS_SORT);
	const [page, setPage] = useState(1);
	const [filterClassId, setFilterClassId] = useState<number | null>(null);
	const [createPostClassId, setCreatePostClassId] = useState<number | null>(null);
	const filtersBelongToActiveClass =
		activeClassId !== null && filterClassId === activeClassId;
	const activeTypeFilter = filtersBelongToActiveClass
		? typeFilter
		: DEFAULT_POST_TYPE_FILTER;
	const activeAuthorFilter = filtersBelongToActiveClass
		? authorFilter
		: DEFAULT_POST_AUTHOR_FILTER;
	const activeSearch = filtersBelongToActiveClass ? search : "";
	const activeDebouncedSearch = filtersBelongToActiveClass
		? debouncedSearch
		: "";
	const activeSort = filtersBelongToActiveClass ? sort : DEFAULT_POSTS_SORT;
	const activePage = filtersBelongToActiveClass ? page : 1;

	useEffect(() => {
		if (isClassesError || !classes?.length) return;

		const selectedClassExists = classes.some(
			(classItem) => classItem.id === selectedClassId
		);

		if (!selectedClassExists) {
			dispatch(setSelectedClassId(classes[0].id));
		}
	}, [classes, dispatch, isClassesError, selectedClassId]);

	useEffect(() => {
		if (activeClassId === filterClassId) return;

		setFilterClassId(activeClassId);
		setTypeFilter(DEFAULT_POST_TYPE_FILTER);
		setAuthorFilter(DEFAULT_POST_AUTHOR_FILTER);
		setSearch("");
		setDebouncedSearch("");
		setSort(DEFAULT_POSTS_SORT);
		setPage(1);
		setCreatePostClassId(null);
	}, [activeClassId, filterClassId]);

	useEffect(() => {
		if (!filtersBelongToActiveClass) return;

		const timeoutId = window.setTimeout(() => {
			setDebouncedSearch(activeSearch.trim());
		}, 400);

		return () => window.clearTimeout(timeoutId);
	}, [activeClassId, activeSearch, filtersBelongToActiveClass]);

	const postsQueryArgs = activeClassId === null
		? skipToken
		: activeAuthorFilter === "mine" && !user
			? skipToken
		: {
			classId: activeClassId,
			type: activeTypeFilter === "all" ? undefined : activeTypeFilter,
			authorId: activeAuthorFilter === "mine" ? user?.id : undefined,
			search: activeDebouncedSearch || undefined,
			sort: activeSort,
			page: activePage,
			pageSize: POSTS_PAGE_SIZE,
		};

	const {
		currentData: postsResponse,
		isFetching,
		isError,
		refetch,
	} = useGetPostsQuery(postsQueryArgs);

	const hasActiveFilters =
		activeTypeFilter !== DEFAULT_POST_TYPE_FILTER ||
		activeAuthorFilter !== DEFAULT_POST_AUTHOR_FILTER ||
		activeDebouncedSearch !== "";
	const isSearchPending = activeSearch.trim() !== activeDebouncedSearch;
	const shouldCheckUnfilteredCount =
		activeClassId !== null &&
		filtersBelongToActiveClass &&
		!isSearchPending &&
		hasActiveFilters &&
		postsResponse?.total === 0;

	const unfilteredQueryArgs = shouldCheckUnfilteredCount
		? {
			classId: activeClassId,
			sort: DEFAULT_POSTS_SORT,
			page: 1,
			pageSize: 1,
		}
		: skipToken;

	const {
		currentData: unfilteredResponse,
		isFetching: isCheckingUnfilteredCount,
		isError: isUnfilteredCountError,
		refetch: refetchUnfilteredCount,
	} = useGetPostsQuery(unfilteredQueryArgs);
	const totalPages = Number.isInteger(postsResponse?.totalPages)
		? Math.max(postsResponse?.totalPages ?? 0, 0)
		: 0;
	const lastValidPage = Math.max(totalPages, 1);
	const isPageOutOfRange = postsResponse !== undefined && activePage > lastValidPage;

	useEffect(() => {
		if (postsResponse && activePage > lastValidPage) {
			setPage(lastValidPage);
		}
	}, [activePage, lastValidPage, postsResponse]);

	const handleTypeFilterChange = (nextType: PostTypeFilter) => {
		setTypeFilter(nextType);
		setPage(1);
	};

	const handleAuthorFilterChange = (nextAuthor: PostAuthorFilter) => {
		setAuthorFilter(nextAuthor);
		setPage(1);
	};

	const handleSearchChange = (nextSearch: string) => {
		setSearch(nextSearch);
		setPage(1);
	};

	const handleSortChange = (nextSort: PostsSort) => {
		setSort(nextSort);
		setPage(1);
	};

	const emptyState: PostListEmptyState =
		hasActiveFilters && (unfilteredResponse?.total ?? 0) > 0
			? "no-results"
			: "no-posts";
	const posts = Array.isArray(postsResponse?.items)
		? postsResponse.items
		: [];
	const shouldShowClassEmptyState =
		!hasActiveFilters || unfilteredResponse?.total === 0;

	return (
		<main className="page">
			<PageHeader
				eyebrow="הארכיון הכיתתי"
				title="פרסומי הכיתה"
				description={selectedClass?.name?.trim() ? `כל הזיכרונות של ${selectedClass.name.trim()} — משפטים, תמונות ורגעים קטנים.` : undefined}
				actions={
					<button
						className="btn btn-brand"
						type="button"
						onClick={() => {
							if (activeClassId !== null) setCreatePostClassId(activeClassId);
						}}
						disabled={activeClassId === null}
					>
						<Plus size={17} aria-hidden="true" />
						הוספת פרסום
					</button>
				}
			/>

			{isClassesLoading || (!classes && !isClassesError) ? (
				<LoadingState label="טוענת את הכיתות..." />
			) : isClassesError ? (
				<ErrorState message="לא הצלחנו לטעון את הכיתות." onRetry={() => refetchClasses()} />
			) : classes.length === 0 ? (
				<p className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-soft">אין כיתות זמינות להצגת פרסומים.</p>
			) : activeClassId === null ? (
				<LoadingState label="מעדכנת את הכיתה הפעילה..." />
			) : (
				<>
					<PostFilters
						typeFilter={activeTypeFilter}
						authorFilter={activeAuthorFilter}
						search={activeSearch}
						sort={activeSort}
						onTypeFilterChange={handleTypeFilterChange}
						onAuthorFilterChange={handleAuthorFilterChange}
						onSearchChange={handleSearchChange}
						onSortChange={handleSortChange}
					/>

					{activeAuthorFilter === "mine" && !user ? (
						<p className="alert-error" role="alert">לא ניתן לטעון את הפרסומים שלך כרגע.</p>
					) : isSearchPending ? (
						<LoadingState label="מחפשת פרסומים..." />
					) : isError ? (
						<ErrorState message="לא הצלחנו לטעון את הפרסומים." onRetry={() => refetch()} />
					) : isFetching && !postsResponse ? (
						<LoadingState label="טוענת פרסומים..." />
					) : isPageOutOfRange ? (
						<LoadingState label="מעדכנת את עמוד הפרסומים..." />
					) : shouldCheckUnfilteredCount && isUnfilteredCountError ? (
						<ErrorState message="לא הצלחנו לבדוק אם קיימים פרסומים בכיתה." onRetry={() => refetchUnfilteredCount()} />
					) : shouldCheckUnfilteredCount && isCheckingUnfilteredCount ? (
						<LoadingState label="בודקת אם קיימים פרסומים בכיתה..." />
					) : postsResponse ? (
						<>
							<div className="mb-4 flex items-center justify-between gap-3 text-sm text-ink-soft">
								<p>
									{postsResponse.total === 0
										? "אין פרסומים להצגה"
										: `${postsResponse.total.toLocaleString("he-IL")} פרסומים`}
								</p>
								{isFetching && <p className="text-xs" role="status">מעדכנת...</p>}
							</div>

							<PostList
								classId={activeClassId}
								currentUserId={user?.id ?? null}
								canManageClassPosts={selectedClass?.role === "ClassManager"}
								posts={posts}
								emptyState={shouldShowClassEmptyState ? "no-posts" : emptyState}
							/>

							<Pagination
								page={activePage}
								totalPages={totalPages}
								isLoading={isFetching}
								onPageChange={setPage}
								label="ניווט בין עמודי פרסומים"
							/>
						</>
					) : (
						<LoadingState label="טוענת פרסומים..." />
					)}

					{createPostClassId !== null && createPostClassId === activeClassId && (
						<CreatePostModal
							key={createPostClassId}
							classId={createPostClassId}
							onClose={() => setCreatePostClassId(null)}
						/>
					)}
				</>
			)}
		</main>
	);
}

export default MyPostsPage;
