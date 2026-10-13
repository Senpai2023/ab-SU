import React, { useState } from 'react';
import { Announcement } from '../types';
import { 
  Send, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  ChevronRight, 
  Users,
  Search,
  Filter
} from 'lucide-react';

interface RecentBroadcastsProps {
  announcements: Announcement[];
  onSelectForFollowUp?: (announcement: Announcement) => void;
}

export const RecentBroadcasts: React.FC<RecentBroadcastsProps> = ({
  announcements,
  onSelectForFollowUp,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredList = announcements.filter((a) => {
    const matchesCategory = filterCategory === 'ALL' || a.category === filterCategory;
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.senderName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 sm:p-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Send className="w-4 h-4 text-[#D00000]" />
            Recent Broadcast Dispatches
          </h3>
          <p className="text-xs text-neutral-500 font-medium">
            Historical log of campus SMS transmissions and cellular delivery telemetry
          </p>
        </div>

        {/* Quick Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dispatches..."
              className="pl-8 pr-3 py-1 text-xs border border-neutral-300 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#D00000]"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs font-medium border border-neutral-300 rounded-lg px-2.5 py-1 bg-white text-neutral-700 focus:outline-none focus:border-[#D00000]"
          >
            <option value="ALL">All Categories</option>
            <option value="SUSPENSION NOTICE">Suspension</option>
            <option value="HEAT ADVISORY">Heat Advisory</option>
            <option value="RAINFALL ADVISORY">Rainfall</option>
            <option value="AIR QUALITY">Air Quality</option>
            <option value="CAMPUS EMERGENCY">Emergency</option>
          </select>
        </div>
      </div>

      {/* Feed List */}
      {filteredList.length === 0 ? (
        <div className="py-12 text-center text-neutral-400 text-sm">
          No broadcast dispatches match your filter.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="group p-4 rounded-xl border border-neutral-200/90 hover:border-neutral-300 bg-neutral-50/50 hover:bg-white transition-all shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {/* Category Label */}
                    <span className="text-xs font-bold text-[#D00000] tracking-wide">
                      {item.category}
                    </span>
                    <span className="text-neutral-300 text-xs">/</span>
                    <span className="text-xs font-semibold text-neutral-800">
                      {item.subCategory}
                    </span>
                    {item.isSimulated && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded uppercase">
                        Simulated
                      </span>
                    )}
                    <span className="text-neutral-300 text-xs">·</span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {new Date(item.sentAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Message Body */}
                  <p className="text-xs sm:text-sm text-neutral-700 font-normal leading-relaxed mb-3 line-clamp-3">
                    {item.message}
                  </p>

                  {/* Delivery Telemetry Strip */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      Audience: <strong className="text-neutral-800 tabular-nums">{item.recipientCount.toLocaleString()}</strong> students
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.isSimulated ? 'Delivered (Simulated)' : 'Delivered'}:</span>
                      <strong className="tabular-nums">{item.deliveryRate}%</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Officer: <span className="text-neutral-700">{item.senderName}</span>
                    </span>
                    <span>·</span>
                    <span className="text-[11px] text-neutral-400">
                      Route: {item.gatewayUsed === 'simulation' ? 'Mock Cellular Gateway' : item.gatewayUsed}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(item.id, item.message)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors"
                    title="Copy SMS text"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {item.referenceUrl && (
                    <a
                      href={item.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-neutral-400 hover:text-[#D00000] hover:bg-neutral-100 rounded-md transition-colors"
                      title="Open reference source link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {onSelectForFollowUp && (
                    <button
                      type="button"
                      onClick={() => onSelectForFollowUp(item)}
                      className="text-[11px] font-semibold text-[#D00000] hover:underline flex items-center gap-0.5"
                    >
                      Re-broadcast <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
