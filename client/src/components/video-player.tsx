import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react";
import { type Movie } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

export function VideoPlayer({ isOpen, onClose, movie }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  const recordViewMutation = useMutation({
    mutationFn: (movieId: string) => apiRequest("POST", `/api/movies/${movieId}/view`),
  });

  useEffect(() => {
    if (isOpen && movie && movie.filePath) {
      // Only record view if movie has a valid file path
      recordViewMutation.mutate(movie.id);
    }
  }, [isOpen, movie]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("ended", handleEnded);
    };
  }, [movie]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const player = document.querySelector('[data-testid="video-player-container"]');
    if (!player) return;

    if (!isFullscreen) {
      player.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  if (!movie) return null;

  // Check if movie has a valid file path
  if (!movie.filePath) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-gray-800 border-gray-700 text-white">
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Video Not Available</h3>
            <p className="text-gray-300 mb-6">
              This movie doesn't have a video file associated with it yet.
            </p>
            <Button onClick={onClose} className="bg-dotbyte-red hover:bg-red-700">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const videoSrc = `/api/videos/${movie.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-none w-full h-full p-0 bg-black border-none"
        data-testid="video-player-container"
      >
        <div 
          className="relative w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 bg-black/50 hover:bg-black/70"
            onClick={onClose}
            data-testid="close-player-btn"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={videoSrc}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            data-testid="video-element"
          />

          {/* Controls Overlay */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
            data-testid="video-controls"
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full"
                data-testid="progress-slider"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="p-2 hover:bg-white/20 rounded-full"
                  data-testid="play-pause-btn"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skip(-10)}
                  className="p-2 hover:bg-white/20 rounded-full"
                  data-testid="skip-back-btn"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skip(10)}
                  className="p-2 hover:bg-white/20 rounded-full"
                  data-testid="skip-forward-btn"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>

                <span className="text-sm" data-testid="current-time">
                  {formatTime(currentTime)}
                </span>
                <span className="text-sm text-gray-300">
                  / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/20 rounded-full hidden md:block"
                  data-testid="mute-btn"
                >
                  {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                <div className="w-24 hidden md:block" data-testid="volume-slider">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/20 rounded-full"
                  data-testid="fullscreen-btn"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Movie Title Overlay */}
          <div 
            className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <h2 className="text-2xl font-bold text-white" data-testid="video-title">
              {movie.title}
            </h2>
            {movie.description && (
              <p className="text-gray-300 mt-2" data-testid="video-description">
                {movie.description}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
