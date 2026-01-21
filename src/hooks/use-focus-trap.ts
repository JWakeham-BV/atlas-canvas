import { useEffect, useRef, useCallback, type RefObject } from "react";

interface UseFocusTrapOptions<T extends HTMLElement> {
  /** Whether the focus trap is active */
  isActive: boolean;
  /** Callback when Escape is pressed */
  onEscape?: () => void;
  /** Delay before auto-focusing the first element (ms). Set to 0 to disable auto-focus. */
  autoFocusDelay?: number;
  /** Whether to restore focus to the previously focused element on deactivation */
  restoreFocus?: boolean;
  /** Optional external ref to use instead of creating a new one */
  containerRef?: RefObject<T>;
}

/**
 * A hook that traps focus within a container element.
 * 
 * Features:
 * - Traps Tab/Shift+Tab navigation within the container
 * - Optionally handles Escape key
 * - Auto-focuses the first focusable element when activated (unless autoFocusDelay is 0)
 * - Restores focus to the previously focused element when deactivated
 * 
 * @example
 * ```tsx
 * // Option 1: Let the hook create the ref
 * function Modal({ isOpen, onClose }) {
 *   const containerRef = useFocusTrap({
 *     isActive: isOpen,
 *     onEscape: onClose,
 *     restoreFocus: true,
 *   });
 *   return <div ref={containerRef}>...</div>;
 * }
 * 
 * // Option 2: Provide your own ref
 * function Drawer({ isOpen, onClose }) {
 *   const myRef = useRef<HTMLDivElement>(null);
 *   useFocusTrap({
 *     isActive: isOpen,
 *     onEscape: onClose,
 *     containerRef: myRef,
 *   });
 *   return <div ref={myRef}>...</div>;
 * }
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  isActive,
  onEscape,
  autoFocusDelay = 100,
  restoreFocus = true,
  containerRef: externalRef,
}: UseFocusTrapOptions<T>) {
  const internalRef = useRef<T>(null);
  const containerRef = externalRef || internalRef;
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    
    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
    ].join(', ');
    
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(selector)
    ).filter((el) => {
      // Check if element is visible
      return el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0;
    });
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element
    if (restoreFocus) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
    }

    // Auto-focus the first focusable element after a delay (unless disabled)
    let focusTimer: ReturnType<typeof setTimeout> | undefined;
    if (autoFocusDelay > 0) {
      focusTimer = setTimeout(() => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }, autoFocusDelay);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape
      if (e.key === "Escape" && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab for focus trapping
      if (e.key === "Tab") {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Check if focus is currently outside the container (shouldn't happen, but safety check)
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
        
        if (e.shiftKey) {
          // Shift+Tab: moving backwards
          if (document.activeElement === firstElement || currentIndex === -1) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: moving forwards
          if (document.activeElement === lastElement || currentIndex === -1) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // Use capture phase to intercept events before they reach other handlers
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      if (focusTimer) clearTimeout(focusTimer);
    };
  }, [isActive, onEscape, autoFocusDelay, getFocusableElements, restoreFocus]);

  // Restore focus when deactivated
  useEffect(() => {
    if (!isActive && restoreFocus && previouslyFocusedRef.current) {
      // Small delay to ensure the element is still in the DOM
      const restoreTimer = setTimeout(() => {
        previouslyFocusedRef.current?.focus();
        previouslyFocusedRef.current = null;
      }, 0);
      
      return () => clearTimeout(restoreTimer);
    }
  }, [isActive, restoreFocus]);

  return containerRef;
}
