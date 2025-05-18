import { cn } from "@/lib/utils";
import { Download, FastForward, Pause, Play, Rewind, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

/**
 * AudioPlayer component for interview audio playback.
 *
 * @param audioUrl - The URL of the audio file to play.
 * @param disabled - If true, the player is visually disabled and non-interactive.
 */
export function AudioPlayer({
  audioUrl,
  disabled,
}: {
  audioUrl?: string;
  disabled?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

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
      try {
        const playPromise = audioRef.current.play();
        // Handle browsers where play() returns a promise
        if (playPromise !== undefined && typeof playPromise.catch === "function") {
          playPromise.catch((error) => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
          });
        }
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, disabled]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (disabled) return;
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current || disabled) return;

    const rect = progressBarRef.current.getBoundingClientRect();

    // Calculate the click position relative to the progress bar
    // Use clientX - rect.left to get the horizontal position within the bar
    const clickX = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const percent = clickX / rect.width;
    const value = percent * duration;

    audioRef.current.currentTime = value;
    setProgress(value);
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current || disabled) return;
    const newTime = Math.min(Math.max(0, audioRef.current.currentTime + seconds), duration);
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleDownload = () => {
    if (!audioUrl || disabled) return;
    const link = document.createElement("a");
    link.href = audioUrl;
    // Extract filename from URL or set a default.
    // This will try to get the part after the last '/' or '?'
    let filename = "downloaded_audio";
    try {
      const urlObj = new URL(audioUrl);
      const pathParts = urlObj.pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart) {
        filename = lastPart;
      }
    } catch (e) {
      // If URL parsing fails, fallback to a simpler method or keep default
      const simpleMatch = audioUrl.substring(audioUrl.lastIndexOf("/") + 1).split("?")[0];
      if (simpleMatch) {
        filename = simpleMatch;
      }
    }
    // Ensure a fallback extension if none is present
    if (!filename.includes(".")) {
      // A common audio extension, adjust if more specific type is known
      filename += ".mp3";
    }

    link.setAttribute("download", filename);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.setAttribute("type", "audio/mpeg");
    link.setAttribute("referrerpolicy", "no-referrer");
    link.setAttribute("href", audioUrl);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        "fixed bottom-0 left-0 w-full z-50 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 flex items-center px-6 py-3 shadow-lg transition-all duration-200",
        disabled ? "opacity-50 pointer-events-none select-none" : "pointer-events-auto"
      )}
      aria-label="Interview audio player"
    >
      <div className="container mx-auto flex items-center justify-between max-w-6xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSkip(-10)}
            className={cn(
              "p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
              disabled && "cursor-not-allowed opacity-50"
            )}
            aria-label="Rewind 10 seconds"
            disabled={disabled}
            type="button"
          >
            <Rewind className="w-5 h-5" />
          </button>

          <button
            onClick={handlePlayPause}
            className={cn(
              "p-3 rounded-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 transition-all scale-100 hover:scale-105 active:scale-95",
              disabled && "cursor-not-allowed opacity-70 hover:bg-blue-600 dark:hover:bg-blue-500"
            )}
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
            disabled={disabled}
            type="button"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={() => handleSkip(10)}
            className={cn(
              "p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
              disabled && "cursor-not-allowed opacity-50"
            )}
            aria-label="Fast-forward 10 seconds"
            disabled={disabled}
            type="button"
          >
            <FastForward className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 mx-6">
          <div className="flex items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right mr-2 tabular-nums font-medium">
              {formatTime(progress)}
            </span>

            <div
              ref={progressBarRef}
              onClick={(e) => {
                e.stopPropagation();
                handleSeek(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (!progressBarRef.current) return;
                  const rect = progressBarRef.current.getBoundingClientRect();
                  const percent = 0.5; // Jump to middle on keyboard activation
                  const value = percent * duration;
                  if (audioRef.current) {
                    audioRef.current.currentTime = value;
                    setProgress(value);
                  }
                }
              }}
              tabIndex={disabled ? -1 : 0}
              className={cn(
                "flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer group relative",
                disabled && "cursor-not-allowed"
              )}
              role="progressbar"
              aria-label="Audio progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={(progress / duration) * 100 || 0}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-full h-full bg-gray-300/50 dark:bg-gray-600/50 backdrop-blur-sm" />
              </div>
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 relative overflow-hidden rounded-full group-hover:shadow-md transition-all"
                style={{ width: `${(progress / duration) * 100 || 0}%` }}
              >
                <div className="absolute top-0 right-0 w-3 h-3 bg-white dark:bg-gray-100 rounded-full shadow-md transform translate-x-1/2 -translate-y-1/4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-left ml-2 tabular-nums font-medium">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className="relative flex items-center"
            onMouseEnter={() => setShowVolumeControl(true)}
            onMouseLeave={() => setShowVolumeControl(false)}
          >
            <button
              onClick={toggleMute}
              className={cn(
                "p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                disabled && "cursor-not-allowed opacity-50"
              )}
              aria-label={isMuted ? "Unmute" : "Mute"}
              disabled={disabled}
              type="button"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            {showVolumeControl && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className={cn(
                    "w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500",
                    disabled && "cursor-not-allowed"
                  )}
                  aria-label="Volume control"
                  disabled={disabled}
                />
              </div>
            )}
          </div>

          <Button
            onClick={handleDownload}
            className={cn(
              "p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
              disabled && "cursor-not-allowed opacity-50"
            )}
            aria-label="Download audio"
            disabled={!audioUrl || disabled}
            type="button"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata">
        <track kind="captions" />
      </audio>
    </section>
  );
}
