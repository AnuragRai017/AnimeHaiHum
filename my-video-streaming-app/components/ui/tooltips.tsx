"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { motion, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  backgroundImageUrl?: string
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 4, backgroundImageUrl, ...props }, ref) => {
  const controls = useAnimation()

  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      onEscapeKeyDown={() => controls.start("exit")}
      onPointerDownOutside={() => controls.start("exit")}
      className={cn(
        "z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      <motion.div
        initial="initial"
        animate={controls}
        exit="exit"
        variants={{
          initial: { opacity: 0, scale: 0.9 },
          enter: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 },
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          background: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'rgba(255, 255, 255, 0.1)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
        className="p-4 rounded-md"
      >
        <div className="relative z-10 text-white text-shadow">
          {props.children}
        </div>
      </motion.div>
    </TooltipPrimitive.Content>
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }