'use client'

import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { Menu, X, Home, PlayCircle, LogOut, User, Film, Search } from 'lucide-react'

const Navbar = () => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    router.push('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/continue-watching', label: 'Continue Watching', icon: PlayCircle },
    { href: '/videos/', label: 'All Videos', icon: Film },
    { href: '/users/{user_id}/profiles/', label: 'Profile', icon: User },
  ]

  interface NavLinkProps {
    href: string
    label: string
    icon: React.ComponentType
    className?: string
  }

  const NavLink: React.FC<NavLinkProps> = ({ href, label, icon: Icon }) => {
    const isActive = router.pathname === href
    return (
      <Link
        href={href}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
          isActive
            ? 'bg-gray-900 text-white'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5 mr-2" aria-hidden="true" />
        {label}
      </Link>
    )
  }

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl">
                StreamVerse
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="mr-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-700 text-white rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            </form>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
            <form onSubmit={handleSearch} className="mt-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            </form>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white mt-3"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar