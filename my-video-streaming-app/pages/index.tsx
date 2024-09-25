import React from 'react'
import Navbar from '../components/Navbar'
import Link from 'next/link'
import { Play, Tv, Upload } from 'lucide-react'
import Image from 'next/image'; // Add this import



const FeaturedVideo = () => (
  <div className="relative h-96 bg-gray-900">
    <Image
      src="/placeholder.svg?height=384&width=768"
      alt="Featured video thumbnail"
      layout="fill" // Add layout prop for responsive behavior
      objectFit="cover" // Add objectFit for proper image scaling
    />
    <div className="absolute inset-0 flex flex-col justify-center items-start p-8">
      <h2 className="text-4xl font-bold text-white mb-4">Featured Video Title</h2>
      <p className="text-lg text-gray-200 mb-6">A brief description of the featured video goes here. It is engaging and makes you want to watch!</p>
      <Link href="/watch/featured-video-id" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
        <Play className="w-4 h-4 mr-2" />
        Watch Now
      </Link>
    </div>
  </div>
)

interface CategorySectionProps {
  title: string;
  videos: { id: string; title: string; views: string }[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, videos }) => (
  <section className="py-8">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video, index) => (
        <Link key={index} href={`/watch/${video.id}`} className="group">
          <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
          <Image
  src={`/placeholder.svg?height=180&width=320&text=${encodeURIComponent(video.title)}`}
  alt={video.title}
  width={320} // Specify width
  height={180} // Specify height
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
/>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-200 flex items-center justify-center">
              <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
          <h3 className="mt-2 text-lg font-semibold">{video.title}</h3>
          <p className="text-sm text-gray-600">{video.views} views</p>
        </Link>
      ))}
    </div>
  </section>
)

const HomePage = () => {
  const trendingVideos = [
    { id: '1', title: 'Amazing Nature Documentary', views: '1.2M' },
    { id: '2', title: 'Cooking Masterclass', views: '890K' },
    { id: '3', title: 'Space Exploration', views: '2.5M' },
    { id: '4', title: 'Fitness Workout Routine', views: '750K' },
  ]

  const recommendedVideos = [
    { id: '5', title: 'Learn React in 1 Hour', views: '500K' },
    { id: '6', title: 'Travel Vlog: Paris', views: '1.8M' },
    { id: '7', title: 'DIY Home Improvement', views: '320K' },
    { id: '8', title: 'Relaxing Music Compilation', views: '3.2M' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main>
        <FeaturedVideo />
        <div className="container mx-auto px-4">
          <section className="py-12">
            <h1 className="text-4xl font-bold mb-8">Welcome to StreamVerse</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <Tv className="w-12 h-12 text-blue-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Watch Anywhere</h2>
                <p className="text-gray-600">Enjoy your favorite content on any device, anytime.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <Upload className="w-12 h-12 text-green-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Upload Your Videos</h2>
                <p className="text-gray-600">Share your creativity with the world. Start uploading now!</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <Play className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Discover New Content</h2>
                <p className="text-gray-600">Explore a wide range of videos from creators worldwide.</p>
              </div>
            </div>
          </section>
          <CategorySection title="Trending Now" videos={trendingVideos} />
          <CategorySection title="Recommended for You" videos={recommendedVideos} />
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">StreamVerse</h3>
              <p className="text-gray-400">Your go-to platform for amazing video content.</p>
            </div>
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div className="w-full md:w-1/3">
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white" title="Link description">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white" title="Link description">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white" title="Link description">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            <p>&copy; 2024 StreamVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage