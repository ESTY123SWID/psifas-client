import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";

import type { RootState } from "../app/store";
import { ErrorState, FullPageLoading } from "../components/ui/States";

function RequireAuth() {
    const user = useSelector((state: RootState) => state.auth.user);
    const sessionStatus = useSelector((state: RootState) => state.auth.sessionStatus);
    const location = useLocation();

    if (sessionStatus === "checking") {
        return <FullPageLoading label="בודקת את מצב ההתחברות..." />;
    }

    if (sessionStatus === "error") {
        return (
            <main className="page max-w-2xl">
                <ErrorState message="לא ניתן לאמת את ההתחברות. נסי שוב לפני הכניסה לאזור פרטי.">
                    <Link className="btn btn-sm btn-secondary" to="/login">מעבר להתחברות</Link>
                </ErrorState>
            </main>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: `${location.pathname}${location.search}${location.hash}` }}
            />
        );
    }

    return <Outlet />;
}

export default RequireAuth;
