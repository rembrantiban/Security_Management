import { useEffect, useRef, useState } from "react";

export const BACKGROUND_VIDEO_SRC = "/Security_system_promotional.mp4";
export const BACKGROUND_VIDEO_POSTER = "/campus.jpg";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Controls a muted, looping background video. Playback starts automatically
 * unless the user prefers reduced motion, and falls back to the poster frame
 * if the browser blocks autoplay.
 */
export function useBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(
    () => !window.matchMedia(REDUCED_MOTION_QUERY).matches
  );

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setPlaying(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }, [playing]);

  const toggle = () => setPlaying((value) => !value);

  return { videoRef, playing, toggle };
}
