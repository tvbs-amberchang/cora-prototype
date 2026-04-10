import { motion } from "framer-motion";
import { Fingerprint, BarChart3, MessageSquare, Send } from "lucide-react";

const modules = [
  {
    icon: Fingerprint,
    name: "Identity Core",
    label: "認人",
    description: "跨網域、跨裝置統一用戶身分識別。Web/App 跨端、匿名轉會員歸戶。",
    color: "primary",
  },
  {
    icon: BarChart3,
    name: "Data Core",
    label: "聽話",
    description: "即時收集所有觸點的行為數據，標準化儲存，支援受眾區隔與分群。",
    color: "accent",
  },
  {
    icon: MessageSquare,
    name: "Engagement Core",
    label: "對話",
    description: "規則引擎、受眾區隔、行銷活動模組。inline 模組、問卷、抽獎、簽到任務。",
    color: "primary",
  },
  {
    icon: Send,
    name: "Delivery Core",
    label: "傳話",
    description: "App Push、LINE OA、SMS、EDM 多渠道統一管理與遞送。",
    color: "accent",
  },
];

const ArchitectureSection = () => {
  return (
    <section id="architecture" className="py-24 md:py-32 relative bg-radial-glow">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            四層<span className="text-gradient-primary">架構</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            從「認人」到「傳話」，完整覆蓋行銷數據生命週期
          </p>
        </motion.div>

        {/* Flow line */}
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-4 gap-6 relative z-10">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.name}
                className="card-interactive relative flex flex-col items-center text-center p-6 rounded-2xl hover:border-primary/30"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                    mod.color === "primary" ? "bg-primary/10" : "bg-accent/10"
                  }`}
                >
                  <mod.icon
                    className={`w-7 h-7 ${
                      mod.color === "primary" ? "text-primary" : "text-accent"
                    }`}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-1">
                  {mod.label}
                </span>
                <h3 className="font-heading text-lg font-semibold mb-2">{mod.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{mod.description}</p>

                {i < modules.length - 1 && (
                  <div className="md:hidden w-px h-8 bg-border mx-auto mt-4" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureSection;
