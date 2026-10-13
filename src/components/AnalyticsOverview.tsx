import React from 'react';
import { Announcement, Recipient } from '../types';
import { Send, Users, Signal, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AnalyticsOverviewProps {
  announcements: Announcement[];
  recipients: Recipient[];
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  announcements,
  recipients,
}) => {
  const activeRecipients = recipients.filter((r) => r.isActive).length;
  const totalDispatches = announcements.length;
  const avgDeliveryRate = announcements.length > 0
    ? (announcements.reduce((acc, curr) => acc + curr.deliveryRate, 0) / announcements.length).toFixed(1)
    : '99.8';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* KPI 1 */}
      <div className="p-4 rounded-xl border border-neutral-200/80 bg-white shadow-2xs">
        <div className="text-xs font-medium text-neutral-500 mb-1">
          Registered Campus Contacts
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tabular-nums">
          {recipients.length.toLocaleString()}
        </div>
        <div className="text-[11px] text-neutral-400 mt-1">
          <span className="text-emerald-600 font-semibold">{activeRecipients}</span> active opt-ins
        </div>
      </div>

      {/* KPI 2 */}
      <div className="p-4 rounded-xl border border-neutral-200/80 bg-white shadow-2xs">
        <div className="text-xs font-medium text-neutral-500 mb-1">
          SMS Advisories Dispatched
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tabular-nums">
          {totalDispatches}
        </div>
        <div className="text-[11px] text-neutral-400 mt-1">
          Weather, suspensions & alerts
        </div>
      </div>

      {/* KPI 3 */}
      <div className="p-4 rounded-xl border border-neutral-200/80 bg-white shadow-2xs">
        <div className="text-xs font-medium text-neutral-500 mb-1">
          Cellular Delivery Rate
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#D00000] tabular-nums">
          {avgDeliveryRate}%
        </div>
        <div className="text-[11px] text-neutral-400 mt-1">
          Globe, Smart & DITO cellular routes
        </div>
      </div>

      {/* KPI 4 */}
      <div className="p-4 rounded-xl border border-neutral-200/80 bg-white shadow-2xs">
        <div className="text-xs font-medium text-neutral-500 mb-1">
          SMS Dispatch Mode
        </div>
        <div className="text-sm sm:text-base font-bold text-neutral-900 mt-1 truncate">
          Sandbox Simulation
        </div>
        <div className="text-[11px] text-blue-600 font-medium mt-1 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Demo Mode (Zero Credentials)
        </div>
      </div>
    </div>
  );
};
