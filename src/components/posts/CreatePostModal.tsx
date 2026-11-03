import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { ChangeEvent } from "react";
import { ImageIcon, Quote, X } from "lucide-react";

import type { CreatePostFormValues, CreatePostModalProps, CreatePostType } from "../../types/createPost.types";
import { useCreatePostMutation } from "../../services/postsApi";
import ImagePicker from "../ui/ImagePicker";
import Modal from "../ui/Modal";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const TYPE_OPTIONS: { value: CreatePostType; label: string; hint: string; icon: typeof Quote }[] = [
    { value: "quote", label: "משפט", hint: "ציטוט, בדיחה או רגע מילולי", icon: Quote },
    { value: "image", label: "תמונה", hint: "צילום מהכיתה עם תיאור", icon: ImageIcon },
];

function CreatePostModal({ classId, onClose, onCreated, initialType = "quote" }: CreatePostModalProps) {
    const [image, setImage] = useState<File | null>(null);
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<CreatePostFormValues>({
        defaultValues: { type: initialType, title: "", content: "", image: null },
    });
    const postType = watch("type");

    const titleInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const headingId = useId();
    const imageId = useId();

    const [createPost, { isLoading, isError, reset: resetMutation }] = useCreatePostMutation();

    const titleRegistration = register("title", {
        validate: {
            required: (value) => value.trim().length > 0 || "יש להזין כותרת.",
            maxLengthTrimmed: (value) => value.trim().length <= 150 || "הכותרת לא יכולה לעלות על 150 תווים.",
        },
        onChange: () => resetMutation(),
    });


    const handleTypeChange = (type: CreatePostType) => {
        if (isLoading) return;
        setValue("type", type, { shouldDirty: true });
        setValue("content", "", { shouldDirty: true });
        setImage(null);
        clearErrors();
        resetMutation();
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] ?? null;
        clearErrors("image");
        resetMutation();

        if (!selectedFile) {
            setImage(null);
            return;
        }
        if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
            setImage(null);
            event.target.value = "";
            setError("image", { message: "יש לבחור תמונה מסוג JPG, PNG או WebP." });
            return;
        }
        if (selectedFile.size > MAX_IMAGE_SIZE) {
            setImage(null);
            event.target.value = "";
            setError("image", { message: "גודל התמונה לא יכול לעלות על 5MB." });
            return;
        }
        setImage(selectedFile);
    };

    const submitPost = handleSubmit(async (values) => {
        if (isLoading) return;
        if (postType === "image" && !image) {
            setError("image", { message: "יש לבחור תמונה." });
            return;
        }

        const formData = new FormData();
        formData.append("type", postType);
        formData.append("title", values.title.trim());
        if (postType === "quote") {
            formData.append("content", values.content.trim());
        }
        if (postType === "image" && image) {
            formData.append("image", image);
            if (values.content.trim()) formData.append("content", values.content.trim());
        }

        try {
            await createPost({ classId, formData }).unwrap();
            onCreated?.();
            onClose();
        } catch {
            // השגיאה מוצגת למטה באמצעות isError
        }
    });

    return (
        <Modal labelledBy={headingId} onClose={onClose} dismissible={!isLoading} initialFocusRef={titleInputRef}>
                <header className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <p className="eyebrow mb-1 text-teal">רגע חדש לארכיון</p>
                        <h2 className="font-display text-2xl font-normal text-ink" id={headingId}>הוספת פרסום</h2>
                    </div>
                    <button type="button" onClick={onClose} disabled={isLoading} aria-label="סגירת החלונית" className="icon-btn">
                        <X size={18} aria-hidden="true" />
                    </button>
                </header>

                <form onSubmit={submitPost} noValidate className="space-y-4 sm:space-y-5">
                    <fieldset className="grid grid-cols-2 gap-3" disabled={isLoading}>
                        <legend className="field-label">סוג הפרסום</legend>
                        {TYPE_OPTIONS.map(({ value, label, hint, icon: Icon }) => {
                            const checked = postType === value;
                            return (
                                <label
                                    key={value}
                                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition sm:p-3.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue ${
                                        checked ? "border-blue bg-mist/70 shadow-sm" : "border-line hover:bg-paper"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        value={value}
                                        checked={checked}
                                        className="sr-only"
                                        {...register("type")}
                                        onChange={() => handleTypeChange(value)}
                                    />
                                    <span
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${checked ? "bg-blue-deep text-white" : "bg-paper text-ink-soft"}`}
                                        aria-hidden="true"
                                    >
                                        <Icon size={17} />
                                    </span>
                                    <span>
                                        <span className={`block text-sm font-bold ${checked ? "text-blue-deep" : "text-ink"}`}>{label}</span>
                                        <span className="block text-xs leading-5 text-ink-soft">{hint}</span>
                                    </span>
                                </label>
                            );
                        })}
                    </fieldset>

                    <div>
                        <label className="field-label" htmlFor="post-title">כותרת הפרסום</label>
                        <input
                            {...titleRegistration}
                            ref={(element) => {
                                titleRegistration.ref(element);
                                titleInputRef.current = element;
                            }}
                            id="post-title"
                            type="text"
                            maxLength={151}
                            disabled={isLoading}
                            aria-invalid={Boolean(errors.title)}
                            placeholder={postType === "quote" ? "למשל: המשפט של המורה לספרות" : "למשל: הטיול השנתי"}
                            className="input"
                        />
                        {errors.title?.message && <p className="field-error" role="alert">{errors.title.message}</p>}
                    </div>

                    {postType === "quote" && (
                        <div>
                            <label className="field-label" htmlFor="post-content">תוכן המשפט</label>
                            <textarea
                                id="post-content"
                                maxLength={2001}
                                disabled={isLoading}
                                aria-invalid={Boolean(errors.content)}
                                className="input min-h-28 resize-y font-display text-base leading-7 sm:min-h-32"
                                {...register("content", {
                                    validate: {
                                        requiredForQuote: (value) => postType !== "quote" || value.trim().length > 0 || "יש להזין את תוכן המשפט.",
                                        maxLengthTrimmed: (value) => value.trim().length <= 2000 || "התוכן לא יכול לעלות על 2000 תווים.",
                                    },
                                    onChange: () => resetMutation(),
                                })}
                            />
                            {errors.content?.message && <p className="field-error" role="alert">{errors.content.message}</p>}
                        </div>
                    )}

                    {postType === "image" && (
                        <>
                            <div>
                                <span className="field-label" id={`${imageId}-label`}>תמונה</span>
                                <ImagePicker
                                    id={imageId}
                                    file={image}
                                    disabled={isLoading}
                                    invalid={Boolean(errors.image)}
                                    inputRef={imageInputRef}
                                    onChange={handleImageChange}
                                />
                                {image && <p className="field-hint">נבחרה תמונה: {image.name}</p>}
                                {errors.image?.message && <p className="field-error" role="alert">{errors.image.message}</p>}
                            </div>

                            <div>
                                <label className="field-label" htmlFor="post-description">
                                    תיאור התמונה <span className="font-normal text-ink-soft">(לא חובה)</span>
                                </label>
                                <textarea
                                    id="post-description"
                                    maxLength={2000}
                                    disabled={isLoading}
                                    className="input min-h-20 resize-y"
                                    {...register("content", { onChange: () => resetMutation() })}
                                />
                            </div>
                        </>
                    )}

                    {isError && <p className="alert-error" role="alert">לא הצלחנו להוסיף את הפרסום. נסי שוב.</p>}

                    <footer className="flex justify-end gap-2.5 border-t border-line pt-5">
                        <button type="button" onClick={onClose} disabled={isLoading} className="btn btn-secondary">ביטול</button>
                        <button type="submit" disabled={isLoading} className="btn btn-brand">
                            {isLoading ? "מפרסמת..." : "פרסום"}
                        </button>
                    </footer>
                </form>
        </Modal>
    );
}

export default CreatePostModal;
