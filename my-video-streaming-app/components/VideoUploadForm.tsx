import { useState } from 'react'
import axios from 'axios'
import { UploadIcon } from 'lucide-react'

const VideoUploadForm = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('description', description)

    try {
      const token = localStorage.getItem('access_token')
      await axios.post('http://localhost:8001/upload/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1))
          setUploadProgress(percentCompleted)
        },
      })
      alert('Video uploaded successfully')
      setTitle('')
      setDescription('')
      setFile(null)
    } catch (error) {
      console.error(error)
      alert('Error uploading video')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title"
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter video description"
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="file" className="block text-gray-700 text-sm font-bold mb-2">
          Upload File
        </label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">MP4, WebM or OGG (MAX. 800MB)</p>
            </div>
            <input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              required
              className="hidden"
              accept="video/*"
            />
          </label>
        </div>
        {file && (
          <p className="mt-2 text-sm text-gray-500">
            Selected file: {file.name}
          </p>
        )}
      </div>
      
      {isUploading && (
        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className={`bg-blue-600 h-2.5 rounded-full progress-bar-${uploadProgress}`}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Upload progress: {uploadProgress}%</p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isUploading}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </div>
    </form>
  )
}

export default VideoUploadForm