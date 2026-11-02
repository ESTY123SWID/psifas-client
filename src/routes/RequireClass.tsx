import { useEffect } from "react";
import { Link, Navigate, Outlet, useParams } from "react-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "../app/store";
import { useGetMyClassesQuery } from "../services/classesApi";
import { setSelectedClassId } from "../features/classes/classSlice";
import { ErrorState, FullPageLoading } from "../components/ui/States";

function GuardError({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <main className="page max-w-2xl">
            <ErrorState message={message} onRetry={onRetry}>
                <Link className="btn btn-sm btn-secondary" to="/my-classes">לכיתות שלי</Link>
            </ErrorState>
        </main>
    );
}

function RequireClass() {
    const dispatch = useDispatch();
    const { classId: classIdParam } = useParams();
    const hasExplicitClassId = classIdParam !== undefined;
    const requestedClassId = hasExplicitClassId ? Number(classIdParam) : null;
    const isRequestedClassIdValid =
        !hasExplicitClassId ||
        (Number.isSafeInteger(requestedClassId) && (requestedClassId ?? 0) > 0);

    const selectedClassId = useSelector(
        (state: RootState) => state.class.selectedClassId
    );
    const classesQueryArgument =
        hasExplicitClassId && !isRequestedClassIdValid ? skipToken : undefined;

    // מרענן את רשימת החברויות בכל כניסה לאזור כיתה, כדי שהרשאות שהשתנו ייקלטו.
    const {
        currentData: classes,
        isError,
        refetch,
    } = useGetMyClassesQuery(classesQueryArgument, {
        refetchOnMountOrArgChange: true,
    });

    const targetClassId = hasExplicitClassId
        ? requestedClassId
        : selectedClassId;
    const targetClass = classes?.find((classItem) => classItem.id === targetClassId);

    useEffect(() => {
        if (!classes?.length) return;

        if (hasExplicitClassId && targetClass) {
            if (selectedClassId !== targetClass.id) {
                dispatch(setSelectedClassId(targetClass.id));
            }
            return;
        }

        if (!hasExplicitClassId && !targetClass) {
            dispatch(setSelectedClassId(classes[0].id));
        }
    }, [
        classes,
        dispatch,
        hasExplicitClassId,
        selectedClassId,
        targetClass,
    ]);

    if (!isRequestedClassIdValid) {
        return <GuardError message="מזהה הכיתה אינו תקין." />;
    }

    // חוסמת רק בטעינה הראשונה. רענון ברקע לא מסיר את הדף המוצג — אחרת דפים שמרעננים
    // את הרשימה בעצמם נכנסים ללולאה אינסופית של הסרה, טעינה מחדש ורענון.
    if (!classes && !isError) {
        return <FullPageLoading label="בודקת את הגישה לכיתה..." />;
    }

    if (!classes) {
        return <GuardError message="לא הצלחנו לבדוק את החברות שלך בכיתה." onRetry={() => refetch()} />;
    }

    if (classes.length === 0) {
        return <Navigate to="/my-classes" replace />;
    }

    if (hasExplicitClassId && !targetClass) {
        return <GuardError message="הכיתה לא נמצאה או שאין לך הרשאה לצפות בה." />;
    }

    if (!targetClass || selectedClassId !== targetClass.id) {
        return <FullPageLoading label="מעדכנת את הכיתה הפעילה..." />;
    }

    return <Outlet />;
}

export default RequireClass;
