import { motion } from "framer-motion";
import { Zap, Database, Copy } from "lucide-react";

const values = [
  {
    icon: Zap,
    title: "效率質變",
    stats: "13+",
    statsLabel: "Agent 平行開發",
    description: "後端、SDK、測試同步推進，三平台 SDK Agent 同步產出，確保 API 一致。",
  },
  {
    icon: Database,
    title: "數據主權",
    stats: "100%",
    statsLabel: "自有數據",
    description: "用戶行為數據完全存放在自有基礎設施，不受第三方政策變更影響。",
  },
  {
    icon: Copy,
    title: "可複製性",
    stats: "∞",
    statsLabel: "可推廣專案",
    description: "PM + AI Agent 團隊模式可推廣至內部工具開發、數據分析平台等任何專案。",
  },
];

const ValueSection = () => {
  return (
    <section id="value" className="py-24 md:py-32 relative bg-radial-glow">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            預期<span className="text-gradient-primary">價值</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((val, i) => (
            <motion.div
              key={val.title}
              className="card text-center p-8 rounded-2xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <val.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <div className="text-4xl md:text-5xl font-heading font-bold text-gradient-primary mb-1">
                {val.stats}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{val.statsLabel}</p>
              <h3 className="font-heading text-xl font-semibold mb-3">{val.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{val.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.blockquote
          className="mt-20 max-w-3xl mx-auto text-center text-lg md:text-xl text-foreground/80 italic leading-relaxed border-l-4 border-primary/40 pl-6 text-left"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          「當 AI 不只是工具，而是一支被工程師經驗驅動的團隊時，『自建 vs 買 SaaS』的成本結構將被徹底改寫。」
        </motion.blockquote>
      </div>
    </section>
  );
};

export default ValueSection;
