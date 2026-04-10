import { motion } from "framer-motion";
import { ShieldAlert, Lock, Coins } from "lucide-react";

const painPoints = [
  {
    icon: ShieldAlert,
    title: "數據治理失控",
    description:
      "第三方 SaaS 的數據治理邏輯與內部需求不符，數據紊亂。拿到了卻用不了——比沒有數據更糟。",
  },
  {
    icon: Lock,
    title: "功能受制於人",
    description:
      "SaaS 功能路線由供應商決定。跨品牌身分識別、自訂事件追蹤等深度客製化往往無法實現或費用高昂。",
  },
  {
    icon: Coins,
    title: "自建成本過高——直到現在",
    description:
      "過去自建需要完整工程團隊——多名資深工程師加架構師。AI Agent 團隊讓這個等式徹底改變。",
  },
];

const PainPointsSection = () => {
  return (
    <section id="pain-points" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            三大<span className="text-gradient-primary">痛點</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            企業該如何在不養大型工程團隊的前提下，拿回數據主權？
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.title}
              className="card-interactive p-8 rounded-2xl hover:border-primary/30 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:glow-primary transition-shadow">
                <point.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">{point.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{point.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPointsSection;
