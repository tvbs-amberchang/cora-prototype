// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: People search form and results table (PostHog style)

import React from 'react';
import { Search, CheckCircle2, Mail, Phone, Smartphone, Globe, ChevronRight, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SearchResult, SearchType, mockResults, BRAND_CONFIG } from './types';

/** Small brand badge */
const BrandBadge = ({ brand }: { brand: string }) => {
  const cfg = BRAND_CONFIG[brand] ?? { label: brand, color: 'bg-ph-surface text-ph-secondary' };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

/** Channel reachability icon */
const ChannelIcon = ({ channel, active }: { channel: string; active: boolean }) => {
  const cls = active ? 'text-ph-blue' : 'text-ph-muted';
  switch (channel) {
    case 'email':    return <Mail      className={`w-4 h-4 ${cls}`} title="Email" />;
    case 'phone':    return <Phone     className={`w-4 h-4 ${cls}`} title="SMS" />;
    case 'app_push': return <Smartphone className={`w-4 h-4 ${cls}`} title="App Push" />;
    case 'web_push': return <Globe     className={`w-4 h-4 ${cls}`} title="Web Push" />;
    default:         return null;
  }
};

interface SearchResultsProps {
  searchType: SearchType;
  onSearchTypeChange: (t: SearchType) => void;
  searchValue: string;
  onSearchValueChange: (v: string) => void;
  isSearching: boolean;
  hasSearched: boolean;
  onSearch: (e: React.FormEvent) => void;
  onSelectProfile: (r: SearchResult) => void;
}

export const SearchResults = ({
  searchType,
  onSearchTypeChange,
  searchValue,
  onSearchValueChange,
  isSearching,
  hasSearched,
  onSearch,
  onSelectProfile,
}: SearchResultsProps) => {
  const placeholder =
    searchType === 'email'     ? '輸入完整或部分 Email...' :
    searchType === 'phone'     ? '輸入完整或部分手機號碼...' :
    '輸入完整精準的 ID...';

  return (
    <div>
      {/* Search box */}
      <div className="bg-white rounded-xl border border-border shadow-card p-2 mb-8">
        <form onSubmit={onSearch} className="flex items-center gap-2">
          <div className="relative border-r border-border pr-2">
            <select
              value={searchType}
              onChange={(e) => onSearchTypeChange(e.target.value as SearchType)}
              className="appearance-none bg-transparent pl-3 pr-8 py-2.5 text-sm font-medium text-ph-text focus:outline-none cursor-pointer"
            >
              <option value="email">Email</option>
              <option value="phone">手機號碼 (Phone)</option>
              <option value="cora_id">CORA ID</option>
              <option value="member_id">會員 ID (Member ID)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-ph-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ph-muted" />
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchValueChange(e.target.value)}
              placeholder={placeholder}
              className="pl-10 border-0 shadow-none focus-visible:ring-0 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={!searchValue.trim() || isSearching}
            className="bg-ph-blue hover:bg-ph-blue/90 text-white px-6"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                搜尋中...
              </>
            ) : '搜尋'}
          </Button>
        </form>
      </div>

      {/* Results table */}
      {hasSearched && (
        <div>
          <p className="text-sm text-ph-secondary mb-3 px-1">
            搜尋結果（{mockResults.length} 筆）
          </p>

          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-ph-surface hover:bg-ph-surface">
                  <TableHead className="text-ph-secondary font-medium">主要識別 (遮罩)</TableHead>
                  <TableHead className="text-ph-secondary font-medium">CORA ID / 會員狀態</TableHead>
                  <TableHead className="text-ph-secondary font-medium">最近活躍</TableHead>
                  <TableHead className="text-ph-secondary font-medium">可觸達渠道</TableHead>
                  <TableHead className="text-ph-secondary font-medium text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockResults.map((result) => (
                  <TableRow key={result.id} className="group hover:bg-ph-surface/60">
                    <TableCell>
                      <div className="font-medium text-ph-text">{result.email}</div>
                      {result.phone && (
                        <div className="text-ph-secondary text-xs mt-0.5">{result.phone}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs text-ph-secondary mb-1">{result.cora_id}</div>
                      {result.member_id ? (
                        <Badge variant="outline" className="text-xs text-green-700 border-green-200 bg-green-50 gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          已綁定
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-ph-secondary">
                          匿名訪客
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-ph-text mb-1">{result.lastActive}</div>
                      <div className="flex gap-1 flex-wrap">
                        {result.activeBrands.map((b) => <BrandBadge key={b} brand={b} />)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(['email', 'phone', 'app_push', 'web_push'] as const).map((ch) => (
                          <ChannelIcon key={ch} channel={ch} active={result.reachableChannels.includes(ch)} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => onSelectProfile(result)}
                        className="text-ph-blue hover:text-ph-blue/80 font-medium text-sm flex items-center justify-end gap-1 w-full"
                      >
                        檢視詳情
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-ph-blue flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">找不到你要的人？</p>
              <p className="text-blue-700">
                請確認輸入的識別符是否正確，或嘗試切換不同的查詢類型（例如改用手機號碼搜尋）。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
