import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const links = [
  { label: "痛點", href: "#pain-points" },
  { label: "架構", href: "#architecture" },
  { label: "功能", href: "#features" },
  { label: "情境", href: "#scenarios" },
  { label: "AI 團隊", href: "#ai-team" },
  { label: "藍圖", href: "#roadmap" },
  { label: "價值", href: "#value" },
];

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-4 left-4 right-4 z-50 rounded-xl border border-slate-200/80 shadow-card transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-xl" : "bg-white/80 backdrop-blur-md"
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        <a href="#" className="font-heading text-xl font-bold text-gradient-primary">
          CORA
        </a>
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-600 hover:text-brand-600 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;
