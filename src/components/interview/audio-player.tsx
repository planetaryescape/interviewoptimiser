import { cn } from "@/lib/utils";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * AudioPlayer component for interview audio playback.
 *
 * @param audioUrl - The URL of the audio file to play.
 * @param disabled - If true, the player is visually disabled and non-interactive.
 */
export function AudioPlayer({ audioUrl, disabled }: { audioUrl?: string; disabled?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", () => setIsPlaying(false));
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying && !disabled) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, disabled]);

  const handlePlayPause = () => {
    if (disabled) return;
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const value = Number(e.target.value);
    audioRef.current.currentTime = value;
    setProgress(value);
  };

  const formatTime = (time: number) => {
    if (Number.isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!audioUrl) return null;

  return (
    <section
      className={cn(
        "fixed bottom-0 left-0 w-full z-50 bg-white border-t border-slate-200 flex items-center px-4 py-2 shadow-lg transition-opacity duration-200",
        disabled && "opacity-50 pointer-events-none select-none bg-slate-100"
      )}
      aria-label="Interview audio player"
    >
      <button
        onClick={handlePlayPause}
        className={cn(
          "mr-4 p-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
          disabled && "cursor-not-allowed"
        )}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
        disabled={disabled}
        type="button"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
      <span className="text-xs text-slate-600 w-12 text-right tabular-nums">
        {formatTime(progress)}
      </span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={progress}
        onChange={handleSeek}
        className="mx-3 flex-1 accent-blue-600 h-1 cursor-pointer"
        aria-label="Seek audio"
        disabled={disabled}
      />
      <span className="text-xs text-slate-600 w-12 text-left tabular-nums">
        {formatTime(duration)}
      </span>
      <audio ref={audioRef} src={audioUrl} preload="metadata">
        <track kind="captions" />
      </audio>
    </section>
  );
}
