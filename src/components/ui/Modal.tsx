import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

// ---- shared state across all open modals (they can be nested: a confirm dialog over a details dialog) ----

/** Open modals, last = topmost. Only the topmost one reacts to Escape and traps focus. */
const modalStack: symbol[] = [];
let scrollLockCount = 0;
let savedScroll: { y: number; style: string } | null = null;

/**
 * Freezes the page behind the modal. `overflow: hidden` alone is not enough (iOS Safari and
 * programmatic scrolling ignore it), so the body is pinned in place at its current offset and
 * the exact scroll position is restored when the last modal closes.
 */
function lockBodyScroll() {
    if (scrollLockCount === 0) {
        const { body } = document;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        savedScroll = { y: window.scrollY, style: body.getAttribute("style") ?? "" };
        body.style.position = "fixed";
        body.style.top = `-${savedScroll.y}px`;
        body.style.left = "0";
        body.style.right = "0";
        body.style.width = "100%";
        body.style.overflow = "hidden";
        // Keeps the page from shifting sideways when the scrollbar disappears.
        if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    }
    scrollLockCount += 1;
}

function unlockBodyScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0 && savedScroll) {
        const { y, style } = savedScroll;
        savedScroll = null;
        if (style) document.body.setAttribute("style", style);
        else document.body.removeAttribute("style");
        window.scrollTo({ top: y, left: 0, behavior: "instant" });
    }
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZES = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
} as const;

interface ModalProps {
    onClose: () => void;
    children: ReactNode;
    labelledBy: string;
    describedBy?: string;
    role?: "dialog" | "alertdialog";
    size?: keyof typeof SIZES;
    /** While false (e.g. during a save), Escape and backdrop clicks do nothing. */
    dismissible?: boolean;
    /** Set to false for forms whose unsaved input should not be lost to a stray click outside. */
    closeOnBackdrop?: boolean;
    /** Element to focus when the modal opens; defaults to the first focusable element. */
    initialFocusRef?: RefObject<HTMLElement | null>;
    /** Stacking for nested modals — a confirm dialog sits above the dialog that opened it. */
    layer?: "base" | "top";
}

/**
 * The one modal shell of the site.
 * - Rendered into <body> through a portal, so it is always centred on the viewport — no ancestor
 *   transform, filter or scroll position can move it.
 * - Dimmed, blurred backdrop; the page behind cannot scroll while it is open.
 * - The panel never scrolls internally. If content is ever taller than a very small screen, the
 *   overlay itself scrolls (the panel stays whole, nothing is cut off) — the accessible fallback.
 * - Escape / backdrop close (topmost modal only), focus trap, focus restored on close.
 */
function Modal({
    onClose,
    children,
    labelledBy,
    describedBy,
    role = "dialog",
    size = "md",
    dismissible = true,
    closeOnBackdrop = true,
    initialFocusRef,
    layer = "base",
}: ModalProps) {
    const panelRef = useRef<HTMLElement>(null);
    const idRef = useRef(Symbol("modal"));
    const onCloseRef = useRef(onClose);
    const dismissibleRef = useRef(dismissible);

    // Always read the latest handler / state from the long-lived listeners below.
    useLayoutEffect(() => {
        onCloseRef.current = onClose;
        dismissibleRef.current = dismissible;
    });

    useEffect(() => {
        const id = idRef.current;
        const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        modalStack.push(id);
        lockBodyScroll();

        const target = initialFocusRef?.current ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current;
        target?.focus({ preventScroll: true });

        const handleKeyDown = (event: KeyboardEvent) => {
            if (modalStack[modalStack.length - 1] !== id) return;

            if (event.key === "Escape") {
                event.stopPropagation();
                if (dismissibleRef.current) onCloseRef.current();
                return;
            }

            if (event.key !== "Tab" || !panelRef.current) return;
            const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => element.offsetParent !== null);
            if (focusable.length === 0) {
                event.preventDefault();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;
            if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (active === last || !panelRef.current.contains(active))) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            const index = modalStack.lastIndexOf(id);
            if (index !== -1) modalStack.splice(index, 1);
            unlockBodyScroll();
            if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
        };
        // Runs once per opening; the latest onClose/dismissible are read through refs.
    }, [initialFocusRef]);

    return createPortal(
        <div
            className={`modal-backdrop fixed inset-0 overflow-y-auto overscroll-contain bg-ink/45 backdrop-blur-[2px] ${layer === "top" ? "z-[110]" : "z-[100]"}`}
            role="presentation"
        >
            <div
                className="flex min-h-full items-center justify-center p-3 sm:p-6"
                onMouseDown={(event) => {
                    if (closeOnBackdrop && event.target === event.currentTarget && dismissibleRef.current) onCloseRef.current();
                }}
            >
                <section
                    ref={panelRef}
                    role={role}
                    aria-modal="true"
                    aria-labelledby={labelledBy}
                    aria-describedby={describedBy}
                    tabIndex={-1}
                    className={`modal-panel w-full ${SIZES[size]} animate-modal-in border-t-2 border-t-ink bg-surface shadow-lift outline-none`}
                >
                    {children}
                </section>
            </div>
        </div>,
        document.body
    );
}

export default Modal;
