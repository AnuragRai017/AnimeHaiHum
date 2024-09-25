import React from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import UserProfile from '@/components/UserProfile'
import Navbar from '@/components/Navbar'

const ProfilePage: NextPage = () => {
  const router = useRouter()

  React.useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return (
    <>
      <Head>
        <title>User Profile | StreamVerse</title>
        <meta name="description" content="View and manage your StreamVerse profile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <UserProfile />
      </main>

      <footer className="bg-gray-100 mt-8">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          © {new Date().getFullYear()} StreamVerse. All rights reserved.
        </div>
      </footer>
    </>
  )
}

export default ProfilePage