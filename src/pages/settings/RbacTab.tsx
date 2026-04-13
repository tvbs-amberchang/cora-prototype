// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: RBAC tab — user/role management table with permission matrix

import React, { useState } from 'react';
import { Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Role = 'system_admin' | 'marketer';

interface UserAccount {
  id: string;
  name: string;
  role: Role;
  brands: string[];
  active: boolean;
}

const roleLabel: Record<Role, string> = {
  system_admin: 'System Admin',
  marketer: 'Marketer',
};

const initialUsers: UserAccount[] = [
  { id: 'u1', name: 'Amber Chang', role: 'system_admin', brands: ['all'], active: true },
  { id: 'u2', name: 'Joan Lin', role: 'marketer', brands: ['health', 'supertaste'], active: true },
  { id: 'u3', name: 'Mina Wu', role: 'marketer', brands: ['woman'], active: true },
];

export default function RbacTab() {
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('marketer');
  const [newUserBrands, setNewUserBrands] = useState('health');

  const addUser = () => {
    const name = newUserName.trim();
    if (!name) {
      alert('請輸入帳號名稱。');
      return;
    }
    const brands = newUserBrands.split(',').map((item) => item.trim()).filter(Boolean);
    setUsers((prev) => [
      ...prev,
      {
        id: `u_${Date.now()}`,
        name,
        role: newUserRole,
        brands: brands.length ? brands : ['health'],
        active: true,
      },
    ]);
    setNewUserName('');
    setNewUserBrands('health');
  };

  const toggleUserActive = (id: string) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, active: !user.active } : user))
    );
  };

  return (
    <div className="space-y-6">
      {/* User accounts section */}
      <div className="rounded-lg border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          帳號與角色指派
        </h3>

        {/* Add user form */}
        <div className="space-y-3 mb-5">
          <Input
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="新帳號名稱"
          />
          <select
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value as Role)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white text-ph-text"
          >
            <option value="marketer">Marketer</option>
            <option value="system_admin">System Admin</option>
          </select>
          <Input
            value={newUserBrands}
            onChange={(e) => setNewUserBrands(e.target.value)}
            placeholder="brand 指派（逗號分隔）"
            className="font-mono"
          />
          <Button onClick={addUser} size="sm">
            新增帳號指派
          </Button>
        </div>

        {/* User table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名稱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>狀態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-ph-text">{user.name}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'system_admin' ? 'default' : 'secondary'}>
                    {roleLabel[user.role]}
                  </Badge>
                </TableCell>
                <TableCell className="text-ph-secondary text-sm">{user.brands.join(', ')}</TableCell>
                <TableCell>
                  <button
                    onClick={() => toggleUserActive(user.id)}
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      user.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {user.active ? '啟用中' : '已停用'}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Permission matrix */}
      <div className="rounded-lg border border-border p-5">
        <h3 className="font-semibold text-ph-text mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          權限矩陣摘要
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>功能</TableHead>
                <TableHead>System Admin</TableHead>
                <TableHead>Marketer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>渠道設定 / API Key</TableCell>
                <TableCell>✅</TableCell>
                <TableCell>❌</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>品牌設定</TableCell>
                <TableCell>✅</TableCell>
                <TableCell>❌</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>預算分配</TableCell>
                <TableCell>✅</TableCell>
                <TableCell>❌（唯讀餘額）</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>受眾/活動/訊息發送</TableCell>
                <TableCell>✅</TableCell>
                <TableCell>✅（限指派 brand）</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>操作日誌全覽</TableCell>
                <TableCell>✅</TableCell>
                <TableCell>❌</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-xs text-ph-muted">
          認證由 Azure AD SSO 提供；本頁只管理角色與 brand 指派。
        </p>
      </div>
    </div>
  );
}
