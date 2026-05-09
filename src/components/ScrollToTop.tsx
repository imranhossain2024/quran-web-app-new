"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function ScrollToTop() {
  const pathname = usePathname();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any pending scroll operations
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Scroll to top immediately for instant feedback
    window.scrollTo(0, 0);
    
    // Additional scroll after layout animations complete
    // This ensures the scrollbar works correctly after sidebar transitions
    scrollTimeoutRef.current = setTimeout(() => {
      window.scrollTo(0, 0);
      
      // Final check to ensure scroll position is correct
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    }, 350); // Wait for sidebar transition (300ms) + extra buffer

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [pathname]);

  return null;
}
