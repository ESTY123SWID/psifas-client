/** iOS Safari refuses canvases above ~16.7M pixels; stay safely below that on every device. */
const MAX_CANVAS_PIXELS = 16_000_000;
const LOSSY_QUALITIES = [0.92, 0.85, 0.75];

const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** מספר רבעי הסיבוב בטווח 0–3 (90° עם כיוון השעון לכל רבע). */
export function normalizeQuarterTurns(quarterTurns: number): number {
    return ((quarterTurns % 4) + 4) % 4;
}

async function loadImage(file: File): Promise<HTMLImageElement> {
    const url = URL.createObjectURL(file);
    try {
        const image = new Image();
        image.src = url;
        // The browser applies the EXIF orientation when decoding, so naturalWidth/Height and
        // drawImage already describe the photo as the user sees it in the preview.
        await image.decode();
        return image;
    } finally {
        URL.revokeObjectURL(url);
    }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * מחזירה קובץ חדש של התמונה מסובבת ב־quarterTurns × 90° עם כיוון השעון.
 * - בלי סיבוב מוחזר הקובץ המקורי כמו שהוא (בלי קידוד מחדש ובלי אובדן איכות).
 * - הקובץ החדש נוצר מ־canvas ולכן אין בו נתוני EXIF, כך שהדפדפן לא יסובב אותו שוב.
 * - נזרקת שגיאה אם לא ניתן לעבד את התמונה או אם התוצאה גדולה מ־maxBytes.
 */
export async function rotateImageFile(file: File, quarterTurns: number, maxBytes: number): Promise<File> {
    const turns = normalizeQuarterTurns(quarterTurns);
    if (turns === 0) return file;

    const image = await loadImage(file);
    const scale = Math.min(1, Math.sqrt(MAX_CANVAS_PIXELS / (image.naturalWidth * image.naturalHeight)));
    const width = Math.round(image.naturalWidth * scale);
    const height = Math.round(image.naturalHeight * scale);
    const sideways = turns % 2 === 1;

    const canvas = document.createElement("canvas");
    canvas.width = sideways ? height : width;
    canvas.height = sideways ? width : height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available");

    // Some browsers (older Safari) cannot encode WebP and would silently return PNG — use JPEG instead.
    const probeCanvas = document.createElement("canvas");
    probeCanvas.width = probeCanvas.height = 1;
    const probe = await canvasToBlob(probeCanvas, file.type);
    const type = probe?.type === file.type ? file.type : "image/jpeg";

    if (type === "image/jpeg") {
        // JPEG has no transparency: paint white instead of letting transparent pixels turn black.
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.imageSmoothingQuality = "high";
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((turns * Math.PI) / 2);
    context.drawImage(image, -width / 2, -height / 2, width, height);

    const qualities = type === "image/png" ? [undefined] : LOSSY_QUALITIES;
    for (const quality of qualities) {
        const blob = await canvasToBlob(canvas, type, quality);
        if (!blob) throw new Error("Could not encode the rotated image");
        if (blob.size <= maxBytes) {
            const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
            return new File([blob], `${baseName}.${EXTENSIONS[type]}`, { type, lastModified: Date.now() });
        }
    }
    throw new Error("The rotated image is too large");
}
