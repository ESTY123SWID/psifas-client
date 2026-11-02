import { Link } from "react-router";
import { useSelector } from "react-redux";
import { ArrowLeft, Images, KeyRound, MessageSquareQuote, SmilePlus } from "lucide-react";

import type { RootState } from "../../app/store";
import { homePathFor } from "../../routes/homePath";
import Brand from "../../components/ui/Brand";

const FEATURES = [
    {
        icon: MessageSquareQuote,
        title: "המשפטים שלא שוכחים",
        text: "הציטוט מהשיעור, הבדיחה הפנימית והמשפט שכולן חוזרות עליו — נשמרים לתמיד.",
    },
    {
        icon: Images,
        title: "גלריה משותפת",
        text: "תמונות מהטיול, מהטקס ומההפסקה, כל אחת עם הסיפור שלה, במקום אחד.",
    },
    {
        icon: SmilePlus,
        title: "תגובות מהלב",
        text: "לב, צחוק או דמעה של התרגשות — כל פרסום מקבל את התגובה שמגיעה לו.",
    },
    {
        icon: KeyRound,
        title: "רק הכיתה שלכן",
        text: "כיתה פרטית שמצטרפים אליה בקוד. מה שקורה בכיתה — נשאר בכיתה.",
    },
];

const STEPS = [
    { title: "פותחות כיתה", text: "יוצרות כיתה ומקבלות קוד הצטרפות קצר." },
    { title: "מזמינות את כולן", text: "שולחות את הקוד בקבוצה, וכל אחת מצטרפת בלחיצה." },
    { title: "שומרות את הרגעים", text: "משפט, תמונה או סיפור קטן — והארכיון מתמלא." },
];

function LandingPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const personalPath = homePathFor(user);

    return (
        <div className="min-h-screen animate-page-in bg-paper">
            <div className="wrap">
                <header className="flex items-center justify-between gap-4 border-b border-line py-7">
                    <Brand size="md" to="/" />
                    <div className="flex gap-3">
                        {user ? (
                            <Link to={personalPath} className="btn btn-sm">לאזור האישי</Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-secondary btn-sm">התחברות</Link>
                                <Link to="/register" className="btn btn-sm">הרשמה</Link>
                            </>
                        )}
                    </div>
                </header>

                <main id="main">
                    <section className="flex flex-wrap items-center gap-12 py-16 sm:py-24 lg:gap-[72px] lg:py-28">
                        <div className="flex-[1_1_440px]">
                            <span className="eyebrow mb-7">ארכיון הזיכרונות הכיתתי</span>
                            <h1 className="mb-8 font-display text-[clamp(2.9rem,6.4vw,5.1rem)] leading-[1.04] font-normal tracking-[-0.02em] text-ink">
                                הרגעים של הכיתה,
                                <br />
                                נשארים <em className="font-medium text-blue not-italic">קרובים.</em>
                            </h1>
                            <p className="mb-12 max-w-[470px] text-xl leading-[1.75] font-light text-ink-2">
                                משפטים, תמונות וחוויות קטנות שמרכיבות יחד סיפור משותף — מסודרים במקום אחד, חם ופרטי.
                            </p>
                            <div className="flex flex-wrap gap-3.5">
                                <Link to={user ? personalPath : "/register"} className="btn btn-brand">
                                    {user ? "לאזור האישי" : "מתחילות עכשיו"}
                                    <ArrowLeft size={19} aria-hidden="true" />
                                </Link>
                                <a href="#how" className="btn btn-secondary">איך זה עובד</a>
                            </div>
                        </div>

                        {/* איור של המוצר: משפט, תמונה ותגובות */}
                        <div
                            aria-hidden="true"
                            className="relative min-h-[440px] flex-[1_1_380px] bg-sand-l bg-[radial-gradient(circle_at_75%_20%,rgb(45_92_88/0.09),transparent_55%),radial-gradient(circle_at_15%_85%,rgb(176_135_79/0.16),transparent_50%)]"
                        >
                            <div className="absolute top-11 right-0 w-[88%] animate-page-in border border-line bg-surface p-6 shadow-lift sm:-right-6 sm:w-[78%]">
                                <p className="text-[13px] text-ink-soft">המשפט של השבוע · י״ב 3</p>
                                <p className="mt-2 font-display text-[22px] leading-snug">
                                    ״אל תפחדו מהשאלות, תפחדו מהרגע שתפסיקו לשאול אותן.״
                                </p>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <span className="border border-mist-strong bg-mist px-3 text-xs leading-[1.9] font-semibold text-blue">❤️ 14</span>
                                    <span className="border border-[#e8dcc6] bg-sand-l px-3 text-xs leading-[1.9] font-semibold text-sun">👏 9</span>
                                    <span className="border border-line bg-surface px-3 text-xs leading-[1.9] font-semibold text-ink-2">🥹 6</span>
                                </div>
                            </div>

                            <div className="absolute top-[250px] right-0 w-[60%] border border-line bg-surface p-3 shadow-lift [animation-delay:150ms] sm:-right-6 sm:w-[46%]">
                                <div className="aspect-[4/3] bg-[linear-gradient(135deg,#e9c79a_0%,#c98d5b_45%,#2d5c58_100%)]" />
                                <p className="mt-2.5 text-[15px] font-semibold">הטיול השנתי לגליל</p>
                                <p className="text-[13px] text-ink-soft">דנה לוי · לפני יומיים</p>
                            </div>

                            <div className="absolute bottom-9 left-0 w-[64%] animate-page-in border border-line bg-surface p-5 shadow-lift [animation-delay:300ms] sm:-left-6 sm:w-[48%]">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mist text-blue">
                                        <SmilePlus size={22} />
                                    </span>
                                    <div>
                                        <p className="font-semibold">מאיה הצטרפה לכיתה</p>
                                        <p className="text-[13px] text-ink-soft">עכשיו כבר 28 חברות</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            <section className="border-t border-line py-20 sm:py-28">
                <div className="wrap">
                    <h2 className="mb-3.5 font-display text-[clamp(2.1rem,4vw,2.9rem)] font-normal">מה מחכה לכן בפנים</h2>
                    <p className="mb-16 max-w-[520px] text-[19px] font-light text-ink-2">ארבעה דברים פשוטים, ששומרים על כל מה שחשוב.</p>
                    <div className="grid border-t border-ink sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map(({ icon: Icon, title, text }, index) => (
                            <div
                                key={title}
                                className={`border-b border-line py-7 sm:border-b-0 sm:px-7 sm:pt-10 sm:pb-2 ${index > 0 ? "sm:border-s" : "sm:ps-0"}`}
                            >
                                <Icon size={28} strokeWidth={1.5} className="mb-6 text-blue" aria-hidden="true" />
                                <h3 className="mb-2.5 text-xl font-bold">{title}</h3>
                                <p className="font-light text-ink-2">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="how" className="border-t border-line bg-sand-l/50 py-20 sm:py-28">
                <div className="wrap">
                    <h2 className="mb-3.5 font-display text-[clamp(2.1rem,4vw,2.9rem)] font-normal">איך זה עובד</h2>
                    <p className="mb-16 max-w-[520px] text-[19px] font-light text-ink-2">שלושה צעדים, ואף רגע לא הולך לאיבוד.</p>
                    <ol className="grid gap-14 md:grid-cols-3">
                        {STEPS.map((step, index) => (
                            <li key={step.title}>
                                <div className="mb-6 border-b border-line-strong pb-5 font-display text-xl text-sand">
                                    {String(index + 1).padStart(2, "0")}
                                </div>
                                <h3 className="mb-2 text-[22px] font-bold">{step.title}</h3>
                                <p className="font-light text-ink-2">{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <div className="wrap">
                <section className="border-t border-ink border-b border-b-line px-5 py-20 text-center sm:py-24">
                    <h2 className="mb-4 font-display text-[clamp(2.25rem,5vw,3.4rem)] font-normal">הזיכרון הבא כבר קורה</h2>
                    <p className="mb-10 text-[19px] font-light text-ink-2">פותחות חשבון בדקה, ומזמינות את כל הכיתה.</p>
                    <Link to={user ? personalPath : "/register"} className="btn btn-brand">
                        {user ? "לאזור האישי" : "יצירת חשבון"}
                    </Link>
                </section>
            </div>

            <footer className="py-11 text-[13px] tracking-[0.06em] text-ink-soft">
                <div className="wrap flex flex-wrap items-center justify-between gap-4">
                    <Brand size="sm" />
                    <span>רגעים קטנים. זיכרונות שנשארים.</span>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
