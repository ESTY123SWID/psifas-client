import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

import type { RootState } from "../app/store";

function RequireSystemAdmin() {
    const user = useSelector((state: RootState) => state.auth.user);

    if (user?.role !== "SystemAdmin") {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}

export default RequireSystemAdmin;
