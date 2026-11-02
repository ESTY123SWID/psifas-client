import { skipToken } from "@reduxjs/toolkit/query";
import { Link, useParams } from "react-router";
import { useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";

import type { RootState } from "../../app/store";
import { useGetMyClassesQuery } from "../../services/classesApi";
import { useGetPostDetailsQuery } from "../../services/postsApi";

import PostCard from "../posts/PostCard";
import { ErrorState, LoadingState } from "../ui/States";

function BackLink({ to, label }: { to: string; label: string }) {
	return (
		<Link to={to} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition hover:text-blue">
			<ArrowRight size={16} aria-hidden="true" />
			{label}
		</Link>
	);
}

function PostDetailsModal() {
	const { classId: classIdParam, postId: postIdParam } = useParams();
	const classId = Number(classIdParam);
	const postId = Number(postIdParam);
	const hasValidIds =
		Number.isSafeInteger(classId) && classId > 0 &&
		Number.isSafeInteger(postId) && postId > 0;
	const user = useSelector((state: RootState) => state.auth.user);
	const { currentData: classes, isLoading: isClassesLoading, isError: isClassesError } = useGetMyClassesQuery();
	const membership = classes?.find((classItem) => classItem.id === classId);
	const canLoadPost = hasValidIds && !isClassesLoading && !isClassesError && membership;
	const queryArgument = canLoadPost ? { classId, postId } : skipToken;
	const { currentData: post, isLoading, isError, refetch } = useGetPostDetailsQuery(queryArgument);
	const backPath = hasValidIds ? `/class/${classId}/posts` : "/my-classes";

	let content;
	if (!hasValidIds) {
		content = <ErrorState message="כתובת הפרסום אינה תקינה." />;
	} else if (isClassesLoading) {
		content = <LoadingState label="בודקת את הגישה לפרסום..." />;
	} else if (isClassesError) {
		content = <ErrorState message="לא הצלחנו לבדוק את החברות שלך בכיתה." />;
	} else if (!membership) {
		content = <ErrorState message="אין לך הרשאה לצפות בפרסום הזה." />;
	} else if (isLoading || (!post && !isError)) {
		content = <LoadingState label="טוענת פרסום..." />;
	} else if (isError || !post || post.id !== postId) {
		content = <ErrorState message="הפרסום לא נמצא או שלא הצלחנו לטעון אותו." onRetry={() => refetch()} />;
	} else {
		content = (
			<PostCard
				key={`${classId}:${postId}`}
				classId={classId}
				currentUserId={user?.id ?? null}
				canManageClassPosts={membership.role === "ClassManager"}
				post={post}
			/>
		);
	}

	return (
		<main className="page max-w-2xl">
			<BackLink to={backPath} label={hasValidIds ? "חזרה לפרסומי הכיתה" : "חזרה לכיתות שלי"} />
			{content}
		</main>
	);
}

export default PostDetailsModal;
