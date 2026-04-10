import { motion } from "framer-motion";
import {
  Filter,
  UserSearch,
  Route,
  Megaphone,
  Send,
  Settings,
} from "lucide-react";

const features = [
  {
    icon: Filter,
    title: "受眾區隔",
    priority: "P1",
    description:
      "屬性/行為條件分群（AND/OR/NOT，最多 3 層巢狀）、動態分群即時更新與靜態分群批次快照。視覺化編輯器搭配即時人數預估。",
    capabilities: ["動態 & 靜態分群", "3 層巢狀條件", "即時人數預估", "視覺化編輯器"],
    painPoint: "Insider Dynamic Segments 只進不出，需繞道旅程才能雙向進出。",
  },
  {
    icon: UserSearch,
    title: "People View",
    priority: "P1",
    description:
      "360 度用戶檔案檢視：身分資料、PII 顯示控制、裝置列表、行為時間軸、分群歸屬與發送紀錄一覽。",
    capabilities: ["身分摘要", "行為時間軸", "分群歸屬", "GDPR 匯出/刪除"],
    painPoint: null,
  },
  {
    icon: Route,
    title: "行銷旅程引擎",
    priority: "P2",
    description:
      "視覺化拖拉畫布編排用戶旅程，支援行為/屬性/排程觸發、等待節點，可執行發送訊息、更新標籤、觸發 Webhook。",
    capabilities: ["拖拉式畫布", "多觸發條件", "等待節點", "Webhook 整合"],
    painPoint: "Insider 旅程引擎依賴批次更新（~1 分鐘延遲），即時觸發形同虛設。",
  },
  {
    icon: Send,
    title: "訊息推播與遞送",
    priority: "P1",
    description:
      "App Push（APNs + FCM）、LINE OA、SMS 統一管理；Email/EDM 拖拉式編輯器搭配品牌模板庫與個人化變數。",
    capabilities: ["4 渠道統一管理", "拖拉式 EDM 編輯器", "品牌模板庫", "排程發送"],
    painPoint: "Insider App Push 只看得到點擊量，無法追到實際成效。",
  },
  {
    icon: Megaphone,
    title: "行銷活動引擎",
    priority: "P2",
    description:
      "inline 模組、popup 模組、問卷（邏輯跳題 + 標籤回寫）、庫存導向抽獎（登記制 + 即時制）、簽到任務。",
    capabilities: ["Inline & Popup 模組", "邏輯跳題問卷", "庫存導向抽獎", "簽到任務"],
    painPoint: "Insider 燈箱條件觸發不準、跑版頻繁、抽獎邏輯不符媒體業需求。",
  },
  {
    icon: Settings,
    title: "系統管理",
    priority: "P1",
    description:
      "渠道連線健康儀表板 + API Key 設定、RBAC 角色權限（System Admin / Marketer）、操作日誌與系統通知。",
    capabilities: ["渠道健康監控", "RBAC 權限", "操作日誌", "品牌設定"],
    painPoint: null,
  },
];

const priorityColor: Record<string, string> = {
  P1: "bg-primary/15 text-primary border-primary/30",
  P2: "bg-accent/15 text-accent border-accent/30",
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            產品<span className="text-gradient-primary">功能</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            基於行銷團隊六大核心工作（JTBD）設計，解決 Insider 架構上無法解的問題
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              className="card-interactive p-6 md:p-8 rounded-2xl hover:border-primary/20 group"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <feat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{feat.title}</h3>
                </div>
                <span
                  className={`text-xs font-heading font-semibold px-2.5 py-1 rounded-full border ${priorityColor[feat.priority]}`}
                >
                  {feat.priority}
                </span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                {feat.description}
              </p>

              {/* Capabilities */}
              <div className="flex flex-wrap gap-2 mb-4">
                {feat.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground"
                  >
                    {cap}
                  </span>
                ))}
              </div>

              {/* Pain point */}
              {feat.painPoint && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-destructive font-medium">Insider 痛點：</span>{" "}
                    {feat.painPoint}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
