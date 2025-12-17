import { Moon, Sun } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const buttonRef = useRef<HTMLButtonElement>(null)

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light"

        // Check if View Transitions API is supported
        if (!document.startViewTransition) {
            setTheme(newTheme)
            return
        }

        // Get button position for animation origin
        const rect = buttonRef.current?.getBoundingClientRect()
        const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
        const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2

        // Calculate the radius needed to cover the entire screen
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        )

        // Start view transition
        document.startViewTransition(async () => {
            setTheme(newTheme)
        }).ready.then(() => {
            const clipPath = [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
            ]

            document.documentElement.animate(
                {
                    clipPath: clipPath,
                },
                {
                    duration: 500,
                    easing: "ease-in-out",
                    pseudoElement: "::view-transition-new(root)",
                }
            )
        })
    }

    return (
        <Button ref={buttonRef} variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
