import { motion } from "framer-motion";
import { Bot, Code, TestTube, Server, FileText, Palette } from "lucide-react";

const agents = [
  { icon: Bot, role: "管理層", desc: "需求分析、任務派工、Sprint 管理" },
  { icon: Palette, role: "設計層", desc: "架構設計、模組邊界、UX 流程" },
  { icon: Code, role: "開發層", desc: "後端、前端、SDK 各平台開發" },
  { icon: TestTube, role: "品質層", desc: "測試策略、Code Review、品質把關" },
  { icon: Server, role: "維運層", desc: "CI/CD、監控、部署" },
  { icon: FileText, role: "文件層", desc: "PRD / SPEC 文件撰寫" },
];

const comparisons = [
  { label: "團隊規模", traditional: "完整工程團隊", ai: "1 PM + 工程師顧問" },
  { label: "開發產出", traditional: "多人協作、溝通成本高", ai: "13+ Agent 平行開發" },
  { label: "品質保證", traditional: "人工 Code Review", ai: "AI Review + 工程師抽查" },
  { label: "知識傳承", traditional: "在個人腦中", ai: "編碼在 SPEC 中" },
];

const AITeamSection = () => {
  return (
    <section id="ai-team" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            AI Agent <span className="text-gradient-primary">工程團隊</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            不是「用 AI 寫程式」，而是建立一個完整的虛擬工程組織
          </p>
        </motion.div>

        {/* Agent roles grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-20">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.role}
              className="card p-5 rounded-xl flex items-start gap-4"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <agent.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="font-heading font-semibold text-sm mb-1">{agent.role}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">{agent.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison table */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="font-heading text-2xl font-bold text-center mb-8">
            傳統 vs AI Agent 模式
          </h3>
          <div className="card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/50 p-4 text-sm font-heading font-semibold">
              <span>維度</span>
              <span className="text-muted-foreground">傳統做法</span>
              <span className="text-primary">AI Agent</span>
            </div>
            {comparisons.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 p-4 text-sm ${
                  i < comparisons.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="font-medium">{row.label}</span>
                <span className="text-muted-foreground">{row.traditional}</span>
                <span className="text-primary font-medium">{row.ai}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AITeamSection;
