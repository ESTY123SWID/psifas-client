import { useEffect, useId, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";

import type { RootState } from "../../app/store";
import type { AdminSortOrder, AdminUserRole, AdminUserSort } from "../../types/admin.types";
import { isAdminUser } from "../../types/admin.types";
import { useGetAdminUsersQuery } from "../../services/adminApi";
import { readApiError } from "../../services/apiError";

import AdminSearchFilters from "../../components/admin/AdminSearchFilters";
import AdminUserDetailsModal from "../../components/admin/AdminUserDetailsModal";
import UsersTable from "../../components/admin/UsersTable";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import { ErrorState, LoadingState } from "../../components/ui/States";

const PAGE_SIZE = 20;

function getUsersErrorMessage(error: unknown): string {
	const { status } = readApiError(error);
	if (status === 401) return "פג תוקף החיבור. התחברי מחדש.";
	if (status === 403) return "אין לך הרשאה לנהל משתמשות.";
	return "לא הצלחנו לטעון את המשתמשות. נסי שוב.";
}

function ManageUsersPage() {
	const roleFilterId = useId();
	const user = useSelector((state: RootState) => state.auth.user);
	const isSystemAdmin = user?.role === "SystemAdmin";
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [role, setRole] = useState<AdminUserRole | "">("");
	const [sort, setSort] = useState<AdminUserSort>("registeredAt");
	const [order, setOrder] = useState<AdminSortOrder>("desc");
	const [page, setPage] = useState(1);
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
		return () => window.clearTimeout(timeoutId);
	}, [search]);

	const queryArgument = isSystemAdmin
		? { page, pageSize: PAGE_SIZE, search: debouncedSearch || undefined, sort, order, role: role || undefined }
		: skipToken;
	const { currentData: usersResponse, isLoading, isFetching, isError, error, refetch } = useGetAdminUsersQuery(queryArgument);

	const totalPages = Number.isSafeInteger(usersResponse?.totalPages) ? Math.max(usersResponse?.totalPages ?? 0, 0) : 0;
	const total = usersResponse && Number.isSafeInteger(usersResponse.total) ? usersResponse.total : undefined;
	const isSearchPending = search.trim() !== debouncedSearch;
	const users = Array.isArray(usersResponse?.items) ? usersResponse.items.filter(isAdminUser) : [];

	useEffect(() => {
		if (usersResponse && page > Math.max(totalPages, 1)) setPage(Math.max(totalPages, 1));
	}, [page, totalPages, usersResponse]);

	const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
		setter(value);
		setPage(1);
		setSelectedUserId(null);
	};

	if (!isSystemAdmin) {
		return (
			<main className="page">
				<ErrorState message="אין לך הרשאה לנהל משתמשות." />
			</main>
		);
	}

	const firstItem = (page - 1) * PAGE_SIZE + 1;

	return (
		<main className="page">
			<PageHeader
				eyebrow="ניהול מערכת"
				title="משתמשות"
				description={total === undefined ? "כל החשבונות הרשומים בפסיפס." : `${total.toLocaleString("he-IL")} חשבונות רשומים בפסיפס.`}
			/>

			<AdminSearchFilters
				search={search}
				sort={sort}
				order={order}
				sortOptions={[
					{ value: "registeredAt", label: "תאריך הרשמה" },
					{ value: "name", label: "שם" },
				]}
				searchLabel="חיפוש"
				searchPlaceholder="שם או כתובת מייל"
				onSearchChange={resetPage(setSearch)}
				onSortChange={resetPage(setSort)}
				onOrderChange={resetPage(setOrder)}
			>
				<div className="min-w-0 flex-[1_1_160px]">
					<label htmlFor={roleFilterId} className="field-label">תפקיד</label>
					<select
						id={roleFilterId}
						value={role}
						className="input select font-semibold"
						onChange={(event) => {
							const value = event.currentTarget.value;
							resetPage(setRole)(value === "User" || value === "SystemAdmin" ? value : "");
						}}
					>
						<option value="">הכול</option>
						<option value="User">משתמשות</option>
						<option value="SystemAdmin">מנהלות מערכת</option>
					</select>
				</div>
			</AdminSearchFilters>

			{isSearchPending ? (
				<LoadingState label="מחפשת משתמשות..." />
			) : isError ? (
				<ErrorState message={getUsersErrorMessage(error)} onRetry={() => refetch()} />
			) : isLoading || (!usersResponse && isFetching) ? (
				<LoadingState label="טוענת משתמשות..." />
			) : usersResponse ? (
				<div className={`transition-opacity ${isFetching ? "opacity-60" : ""}`} aria-busy={isFetching}>
					<UsersTable users={users} onSelectUser={setSelectedUserId} />
					{total !== undefined && total > 0 && (
						<p className="mt-4 text-center text-sm text-ink-soft">
							{firstItem}–{Math.min(firstItem + users.length - 1, total)} מתוך {total.toLocaleString("he-IL")}
						</p>
					)}
					<Pagination page={page} totalPages={totalPages} isLoading={isFetching} onPageChange={setPage} label="ניווט בין עמודי משתמשות" />
				</div>
			) : (
				<ErrorState message="נתוני המשתמשות אינם זמינים כרגע." onRetry={() => refetch()} />
			)}

			{selectedUserId !== null && (
				<AdminUserDetailsModal
					key={selectedUserId}
					userId={selectedUserId}
					onClose={() => setSelectedUserId(null)}
					onDeleted={() => setSelectedUserId(null)}
				/>
			)}
		</main>
	);
}

export default ManageUsersPage;
