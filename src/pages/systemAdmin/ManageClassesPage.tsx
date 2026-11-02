import { useEffect, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

import type { RootState } from "../../app/store";
import type { AdminClassSort, AdminSortOrder } from "../../types/admin.types";
import { isAdminClass } from "../../types/admin.types";
import { useGetAdminClassesQuery } from "../../services/adminApi";
import { readApiError } from "../../services/apiError";

import AdminSearchFilters from "../../components/admin/AdminSearchFilters";
import ClassesTable from "../../components/admin/ClassesTable";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import { ErrorState, LoadingState } from "../../components/ui/States";

const PAGE_SIZE = 20;

function getClassesErrorMessage(error: unknown): string {
	const { status } = readApiError(error);
	if (status === 401) return "פג תוקף החיבור. התחברי מחדש.";
	if (status === 403) return "אין לך הרשאה לנהל כיתות.";
	return "לא הצלחנו לטעון את הכיתות. נסי שוב.";
}

function ManageClassesPage() {
	const user = useSelector((state: RootState) => state.auth.user);
	const isSystemAdmin = user?.role === "SystemAdmin";
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [sort, setSort] = useState<AdminClassSort>("createdAt");
	const [order, setOrder] = useState<AdminSortOrder>("desc");
	const [page, setPage] = useState(1);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
		return () => window.clearTimeout(timeoutId);
	}, [search]);

	const queryArgument = isSystemAdmin
		? { page, pageSize: PAGE_SIZE, search: debouncedSearch || undefined, sort, order }
		: skipToken;
	const { currentData: classesResponse, isLoading, isFetching, isError, error, refetch } = useGetAdminClassesQuery(queryArgument);

	const totalPages = Number.isSafeInteger(classesResponse?.totalPages) ? Math.max(classesResponse?.totalPages ?? 0, 0) : 0;
	const total = classesResponse && Number.isSafeInteger(classesResponse.total) ? classesResponse.total : undefined;
	const isSearchPending = search.trim() !== debouncedSearch;
	const classes = Array.isArray(classesResponse?.items) ? classesResponse.items.filter(isAdminClass) : [];

	useEffect(() => {
		if (classesResponse && page > Math.max(totalPages, 1)) setPage(Math.max(totalPages, 1));
	}, [classesResponse, page, totalPages]);

	const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
		setter(value);
		setPage(1);
	};

	if (!isSystemAdmin) {
		return (
			<main className="page">
				<ErrorState message="אין לך הרשאה לנהל כיתות." />
			</main>
		);
	}

	const firstItem = (page - 1) * PAGE_SIZE + 1;

	return (
		<main className="page">
			<PageHeader
				eyebrow="ניהול מערכת"
				title="כיתות"
				description={total === undefined ? "כל הכיתות בפסיפס." : `${total.toLocaleString("he-IL")} כיתות בפסיפס.`}
			/>

			<AdminSearchFilters
				search={search}
				sort={sort}
				order={order}
				sortOptions={[
					{ value: "createdAt", label: "תאריך יצירה" },
					{ value: "name", label: "שם הכיתה" },
				]}
				searchLabel="חיפוש"
				searchPlaceholder="שם הכיתה או קוד הצטרפות"
				onSearchChange={resetPage(setSearch)}
				onSortChange={resetPage(setSort)}
				onOrderChange={resetPage(setOrder)}
			/>

			{isSearchPending ? (
				<LoadingState label="מחפשת כיתות..." />
			) : isError ? (
				<ErrorState message={getClassesErrorMessage(error)} onRetry={() => refetch()} />
			) : isLoading || (!classesResponse && isFetching) ? (
				<LoadingState label="טוענת כיתות..." />
			) : classesResponse ? (
				<div className={`transition-opacity ${isFetching ? "opacity-60" : ""}`} aria-busy={isFetching}>
					<ClassesTable classes={classes} onSelectClass={(classId) => navigate(`/admin/classes/${classId}`)} />
					{total !== undefined && total > 0 && (
						<p className="mt-4 text-center text-sm text-ink-soft">
							{firstItem}–{Math.min(firstItem + classes.length - 1, total)} מתוך {total.toLocaleString("he-IL")}
						</p>
					)}
					<Pagination page={page} totalPages={totalPages} isLoading={isFetching} onPageChange={setPage} label="ניווט בין עמודי כיתות" />
				</div>
			) : (
				<ErrorState message="נתוני הכיתות אינם זמינים כרגע." onRetry={() => refetch()} />
			)}
		</main>
	);
}

export default ManageClassesPage;
