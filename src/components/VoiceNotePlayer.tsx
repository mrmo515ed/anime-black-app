import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";

interface VoiceNotePlayerProps {
  url: string;
  isMe: boolean;
  isArabic: boolean;
  durationLabel?: string;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  url,
  isMe,
  isArabic,
  durationLabel = "0:05"
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Parse duration label (e.g. "0:05" -> 5 seconds) to set initial state if needed
  useEffect(() => {
    if (durationLabel) {
      const parts = durationLabel.split(":");
      if (parts.length === 2) {
        const secs = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        if (!isNaN(secs)) {
          setDuration(secs);
        }
      }
    }
  }, [durationLabel]);

  // Lazy initialize audio when user interacts or on mount
  const getAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio(url);
      audio.preload = "metadata";
      
      audio.addEventListener("loadedmetadata", () => {
        if (audio.duration && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
        setIsLoaded(true);
        setIsLoading(false);
      });

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audio.addEventListener("pause", () => {
        setIsPlaying(false);
      });

      audio.addEventListener("play", () => {
        setIsPlaying(true);
      });

      audioRef.current = audio;
    }
    return audioRef.current;
  };

  // Listen to global play events to stop other instances from playing simultaneously
  useEffect(() => {
    const handleGlobalPlay = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.url !== url) {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    window.addEventListener("shinobi-voice-play", handleGlobalPlay);
    return () => {
      window.removeEventListener("shinobi-voice-play", handleGlobalPlay);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [url]);

  const togglePlay = async () => {
    const audio = getAudio();
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Notify all other audio players to pause
      window.dispatchEvent(
        new CustomEvent("shinobi-voice-play", { detail: { url } })
      );

      setIsLoading(!isLoaded);
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Failed to play audio:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = getAudio();
    const targetTime = parseFloat(e.target.value);
    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const toggleMute = () => {
    const audio = getAudio();
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Format time (e.g. 74 seconds -> "1:14")
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      className={`mt-2.5 w-full max-w-[290px] rounded-2xl p-3 border shadow-sm transition-all duration-200 ${
        isMe
          ? "bg-gradient-to-br from-zinc-900 to-black border-white/10 text-white"
          : "bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800/80 text-zinc-100"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-150 active:scale-90 shadow-md ${
            isPlaying 
              ? "bg-[#FF3D00] text-white hover:bg-orange-600 ring-2 ring-[#FF3D00]/20" 
              : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white"
          }`}
          title={isPlaying ? (isArabic ? "إيقاف مؤقت" : "Pause") : (isArabic ? "تشغيل" : "Play")}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Dynamic Waveform Simulator & Progress Slider */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <div className="relative flex items-center group w-full">
            {/* Interactive Progress Bar */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#FF3D00] transition-colors focus:outline-none"
              style={{
                background: `linear-gradient(to right, #FF3D00 0%, #FF3D00 ${
                  duration ? (currentTime / duration) * 100 : 0
                }%, #27272a ${duration ? (currentTime / duration) * 100 : 0}%, #27272a 100%)`
              }}
            />
          </div>

          {/* Time duration tracker */}
          <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono tracking-wider">
            <span>{formatTime(currentTime)}</span>
            <span className="flex items-center gap-1.5 font-bold">
              {isPlaying && (
                <span className="flex items-center gap-0.5 shrink-0 px-1">
                  <span className="w-0.5 h-2.5 bg-[#FF3D00] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-0.5 h-3.5 bg-[#FF3D00] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-0.5 h-2 bg-[#FF3D00] rounded-full animate-bounce" />
                </span>
              )}
              <span>{formatTime(duration)}</span>
            </span>
          </div>
        </div>

        {/* Mute toggle button */}
        <button
          onClick={toggleMute}
          className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800/40 shrink-0 transition-all cursor-pointer"
          title={isMuted ? (isArabic ? "إلغاء الكتم" : "Unmute") : (isArabic ? "كتم الصوت" : "Mute")}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? "text-[#FF3D00] animate-pulse" : ""}`} />
          )}
        </button>
      </div>
    </div>
  );
};
