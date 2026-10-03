import { Link } from "react-router-dom";
import { ArrowRight, Pause, Play } from "lucide-react";
import {
  BACKGROUND_VIDEO_POSTER,
  BACKGROUND_VIDEO_SRC,
  useBackgroundVideo,
} from "@/hooks/useBackgroundVideo";

const COVERAGE = ["Incidents", "Monitoring", "Patrols", "Visitor access"] as const;

export default function Hero() {
  const { videoRef, playing, toggle } = useBackgroundVideo();

  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col overflow-hidden bg-stone-950 text-white"
    >
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

      {/* Darken the left side for legibility and fade the bottom edge. */}
      <div className="absolute inset-0 bg-linear-to-r from-stone-950/85 via-stone-950/55 to-stone-950/20" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-stone-950/90 to-transparent" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-5 pb-10 pt-32 md:px-8 md:pb-14">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-orange-300">
          Saint Francis College · Campus Security Office
        </p>

        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
          Campus security, run from one place.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
          Report incidents, schedule monitoring shifts, log patrols and clear
          visitors at the gate — with every action recorded for review.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-200"
          >
            Sign in to the console
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center rounded-md border border-white/30 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/5"
          >
            Request an account
          </Link>
        </div>

        <div className="mt-16 flex items-end justify-between gap-6 border-t border-white/15 pt-5">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
            {COVERAGE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <button
            type="button"
            onClick={toggle}
            className="flex shrink-0 items-center gap-2 text-xs text-white/60 transition-colors hover:text-white"
            aria-label={playing ? "Pause background video" : "Play background video"}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            <span className="hidden sm:inline">{playing ? "Pause" : "Play"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
