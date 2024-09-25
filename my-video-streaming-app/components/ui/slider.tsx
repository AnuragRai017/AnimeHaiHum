"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showTooltip?: boolean
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, showTooltip = true, ...props }, ref) => {
  const [hoveredValue, setHoveredValue] = React.useState<number | null>(null)

  return (
    <SliderPrimitive.Root
      ref={ref}
      onMouseEnter={() => setHoveredValue(props.value?.[0] ?? null)}
      onMouseLeave={() => setHoveredValue(null)}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className="relative h-2 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300"
      >
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      </SliderPrimitive.Track>
      <AnimatePresence>
        {showTooltip && hoveredValue !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-sm"
          >
            {hoveredValue}
          </motion.div>
        )}
      </AnimatePresence>
      <SliderPrimitive.Thumb
        className="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-lg ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110"
      >
        <motion.div
          className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        />
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }