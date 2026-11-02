import { useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import type { PostManagementActionsProps } from "../../types/posts.types";
import { useDeletePostMutation } from "../../services/postsApi";

import ConfirmDialog from "../common/ConfirmDialog";
import EditPostModal from "../modals/EditPostModal";

function PostManagementActions({ classId, currentUserId, canManageClassPosts, post }: PostManagementActionsProps) {
    const isAuthor = currentUserId !== null && post.authorId === currentUserId;
    const canManagePost = isAuthor || canManageClassPosts;
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [deletePost, { isLoading, isError, reset }] = useDeletePostMutation();
    const requestRef = useRef<ReturnType<typeof deletePost> | null>(null);

    if (!canManagePost) return null;

    const handleDelete = async () => {
        if (isLoading) return;
        const request = deletePost({ classId, postId: post.id });
        requestRef.current = request;
        try {
            await request.unwrap();
            setIsConfirmingDelete(false);
        } catch {
            // הודעת השגיאה מוצגת בחלונית האישור.
        } finally {
            requestRef.current = null;
        }
    };

    const handleCancelDelete = () => {
        requestRef.current?.abort();
        reset();
        setIsConfirmingDelete(false);
    };

    return (
        <>
            <div className="-mt-1 -ml-2 flex shrink-0 items-center">
                <button className="icon-btn h-8 w-8" type="button" onClick={() => setIsEditing(true)} aria-label="עריכת הפרסום" title="עריכה">
                    <Pencil size={15} aria-hidden="true" />
                </button>
                <button
                    className="icon-btn h-8 w-8 hover:bg-coral-mist hover:text-coral"
                    type="button"
                    onClick={() => {
                        reset();
                        setIsConfirmingDelete(true);
                    }}
                    aria-label="מחיקת הפרסום"
                    title="מחיקה"
                >
                    <Trash2 size={15} aria-hidden="true" />
                </button>
            </div>

            {isEditing && (
                <EditPostModal
                    key={`${classId}:${post.id}`}
                    classId={classId}
                    post={post}
                    onClose={() => setIsEditing(false)}
                />
            )}

            {isConfirmingDelete && (
                <ConfirmDialog
                    title="מחיקת פרסום"
                    message="למחוק את הפרסום? לא ניתן לשחזר אותו לאחר המחיקה."
                    confirmLabel="מחיקה"
                    isLoading={isLoading}
                    errorMessage={isError ? "לא הצלחנו למחוק את הפרסום. נסי שוב." : undefined}
                    onConfirm={handleDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </>
    );
}

export default PostManagementActions;
