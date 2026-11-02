import { useEffect, useState } from "react";
import type { ChangeEvent, Ref } from "react";
import { ImagePlus, RefreshCw } from "lucide-react";

interface ImagePickerProps {
    id: string;
    file: File | null;
    /** תמונה קיימת (בעריכה) שמוצגת כשלא נבחר קובץ חדש. */
    existingUrl?: string | null;
    disabled?: boolean;
    invalid?: boolean;
    inputRef?: Ref<HTMLInputElement>;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/** בחירת תמונה עם תצוגה מקדימה. הקובץ נשלח כמו שהוא; האימות נעשה אצל מי שמשתמש ברכיב. */
function ImagePicker({ id, file, existingUrl, disabled, invalid, inputRef, onChange }: ImagePickerProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const shownUrl = previewUrl ?? existingUrl ?? null;

    return (
        <label
            htmlFor={id}
            className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition ${
                invalid ? "border-coral/50 bg-coral-mist/40" : "border-line bg-paper/60 hover:border-blue/40 hover:bg-mist/40"
            } ${shownUrl ? "aspect-[16/10]" : "py-9"} ${disabled ? "pointer-events-none opacity-60" : ""}`}
        >
            {shownUrl ? (
                <>
                    <img src={shownUrl} alt="תצוגה מקדימה של התמונה" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-ink shadow-sm backdrop-blur">
                        <RefreshCw size={13} aria-hidden="true" />
                        החלפת תמונה
                    </span>
                </>
            ) : (
                <>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue shadow-sm" aria-hidden="true">
                        <ImagePlus size={22} />
                    </span>
                    <span className="mt-3 text-sm font-semibold text-ink">לחצי לבחירת תמונה</span>
                    <span className="mt-1 text-xs text-ink-soft">JPG, PNG או WebP · עד 5MB</span>
                </>
            )}
            <input
                ref={inputRef}
                id={id}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={disabled}
                aria-invalid={invalid}
                className="sr-only"
                onChange={onChange}
            />
        </label>
    );
}

export default ImagePicker;
