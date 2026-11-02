import type {
    ReactionCounts,
    ReactionType,
} from "./reaction.types";

export type PostType = "quote" | "image";

export type PostTypeFilter = PostType | "all";

export type PostAuthorFilter = "all" | "mine";

export type PostsSort = "newest" | "oldest" | "popular";

export const DEFAULT_POST_TYPE_FILTER: PostTypeFilter = "all";

export const DEFAULT_POST_AUTHOR_FILTER: PostAuthorFilter = "all";

export const DEFAULT_POSTS_SORT: PostsSort = "newest";

export interface Post {
    id: number;
    /** null כאשר חשבון המפרסמת נמחק והפרסום נשמר ללא פרטים מזהים. */
    authorId: number | null;
    type: PostType;
    title?: string | null;
    authorName?: string | null;
    createdAt?: string | null;
    content?: string | null;
    imageUrl?: string | null;
    reactions?: Partial<ReactionCounts> | null;
    myReaction?: ReactionType | null;
}

export interface PostCardProps {
    classId: number;
    currentUserId: number | null;
    canManageClassPosts: boolean;
    post: Post;
}

export interface GetPostsRequest {
    classId: number;
    type?: PostType;
    authorId?: number;
    search?: string;
    sort: PostsSort;
    page: number;
    pageSize: number;
}

export interface GetPostsResponse {
    items: Post[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface PostFiltersProps {
    typeFilter: PostTypeFilter;
    authorFilter: PostAuthorFilter;
    search: string;
    sort: PostsSort;
    onTypeFilterChange: (type: PostTypeFilter) => void;
    onAuthorFilterChange: (author: PostAuthorFilter) => void;
    onSearchChange: (search: string) => void;
    onSortChange: (sort: PostsSort) => void;
}

export interface PostFilterOption<T extends string> {
    value: T;
    label: string;
}

export type PostListEmptyState = "no-posts" | "no-results";

export interface PostListProps {
    classId: number;
    currentUserId: number | null;
    canManageClassPosts: boolean;
    posts: Post[];
    emptyState: PostListEmptyState;
}

export interface EditPostModalProps {
    classId: number;
    post: Post;
    onClose: () => void;
}

export interface EditPostFormValues {
    title: string;
    content: string;
}

export interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmLabel: string;
    isLoading: boolean;
    loadingLabel?: string;
    errorMessage?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export interface PostManagementActionsProps {
    classId: number;
    currentUserId: number | null;
    canManageClassPosts: boolean;
    post: Post;
}

export interface UpdatePostRequest {
    classId: number;
    postId: number;
    formData: FormData;
}

export interface DeletePostRequest {
    classId: number;
    postId: number;
}

export interface PostMutationResponse {
    id: number;
}

export interface GetPostDetailsRequest {
    classId: number;
    postId: number;
}