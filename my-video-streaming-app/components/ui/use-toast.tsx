import React, { createContext, useContext, useState } from 'react'
import { X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

const ToastContext = createContext<{
  showToast: (props: ToastProps) => void
}>({
  showToast: () => {},
})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastProps | null>(null)

  const showToast = ({ message, type = 'info', duration = 3000 }: ToastProps) => {
    setToast({ message, type, duration })
    setTimeout(() => setToast(null), duration)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg text-white ${
            toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'
          }`}
          role="alert"
        >
          <div className="flex items-center justify-between">
            <p>{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-4 text-white hover:text-gray-200 focus:outline-none"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const Toast = {
  useShowToast: (props: ToastProps) => {
    const context = useContext(ToastContext)
    context.showToast(props)
  }
}