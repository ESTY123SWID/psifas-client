import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";
import { FileText, School, Sparkles, Users } from "lucide-react";

import type { RootState } from "../../app/store";
import { useGetAdminDashboardQuery } from "../../services/adminApi";

import AdminRecentClasses from "../../components/admin/AdminRecentClasses";
import AdminRecentUsers from "../../components/admin/AdminRecentUsers";
import StatsCard from "../../components/admin/StatsCard";
import PageHeader from "../../components/ui/PageHeader";
import { ErrorState, LoadingState } from "../../components/ui/States";

function plural(count: number | null | undefined, one: string, many: string): string | undefined {
	if (typeof count !== "number") return undefined;
	return count === 1 ? one : `${count.toLocaleString("he-IL")} ${many}`;
}

function AdminDashboardPage() {
	const user = useSelector((state: RootState) => state.auth.user);
	const isSystemAdmin = user?.role === "SystemAdmin";
	const { currentData: dashboard, isLoading, isFetching, isError, refetch } = useGetAdminDashboardQuery(
		isSystemAdmin ? undefined : skipToken
	);
	const firstName = user?.name?.trim().split(/\s+/)[0] ?? "";

	if (!isSystemAdmin) {
		return (
			<main className="page">
				<ErrorState message="אין לך הרשאה לצפות בנתוני הניהול." />
			</main>
		);
	}

	return (
		<main className="page">
			<PageHeader
				eyebrow="ניהול מערכת"
				title={`שלום${firstName ? `, ${firstName}` : ""}`}
				description="תמונת מצב של כל הכיתות והמשתמשות בפסיפס."
				actions={isFetching && dashboard ? <span className="text-sm text-ink-soft" role="status">מעדכנת נתונים...</span> : undefined}
			/>

			{isLoading || (!dashboard && !isError) ? (
				<LoadingState label="טוענת את נתוני המערכת..." />
			) : isError || !dashboard ? (
				<ErrorState message="לא הצלחנו לטעון את נתוני המערכת." onRetry={() => refetch()} />
			) : (
				<>
					<section aria-label="נתוני המערכת" className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						<StatsCard
							icon={<Users size={22} strokeWidth={1.6} />}
							label="משתמשות"
							value={dashboard.totalUsers}
							note={plural(dashboard.systemAdminCount, "מנהלת מערכת אחת", "מנהלות מערכת")}
							to="/admin/users"
						/>
						<StatsCard
							icon={<School size={22} strokeWidth={1.6} />}
							label="כיתות"
							value={dashboard.totalClasses}
							note="פעילות במערכת"
							to="/admin/classes"
						/>
						<StatsCard
							icon={<FileText size={22} strokeWidth={1.6} />}
							label="פרסומים"
							value={dashboard.totalPosts}
							note={plural(dashboard.imagePostCount, "תמונה אחת", "מהם תמונות")}
						/>
						<StatsCard
							icon={<Sparkles size={22} strokeWidth={1.6} />}
							label="הצטרפו השבוע"
							value={dashboard.newUsersThisWeek}
							note={
								typeof dashboard.newPostsThisWeek === "number"
									? dashboard.newPostsThisWeek === 0
										? "אין פרסומים חדשים השבוע"
										: `${plural(dashboard.newPostsThisWeek, "פרסום חדש אחד", "פרסומים חדשים")} השבוע`
									: undefined
							}
						/>
					</section>

					<div className="grid items-start gap-6 lg:grid-cols-2">
						<AdminRecentUsers users={dashboard.recentUsers} />
						<AdminRecentClasses classes={dashboard.recentClasses} />
					</div>
				</>
			)}
		</main>
	);
}

export default AdminDashboardPage;
