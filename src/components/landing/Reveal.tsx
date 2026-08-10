import { useRef, useState, useEffect } from "react";

type RevealVariant = "up" | "down" | "left" | "right" | "blur" | "scale" | "fade";

const HIDDEN: Record<RevealVariant, string> = {
  up: "opacity-0 translate-y-8",
  down: "opacity-0 -translate-y-8",
  left: "opacity-0 -translate-x-8",
  right: "opacity-0 translate-x-8",
  blur: "opacity-0 translate-y-6 blur-md",
  scale: "opacity-0 scale-[0.94]",
  fade: "opacity-0",
};

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  duration?: number;
}

export function Reveal({ children, className = "", delay = 0, variant = "up", duration = 0.8 }: RevealProps) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`${visible ? "opacity-100 translate-y-0 translate-x-0 scale-100 blur-0" : HIDDEN[variant]} ${className}`}
      style={{
        transition: `opacity ${duration}s cubic-bezier(0.16,1,0.3,1), transform ${duration}s cubic-bezier(0.16,1,0.3,1), filter ${duration}s ease`,
        transitionDelay: `${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
