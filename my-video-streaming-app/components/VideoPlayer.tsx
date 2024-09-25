"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface VideoPlayerProps {
  videoUrl: string
  title: string
  videoId: number
}

export default function VideoPlayer({ videoUrl, title, videoId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }, [])

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [handleLoadedMetadata, handleTimeUpdate, handleFullscreenChange])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let viewCountTimeout: NodeJS.Timeout

    const startViewCountTimer = () => {
      viewCountTimeout = setTimeout(() => {
        incrementViewCount()
      }, 10000)
    }

    const stopViewCountTimer = () => {
      clearTimeout(viewCountTimeout)
    }

    const incrementViewCount = async () => {
      try {
        await fetch(`/api/videos/${videoId}/increment-view`, {
          method: 'POST',
        })
      } catch (error) {
        console.error('Error incrementing view count:', error)
      }
    }

    video.addEventListener('play', startViewCountTimer)
    video.addEventListener('pause', stopViewCountTimer)
    video.addEventListener('ended', stopViewCountTimer)

    return () => {
      video.removeEventListener('play', startViewCountTimer)
      video.removeEventListener('pause', stopViewCountTimer)
      video.removeEventListener('ended', stopViewCountTimer)
    }
  }, [videoId])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
      setVolume(isMuted ? videoRef.current.volume : 0)
    }
  }, [isMuted])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  const handlePlaybackSpeedChange = useCallback((speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
    }
  }, [])

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0 relative group">
        <video
          ref={videoRef}
          className="w-full h-auto cursor-pointer"
          onClick={togglePlay}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          title={title}
          src={videoUrl}
          controlsList={isFullscreen ? "nodownload" : undefined}
          id={`video-${videoId}`}
        >
          Your browser does not support the video tag.
        </video>
        {!isPlaying && (
          <Button
            size="lg"
            variant="ghost"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-8 hover:bg-opacity-75 transition-all"
            onClick={togglePlay}
          >
            <Play className="h-12 w-12" />
            <span className="sr-only">Play video</span>
          </Button>
        )}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={(newValue: number[]) => {
              if (videoRef.current) {
                videoRef.current.currentTime = newValue[0]
                setCurrentTime(newValue[0])
              }
            }}
            className="w-full mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" onClick={togglePlay} className="text-white">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime -= 10
                  }
                }}
                className="text-white"
              >
                <SkipBack className="h-4 w-4" />
                <span className="sr-only">Skip backward 10 seconds</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime += 10
                  }
                }}
                className="text-white"
              >
                <SkipForward className="h-4 w-4" />
                <span className="sr-only">Skip forward 10 seconds</span>
              </Button>
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" onClick={toggleMute} className="text-white">
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={(newValue: number[]) => handleVolumeChange(newValue[0])}
                className="w-24"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-white">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handlePlaybackSpeedChange(0.5)}>0.5x</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePlaybackSpeedChange(1)}>1x</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePlaybackSpeedChange(1.5)}>1.5x</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePlaybackSpeedChange(2)}>2x</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="ghost" onClick={toggleFullscreen} className="text-white">
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                <span className="sr-only">{isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}