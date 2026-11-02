import { Outlet } from "react-router";
import { useSelector } from "react-redux";

import type { RootState } from "../../app/store";
import type { MainLayoutProps } from "../../types/navigation.types";

import Footer from "./Footer";
import Header from "./Header";

function MainLayout({ mode }: MainLayoutProps) {
	const user = useSelector((state: RootState) => state.auth.user);
	const isSystemAdmin = user?.role === "SystemAdmin";

	return (
		<div className="flex min-h-screen flex-col bg-paper text-ink">
			<Header isSystemAdmin={isSystemAdmin} mode={mode} />
			<div className="flex-1">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
}

export default MainLayout;
