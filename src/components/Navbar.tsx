import React from 'react';
import { User } from '../types';
import { BrandLogo } from './BrandLogo';
import { 
  Send, 
  Users, 
  Database, 
  Settings, 
  LogOut, 
  Smartphone, 
  Monitor,
  ShieldAlert
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activeTab: 'composer' | 'recipients' | 'history';
  onSelectTab: (tab: 'composer' | 'recipients' | 'history') => void;
  onOpenSqlSchema: () => void;
  onOpenGatewaySettings: () => void;
  onLogout: () => void;
  isMobileDeviceView: boolean;
  onToggleMobileDeviceView: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenSqlSchema,
  onOpenGatewaySettings,
  onLogout,
  isMobileDeviceView,
  onToggleMobileDeviceView,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark / Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <BrandLogo size="sm" onClick={() => onSelectTab('composer')} />
          <span className="hidden md:inline-block text-xs font-bold text-neutral-400 tracking-wider pl-3 border-l border-neutral-200">
            CAMPUS DISPATCH
          </span>
        </div>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="flex items-center gap-1 sm:gap-4 text-xs sm:text-sm font-semibold text-neutral-600 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => onSelectTab('composer')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'composer'
                ? 'text-[#D00000] bg-red-50 font-bold'
                : 'hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Dispatch Console
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('history')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'text-[#D00000] bg-red-50 font-bold'
                : 'hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Broadcast Logs
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('recipients')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'recipients'
                ? 'text-[#D00000] bg-red-50 font-bold'
                : 'hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Student Directory
          </button>

          <button
            type="button"
            onClick={onOpenSqlSchema}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-neutral-500" />
            SQL Schema
          </button>

          <button
            type="button"
            onClick={onOpenGatewaySettings}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-500" />
            SMS Gateway
          </button>
        </nav>

        {/* Zone 3: Primary action & User session badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile Wireframe Simulator Toggle */}
          <button
            type="button"
            onClick={onToggleMobileDeviceView}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            title="Toggle between Desktop Station and Mobile Wireframe View (9:41 Phone)"
          >
            {isMobileDeviceView ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-neutral-700" />
                <span>Full Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#D00000]" />
                <span>Mobile Wireframe</span>
              </>
            )}
          </button>

          {/* User Profile info */}
          <div className="hidden xl:flex flex-col text-right">
            <span className="text-xs font-bold text-neutral-900 truncate max-w-[130px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
              {currentUser.role} · CarSU
            </span>
          </div>

          {/* Sign Out CTA */}
          <button
            type="button"
            onClick={onLogout}
            className="p-2 text-neutral-500 hover:text-[#D00000] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Sign out of Ab!SU"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
