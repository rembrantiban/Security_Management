import { useEffect, useRef, useState } from "react";

export const BACKGROUND_VIDEO_SRC = "/Security_system_promotional.mp4";
export const BACKGROUND_VIDEO_POSTER = "/campus.jpg";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Controls a muted, looping background video. Playback starts automatically
 * unless the user prefers reduced motion, and falls back to the poster frame
 * if the browser blocks autoplay.
 *
 * The video only plays while `enabled` is true (pass false when the element is
 * hidden or off-screen) and while the browser tab is visible, so off-screen
 * copies don't keep decoding in the background.
 */
export function useBackgroundVideo(enabled = true) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(
    () => !window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
  const [pageVisible, setPageVisible] = useState(
    () => document.visibilityState === "visible"
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
    const onVisibilityChange = () =>
      setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing && enabled && pageVisible) {
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }, [playing, enabled, pageVisible]);

  const toggle = () => setPlaying((value) => !value);

  return { videoRef, playing, toggle };
}
