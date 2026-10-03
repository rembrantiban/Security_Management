import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Pause, Play } from "lucide-react";
import {
  BACKGROUND_VIDEO_POSTER,
  BACKGROUND_VIDEO_SRC,
  useBackgroundVideo,
} from "@/hooks/useBackgroundVideo";

interface AuthLayoutProps {
  /** Statement shown over the video panel on large screens. */
  headline: string;
  /** Width of the form column. */
  formWidth?: "sm" | "md";
  children: ReactNode;
}

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/sfc.png" alt="" className="h-8 w-8 object-contain bg-white rounded-full" />
      <span className="text-[15px] font-semibold tracking-tight">
        SFC Security
      </span>
    </span>
  );
}

/**
 * Split-screen shell shared by the sign-in and registration pages. The left
 * panel reuses the landing page's background video so the public pages read
 * as one site.
 */
export default function AuthLayout({
  headline,
  formWidth = "sm",
  children,
}: AuthLayoutProps) {
  const { videoRef, playing, toggle } = useBackgroundVideo();

  return (
    <div className="min-h-svh bg-white text-stone-900 antialiased lg:grid lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-stone-950 text-white lg:block">
        <div className="sticky top-0 flex h-svh flex-col">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={BACKGROUND_VIDEO_SRC}
            poster={BACKGROUND_VIDEO_POSTER}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-stone-950/70" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-stone-950/90 to-transparent" />

          <div className="relative flex flex-1 flex-col justify-between p-10 xl:p-14">
            <Link to="/" className="w-fit">
              <Wordmark />
            </Link>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-orange-300">
                Saint Francis College · Campus Security Office
              </p>
              <p className="mt-5 max-w-md text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
                {headline}
              </p>

              <div className="mt-10 flex items-center justify-between border-t border-white/15 pt-5 text-xs text-white/55">
                <span>Authorized personnel only. Activity is logged.</span>
                <button
                  type="button"
                  onClick={toggle}
                  className="flex items-center gap-2 transition-colors hover:text-white"
                  aria-label={playing ? "Pause background video" : "Play background video"}
                >
                  {playing ? <Pause size={14} /> : <Play size={14} />}
                  {playing ? "Pause" : "Play"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-h-svh flex-col px-5 py-8 sm:px-10">
        <Link
          to="/"
          className="group inline-flex w-fit items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-900"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back to home
        </Link>

        <div
          className={`mx-auto flex w-full flex-1 flex-col justify-center py-12 ${
            formWidth === "md" ? "max-w-md" : "max-w-sm"
          }`}
        >
          <div className="mb-8 lg:hidden">
            <Wordmark />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
