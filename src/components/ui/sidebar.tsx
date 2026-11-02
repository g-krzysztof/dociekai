"use client"

import * as React from "react"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: "left" | "right"
    variant?: "default" | "floating" | "inset"
    collapsible?: "icon" | "none"
  }
>(({ className, side = "left", variant = "default", collapsible = "none", ...props }, ref) => {
  const { isOpen } = React.useContext(SidebarProvider) || { isOpen: true }
  
  return (
    <div
      ref={ref}
      data-side={side}
      data-variant={variant}
      data-state={isOpen ? "expanded" : "collapsed"}
      className={cn(
        // Base styles
        "flex h-full flex-col bg-background transition-all duration-300",
        // Border based on side
        side === "left" ? "border-r" : "border-l",
        // Width based on state
        isOpen ? "w-80" : collapsible === "icon" ? "w-16" : "w-0",
        // Variant styles
        variant === "floating" && "m-2 rounded-lg border shadow-md",
        variant === "inset" && "border-sidebar-border bg-sidebar",
        // Hidden when collapsed and not icon mode
        !isOpen && collapsible === "none" && "hidden",
        className
      )}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 flex-col gap-2 p-4 overflow-y-auto custom-scrollbar", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 px-4 py-2 border-b", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-auto border-t p-4", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string
  }
>(({ className, title, children, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props}>
    {title && (
      <h3 className="text-sm font-medium text-muted-foreground px-2">
        {title}
      </h3>
    )}
    <div className="space-y-1">{children}</div>
  </div>
))
SidebarSection.displayName = "SidebarSection"

const SidebarItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean
  }
>(({ className, active, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
      active
        ? "bg-accent text-accent-foreground"
        : "hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  />
))
SidebarItem.displayName = "SidebarItem"

const SidebarProvider = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: true,
  setIsOpen: () => {},
})

const SidebarRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultOpen?: boolean
  }
>(({ className, defaultOpen = true, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <SidebarProvider.Provider value={{ isOpen, setIsOpen }}>
      <div
        ref={ref}
        className={cn("flex h-full", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarProvider.Provider>
  )
})
SidebarRoot.displayName = "SidebarRoot"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { isOpen, setIsOpen } = useSidebar()
  
  return (
    <button
      ref={ref}
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-all duration-200",
        "bg-background hover:bg-accent hover:text-accent-foreground",
        "border border-border hover:border-accent-foreground/20 shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      {...props}
    >
      <PanelLeft className={cn(
        "h-4 w-4 transition-transform duration-200",
        !isOpen && "transform rotate-180"
      )} />
    </button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const useSidebar = () => {
  const context = React.useContext(SidebarProvider)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarSection,
  SidebarItem,
  SidebarRoot,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}