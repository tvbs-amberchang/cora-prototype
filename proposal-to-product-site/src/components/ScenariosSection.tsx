import { motion } from "framer-motion";
import { Globe, UserCheck, Zap, ArrowRight, Smartphone, Monitor, Mail, Bell, MessageSquare } from "lucide-react";

const scenarios = [
  {
    id: "cross-brand",
    icon: Globe,
    title: "跨站分群 + 精準推播",
    persona: "食尚玩家行銷人員",
    steps: [
      {
        label: "建立分群",
        detail: "在 CORA 後台設定條件：近 30 天在女大站看過「美食旅遊」文章 ≥ 3 次",
        icon: Monitor,
      },
      {
        label: "跨站撈人",
        detail: "系統跨站比對，透過 cora_id 識別同一用戶在女大與食尚的行為",
        icon: UserCheck,
      },
      {
        label: "精準推播",
        detail: "對符合條件的用戶推播所在位置附近的美食優惠券",
        icon: Bell,
      },
    ],
    highlight: "一個 cora_id，打通所有品牌數據",
    accentColor: "primary",
  },
  {
    id: "identity-merge",
    icon: UserCheck,
    title: "匿名歸戶 + 跨端識別",
    persona: "一般讀者的日常行為",
    steps: [
      {
        label: "手機匿名瀏覽",
        detail: "用戶在手機 Web 瀏覽數天，系統賦予匿名 cora_id 並持續追蹤行為",
        icon: Smartphone,
      },
      {
        label: "App 登入合併",
        detail: "某天打開 App 登入，取得 member_id，系統自動將匿名行為歸戶至會員",
        icon: UserCheck,
      },
      {
        label: "桌機自動串聯",
        detail: "之後在桌機 Web 登入同一帳號，所有行為串聯為同一人",
        icon: Monitor,
      },
    ],
    highlight: "跨裝置、跨平台，身分永不斷裂",
    accentColor: "accent",
  },
  {
    id: "realtime-journey",
    icon: Zap,
    title: "即時行銷旅程",
    persona: "健康 2.0 的忠實讀者",
    steps: [
      {
        label: "行為觸發",
        detail: "用戶在 App 連續閱讀 3 篇健康專題後離開，30 分鐘後觸發行銷旅程",
        icon: Smartphone,
      },
      {
        label: "多渠道追擊",
        detail: "先發 App Push 推薦相關專題 → 未開啟則 1 小時後發 LINE 訊息",
        icon: MessageSquare,
      },
      {
        label: "最終觸達",
        detail: "仍未回訪則隔天發 EDM，附上本週精選健康內容",
        icon: Mail,
      },
    ],
    highlight: "秒級觸發，不錯過任何黃金時刻",
    accentColor: "primary",
  },
];

const stepConnectorColor: Record<string, string> = {
  primary: "bg-primary/40",
  accent: "bg-accent/40",
};

const stepDotColor: Record<string, string> = {
  primary: "border-primary bg-primary/20",
  accent: "border-accent bg-accent/20",
};

const stepIconBg: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
};

const highlightBg: Record<string, string> = {
  primary: "bg-primary/8 border-primary/20 text-primary",
  accent: "bg-accent/8 border-accent/20 text-accent",
};

const ScenariosSection = () => {
  return (
    <section id="scenarios" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            使用<span className="text-gradient-primary">情境</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            從行銷人員的真實工作場景出發，看 CORA 如何解決問題
          </p>
        </motion.div>

        <div className="space-y-10">
          {scenarios.map((scenario, si) => (
            <motion.div
              key={scenario.id}
              className="card rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: si * 0.1 }}
            >
              {/* Header */}
              <div className="p-6 md:p-8 pb-0 md:pb-0">
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stepIconBg[scenario.accentColor]}`}>
                    <scenario.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold">{scenario.title}</h3>
                    <p className="text-xs text-muted-foreground">{scenario.persona}</p>
                  </div>
                </div>
              </div>

              {/* Steps flow */}
              <div className="p-6 md:p-8">
                <div className="grid md:grid-cols-3 gap-0 md:gap-0 relative">
                  {/* Horizontal connector line (desktop) */}
                  <div className={`hidden md:block absolute top-6 left-[16.67%] right-[16.67%] h-px ${stepConnectorColor[scenario.accentColor]}`} />

                  {scenario.steps.map((step, i) => (
                    <div key={step.label} className="relative flex flex-col items-center text-center">
                      {/* Dot */}
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 bg-card ${stepDotColor[scenario.accentColor]}`}>
                        <step.icon className={`w-5 h-5 ${scenario.accentColor === "primary" ? "text-primary" : "text-accent"}`} />
                      </div>

                      {/* Vertical connector (mobile) */}
                      {i < scenario.steps.length - 1 && (
                        <div className={`md:hidden w-px h-6 ${stepConnectorColor[scenario.accentColor]}`} />
                      )}

                      {/* Step number + label */}
                      <div className="mt-3 mb-1">
                        <span className="text-xs text-muted-foreground font-medium">
                          Step {i + 1}
                        </span>
                      </div>
                      <h4 className="font-heading text-sm font-semibold mb-1.5">{step.label}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px]">
                        {step.detail}
                      </p>

                      {/* Mobile connector below text */}
                      {i < scenario.steps.length - 1 && (
                        <div className="md:hidden flex flex-col items-center mt-3 mb-1">
                          <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Highlight bar */}
                <div className={`mt-8 px-4 py-2.5 rounded-lg border text-center text-sm font-medium ${highlightBg[scenario.accentColor]}`}>
                  {scenario.highlight}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScenariosSection;
