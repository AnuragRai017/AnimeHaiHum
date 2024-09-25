import React from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import VideoList from '../components/VideoList'

const VideosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Video Library - StreamVerse</title>
        <meta name="description" content="Browse our collection of videos on StreamVerse" />
      </Head>
      <Navbar />
      <main>
        <VideoList />
      </main>
    </div>
  )
}

export default VideosPage