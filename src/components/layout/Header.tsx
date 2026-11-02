import { useEffect, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Menu, X } from "lucide-react";

import type { RootState } from "../../app/store";
import type { HeaderNavProps } from "../../types/navigation.types";
import { setSelectedClassId } from "../../features/classes/classSlice";
import { logout } from "../../features/auth/authSlice";
import { useGetMyClassesQuery } from "../../services/classesApi";
import { useLogoutMutation } from "../../services/authApi";
import { baseApi } from "../../services/baseApi";

import Brand from "../ui/Brand";
import UserProfileButton from "../modals/UserProfileButton";
import ClassSelector from "./ClassSelector";
import HeaderNav from "./HeaderNav";

const Header = ({ isSystemAdmin, mode }: HeaderNavProps) => {
    const selectedClassId = useSelector((state: RootState) => state.class.selectedClassId);
    const user = useSelector((state: RootState) => state.auth.user);
    const [menuOpen, setMenuOpen] = useState(false);

    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const isClassRoute = location.pathname.startsWith("/class/");
    const classRouteMatch = location.pathname.match(/^\/class\/(\d+)(?:\/|$)/);
    const routeClassId = classRouteMatch ? Number(classRouteMatch[1]) : null;
    const [logoutSession, { isLoading: isLoggingOut }] = useLogoutMutation();
    const [logoutError, setLogoutError] = useState<string | null>(null);

    // התפריט הנייד נסגר אחרי מעבר עמוד.
    useEffect(() => setMenuOpen(false), [location.pathname]);

    const classesQueryArgument = mode === "personal" ? undefined : skipToken;
    const { data: classes = [], isLoading, isError } = useGetMyClassesQuery(classesQueryArgument);
    const routeClassIsAvailable = routeClassId !== null && classes.some((classItem) => classItem.id === routeClassId);
    const selectedClassIsAvailable = classes.some((classItem) => classItem.id === selectedClassId);
    const headerClassId = isClassRoute
        ? routeClassIsAvailable ? routeClassId : null
        : selectedClassIsAvailable ? selectedClassId : classes[0]?.id ?? null;

    const handleClassChange = (classId: number) => {
        if (classId === headerClassId && classId === selectedClassId) return;
        dispatch(setSelectedClassId(classId));

        if (mode === "personal" && isClassRoute && classRouteMatch && classId !== routeClassId) {
            const classRelativePath = location.pathname.replace(/^\/class\/\d+/, "");
            navigate(`/class/${classId}${classRelativePath}${location.search}${location.hash}`, { replace: true });
        }
    };

    const selectedClass = classes.find((classItem) => classItem.id === headerClassId);
    const userRole =
        user?.role === "SystemAdmin"
            ? "מנהלת מערכת"
            : selectedClass
                ? `${selectedClass.role === "ClassManager" ? "מנהלת כיתה" : "חברת כיתה"} · ${selectedClass.name}`
                : "עדיין בלי כיתה";

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setLogoutError(null);
        try {
            await logoutSession().unwrap();
            dispatch(logout());
            dispatch(setSelectedClassId(null));
            dispatch(baseApi.util.resetApiState());
            navigate("/", { replace: true });
        } catch {
            setLogoutError("לא הצלחנו לצאת מהחשבון. נסי שוב.");
        }
    };

    const showClassSelector = mode === "personal" && !isLoading && !isError && (!isClassRoute || routeClassIsAvailable);

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
            <div className="wrap flex min-h-[76px] flex-wrap items-center gap-4 lg:flex-nowrap lg:gap-10">
                <Brand size="sm" to={isSystemAdmin && mode === "admin" ? "/admin" : "/home"} />

                {isSystemAdmin && mode === "admin" && (
                    <span className="badge border-lilac/30 bg-lilac-mist text-lilac">ניהול מערכת</span>
                )}

                <button
                    type="button"
                    className="ms-auto inline-flex h-[42px] w-[42px] items-center justify-center border border-line bg-surface text-ink lg:hidden"
                    aria-expanded={menuOpen}
                    aria-controls="app-nav"
                    aria-label={menuOpen ? "סגירת התפריט" : "פתיחת התפריט"}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
                </button>

                <div
                    id="app-nav"
                    className={`${menuOpen ? "flex animate-page-in" : "hidden"} basis-full flex-col gap-5 pt-1 pb-6 lg:flex lg:flex-1 lg:basis-auto lg:flex-row lg:items-center lg:gap-7 lg:p-0`}
                >
                    <div className="lg:flex-1">
                        <HeaderNav isSystemAdmin={isSystemAdmin} mode={mode} />
                    </div>

                    {showClassSelector && (
                        <ClassSelector classes={classes} selectedClassId={headerClassId} onClassChange={handleClassChange} />
                    )}

                    {user && (
                        <UserProfileButton
                            userName={user.name}
                            userEmail={user.email}
                            role={userRole}
                            onLogout={handleLogout}
                            isLoggingOut={isLoggingOut}
                            logoutError={logoutError}
                        />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
