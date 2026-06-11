"use client";

import { ChevronUpIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const SCROLL_TOP_THRESHOLD = 240;

export function ScrollTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > SCROLL_TOP_THRESHOLD);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="default"
      size="icon-lg"
      aria-label="맨 위로 이동"
      className="fixed right-4 bottom-4 z-50 rounded-full border-primary/20 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 sm:right-6 sm:bottom-6"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <ChevronUpIcon aria-hidden="true" />
    </Button>
  );
}
