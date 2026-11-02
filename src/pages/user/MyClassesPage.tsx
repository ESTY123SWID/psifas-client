import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { School } from "lucide-react";

import type { RootState } from "../../app/store";
import { setSelectedClassId } from "../../features/classes/classSlice";
import { useGetMyClassesQuery } from "../../services/classesApi";

import ClassList from "../../components/classes/ClassList";
import CreateClassForm from "../../components/classes/CreateClassForm";
import JoinClassForm from "../../components/classes/JoinClassForm";
import PageHeader from "../../components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States";

function MyClassesPage() {
	const dispatch = useDispatch();
	const selectedClassId = useSelector((state: RootState) => state.class.selectedClassId);
	const { data: classes, isLoading, isFetching, isError, refetch } = useGetMyClassesQuery();

	useEffect(() => {
		if (isLoading || isFetching || isError || !classes) return;

		if (classes.length === 0) {
			if (selectedClassId !== null) dispatch(setSelectedClassId(null));
			return;
		}

		const selectedClassExists = classes.some((classItem) => classItem.id === selectedClassId);
		if (!selectedClassExists) dispatch(setSelectedClassId(classes[0].id));
	}, [classes, dispatch, isError, isFetching, isLoading, selectedClassId]);

	const handleSelectActive = (classId: number) => {
		if (!classes?.some((classItem) => classItem.id === classId)) return;
		dispatch(setSelectedClassId(classId));
	};

	const handleClassCreated = (classId: number) => {
		dispatch(setSelectedClassId(classId));
	};

	const handleClassJoined = (classId: number) => {
		dispatch(setSelectedClassId(classId));
	};

	const hasNoClasses = classes?.length === 0;

	return (
		<main className="page">
			<PageHeader
				title="הכיתות שלי"
				description={hasNoClasses ? "עוד רגע מתחילות: פותחות כיתה חדשה, או מצטרפות לכיתה קיימת עם קוד." : "בוחרות כיתה פעילה, ומנהלות את פרטיה."}
			/>

			<section aria-label="הכיתות שלך" className="mb-12">
				{isLoading || (!classes && !isError) ? (
					<LoadingState label="טוענת את הכיתות..." />
				) : isError ? (
					<ErrorState message="לא הצלחנו לטעון את רשימת הכיתות." onRetry={() => refetch()} />
				) : classes.length === 0 ? (
					<div className="border-t border-ink bg-sand-l/60">
						<EmptyState
							compact
							icon={<School size={40} strokeWidth={1.3} />}
							title="ברוכה הבאה לפסיפס"
							text="כדי להתחיל לשמור זיכרונות צריך כיתה. אפשר לפתוח אחת חדשה או להצטרף לכיתה שמישהי כבר פתחה."
						/>
					</div>
				) : (
					<>
						{isFetching && <p className="sr-only" role="status">מעדכנת את רשימת הכיתות...</p>}
						<ClassList classes={classes} selectedClassId={selectedClassId} onSelectActive={handleSelectActive} />
					</>
				)}
			</section>

			<div className="grid gap-7 md:grid-cols-2">
				<CreateClassForm onCreated={handleClassCreated} />
				<JoinClassForm onJoined={handleClassJoined} />
			</div>
		</main>
	);
}

export default MyClassesPage;
