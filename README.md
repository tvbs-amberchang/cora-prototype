# CORA 前端原型專案

這是一個以 React + Vite 建立的 CORA 前端原型專案，目標是用於 PM/設計/工程快速對照 PRD、驗證流程與畫面可行性。

目前已涵蓋以下核心模組頁面（原型等級）：

- 總覽儀表板（Dashboard）
- 受眾區隔（Audience Segmentation）
- 用戶檔案（People View）
- 行銷活動（Campaign Module）
- 自動化旅程（Journey Engine）
- 訊息遞送（Message Delivery）
- 數據追蹤（Data Core）
- 系統管理（System Admin）

---

## 技術架構

- React 18
- TypeScript
- Vite 5
- React Router
- Tailwind CSS
- Lucide Icons
- React Flow (`@xyflow/react`)

---

## 快速啟動

### 1) 安裝套件

```bash
npm install
```

### 2) 啟動開發環境

```bash
npm run dev -- --host localhost --port 5174 --strictPort
```

啟動後請開啟：

- `http://localhost:5174`

> 建議固定使用 `5174`，避免同時啟動多個 Vite instance 導致看到舊畫面。

### 3) 建置驗證

```bash
npm run build
```

### 4) 程式碼檢查（Lint）

```bash
npm run lint
```

---

## 專案結構（重點檔案）

```txt
src/
  App.tsx
  index.tsx
  pages/
    Audience.tsx
    Campaigns.tsx
    DataCore.tsx
    Delivery.tsx
    Journeys.tsx
    PeopleView.tsx
    SystemAdmin.tsx
```

---

## 原型使用說明

- 本專案以「可操作的假資料流程」為主，方便討論 PRD 與 UX。
- 大多數資料為前端 mock state，尚未串接真實後端 API。
- 若畫面未更新，請先強制重整：
  - macOS: `Cmd + Shift + R`

---

## 已知事項

- 首次啟動或長時間開發後，若看到舊畫面，通常是舊的 dev server 仍在執行。
- 建議同時間只保留一個 Vite server（固定 `5174`）。

---

## 後續建議擴充方向

- 串接真實 API（Audience/Delivery/Journey）
- 將大型頁面拆分成更細的元件與 hooks
- 加入測試（Vitest + React Testing Library）
- 補齊權限與 brand 指派的真實登入狀態流
