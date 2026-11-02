import { Link, Navigate, Outlet, Route, Routes, useParams } from "react-router";
import { useSelector } from "react-redux";
import { Compass } from "lucide-react";

import type { RootState } from "../app/store";

import RequireAuth from "./RequireAuth";
import RequireClass from "./RequireClass";
import RequireSystemAdmin from "./RequireSystemAdmin";
import { homePathFor } from "./homePath";

import MainLayout from "../components/layout/MainLayout";
import PostDetailsModal from "../components/modals/PostDetailsModal";
import { EmptyState, FullPageLoading } from "../components/ui/States";
import LandingPage from "../pages/public/LandingPage";
import LoginRegisterPage from "../pages/public/LoginRegisterPage";
import UserHomePage from "../pages/user/UserHomePage";
import MyClassesPage from "../pages/user/MyClassesPage";
import ProfilePage from "../pages/user/ProfilePage";
import MyPostsPage from "../pages/class/MyPostsPage";
import MembersPage from "../pages/class/MembersPage";
import GalleryPage from "../pages/class/GalleryPage";
import AdminDashboardPage from "../pages/systemAdmin/AdminDashboardPage";
import ManageUsersPage from "../pages/systemAdmin/ManageUsersPage";
import ManageClassesPage from "../pages/systemAdmin/ManageClassesPage";
import AdminClassDetailsPage from "../pages/systemAdmin/AdminClassDetailsPage";

function ClassRootRedirect() {
	const { classId } = useParams();
	return <Navigate to={`/class/${classId}/posts`} replace />;
}

/** מסכי התחברות והרשמה — מי שכבר מחוברת מועברת לאזור האישי. */
function GuestOnly() {
	const user = useSelector((state: RootState) => state.auth.user);
	const sessionStatus = useSelector((state: RootState) => state.auth.sessionStatus);

	if (sessionStatus === "checking") return <FullPageLoading label="בודקת את מצב ההתחברות..." />;
	if (user && sessionStatus !== "error") return <Navigate to={homePathFor(user)} replace />;
	return <Outlet />;
}

function NotFoundPage() {
	return (
		<main className="wrap flex min-h-[70svh] items-center justify-center">
			<EmptyState
				icon={<Compass size={48} strokeWidth={1.3} />}
				title="הדף לא נמצא"
				text="נראה שהכתובת הזו לא קיימת בפסיפס."
				action={<Link className="btn btn-brand" to="/">חזרה לדף הבית</Link>}
			/>
		</main>
	);
}

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />

			<Route element={<GuestOnly />}>
				<Route path="/login" element={<LoginRegisterPage mode="login" />} />
				<Route path="/register" element={<LoginRegisterPage mode="register" />} />
			</Route>

			<Route element={<RequireAuth />}>
				<Route element={<MainLayout mode="personal" />}>
					<Route path="/my-classes" element={<MyClassesPage />} />
					<Route path="/profile" element={<ProfilePage />} />

					<Route element={<RequireClass />}>
						<Route path="/home" element={<UserHomePage />} />
						<Route path="/gallery" element={<GalleryPage />} />
					</Route>

					<Route path="/class/:classId" element={<RequireClass />}>
						<Route index element={<ClassRootRedirect />} />
						<Route path="posts" element={<MyPostsPage />} />
						<Route path="posts/:postId" element={<PostDetailsModal />} />
						<Route path="members" element={<MembersPage />} />
					</Route>
				</Route>

				<Route element={<RequireSystemAdmin />}>
					<Route element={<MainLayout mode="admin" />}>
						<Route path="/admin" element={<AdminDashboardPage />} />
						<Route path="/admin/users" element={<ManageUsersPage />} />
						<Route path="/admin/classes" element={<ManageClassesPage />} />
						<Route path="/admin/classes/:classId" element={<AdminClassDetailsPage />} />
					</Route>
				</Route>
			</Route>

			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
}

export default AppRoutes;
