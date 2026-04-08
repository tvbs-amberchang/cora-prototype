import React, { useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Database,
  FileText,
  KeyRound,
  Lock,
  Search,
  Shield,
  Slack,
  Users } from
'lucide-react';

type Role = 'system_admin' | 'marketer';
type Channel = 'push' | 'line' | 'sms' | 'email';
type HealthStatus = 'healthy' | 'error' | 'unset';

interface UserAccount {
  id: string;
  name: string;
  role: Role;
  brands: string[];
  active: boolean;
}

interface ChannelCredential {
  id: string;
  channel: Channel;
  provider: string;
  maskedKey: string;
  status: HealthStatus;
  lastCheck: string;
  isPrimary?: boolean;
}

interface BudgetRow {
  channel: Channel;
  cycle: 'monthly' | 'quarterly';
  total: number;
  used: number;
  brandAllocations: Array<{brand: string;amount: number;}>;
  enabled: boolean;
}

interface AuditLog {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  module: string;
  ip: string;
}

interface GdprRequest {
  id: string;
  type: 'export_request' | 'deletion_request';
  coraId: string;
  requester: string;
  approver?: string;
  status: 'pending_approval' | 'queued' | 'in_progress' | 'partially_completed' | 'completed' | 'failed' | 'cancelled';
  reason: string;
}

const roleLabel: Record<Role, string> = {
  system_admin: 'System Admin',
  marketer: 'Marketer'
};

const channelLabel: Record<Channel, string> = {
  push: 'App Push',
  line: 'LINE OA',
  sms: 'SMS',
  email: 'Email'
};

const healthLabel: Record<HealthStatus, string> = {
  healthy: '🟢 正常',
  error: '🔴 異常',
  unset: '⚪ 未設定'
};

const initialUsers: UserAccount[] = [
{ id: 'u1', name: 'Amber Chang', role: 'system_admin', brands: ['all'], active: true },
{ id: 'u2', name: 'Joan Lin', role: 'marketer', brands: ['health', 'supertaste'], active: true },
{ id: 'u3', name: 'Mina Wu', role: 'marketer', brands: ['woman'], active: true }];

const initialCredentials: ChannelCredential[] = [
{ id: 'c1', channel: 'push', provider: 'APNs', maskedKey: 'apns_****7a3b', status: 'healthy', lastCheck: '剛剛' },
{ id: 'c2', channel: 'push', provider: 'FCM', maskedKey: 'fcm_****1ee9', status: 'healthy', lastCheck: '剛剛' },
{ id: 'c3', channel: 'line', provider: 'LINE Messaging API', maskedKey: 'line_****22fe', status: 'healthy', lastCheck: '1 分鐘前' },
{ id: 'c4', channel: 'sms', provider: 'Mitake', maskedKey: 'mitake_****991a', status: 'error', lastCheck: '2 分鐘前', isPrimary: true },
{ id: 'c5', channel: 'sms', provider: 'Infobip', maskedKey: 'infobip_****38cc', status: 'healthy', lastCheck: '2 分鐘前' },
{ id: 'c6', channel: 'email', provider: 'ESP Provider', maskedKey: 'esp_****0c5d', status: 'unset', lastCheck: '-' }];

const initialBudgets: BudgetRow[] = [
{
  channel: 'line',
  cycle: 'monthly',
  total: 120000,
  used: 86400,
  enabled: true,
  brandAllocations: [{ brand: 'health', amount: 40000 }, { brand: 'supertaste', amount: 30000 }, { brand: 'woman', amount: 30000 }, { brand: '共用池', amount: 20000 }]
},
{
  channel: 'sms',
  cycle: 'monthly',
  total: 100000,
  used: 64000,
  enabled: true,
  brandAllocations: [{ brand: 'health', amount: 30000 }, { brand: 'supertaste', amount: 20000 }, { brand: 'woman', amount: 30000 }, { brand: '共用池', amount: 20000 }]
},
{
  channel: 'email',
  cycle: 'monthly',
  total: 50000,
  used: 12000,
  enabled: false,
  brandAllocations: [{ brand: 'health', amount: 15000 }, { brand: 'supertaste', amount: 15000 }, { brand: 'woman', amount: 20000 }]
}];

const initialLogs: AuditLog[] = [
{ id: 'l1', at: '2026-04-08 09:12', actor: 'Amber Chang (System Admin)', action: 'channel.update', target: 'SMS provider priority', module: 'system_admin', ip: '10.2.1.32' },
{ id: 'l2', at: '2026-04-08 09:00', actor: 'Joan Lin (Marketer)', action: 'campaign.send', target: '母親節 LINE 群發', module: 'delivery', ip: '10.2.1.88' },
{ id: 'l3', at: '2026-04-07 18:22', actor: 'Amber Chang (System Admin)', action: 'rbac.update', target: 'Mina Wu brand assignment', module: 'system_admin', ip: '10.2.1.32' }];

const initialGdpr: GdprRequest[] = [
{ id: 'g1', type: 'export_request', coraId: '550e8400-e29b-41d4-a716', requester: 'Amber Chang', status: 'completed', reason: 'DSAR #2026-041' },
{ id: 'g2', type: 'deletion_request', coraId: '4fe1e12f-7f52-4f2b-a3bf', requester: 'Amber Chang', approver: 'Jack Hsu', status: 'in_progress', reason: 'DSAR #2026-042' }];

export default function SystemAdmin() {
  const [tab, setTab] = useState<'rbac' | 'channels' | 'budget' | 'brands' | 'audit' | 'notify' | 'gdpr'>('rbac');
  const [users, setUsers] = useState(initialUsers);
  const [credentials, setCredentials] = useState(initialCredentials);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [logs] = useState(initialLogs);
  const [gdprRequests, setGdprRequests] = useState(initialGdpr);
  const [logQuery, setLogQuery] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('marketer');
  const [newUserBrands, setNewUserBrands] = useState('health');
  const [budgetWarn, setBudgetWarn] = useState(80);
  const [budgetCritical, setBudgetCritical] = useState(100);
  const [slackWebhookMasked, setSlackWebhookMasked] = useState('https://hooks.slack.com/services/****');
  const [notifyChannelError, setNotifyChannelError] = useState(true);
  const [notifyBudget, setNotifyBudget] = useState(true);
  const [notifyExport, setNotifyExport] = useState(true);

  const filteredLogs = useMemo(
    () =>
    logs.filter((log) =>
    [log.actor, log.action, log.target, log.module].join(' ').toLowerCase().includes(logQuery.toLowerCase())
    ),
    [logQuery, logs]
  );

  const addUser = () => {
    const name = newUserName.trim();
    if (!name) {
      alert('請輸入帳號名稱。');
      return;
    }
    const brands = newUserBrands.split(',').map((item) => item.trim()).filter(Boolean);
    setUsers((prev) => [...prev, { id: `u_${Date.now()}`, name, role: newUserRole, brands: brands.length ? brands : ['health'], active: true }]);
    setNewUserName('');
    setNewUserBrands('health');
  };

  const toggleUserActive = (id: string) => {
    setUsers((prev) => prev.map((user) => user.id === id ? { ...user, active: !user.active } : user));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">系統管理與設定</h1>
        <p className="text-slate-500">RBAC、渠道憑證、預算管理、品牌設定、稽核日誌與系統通知</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3 mb-6 flex flex-wrap gap-2">
        <button onClick={() => setTab('rbac')} className={`px-3 py-2 rounded text-sm ${tab === 'rbac' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>角色與權限</button>
        <button onClick={() => setTab('channels')} className={`px-3 py-2 rounded text-sm ${tab === 'channels' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>渠道連線</button>
        <button onClick={() => setTab('budget')} className={`px-3 py-2 rounded text-sm ${tab === 'budget' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>預算管理</button>
        <button onClick={() => setTab('brands')} className={`px-3 py-2 rounded text-sm ${tab === 'brands' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>品牌設定</button>
        <button onClick={() => setTab('audit')} className={`px-3 py-2 rounded text-sm ${tab === 'audit' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>操作日誌</button>
        <button onClick={() => setTab('notify')} className={`px-3 py-2 rounded text-sm ${tab === 'notify' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>系統通知</button>
        <button onClick={() => setTab('gdpr')} className={`px-3 py-2 rounded text-sm ${tab === 'gdpr' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>GDPR 流程</button>
      </div>

      {tab === 'rbac' &&
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2"><Users className="w-4 h-4" /><span>帳號與角色指派</span></h3>
            <div className="space-y-3 mb-4">
              <input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="新帳號名稱" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
              <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as Role)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white">
                <option value="marketer">Marketer</option>
                <option value="system_admin">System Admin</option>
              </select>
              <input value={newUserBrands} onChange={(e) => setNewUserBrands(e.target.value)} placeholder="brand 指派（逗號分隔）" className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-mono" />
              <button onClick={addUser} className="px-3 py-2 bg-slate-900 text-white rounded text-sm">新增帳號指派</button>
            </div>
            <div className="space-y-2">
              {users.map((user) =>
            <div key={user.id} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{roleLabel[user.role]} · brand: {user.brands.join(', ')}</div>
                    </div>
                    <button onClick={() => toggleUserActive(user.id)} className={`px-2 py-1 text-xs rounded ${user.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {user.active ? '啟用中' : '已停用'}
                    </button>
                  </div>
                </div>
            )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2"><Shield className="w-4 h-4" /><span>權限矩陣摘要</span></h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 border-b border-slate-200">
                  <tr><th className="py-2">功能</th><th className="py-2">System Admin</th><th className="py-2">Marketer</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="py-2">渠道設定 / API Key</td><td className="py-2">✅</td><td className="py-2">❌</td></tr>
                  <tr><td className="py-2">品牌設定</td><td className="py-2">✅</td><td className="py-2">❌</td></tr>
                  <tr><td className="py-2">預算分配</td><td className="py-2">✅</td><td className="py-2">❌（唯讀餘額）</td></tr>
                  <tr><td className="py-2">受眾/活動/訊息發送</td><td className="py-2">✅</td><td className="py-2">✅（限指派 brand）</td></tr>
                  <tr><td className="py-2">操作日誌全覽</td><td className="py-2">✅</td><td className="py-2">❌</td></tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-xs text-slate-500">認證由 Azure AD SSO 提供；本頁只管理角色與 brand 指派。</div>
          </div>
        </div>
      }

      {tab === 'channels' &&
      <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2"><KeyRound className="w-4 h-4" /><span>渠道憑證與健康狀態</span></h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-200">
                <tr><th className="py-2">渠道</th><th className="py-2">Provider</th><th className="py-2">憑證</th><th className="py-2">狀態</th><th className="py-2">最後檢查</th><th className="py-2">備註</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {credentials.map((item) =>
              <tr key={item.id}>
                    <td className="py-2">{channelLabel[item.channel]}</td>
                    <td className="py-2">{item.provider}</td>
                    <td className="py-2 font-mono text-xs">{item.maskedKey}</td>
                    <td className="py-2">{healthLabel[item.status]}</td>
                    <td className="py-2 text-slate-500">{item.lastCheck}</td>
                    <td className="py-2 text-xs text-slate-500">{item.channel === 'sms' && item.isPrimary ? '主要供應商' : '-'}</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded p-3">憑證寫入後僅顯示遮罩；SMS 供應商失敗時可切到備援，恢復後自動切回主要。</div>
        </div>
      }

      {tab === 'budget' &&
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3">渠道預算與 brand 分配</h3>
            <div className="space-y-3">
              {budgets.map((row, idx) =>
            <div key={row.channel} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-slate-900">{channelLabel[row.channel]}</div>
                    <label className="text-xs flex items-center space-x-1"><span>啟用</span><input type="checkbox" checked={row.enabled} onChange={(e) => setBudgets((prev) => prev.map((item, i) => i === idx ? { ...item, enabled: e.target.checked } : item))} /></label>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <label className="border border-slate-200 rounded p-2">總預算<input type="number" value={row.total} onChange={(e) => setBudgets((prev) => prev.map((item, i) => i === idx ? { ...item, total: Number(e.target.value) || 0 } : item))} className="mt-1 w-full px-2 py-1 border border-slate-300 rounded" /></label>
                    <label className="border border-slate-200 rounded p-2">已用<input type="number" value={row.used} onChange={(e) => setBudgets((prev) => prev.map((item, i) => i === idx ? { ...item, used: Number(e.target.value) || 0 } : item))} className="mt-1 w-full px-2 py-1 border border-slate-300 rounded" /></label>
                    <div className="border border-slate-200 rounded p-2">使用率<div className="mt-1 font-mono text-sm">{Math.round(row.used / Math.max(1, row.total) * 100)}%</div></div>
                  </div>
                  <div className="text-xs text-slate-600">
                    分配：{row.brandAllocations.map((item) => `${item.brand} ${item.amount.toLocaleString()}`).join(' ｜ ')}
                  </div>
                </div>
            )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3">告警門檻</h3>
            <div className="space-y-3 text-sm">
              <label className="block">提醒門檻（%）<input type="number" value={budgetWarn} onChange={(e) => setBudgetWarn(Number(e.target.value) || 0)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded" /></label>
              <label className="block">緊急門檻（%）<input type="number" value={budgetCritical} onChange={(e) => setBudgetCritical(Number(e.target.value) || 0)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded" /></label>
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded p-3">預算設定/分配由 System Admin 管；發送時攔截邏輯由 Delivery Core 執行。</div>
            </div>
          </div>
        </div>
      }

      {tab === 'brands' &&
      <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Brand 設定與發送身份</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="border border-slate-200 rounded p-3">
              <div className="font-semibold text-slate-900 mb-2">health（健康 2.0）</div>
              <div className="text-xs text-slate-600">Email：健康 2.0 &lt;health@tvbs.com.tw&gt;</div>
              <div className="text-xs text-slate-600">SMS：`【健康2.0】`</div>
              <div className="text-xs text-slate-600">LINE：健康 2.0 官方帳號</div>
            </div>
            <div className="border border-slate-200 rounded p-3">
              <div className="font-semibold text-slate-900 mb-2">supertaste（食尚玩家）</div>
              <div className="text-xs text-slate-600">Email：食尚玩家 &lt;supertaste@tvbs.com.tw&gt;</div>
              <div className="text-xs text-slate-600">SMS：`【食尚玩家】`</div>
              <div className="text-xs text-slate-600">LINE：食尚玩家官方帳號</div>
            </div>
            <div className="border border-slate-200 rounded p-3">
              <div className="font-semibold text-slate-900 mb-2">woman（女人我最大）</div>
              <div className="text-xs text-slate-600">Email：女人我最大 &lt;woman@tvbs.com.tw&gt;</div>
              <div className="text-xs text-slate-600">SMS：`【女人我最大】`</div>
              <div className="text-xs text-slate-600">LINE：女人我最大官方帳號</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">brand code 停用不刪資料；新增/停用需 PM 審核流程。</div>
        </div>
      }

      {tab === 'audit' &&
      <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2"><FileText className="w-4 h-4" /><span>全域稽核日誌（append-only）</span></h3>
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={logQuery} onChange={(e) => setLogQuery(e.target.value)} placeholder="搜尋操作者 / 動作 / 目標..." className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-sm" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-200">
                <tr><th className="py-2">時間</th><th className="py-2">操作者</th><th className="py-2">動作</th><th className="py-2">目標</th><th className="py-2">模組</th><th className="py-2">IP</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) =>
              <tr key={log.id}>
                    <td className="py-2 text-xs">{log.at}</td>
                    <td className="py-2">{log.actor}</td>
                    <td className="py-2 font-mono text-xs">{log.action}</td>
                    <td className="py-2">{log.target}</td>
                    <td className="py-2 text-xs">{log.module}</td>
                    <td className="py-2 text-xs font-mono">{log.ip}</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      }

      {tab === 'notify' &&
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2"><Bell className="w-4 h-4" /><span>通知規則</span></h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center justify-between border border-slate-200 rounded p-3"><span>渠道健康檢查失敗（緊急）</span><input type="checkbox" checked={notifyChannelError} onChange={(e) => setNotifyChannelError(e.target.checked)} /></label>
              <label className="flex items-center justify-between border border-slate-200 rounded p-3"><span>預算達門檻告警</span><input type="checkbox" checked={notifyBudget} onChange={(e) => setNotifyBudget(e.target.checked)} /></label>
              <label className="flex items-center justify-between border border-slate-200 rounded p-3"><span>大量名單匯出（&gt;10,000）</span><input type="checkbox" checked={notifyExport} onChange={(e) => setNotifyExport(e.target.checked)} /></label>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2"><Slack className="w-4 h-4" /><span>Slack / Email 通知設定</span></h3>
            <div className="space-y-3">
              <label className="block text-sm">Slack Webhook（遮罩顯示）
                <input value={slackWebhookMasked} onChange={(e) => setSlackWebhookMasked(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded text-sm font-mono" />
              </label>
              <label className="block text-sm">Email 收件群組
                <input defaultValue="cora-admin@tvbs.com.tw, martech@tvbs.com.tw" className="mt-1 w-full px-3 py-2 border border-slate-300 rounded text-sm" />
              </label>
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded p-3">通知歷史保留至少 6 個月；緊急事件預設後台+Email+Slack。</div>
            </div>
          </div>
        </div>
      }

      {tab === 'gdpr' &&
      <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2"><Lock className="w-4 h-4" /><span>GDPR Request Orchestrator</span></h3>
          <div className="space-y-3 mb-4">
            {gdprRequests.map((req) =>
          <div key={req.id} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm text-slate-900">{req.id}</div>
                  <span className={`px-2 py-0.5 rounded text-xs ${req.status === 'completed' ? 'bg-green-100 text-green-700' : req.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                    {req.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1">{req.type} · cora_id: {req.coraId}</div>
                <div className="text-xs text-slate-600">requester: {req.requester}{req.approver ? ` · approver: ${req.approver}` : ''}</div>
                <div className="text-xs text-slate-500">reason: {req.reason}</div>
              </div>
          )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="border border-slate-200 rounded p-3 bg-slate-50"><Database className="w-4 h-4 mb-1 text-slate-700" />module_tasks：Identity / Data / Audience / Delivery / Engagement</div>
            <div className="border border-slate-200 rounded p-3 bg-slate-50"><CheckCircle2 className="w-4 h-4 mb-1 text-slate-700" />刪除需第二位 System Admin 覆核後才可入列</div>
            <div className="border border-slate-200 rounded p-3 bg-slate-50"><FileText className="w-4 h-4 mb-1 text-slate-700" />audit log 不可寫入明文 PII（僅遮罩或摘要）</div>
          </div>
        </div>
      }
    </div>);
}
