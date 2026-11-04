import { useEffect, useState } from "react";
import type { CSSProperties, ChangeEvent, Ref } from "react";
import { ImagePlus, RefreshCw, RotateCw } from "lucide-react";

import { normalizeQuarterTurns } from "../../utils/rotateImage";

interface ImagePickerProps {
    id: string;
    file: File | null;
    /** תמונה קיימת (בעריכה) שמוצגת כשלא נבחר קובץ חדש. */
    existingUrl?: string | null;
    disabled?: boolean;
    invalid?: boolean;
    inputRef?: Ref<HTMLInputElement>;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    /** סיבוב הקובץ החדש ברבעי סיבוב (90° עם כיוון השעון). כשמועבר onRotate מוצג כפתור סיבוב. */
    rotation?: number;
    onRotate?: () => void;
}

/** סגנון התצוגה המקדימה המסובבת. ב־90°/270° התמונה מוחלפת ברוחב ובגובה כדי להיכנס בדיוק למסגרת. */
function rotatedPreviewStyle(turns: number): CSSProperties | undefined {
    if (turns === 0) return undefined;
    if (turns === 2) return { transform: "rotate(180deg)" };
    return {
        inset: "auto",
        top: "50%",
        left: "50%",
        // cqw/cqh = רוחב/גובה המסגרת (container-type: size על התווית).
        width: "100cqh",
        height: "100cqw",
        transform: `translate(-50%, -50%) rotate(${turns * 90}deg)`,
    };
}

/** בחירת תמונה עם תצוגה מקדימה ואפשרות סיבוב. האימות והסיבוב בפועל נעשים אצל מי שמשתמש ברכיב. */
function ImagePicker({ id, file, existingUrl, disabled, invalid, inputRef, onChange, rotation = 0, onRotate }: ImagePickerProps) {
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
    // הסיבוב חל רק על קובץ חדש שנבחר, לא על תמונה שכבר נשמרה.
    const turns = previewUrl ? normalizeQuarterTurns(rotation) : 0;
    const canRotate = Boolean(previewUrl && onRotate);

    return (
        <div className="relative">
            <label
                htmlFor={id}
                style={shownUrl ? { containerType: "size" } : undefined}
                className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition ${
                    invalid ? "border-coral/50 bg-coral-mist/40" : "border-line bg-paper/60 hover:border-blue/40 hover:bg-mist/40"
                } ${shownUrl ? "h-36 sm:h-44" : "py-7"} ${disabled ? "pointer-events-none opacity-60" : ""}`}
            >
                {shownUrl ? (
                    <>
                        <img
                            src={shownUrl}
                            alt="תצוגה מקדימה של התמונה"
                            style={rotatedPreviewStyle(turns)}
                            className="absolute inset-0 h-full w-full bg-sand-l object-contain"
                        />
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

            {canRotate && (
                <button
                    type="button"
                    onClick={onRotate}
                    disabled={disabled}
                    aria-label="סיבוב התמונה ב־90 מעלות עם כיוון השעון"
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-ink shadow-sm backdrop-blur transition hover:bg-white hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:opacity-60"
                >
                    <RotateCw size={13} aria-hidden="true" />
                    סיבוב
                </button>
            )}
            <span className="sr-only" aria-live="polite">
                {turns ? `התמונה תישמר מסובבת ב־${turns * 90} מעלות` : ""}
            </span>
        </div>
    );
}

export default ImagePicker;
