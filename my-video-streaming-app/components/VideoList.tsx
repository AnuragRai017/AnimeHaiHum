'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import Image from 'next/image'
import Rating from './ui/Rating'
import { useRouter } from 'next/router'
import { Heart, Plus, Play } from 'lucide-react'

interface Video {
  id: string
  title: string
  description: string
  file_path: string
  thumbnail_url: string | null
  rating: number | null
  userRating: number | null
  averageRating: number | null
  ratedAt: string | null
  userId: string | null
}

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem('access_token')
      setToken(storedToken)
    }
  }, [])

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:8001/videos/', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const videoData = await Promise.all(
          response.data.map(async (video: Video) => {
            if (token) {
              try {
                const userRatingResponse = await axios.get(
                  `http://localhost:8001/videos/${video.id}/user-rating/`,
                  { headers: { Authorization: `Bearer ${token}` } }
                )
                return {
                  ...video,
                  userRating: userRatingResponse.data.rating,
                  averageRating: video.rating || null,
                  ratedAt: userRatingResponse.data.rated_at,
                  userId: userRatingResponse.data.user_id,
                }
              } catch (ratingError: any) {
                if (ratingError.response?.status === 404) {
                  return {
                    ...video,
                    userRating: null,
                    averageRating: video.rating || null,
                    ratedAt: null,
                    userId: null,
                  }
                } else if (ratingError.response?.status === 401) {
                  console.error(`Unauthorized access for video ID ${video.id}:`, ratingError)
                  alert('Session expired. Please log in again.')
                  router.push('/login')
                } else {
                  console.error(`Error fetching rating for video ID ${video.id}:`, ratingError)
                }
                return video
              }
            }
            return video
          })
        )
        setVideos(videoData)
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            console.error('Unauthorized: Token invalid or expired.')
            alert('Session expired. Please log in again.')
            router.push('/login')
          } else {
            console.error('Error fetching videos:', err)
            setError('Failed to load videos. Please try again later.')
          }
        } else {
          console.error('Unexpected error:', err)
          setError('An unexpected error occurred. Please try again later.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchVideos()
    } else {
      axios.get('http://localhost:8001/videos/')
        .then(response => {
          setVideos(response.data)
          setIsLoading(false)
        })
        .catch((err: any) => {
          if (axios.isAxiosError(err)) {
            console.error('Error fetching videos:', err)
            setError('Failed to load videos. Please try again later.')
          } else {
            console.error('Unexpected error:', err)
            setError('An unexpected error occurred. Please try again later.')
          }
          setIsLoading(false)
        })
    }
  }, [token, router])

  const handleRatingSubmit = async (videoId: string, newRating: number) => {
    try {
      if (token) {
        await axios.post(
          `http://localhost:8001/videos/${videoId}/rate/`,
          { video_id: Number(videoId), rating: newRating },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setVideos((prevVideos) =>
          prevVideos.map((video) =>
            video.id === videoId ? { ...video, userRating: newRating } : video
          )
        )
        console.log(`Rating for video ${videoId} updated to ${newRating}`)
      } else {
        alert('You must be logged in to rate a video.')
        router.push('/login')
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          console.error('Unauthorized: Please log in again.', err)
          alert('Session expired. Please log in again.')
          router.push('/login')
        } else {
          console.error('Error submitting rating:', err)
          alert('Failed to submit rating. Please try again.')
        }
      } else {
        console.error('Unexpected error:', err)
        alert('An unexpected error occurred. Please try again.')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Video Library</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Video Library</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Video Library</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="relative group">
              <Image
                src={
                  video.thumbnail_url && video.thumbnail_url.startsWith('http')
                    ? video.thumbnail_url
                    : `http://localhost:8001/${video.thumbnail_url}`
                }
                alt={`Thumbnail for ${video.title}`}
                width={340}
                height={192}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Link href={`/watch/${video.id}`}>
                  <button className="bg-white text-black rounded-full p-3 hover:bg-opacity-80 transition-colors duration-300">
                    <Play className="w-6 h-6" />
                  </button>
                </Link>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 line-clamp-1">{video.title}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{video.description}</p>
              <div className="flex items-center justify-between mb-2">
                <Rating
                  initialRating={video.userRating || 0}
                  maxStars={5}
                  onValueChange={(newRating) => handleRatingSubmit(video.id, newRating)}
                />
                <span className="text-sm text-gray-500">
                  Avg: {video.averageRating?.toFixed(1) || 'N/A'}
                </span>
              </div>
              {video.ratedAt && (
                <p className="text-xs text-gray-500 mb-2">
                  Rated on: {new Date(video.ratedAt).toLocaleDateString()}
                </p>
              )}
              <div className="flex justify-between items-center mt-4">
                <Link
                  href={`/watch/${video.id}`}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Watch Now
                </Link>
                <div className="flex space-x-2">
                  <button className="text-gray-500 hover:text-red-500 transition duration-300">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="text-gray-500 hover:text-green-500 transition duration-300">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VideoList