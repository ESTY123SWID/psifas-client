import { BookOpenText, SearchX } from "lucide-react";

import type { PostListProps } from "../../types/posts.types";
import { EmptyState } from "../ui/States";
import PostCard from "./PostCard";

function PostList({ classId, currentUserId, canManageClassPosts, posts, emptyState }: PostListProps) {
	if (posts.length === 0) {
		return emptyState === "no-posts" ? (
			<EmptyState
				icon={<BookOpenText size={26} />}
				title="הארכיון עוד מחכה לרגע הראשון"
				text="כשתוסיפו משפט או תמונה, הם יישמרו כאן בזיכרון הכיתתי."
			/>
		) : (
			<EmptyState
				icon={<SearchX size={26} />}
				title="לא מצאנו פרסומים מתאימים"
				text="נסי לשנות את החיפוש או לנקות את הסינון."
			/>
		);
	}

	return (
		<ul aria-label="פרסומי הכיתה" className="grid items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
			{posts.map((post) => (
				<li key={`${classId}:${post.id}`}>
					<PostCard
						classId={classId}
						currentUserId={currentUserId}
						canManageClassPosts={canManageClassPosts}
						post={post}
					/>
				</li>
			))}
		</ul>
	);
}

export default PostList;
