import { useEffect, useRef, useState } from "react";

interface StoriesPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const YOUTUBE_ID = "iy6QfhZWccA";
const STORY_DURATION_MS = 60000;

export function StoriesPlayer({ isOpen, onClose }: StoriesPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const startRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // ESC to close + body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  // Progress loop
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      elapsedRef.current = 0;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    startRef.current = performance.now();
    const tick = (now: number) => {
      if (!paused) {
        const total = elapsedRef.current + (now - startRef.current);
        const pct = Math.min(100, (total / STORY_DURATION_MS) * 100);
        setProgress(pct);
        if (pct >= 100) {
          onClose();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, paused, onClose]);

  const handlePauseStart = () => {
    if (paused) return;
    elapsedRef.current += performance.now() - startRef.current;
    setPaused(true);
    videoRef.current?.pause();
  };

  const handlePauseEnd = () => {
    if (!paused) return;
    startRef.current = performance.now();
    setPaused(false);
    videoRef.current?.play().catch(() => {});
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative h-full w-full max-w-[390px] overflow-hidden bg-black sm:h-[100vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 p-2">
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full bg-white transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Fechar stories"
          className="absolute right-3 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full text-2xl text-white hover:bg-white/10"
        >
          ×
        </button>

        {/* Tap-and-hold area */}
        <div
          className="absolute inset-0 z-10"
          onMouseDown={handlePauseStart}
          onMouseUp={handlePauseEnd}
          onMouseLeave={handlePauseEnd}
          onTouchStart={handlePauseStart}
          onTouchEnd={handlePauseEnd}
        />

        {/* Video — Add your video URL here */}
        <video
          ref={videoRef}
          src=""
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
