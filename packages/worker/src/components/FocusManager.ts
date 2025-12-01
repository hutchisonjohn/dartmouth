/**
 * Focus Manager
 * 
 * Utility for managing chat input focus and preventing page scroll.
 * Implements Section 5.1.10 from AGENT_ARMY_SYSTEM.md
 * 
 * This is a utility class that can be used in React hooks or vanilla JS.
 */

export class FocusManager {
  private element: HTMLElement | null = null
  private isEnabled: boolean = true

  /**
   * Initialize focus manager with a target element
   */
  init(element: HTMLElement): void {
    this.element = element
    this.attachListeners()
  }

  /**
   * Enable focus management
   */
  enable(): void {
    this.isEnabled = true
  }

  /**
   * Disable focus management
   */
  disable(): void {
    this.isEnabled = false
  }

  /**
   * Focus the element without scrolling the page
   */
  focus(): void {
    if (!this.element || !this.isEnabled) return

    // Prevent scroll by using preventScroll option
    this.element.focus({ preventScroll: true })

    // Ensure element is in view without scrolling the page
    this.scrollIntoViewIfNeeded()
  }

  /**
   * Attach event listeners to maintain focus
   */
  private attachListeners(): void {
    if (!this.element) return

    // Re-focus on blur (unless user explicitly clicked elsewhere)
    this.element.addEventListener('blur', (e) => {
      if (!this.isEnabled) return

      // Only re-focus if blur wasn't caused by user interaction
      const relatedTarget = (e as FocusEvent).relatedTarget as HTMLElement
      if (!relatedTarget) {
        // Blur without a new focus target - re-focus after a brief delay
        setTimeout(() => this.focus(), 10)
      }
    })

    // Prevent parent scroll during typing
    this.element.addEventListener('keydown', (e) => {
      if (!this.isEnabled) return

      // Prevent scroll on arrow keys if at boundaries
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const textarea = this.element as HTMLTextAreaElement
        if (textarea.scrollHeight <= textarea.clientHeight) {
          e.preventDefault()
        }
      }
    })
  }

  /**
   * Scroll element into view only if needed, without scrolling the page
   */
  private scrollIntoViewIfNeeded(): void {
    if (!this.element) return

    const rect = this.element.getBoundingClientRect()
    const isInView = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    )

    if (!isInView) {
      this.element.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    this.element = null
    this.isEnabled = false
  }
}

/**
 * React Hook version (type definitions only - implementation in React package)
 * 
 * Usage:
 * ```tsx
 * const textareaRef = useFocusManager({ autoFocus: true })
 * return <textarea ref={textareaRef} />
 * ```
 */
export interface UseFocusManagerOptions {
  autoFocus?: boolean
  maintainFocus?: boolean
  preventScroll?: boolean
}

export type UseFocusManagerReturn = {
  ref: (element: HTMLElement | null) => void
  focus: () => void
  blur: () => void
}

/**
 * Vanilla JS helper for chat inputs
 */
export function createChatFocusManager(
  inputElement: HTMLElement,
  options: UseFocusManagerOptions = {}
): FocusManager {
  const manager = new FocusManager()
  manager.init(inputElement)

  if (options.autoFocus) {
    manager.focus()
  }

  return manager
}

