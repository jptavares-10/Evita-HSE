import { useRef, useState, useEffect } from "react";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, className: visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6", style: { transition: "opacity 0.6s ease, transform 0.6s ease" } };
}

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const r = useReveal();
  return (
    <div ref={r.ref} className={`${r.className} ${className}`} style={{ ...r.style, transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}
