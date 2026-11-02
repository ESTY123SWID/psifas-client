import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RotateCw } from "lucide-react";

import type { RootState } from "../../app/store";
import { isUser } from "../../types/auth.types";
import { logout, setSessionError, setSessionStatus, setUser } from "../../features/auth/authSlice";
import { setSelectedClassId } from "../../features/classes/classSlice";
import { baseApi } from "../../services/baseApi";
import { useGetCurrentUserQuery } from "../../services/authApi";
import AppRoutes from "../../routes/AppRoutes";
import { FullPageLoading } from "../ui/States";

function AuthBootstrap() {
    const dispatch = useDispatch();
    const sessionStatus = useSelector((state: RootState) => state.auth.sessionStatus);
    const sessionError = useSelector((state: RootState) => state.auth.sessionError);
    const {
        currentData: session,
        isLoading,
        isFetching,
        isError,
        error,
    } = useGetCurrentUserQuery(undefined, {
        skip: sessionStatus !== "checking",
        refetchOnMountOrArgChange: true,
    });

    useEffect(() => {
        if (sessionStatus !== "checking" || isLoading || isFetching) return;

        if (isError) {
            if (error && "status" in error && error.status === 401) {
                dispatch(logout());
                dispatch(setSelectedClassId(null));
                dispatch(baseApi.util.resetApiState());
                return;
            }
            dispatch(setSessionError("לא ניתן לבדוק את מצב ההתחברות. נסי שוב."));
            return;
        }

        if (isUser(session?.user)) {
            dispatch(setUser(session.user));
            return;
        }

        dispatch(logout());
        dispatch(setSelectedClassId(null));
        dispatch(baseApi.util.resetApiState());
        dispatch(setSessionError("השרת לא החזיר פרטי התחברות תקינים."));
    }, [dispatch, error, isError, isFetching, isLoading, session, sessionStatus]);

    if (sessionStatus === "checking") {
        return <FullPageLoading label="בודקת את מצב ההתחברות..." />;
    }

    if (sessionStatus === "error") {
        return (
            <>
                <div className="border-b border-coral/20 bg-coral-mist">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8" role="alert">
                        <p className="text-sm font-medium text-coral">{sessionError}</p>
                        <button
                            type="button"
                            onClick={() => dispatch(setSessionStatus("checking"))}
                            className="btn btn-sm bg-white text-coral hover:bg-coral hover:text-white"
                        >
                            <RotateCw size={14} aria-hidden="true" />
                            בדיקה מחדש
                        </button>
                    </div>
                </div>
                <AppRoutes />
            </>
        );
    }

    return <AppRoutes />;
}

export default AuthBootstrap;
