// גוונים חמים ורכים — רקע בהיר, אות בצבע מלא וקו דק.
const TONES = [
    "bg-mist text-blue border-mist-strong",
    "bg-sand-l text-[#7a5f33] border-[#e8dcc6]",
    "bg-coral-mist text-coral border-[#ecd0ca]",
    "bg-[#f3f6ef] text-[#55663f] border-[#dbe3cf]",
    "bg-lilac-mist text-lilac border-[#ead3da]",
];

const SIZES = {
    sm: "h-8 w-8 text-sm",
    md: "h-[42px] w-[42px] text-[17px]",
    lg: "h-14 w-14 text-[22px]",
    xl: "h-20 w-20 text-[30px]",
} as const;

export function getInitials(name: string | null | undefined): string {
    const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    return parts.slice(0, 2).map((part) => part.charAt(0)).join("");
}

/** מספר יציב לכל מחרוזת — כך שאותה משתמשת או כיתה מקבלות תמיד אותו גוון. */
export function toneFor(seed: string | number): number {
    const text = String(seed);
    let hash = 0;
    for (let index = 0; index < text.length; index++) {
        hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
    }
    return hash;
}

interface AvatarProps {
    name: string | null | undefined;
    size?: keyof typeof SIZES;
    className?: string;
}

function Avatar({ name, size = "md", className = "" }: AvatarProps) {
    const tone = TONES[toneFor(name ?? "") % TONES.length];
    return (
        <span
            aria-hidden="true"
            className={`inline-flex shrink-0 items-center justify-center rounded-full border font-display font-medium tracking-[0.02em] select-none ${SIZES[size]} ${tone} ${className}`}
        >
            {getInitials(name)}
        </span>
    );
}

export default Avatar;
