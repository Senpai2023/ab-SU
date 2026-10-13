/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Announcement, Recipient } from './types';
import { storage } from './services/storage';
import { DispatchResult } from './services/smsService';
import { Navbar } from './components/Navbar';
import { Composer } from './components/Composer';
import { RecentBroadcasts } from './components/RecentBroadcasts';
import { RecipientManager } from './components/RecipientManager';
import { AnalyticsOverview } from './components/AnalyticsOverview';
import { SqlSchemaModal } from './components/SqlSchemaModal';
import { SmsGatewaySettings } from './components/SmsGatewaySettings';
import { AuthPages } from './components/AuthPages';
import { MobileFrame } from './components/MobileFrame';
import { BrandLogo } from './components/BrandLogo';
import { CheckCircle2, Smartphone, Monitor, Info, Bell, Radio, Shield } from 'lucide-react';

export default function App() {
  // Current logged in user (null if on public landing/auth)
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'composer' | 'recipients' | 'history'>('composer');

  // Application data
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => storage.getAnnouncements());
  const [recipients, setRecipients] = useState<Recipient[]>(() => storage.getRecipients());

  // Device display mode toggle (Desktop workstation vs Mobile Wireframe)
  const [isMobileDeviceView, setIsMobileDeviceView] = useState<boolean>(false);

  // Modals
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState<boolean>(false);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Auth Handlers
  const handleLogin = (user: User) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
    showToast('Signed in successfully', `Logged in as ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleRegister = (user: User) => {
    storage.addUser(user);
    storage.setCurrentUser(user);
    setCurrentUser(user);
    showToast('Account Created', `Welcome to Ab!SU, ${user.name}`);
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
    showToast('Logged Out', 'You have been safely signed out of Ab!SU.');
  };

  // Broadcast Success Handler
  const handleBroadcastSuccess = (newAnnouncement: Announcement, result: DispatchResult) => {
    storage.addAnnouncement(newAnnouncement);
    setAnnouncements((prev) => [newAnnouncement, ...prev]);

    showToast(
      result.isSimulated ? 'Simulated Broadcast Dispatched' : 'Broadcast Dispatched!',
      result.isSimulated
        ? `[SIMULATED] Transmitted ${result.smsSegments} SMS to ${result.totalRecipients.toLocaleString()} students. Status: Delivered (Simulated) · 0 credits billed.`
        : `Sent ${result.smsSegments} SMS to ${result.totalRecipients.toLocaleString()} students via ${result.provider}. Delivered: ${result.deliveredCount.toLocaleString()}`
    );
  };

  // Recipient Handlers
  const handleAddRecipient = (rec: Recipient) => {
    storage.addRecipient(rec);
    setRecipients(storage.getRecipients());
    showToast('Student Contact Added', `${rec.fullName} (${rec.phoneNumber}) registered.`);
  };

  const handleDeleteRecipient = (id: string) => {
    storage.deleteRecipient(id);
    setRecipients(storage.getRecipients());
    showToast('Contact Removed', 'Recipient removed from broadcast list.');
  };

  const handleToggleRecipientStatus = (id: string) => {
    storage.toggleRecipientStatus(id);
    setRecipients(storage.getRecipients());
  };

  const handleImportCsv = (importedList: Recipient[]) => {
    const combined = [...importedList, ...recipients];
    storage.saveRecipients(combined);
    setRecipients(combined);
    showToast('CSV Import Complete', `Added ${importedList.length} verified student phone numbers.`);
  };

  // IF NOT LOGGED IN -> SHOW AUTH PAGES (LANDING / LOGIN / SIGNUP)
  if (!currentUser) {
    return (
      <AuthPages
        onLoginSuccess={handleLogin}
        onRegisterSuccess={handleRegister}
        initialView="landing"
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 font-sans flex flex-col">
      {/* Top Bar adhering to Top Bar Contract */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSqlSchema={() => setIsSqlModalOpen(true)}
        onOpenGatewaySettings={() => setIsGatewayModalOpen(true)}
        onLogout={handleLogout}
        isMobileDeviceView={isMobileDeviceView}
        onToggleMobileDeviceView={() => setIsMobileDeviceView(!isMobileDeviceView)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* KPI Analytics Strip on Desktop */}
        {!isMobileDeviceView && (
          <AnalyticsOverview
            announcements={announcements}
            recipients={recipients}
          />
        )}

        {/* TAB 1: DISPATCH WORKSTATION COMPOSER */}
        {activeTab === 'composer' && (
          <div>
            {isMobileDeviceView ? (
              /* Mobile Wireframe Simulator view (matching Dashboard.png with 9:41 status bar) */
              <MobileFrame>
                <Composer
                  currentUser={currentUser}
                  recipientCount={recipients.filter((r) => r.isActive).length}
                  onBroadcastSuccess={handleBroadcastSuccess}
                  isMobileFrame={true}
                />
              </MobileFrame>
            ) : (
              /* Desktop Multi-Panel Workstation Grid */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left/Center Column: The Main Composer workstation */}
                <div className="lg:col-span-7 xl:col-span-8">
                  <Composer
                    currentUser={currentUser}
                    recipientCount={recipients.filter((r) => r.isActive).length}
                    onBroadcastSuccess={handleBroadcastSuccess}
                    isMobileFrame={false}
                  />
                </div>

                {/* Right Column: Live Broadcast Feed & Quick Student Directory */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                  {/* System Broadcast Info Card */}
                  <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                        Dispatch Engine
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        <Radio className="w-3 h-3 text-blue-600 animate-pulse" /> SIMULATION ACTIVE
                      </span>
                    </div>

                    <div className="text-xs text-neutral-600 space-y-1.5 leading-relaxed">
                      <p>
                        School prototype demo mode enabled. Simulated offline cellular distribution across <strong>Globe</strong>,{' '}
                        <strong>Smart</strong>, and <strong>DITO</strong> networks.
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Zero credentials required. SMS dispatches, student reach metrics, and delivery statuses are generated safely.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setIsGatewayModalOpen(true)}
                        className="text-xs font-semibold text-[#D00000] hover:underline cursor-pointer"
                      >
                        Configure SMS Gateway (.env) →
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSqlModalOpen(true)}
                        className="text-xs font-semibold text-neutral-600 hover:text-black cursor-pointer"
                      >
                        View SQL Schema →
                      </button>
                    </div>
                  </div>

                  {/* Compact Recent Broadcasts Feed */}
                  <RecentBroadcasts
                    announcements={announcements}
                    onSelectForFollowUp={(a) => {
                      showToast('Follow-up Selected', `Loaded prior broadcast: ${a.title}`);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BROADCAST HISTORY FEED */}
        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto">
            <RecentBroadcasts
              announcements={announcements}
              onSelectForFollowUp={(a) => {
                setActiveTab('composer');
                showToast('Follow-up Selected', `Ready to re-dispatch ${a.category}`);
              }}
            />
          </div>
        )}

        {/* TAB 3: STUDENT RECIPIENTS & CONTACT DIRECTORY */}
        {activeTab === 'recipients' && (
          <div className="max-w-6xl mx-auto">
            <RecipientManager
              recipients={recipients}
              onAddRecipient={handleAddRecipient}
              onDeleteRecipient={handleDeleteRecipient}
              onToggleStatus={handleToggleRecipientStatus}
              onImportCsv={handleImportCsv}
            />
          </div>
        )}

      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-neutral-900 text-white p-4 rounded-xl shadow-2xl border border-neutral-800 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white">{toastMessage.title}</h4>
            <p className="text-[11px] text-neutral-300 mt-0.5 leading-tight">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* SQL SCHEMA MODAL DELIVERABLE */}
      <SqlSchemaModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      {/* SMS GATEWAY SETTINGS MODAL */}
      <SmsGatewaySettings
        isOpen={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="text-neutral-300">|</span>
            <span>Caraga State University Emergency & Advisory SMS Notification System</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>Offline Push Architecture</span>
            <span>·</span>
            <span>PAGASA / NDRRMC Aligned</span>
            <span>·</span>
            <span>© 2026 CarSU PIO</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
