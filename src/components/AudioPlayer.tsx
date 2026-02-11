"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react";

type Props = {
  audioFiles: { file_name: string; surah_name_ar: string | null; reciter_ar: string | null }[];
  audioBaseUrl: string;
};

export default function AudioPlayer({ audioFiles, audioBaseUrl }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState<(typeof audioFiles)[0] | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const getUrl = useCallback(
    (fileName: string) => `${audioBaseUrl}/${fileName}`,
    [audioBaseUrl]
  );

  const pickRandom = useCallback(() => {
    const idx = Math.floor(Math.random() * audioFiles.length);
    return audioFiles[idx];
  }, [audioFiles]);

  const loadTrack = useCallback(
    (track: (typeof audioFiles)[0]) => {
      setCurrent(track);
      setProgress(0);
      setDuration(0);
      if (audioRef.current) {
        audioRef.current.src = getUrl(track.file_name);
        audioRef.current.load();
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      }
    },
    [getUrl]
  );

  useEffect(() => {
    if (audioFiles.length > 0 && !current) {
      const track = pickRandom();
      setCurrent(track);
      if (audioRef.current) {
        audioRef.current.src = getUrl(track.file_name);
      }
    }
  }, [audioFiles, current, pickRandom, getUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => loadTrack(pickRandom());
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [loadTrack, pickRandom]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onTime);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onTime);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const skip = () => loadTrack(pickRandom());

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = val;
    setProgress(val);
  };

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full rounded-2xl bg-primary p-4 shadow-xl">
      <audio ref={audioRef} preload="auto" />

      <div className={`flex items-end justify-center gap-1 mb-3 h-6 ${!playing ? "audio-bars-paused" : ""}`}>
        {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((bar, i) => (
          <div
            key={i}
            className={`w-1 rounded-full bg-cream audio-bar-${bar}`}
            style={{ height: "8px" }}
          />
        ))}
      </div>

      <div className="mb-3 flex items-center gap-3 text-xs text-cream/60" dir="ltr">
        <span className="w-8 text-left">{fmt(progress)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={progress}
          onChange={seek}
          step={0.1}
          className="flex-1"
        />
        <span className="w-8 text-right">{fmt(duration)}</span>
      </div>

      <div className="flex items-center justify-center gap-5">
        <button
          onClick={() => { setMuted(!muted); if (audioRef.current) audioRef.current.muted = !muted; }}
          className="text-cream/50 hover:text-cream transition"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button
          onClick={togglePlay}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-primary shadow-lg transition hover:opacity-80"
        >
          {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
        </button>
        <button onClick={skip} className="text-cream/50 hover:text-cream transition">
          <SkipForward size={18} />
        </button>
      </div>

      <button onClick={skip} className="mt-4 flex items-center justify-center gap-1 text-xs text-cream/40 hover:text-cream/70 transition w-full">
        <SkipForward size={12} />
        <span>السورة التالية</span>
      </button>
    </div>
  );
}
