import * as React from "react"
import { cn } from "@/lib/utils"

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full max-w-5xl mx-auto px-4 sm:px-6", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = "Container"