export type CreatePostType = "quote" | "image";

export interface CreatePostFormValues {
    type: CreatePostType;
    title: string;
    content: string;
    image?: File | null;
}

export interface CreatePostModalProps {
    classId: number;
    onClose: () => void;
    onCreated?: () => void;
    /** סוג הפרסום שנבחר מראש (למשל "image" בגלריה). */
    initialType?: CreatePostType;
}

export interface CreatePostRequest {
    classId: number;
    formData: FormData;
}

export interface CreatePostResponse {
    id: number;
}

export interface CreatePostErrors {
    title?: string;
    content?: string;
    image?: string;
}