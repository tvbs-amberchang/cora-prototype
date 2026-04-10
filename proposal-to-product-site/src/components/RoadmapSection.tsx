import { motion } from "framer-motion";

const phases = [
  {
    phase: "Phase 1",
    period: "Month 1–3",
    title: "數據奠基期",
    subtitle: "Foundation",
    description: "建立 cora_id 體系，完成 Web/App 全站數據接入。",
    items: ["Web SDK v1.0", "Identity API & Graph", "身分合併引擎", "Tracking API", "CI/CD & 監控"],
    metrics: [
      { label: "ID 覆蓋率", value: "> 95%" },
      { label: "識別率", value: "> 20%" },
      { label: "API Uptime", value: "> 99.9%" },
    ],
    color: "primary",
  },
  {
    phase: "Phase 2a",
    period: "Month 4–6",
    title: "行銷賦能期",
    subtitle: "Activation",
    description: "提供「分群 + 發訊息」核心行銷工具。",
    items: ["受眾區隔服務", "推播服務 (Push/LINE/SMS)", "Email/EDM 編輯器", "People View Wave 1", "Admin Dashboard"],
    metrics: [
      { label: "分群覆蓋率", value: "> 60%" },
      { label: "訊息送達率", value: "> 95%" },
    ],
    color: "accent",
  },
  {
    phase: "Phase 2b",
    period: "Month 7–9",
    title: "互動活動期",
    subtitle: "Engagement",
    description: "互動活動工具與自動化旅程，豐富行銷手段。",
    items: ["行銷旅程引擎", "Inline & Popup 模組", "問卷 & 抽獎", "People View Wave 2", "資料倉儲 ETL"],
    metrics: [],
    color: "primary",
  },
  {
    phase: "Phase 3",
    period: "Month 10+",
    title: "智慧數據期",
    subtitle: "Intelligence",
    description: "引入機器學習，實現預測性行銷。",
    items: ["推薦系統 (RecSys)", "Lookalike 受眾擴展", "即時戰情室", "AI 自動分群"],
    metrics: [],
    color: "accent",
  },
];

const RoadmapSection = () => {
  return (
    <section id="roadmap" className="py-24 md:py-32 relative bg-radial-glow">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            產品<span className="text-gradient-primary">藍圖</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            從數據奠基到智慧行銷，分階段穩步推進
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-accent/30 to-transparent -translate-x-1/2" />

          <div className="space-y-12">
            {phases.map((p, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={p.phase}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {/* Card */}
                  <div className="card md:w-[45%] p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`text-xs font-heading font-bold px-3 py-1 rounded-full ${
                          p.color === "primary"
                            ? "bg-primary/15 text-primary"
                            : "bg-accent/15 text-accent"
                        }`}
                      >
                        {p.phase}
                      </span>
                      <span className="text-xs text-muted-foreground">{p.period}</span>
                    </div>
                    <h3 className="font-heading text-xl font-semibold mb-1">
                      {p.title}{" "}
                      <span className="text-muted-foreground font-normal text-base">
                        {p.subtitle}
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{p.description}</p>

                    <ul className="space-y-1.5 mb-4">
                      {p.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            p.color === "primary" ? "bg-primary" : "bg-accent"
                          }`} />
                          {item}
                        </li>
                      ))}
                    </ul>

                    {p.metrics.length > 0 && (
                      <div className="flex gap-4 pt-3 border-t border-border">
                        {p.metrics.map((m) => (
                          <div key={m.label} className="text-center">
                            <div className="font-heading font-bold text-primary text-sm">
                              {m.value}
                            </div>
                            <div className="text-xs text-muted-foreground">{m.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Center dot */}
                  <div
                    className={`hidden md:flex w-4 h-4 rounded-full border-2 shrink-0 ${
                      p.color === "primary"
                        ? "border-primary bg-primary/20"
                        : "border-accent bg-accent/20"
                    }`}
                  />

                  {/* Spacer */}
                  <div className="hidden md:block md:w-[45%]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
