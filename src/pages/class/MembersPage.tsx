import { useEffect, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { Link, useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "../../app/store";
import { isClassMember } from "../../types/classMember.types";
import { setSelectedClassId } from "../../features/classes/classSlice";
import { useGetMyClassesQuery, useGetClassDetailsQuery } from "../../services/classesApi";
import { useGetClassMembersQuery } from "../../services/classMembersApi";

import ClassMembershipActions from "../../components/classes/ClassMembershipActions";
import InviteCodePanel from "../../components/classes/InviteCodePanel";
import RenameClassForm from "../../components/classes/RenameClassForm";
import MembersList from "../../components/members/MembersList";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import { ErrorState, LoadingState } from "../../components/ui/States";
import { formatDate } from "../../components/ui/format";
import { ArrowLeft, ArrowRight, CalendarDays, Users } from "lucide-react";

const MEMBERS_PAGE_SIZE = 20;

function getMembersLoadError(
	error: FetchBaseQueryError | SerializedError | undefined
): string {
	if (error && "status" in error) {
		if (error.status === 403) return "אינך חברה בכיתה או שאין לך הרשאה לצפות בה.";
		if (error.status === 404) return "הכיתה או רשימת החברות לא נמצאה.";
	}
	return "לא הצלחנו לטעון את חברות הכיתה.";
}

function MembersPage() {
	const { classId: classIdParam } = useParams();
	const classId = Number(classIdParam);
	const hasValidClassId = Number.isSafeInteger(classId) && classId > 0;
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.auth.user);
	const selectedClassId = useSelector(
		(state: RootState) => state.class.selectedClassId
	);

	const {
		currentData: classes,
		isLoading: isClassesLoading,
		isError: isClassesError,
		refetch: refetchClasses,
	} = useGetMyClassesQuery();
	const membership = classes?.find((classItem) => classItem.id === classId);
	const canLoadClass = hasValidClassId &&
		!isClassesLoading &&
		!isClassesError &&
		membership !== undefined;

	const [page, setPage] = useState(1);
	const [pageClassId, setPageClassId] = useState<number | null>(null);
	const activePage = pageClassId === classId ? page : 1;

	useEffect(() => {
		if (pageClassId === classId) return;
		setPageClassId(hasValidClassId ? classId : null);
		setPage(1);
	}, [classId, hasValidClassId, pageClassId]);

	const classDetailsArgs = canLoadClass ? classId : skipToken;
	const {
		currentData: classDetails,
		isLoading: isDetailsLoading,
		isError: isDetailsError,
		refetch: refetchDetails,
	} = useGetClassDetailsQuery(classDetailsArgs);

	const membersQueryArgs = canLoadClass
		? { classId, page: activePage, pageSize: MEMBERS_PAGE_SIZE }
		: skipToken;
	const {
		currentData: membersResponse,
		isLoading: isMembersLoading,
		isFetching: isMembersFetching,
		isError: isMembersError,
		error: membersError,
		refetch: refetchMembers,
	} = useGetClassMembersQuery(membersQueryArgs);

	const hasValidMembers =
		Array.isArray(membersResponse?.members) &&
		membersResponse.members.every(isClassMember);
	const members = hasValidMembers ? membersResponse.members : [];
	const responseManagerCount = membersResponse?.managerCount;
	const managerCount = typeof responseManagerCount === "number" &&
		Number.isSafeInteger(responseManagerCount) && responseManagerCount >= 0
		? responseManagerCount
		: undefined;
	const hasValidMemberCount =
		Number.isSafeInteger(membersResponse?.totalCount) &&
		(membersResponse?.totalCount ?? -1) >= 0;
	const totalCount = hasValidMemberCount
		? Math.max(membersResponse?.totalCount ?? 0, 0)
		: 0;
	const calculatedPages = Math.ceil(totalCount / MEMBERS_PAGE_SIZE);
	const totalPages = Number.isInteger(membersResponse?.totalPages)
		? Math.max(membersResponse?.totalPages ?? 0, 0)
		: calculatedPages;
	const lastValidPage = Math.max(totalPages, 1);
	const isPageOutOfRange =
		membersResponse !== undefined && activePage > lastValidPage;

	useEffect(() => {
		if (membersResponse && activePage > lastValidPage) {
			setPage(lastValidPage);
		}
	}, [activePage, lastValidPage, membersResponse]);

	const handleMembershipEnded = () => {
		const nextClass = selectedClassId !== classId
			? classes?.find((classItem) => classItem.id === selectedClassId)
			: undefined;
		const fallbackClass = nextClass ??
			classes?.find((classItem) => classItem.id !== classId);
		dispatch(setSelectedClassId(fallbackClass?.id ?? null));
		navigate("/my-classes");
	};

	const handleActivateClass = () => {
		if (membership) {
			dispatch(setSelectedClassId(classId));
		}
	};

	if (!hasValidClassId) {
		return (
			<main className="page max-w-2xl">
				<ErrorState message="מזהה הכיתה אינו תקין.">
					<Link className="btn btn-sm btn-secondary" to="/my-classes">לכיתות שלי</Link>
				</ErrorState>
			</main>
		);
	}

	if (isClassesLoading || (!classes && !isClassesError)) {
		return <main className="page"><LoadingState label="טוענת את פרטי החברות בכיתה..." /></main>;
	}

	if (isClassesError) {
		return (
			<main className="page max-w-2xl">
				<ErrorState message="לא הצלחנו לבדוק את החברות שלך בכיתה." onRetry={() => refetchClasses()}>
					<Link className="btn btn-sm btn-secondary" to="/my-classes">לכיתות שלי</Link>
				</ErrorState>
			</main>
		);
	}

	if (!membership) {
		return (
			<main className="page max-w-2xl">
				<ErrorState message="הכיתה לא נמצאה או שאין לך הרשאה לצפות בה.">
					<Link className="btn btn-sm btn-secondary" to="/my-classes">לכיתות שלי</Link>
				</ErrorState>
			</main>
		);
	}

	const className = classDetails?.name?.trim() || membership.name?.trim() || "הכיתה שלי";
	const canManageClass = membership.role === "ClassManager";
	const createdAt = formatDate(classDetails?.createdAt);
	const hasInvalidCreatedAt = Boolean(classDetails?.createdAt) && !createdAt;

	return (
		<main className="page">
			<Link to="/my-classes" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition hover:text-blue">
				<ArrowRight size={16} aria-hidden="true" />
				חזרה לכיתות שלי
			</Link>

			<PageHeader
				eyebrow="הקהילה שלך"
				title={className}
				actions={
					<>
						{selectedClassId !== classId && (
							<button type="button" className="btn btn-secondary" onClick={handleActivateClass}>
								מעבר לכיתה הזו
							</button>
						)}
						<Link to={`/class/${classId}/posts`} className="btn btn-primary">
							לפרסומי הכיתה
							<ArrowLeft size={16} aria-hidden="true" />
						</Link>
					</>
				}
			>
				<div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
					<span className={`badge ${canManageClass ? "bg-lilac-mist text-lilac" : "bg-mist text-blue-deep"}`}>
						{canManageClass ? "את מנהלת את הכיתה" : "חברה בכיתה"}
					</span>
					{isDetailsLoading ? (
						<span className="text-ink-soft" role="status">טוענת פרטי כיתה...</span>
					) : isDetailsError ? (
						<span className="flex items-center gap-2 text-coral" role="alert">
							לא הצלחנו לטעון פרטים נוספים.
							<button type="button" className="link text-coral" onClick={() => refetchDetails()}>נסי שוב</button>
						</span>
					) : (
						<>
							<span className="badge bg-surface text-ink-soft ring-1 ring-line">
								<Users size={13} aria-hidden="true" />
								{membersResponse && hasValidMemberCount ? `${totalCount} חברות` : "מספר החברות אינו זמין"}
							</span>
							{createdAt && (
								<span className="badge bg-surface text-ink-soft ring-1 ring-line">
									<CalendarDays size={13} aria-hidden="true" />
									נוצרה ב־<time dateTime={classDetails?.createdAt ?? undefined}>{createdAt}</time>
								</span>
							)}
							{hasInvalidCreatedAt && <span className="text-ink-soft">תאריך יצירת הכיתה אינו זמין.</span>}
						</>
					)}
				</div>
			</PageHeader>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-start">
				<section aria-labelledby="members-heading" className="card card-pad">
					<div className="mb-5 flex items-center justify-between gap-3">
						<h2 id="members-heading" className="section-title">חברות הכיתה</h2>
						{typeof managerCount === "number" && (
							<span className="text-xs text-ink-soft">{managerCount === 1 ? "מנהלת אחת" : `${managerCount} מנהלות`}</span>
						)}
					</div>

					{isMembersLoading ? (
						<LoadingState label="טוענת חברות..." compact />
					) : isMembersError ? (
						<ErrorState message={getMembersLoadError(membersError)} onRetry={() => refetchMembers()} />
					) : membersResponse && !hasValidMembers ? (
						<p className="alert-error" role="alert">השרת החזיר רשימת חברות לא תקינה.</p>
					) : isPageOutOfRange ? (
						<LoadingState label="מעדכנת את עמוד החברות..." compact />
					) : membersResponse ? (
						<>
							{isMembersFetching && <p className="sr-only" role="status">מעדכנת את הרשימה...</p>}
							<MembersList
								classId={classId}
								members={members}
								currentUserId={user?.id ?? null}
								canManageMembers={canManageClass}
								managerCount={managerCount}
								onCurrentUserRemoved={handleMembershipEnded}
							/>
							<Pagination
								page={activePage}
								totalPages={totalPages}
								isLoading={isMembersFetching}
								onPageChange={setPage}
								label="ניווט בין עמודי חברות"
							/>
						</>
					) : (
						<LoadingState label="טוענת חברות..." compact />
					)}
				</section>

				<aside className="space-y-6">
					{canManageClass && (
						<>
							<InviteCodePanel classId={classId} />
							<RenameClassForm key={`${classId}:${className}`} classId={classId} currentName={className} />
						</>
					)}
					<ClassMembershipActions
						classId={classId}
						className={className}
						role={membership.role}
						managerCount={managerCount}
						onMembershipEnded={handleMembershipEnded}
					/>
				</aside>
			</div>
		</main>
	);
}

export default MembersPage;
