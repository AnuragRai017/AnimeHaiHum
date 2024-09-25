import React from 'react'
import VideoUploadForm from '../components/VideoUploadForm'
import Navbar from '../components/Navbar'

const UploadPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Upload Video</h1>
        <div className="max-w-2xl mx-auto">
          <VideoUploadForm />
        </div>
      </main>
    </div>
  )
}

export default UploadPage