"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position || "top-right"
    if (!acc[position]) {
      acc[position] = []
    }
    acc[position].push(toast)
    return acc
  }, {} as Record<string, typeof toasts>)

  return (
    <ToastProvider>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div key={position}>
          {positionToasts.map(function ({ id, title, description, action, ...props }) {
            return (
              <Toast key={id} {...props}>
                <div className="grid gap-1">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
                {action}
                <ToastClose />
              </Toast>
            )
          })}
          <ToastViewport position={position as "top-right" | "bottom-right" | "top-left" | "bottom-left"} />
        </div>
      ))}
    </ToastProvider>
  )
}
