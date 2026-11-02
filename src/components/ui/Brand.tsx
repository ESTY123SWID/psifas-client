import { Link } from "react-router";

import logo from "../../assets/images/logo.svg";

const SIZES = {
    sm: { mark: 34, text: "text-[22px]" },
    md: { mark: 40, text: "text-[27px]" },
    lg: { mark: 52, text: "text-[36px]" },
} as const;

interface BrandProps {
    to?: string;
    size?: keyof typeof SIZES;
    tagline?: boolean;
    tone?: "dark" | "light";
}

/** הלוגו המקורי של פסיפס עם שם המותג. */
function Brand({ to, size = "md", tagline = false, tone = "dark" }: BrandProps) {
    const { mark, text } = SIZES[size];
    const content = (
        <>
            <img
                src={logo}
                alt=""
                width={mark}
                height={mark}
                style={{ width: mark, height: mark }}
                className="shrink-0 transition-transform duration-500 group-hover:-rotate-6"
            />
            <span className="flex flex-col leading-none">
                <span className={`font-display font-medium tracking-[0.02em] ${text} ${tone === "light" ? "text-white" : "text-ink"}`}>פסיפס</span>
                {tagline && (
                    <span className={`mt-1.5 text-[12.5px] tracking-[0.04em] ${tone === "light" ? "text-white/60" : "text-ink-soft"}`}>
                        רגעים קטנים. זיכרונות שנשארים.
                    </span>
                )}
            </span>
        </>
    );

    return to ? (
        <Link to={to} className="group inline-flex shrink-0 items-center gap-3 no-underline" aria-label="פסיפס – לדף הבית">
            {content}
        </Link>
    ) : (
        <span className="group inline-flex shrink-0 items-center gap-3">{content}</span>
    );
}

export default Brand;
