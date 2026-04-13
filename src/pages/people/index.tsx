// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: PeopleView page — composition of SearchResults, UserDetail, Timeline

import React, { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchResults } from './SearchResults';
import { UserDetail } from './UserDetail';
import { Timeline } from './Timeline';
import { SearchResult, SearchType, TimeRange, mockEvents } from './types';

export default function PeopleView() {
  const [searchType, setSearchType] = useState<SearchType>('email');
  const [searchValue, setSearchValue] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<SearchResult | null>(null);
  const [showFullPII, setShowFullPII] = useState(false);

  // Timeline state
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [importantOnly, setImportantOnly] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [collapsedDateGroups, setCollapsedDateGroups] = useState<Record<string, boolean>>({});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 800);
  };

  const handleTogglePII = () => {
    if (showFullPII) {
      setShowFullPII(false);
    } else if (window.confirm('揭露完整 PII 將留下稽核紀錄，確定要繼續嗎？')) {
      setShowFullPII(true);
    }
  };

  useEffect(() => {
    setVisibleCount(10);
  }, [timeRange, eventTypeFilter, brandFilter, importantOnly, selectedProfile]);

  const filteredEvents = useMemo(() => {
    const nowDate = new Date('2026-04-08T23:59:59');
    const cutoffMs =
      timeRange === '24h' ? 24 * 60 * 60 * 1000 :
      timeRange === '7d'  ? 7 * 24 * 60 * 60 * 1000 :
      30 * 24 * 60 * 60 * 1000;

    return mockEvents
      .filter((event) => {
        if (nowDate.getTime() - new Date(event.timestamp).getTime() > cutoffMs) return false;
        if (eventTypeFilter !== 'all' && event.type !== eventTypeFilter) return false;
        if (brandFilter !== 'all' && event.brand !== brandFilter) return false;
        if (importantOnly && !event.isKeyEvent) return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [brandFilter, eventTypeFilter, importantOnly, timeRange]);

  const visibleEvents = useMemo(
    () => filteredEvents.slice(0, visibleCount),
    [filteredEvents, visibleCount],
  );

  const eventTypeOptions = useMemo(
    () => Array.from(new Set(mockEvents.map((e) => e.type))).sort(),
    [],
  );

  const brandOptions = useMemo(
    () => Array.from(new Set(mockEvents.map((e) => e.brand))).sort(),
    [],
  );

  const groupedVisibleEvents = useMemo(() => {
    const groups: Record<string, typeof visibleEvents> = {};
    visibleEvents.forEach((event) => {
      const dateKey = event.timestamp.slice(0, 10);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });
    return Object.entries(groups);
  }, [visibleEvents]);

  const topEventType = useMemo(() => {
    if (filteredEvents.length === 0) return '-';
    const counter = new Map<string, number>();
    filteredEvents.forEach((e) => counter.set(e.type, (counter.get(e.type) ?? 0) + 1));
    return Array.from(counter.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
  }, [filteredEvents]);

  const topBrand = useMemo(() => {
    if (filteredEvents.length === 0) return '-';
    const counter = new Map<string, number>();
    filteredEvents.forEach((e) => counter.set(e.brand, (counter.get(e.brand) ?? 0) + 1));
    return Array.from(counter.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
  }, [filteredEvents]);

  // Profile detail view
  if (selectedProfile) {
    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: identity + activity + diagnostics */}
          <div className="lg:col-span-1">
            <UserDetail
              profile={selectedProfile}
              showFullPII={showFullPII}
              onTogglePII={handleTogglePII}
              onBack={() => setSelectedProfile(null)}
              filteredEvents={filteredEvents}
              topEventType={topEventType}
              topBrand={topBrand}
            />
          </div>

          {/* Right: timeline */}
          <div className="lg:col-span-2">
            <Timeline
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              eventTypeFilter={eventTypeFilter}
              onEventTypeFilterChange={setEventTypeFilter}
              brandFilter={brandFilter}
              onBrandFilterChange={setBrandFilter}
              importantOnly={importantOnly}
              onImportantOnlyChange={setImportantOnly}
              eventTypeOptions={eventTypeOptions}
              brandOptions={brandOptions}
              groupedVisibleEvents={groupedVisibleEvents}
              visibleCount={visibleCount}
              filteredEventsTotal={filteredEvents.length}
              visibleEventsTotal={visibleEvents.length}
              collapsedDateGroups={collapsedDateGroups}
              onToggleDateGroup={(dateKey) =>
                setCollapsedDateGroups((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }))
              }
              onLoadMore={() => setVisibleCount((prev) => prev + 10)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Search view
  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <PageHeader
        title="用戶檔案"
        description="輸入識別符，快速查詢用戶全貌與診斷發送狀態"
      />
      <SearchResults
        searchType={searchType}
        onSearchTypeChange={setSearchType}
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        isSearching={isSearching}
        hasSearched={hasSearched}
        onSearch={handleSearch}
        onSelectProfile={setSelectedProfile}
      />
    </div>
  );
}
