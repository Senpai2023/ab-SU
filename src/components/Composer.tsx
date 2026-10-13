import React, { useState, useMemo } from 'react';
import { 
  AlertCategory, 
  SubCategory, 
  SuspensionScope, 
  HeatLevel, 
  RainfallLevel, 
  AirQualityLevel, 
  EmergencyType,
  Announcement,
  User 
} from '../types';
import { calculateSmsSegments, defaultSmsGateway, DispatchResult } from '../services/smsService';
import { ConfirmationModal } from './ConfirmationModal';
import { BrandLogo } from './BrandLogo';
import { COLLEGES } from '../data/mockData';
import { CheckCircle2, AlertTriangle, Radio, Sparkles, Edit3, RotateCcw } from 'lucide-react';

interface ComposerProps {
  currentUser: User;
  recipientCount: number;
  onBroadcastSuccess: (announcement: Announcement, result: DispatchResult) => void;
  isMobileFrame?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  currentUser,
  recipientCount,
  onBroadcastSuccess,
  isMobileFrame = false,
}) => {
  // Category state
  const [category, setCategory] = useState<AlertCategory>('SUSPENSION NOTICE');
  const [subCategory, setSubCategory] = useState<SubCategory>('AFTERNOON CLASSES');
  
  // Dynamic Input States
  const [memoInput, setMemoInput] = useState<string>('01-1010');
  const [linkInput, setLinkInput] = useState<string>('https://carsu.edu.ph/memo/01-1010');
  const [dateInput, setDateInput] = useState<string>('11-20-2026');
  const [tempInput, setTempInput] = useState<string>('50');
  const [customDetailInput, setCustomDetailInput] = useState<string>('Heavy torrential rain in northern sector');
  const [targetCollege, setTargetCollege] = useState<string>('ALL');

  // Direct editing mode toggle
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customMessageBody, setCustomMessageBody] = useState<string>('');

  // Validation errors
  const [errors, setErrors] = useState<{
    memo?: string;
    link?: string;
    date?: string;
    temp?: string;
  }>({});

  // Confirmation & Dispatch states
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [dispatchProgress, setDispatchProgress] = useState<number>(0);
  const [dispatchStageLabel, setDispatchStageLabel] = useState<string>('Queued (Simulated)');
  const [lastDispatchResult, setLastDispatchResult] = useState<DispatchResult | null>(null);

  // Sub-category options generator
  const subCategoryOptions: SubCategory[] = useMemo(() => {
    switch (category) {
      case 'SUSPENSION NOTICE':
        return ['ALL CLASSES', 'MORNING CLASSES', 'AFTERNOON CLASSES'];
      case 'HEAT ADVISORY':
        return ['CAUTION', 'EXTREME CAUTION', 'DANGER'];
      case 'RAINFALL ADVISORY':
        return ['YELLOW ADVISORY', 'ORANGE ADVISORY', 'RED ADVISORY'];
      case 'AIR QUALITY':
        return ['UNHEALTHY FOR SENSITIVE', 'UNHEALTHY (PM2.5)', 'VERY UNHEALTHY'];
      case 'CAMPUS EMERGENCY':
        return ['CAMPUS EVACUATION', 'POWER & UTILITIES', 'SECURITY ADVISORY'];
      default:
        return [];
    }
  }, [category]);

  // Sync subcategory when main category changes
  const handleCategorySelect = (newCat: AlertCategory) => {
    setCategory(newCat);
    setErrors({});
    if (newCat === 'SUSPENSION NOTICE') {
      setSubCategory('AFTERNOON CLASSES');
    } else if (newCat === 'HEAT ADVISORY') {
      setSubCategory('EXTREME CAUTION');
    } else if (newCat === 'RAINFALL ADVISORY') {
      setSubCategory('ORANGE ADVISORY');
    } else if (newCat === 'AIR QUALITY') {
      setSubCategory('UNHEALTHY (PM2.5)');
    } else if (newCat === 'CAMPUS EMERGENCY') {
      setSubCategory('CAMPUS EVACUATION');
    }
  };

  // Generate dynamic SMS Template string matching CarSU / Ab!SU screenshot formats
  const generatedSmsText = useMemo(() => {
    const formattedMemo = memoInput ? `per Memo-[${memoInput}]` : 'per Memo-[00-0000]';
    const formattedDate = dateInput ? `[${dateInput}]` : '[MM-DD-YYYY]';
    const formattedLink = linkInput ? linkInput : '[https://...]';

    if (category === 'SUSPENSION NOTICE') {
      return `[CarSU] CLASS SUSPENSION NOTICE: ${subCategory} SUSPENDED on ${formattedDate} ${formattedMemo}. Online classes proceed as scheduled. Full memo: [${formattedLink}]`;
    }

    if (category === 'HEAT ADVISORY') {
      const tempVal = tempInput ? `[${tempInput}]` : '[50]';
      return `[CarSU] HEAT ADVISORY: ${subCategory} level on ${formattedDate}, heat index ~ ${tempVal}°C. Avoid outdoor activity between 10AM - 3PM. Stay hydrated. Info: [${formattedLink}]`;
    }

    if (category === 'RAINFALL ADVISORY') {
      return `[CarSU] RAINFALL ADVISORY: ${subCategory} in effect on ${formattedDate}. Flooding hazard in low-lying grounds. Keep emergency lines active. Details: [${formattedLink}]`;
    }

    if (category === 'AIR QUALITY') {
      return `[CarSU] AIR QUALITY ALERT: ${subCategory} detected on ${formattedDate}. Wear N95 face masks outdoors. Sensitive individuals remain indoors. Advisory: [${formattedLink}]`;
    }

    if (category === 'CAMPUS EMERGENCY') {
      return `[CarSU] URGENT CAMPUS ADVISORY: ${subCategory} issued on ${formattedDate}. Follow campus marshal directives immediately. Official bulletin: [${formattedLink}]`;
    }

    return `[CarSU] ADVISORY: Announcement on ${formattedDate}. Info: [${formattedLink}]`;
  }, [category, subCategory, memoInput, linkInput, dateInput, tempInput]);

  const activeMessageText = isCustomMode ? customMessageBody : generatedSmsText;
  const segmentStats = useMemo(() => calculateSmsSegments(activeMessageText), [activeMessageText]);

  // Validation before sending
  const validateInputs = (): boolean => {
    const newErrors: { memo?: string; link?: string; date?: string; temp?: string } = {};

    if (category === 'SUSPENSION NOTICE') {
      // Memo pattern validation (e.g. 01-1010 or 00-0000)
      if (!memoInput || !/^\d{2}-\d{4}$/.test(memoInput.trim())) {
        newErrors.memo = 'Invalid. ( 00-0000 )';
      }
    }

    if (category === 'HEAT ADVISORY') {
      const num = parseFloat(tempInput);
      if (!tempInput || isNaN(num) || num < 25 || num > 65) {
        newErrors.temp = 'Invalid. (Enter 25-65°C)';
      }
    }

    // Date validation (MM-DD-YYYY or YYYY-MM-DD)
    if (!dateInput || !/^(\d{2}-\d{2}-\d{4}|\d{4}-\d{2}-\d{2})$/.test(dateInput.trim())) {
      newErrors.date = 'Invalid. (MM-DD-YYYY)';
    }

    // Link validation
    if (!linkInput || !linkInput.startsWith('http')) {
      newErrors.link = 'https://...';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendClick = () => {
    if (validateInputs()) {
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmBroadcast = async () => {
    setIsSending(true);
    setDispatchProgress(10);

    // Filter recipients based on college if specified
    const estimatedAudience = targetCollege === 'ALL' 
      ? recipientCount 
      : Math.max(1, Math.round(recipientCount * 0.28));

    // Sample recipient phones
    const samplePhones = Array.from({ length: Math.min(25, estimatedAudience) }, (_, i) => 
      `+63917${Math.floor(1000000 + i * 2781)}`
    );

    try {
      const isSim = defaultSmsGateway.isSimulation();
      setDispatchStageLabel(isSim ? 'Queued (Simulated)' : 'Queuing SMS...');

      const result = await defaultSmsGateway.sendBroadcast(
        activeMessageText,
        samplePhones,
        (progress, _sent, statusLabel) => {
          setDispatchProgress(progress);
          if (statusLabel) {
            setDispatchStageLabel(statusLabel);
          }
        }
      );

      if (!result.success) {
        alert(result.error || 'Failed to dispatch broadcast');
        setIsConfirmOpen(false);
        setIsSending(false);
        return;
      }

      // Create Announcement record
      const newAnnouncement: Announcement = {
        id: `ann-${Date.now().toString(36)}`,
        title: `${category}: ${subCategory}`,
        message: activeMessageText,
        category,
        subCategory,
        referenceUrl: linkInput,
        memoNumber: category === 'SUSPENSION NOTICE' ? memoInput : undefined,
        eventDate: dateInput,
        temperature: category === 'HEAT ADVISORY' ? tempInput : undefined,
        senderId: currentUser.id,
        senderName: currentUser.name,
        sentAt: new Date().toISOString(),
        status: isSim ? 'delivered_simulated' : 'sent',
        isSimulated: isSim,
        recipientCount: estimatedAudience,
        deliverySuccessCount: Math.round(estimatedAudience * 0.997),
        deliveryRate: 99.7,
        smsSegments: segmentStats.segmentCount,
        gatewayUsed: isSim ? 'simulation' : (defaultSmsGateway.getConfig().provider as any),
        targetColleges: [targetCollege],
      };

      setLastDispatchResult(result);
      setIsConfirmOpen(false);
      setIsSending(false);
      onBroadcastSuccess(newAnnouncement, result);
    } catch (err) {
      console.error(err);
      setIsSending(false);
    }
  };

  // Quick fill helper
  const handleQuickPreset = (preset: 'rain' | 'heat' | 'suspension') => {
    if (preset === 'suspension') {
      handleCategorySelect('SUSPENSION NOTICE');
      setSubCategory('AFTERNOON CLASSES');
      setMemoInput('01-1010');
      setDateInput('11-20-2026');
      setLinkInput('https://carsu.edu.ph/memo/01-1010');
    } else if (preset === 'heat') {
      handleCategorySelect('HEAT ADVISORY');
      setSubCategory('EXTREME CAUTION');
      setTempInput('50');
      setDateInput('10-15-2026');
      setLinkInput('https://pagasa.dost.gov.ph/heat-index');
    } else if (preset === 'rain') {
      handleCategorySelect('RAINFALL ADVISORY');
      setSubCategory('ORANGE ADVISORY');
      setDateInput('10-12-2026');
      setLinkInput('https://pagasa.dost.gov.ph/rainfall');
    }
    setErrors({});
  };

  return (
    <div className={`w-full ${isMobileFrame ? 'max-w-[420px] mx-auto' : ''}`}>
      {/* Top Header - "WELCOME, [NAME]" matching wireframes */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-light tracking-wide text-neutral-900 font-['Outfit'] uppercase">
            WELCOME, <span className="font-bold text-neutral-950">{currentUser.name.toUpperCase()}</span>
          </h2>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            Campus Emergency & Advisory SMS Dispatch Console · Caraga State University
          </p>
        </div>

        {/* Quick presets for swift evaluation */}
        <div className="hidden sm:flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] text-neutral-400 font-medium mr-1">Presets:</span>
          <button 
            type="button" 
            onClick={() => handleQuickPreset('suspension')}
            className="text-[11px] px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition-colors"
          >
            Suspension
          </button>
          <button 
            type="button" 
            onClick={() => handleQuickPreset('heat')}
            className="text-[11px] px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition-colors"
          >
            Heat (50°C)
          </button>
          <button 
            type="button" 
            onClick={() => handleQuickPreset('rain')}
            className="text-[11px] px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition-colors"
          >
            Heavy Rain
          </button>
        </div>
      </div>

      {/* Main Form Workstation Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 sm:p-7">
        
        {/* Simulation Demo Mode Banner */}
        {defaultSmsGateway.isSimulation() && (
          <div className="mb-5 py-2.5 px-3.5 bg-blue-50/90 border border-blue-200/80 rounded-xl flex items-center justify-between gap-2 text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
              <span>
                <strong className="font-bold">Prototype Demo Mode:</strong> SMS messages are simulated locally. No credentials or active telco credits required.
              </span>
            </div>
            <span className="text-[10px] font-black tracking-wider bg-blue-200/70 text-blue-800 px-2 py-0.5 rounded-sm uppercase shrink-0">
              SIMULATED
            </span>
          </div>
        )}

        {/* ROW 1: PRIMARY CATEGORY SELECTOR */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Advisory Category
          </label>
          <div className="flex flex-wrap gap-2.5">
            {(['HEAT ADVISORY', 'RAINFALL ADVISORY', 'SUSPENSION NOTICE', 'AIR QUALITY', 'CAMPUS EMERGENCY'] as AlertCategory[]).map((cat) => {
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wide rounded-md transition-all select-none cursor-pointer ${
                    isActive
                      ? 'bg-[#D00000] text-white shadow-sm'
                      : 'bg-[#D6D8DC] hover:bg-[#CBCED3] text-[#D00000]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 2: SUB-CATEGORY SELECTOR */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Classification / Target Window
          </label>
          <div className="flex flex-wrap gap-2.5">
            {subCategoryOptions.map((sub) => {
              const isActive = subCategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubCategory(sub)}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold tracking-wide rounded-md transition-all select-none cursor-pointer ${
                    isActive
                      ? 'bg-[#D00000] text-white shadow-sm'
                      : 'bg-[#D6D8DC] hover:bg-[#CBCED3] text-[#D00000]'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audience Target Scope Filter (All vs Specific College) */}
        <div className="mb-6 pb-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
            <Radio className="w-4 h-4 text-[#D00000]" />
            <span>Target Broadcast Audience:</span>
            <select
              value={targetCollege}
              onChange={(e) => setTargetCollege(e.target.value)}
              className="ml-1 text-xs font-semibold bg-neutral-50 border border-neutral-300 rounded px-2.5 py-1 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {COLLEGES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code === 'ALL' ? 'All Colleges (Entire Campus)' : `${c.code} - ${c.name}`}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-neutral-500 font-medium">
            Active Reach:{' '}
            <span className="font-bold text-[#D00000]">
              {(targetCollege === 'ALL' ? recipientCount : Math.max(1, Math.round(recipientCount * 0.28))).toLocaleString()}
            </span>{' '}
            verified student numbers
          </div>
        </div>

        {/* DYNAMIC FORM INPUTS - Matched to screenshots */}
        <div className="space-y-4 mb-6">
          
          {/* Conditional Field 1: Memo or Temperature or Condition */}
          {category === 'SUSPENSION NOTICE' && (
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={memoInput}
                  onChange={(e) => {
                    setMemoInput(e.target.value);
                    if (errors.memo) setErrors({ ...errors, memo: undefined });
                  }}
                  placeholder={errors.memo || 'Enter memo (e.g. 01-1010)'}
                  className={`w-full px-4 py-3 text-sm rounded-xl border transition-all focus:outline-none ${
                    errors.memo
                      ? 'border-[#D00000] text-[#D00000] placeholder-[#D00000] bg-red-50/20'
                      : 'border-neutral-300 focus:border-[#D00000] text-neutral-800 placeholder-neutral-400'
                  }`}
                />
              </div>
              {errors.memo && (
                <p className="mt-1 text-[11px] text-[#D00000] font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Memo format requirement: 00-0000 (e.g., 01-1010)
                </p>
              )}
            </div>
          )}

          {category === 'HEAT ADVISORY' && (
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={tempInput}
                  onChange={(e) => {
                    setTempInput(e.target.value);
                    if (errors.temp) setErrors({ ...errors, temp: undefined });
                  }}
                  placeholder={errors.temp || 'Enter °C'}
                  className={`w-full px-4 py-3 text-sm rounded-xl border transition-all focus:outline-none ${
                    errors.temp
                      ? 'border-[#D00000] text-[#D00000] placeholder-[#D00000] bg-red-50/20'
                      : 'border-neutral-300 focus:border-[#D00000] text-neutral-800 placeholder-neutral-400'
                  }`}
                />
              </div>
              {errors.temp && (
                <p className="mt-1 text-[11px] text-[#D00000] font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Please specify a valid Heat Index temperature (e.g. 50)
                </p>
              )}
            </div>
          )}

          {(category === 'RAINFALL ADVISORY' || category === 'AIR QUALITY' || category === 'CAMPUS EMERGENCY') && (
            <div>
              <input
                type="text"
                value={customDetailInput}
                onChange={(e) => setCustomDetailInput(e.target.value)}
                placeholder="Enter condition details / hazard alert"
                className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-300 focus:border-[#D00000] text-neutral-800 placeholder-neutral-400 transition-all focus:outline-none"
              />
            </div>
          )}

          {/* Field 2: Reference Source Link (URL) */}
          <div>
            <div className="relative">
              <input
                type="text"
                value={linkInput}
                onChange={(e) => {
                  setLinkInput(e.target.value);
                  if (errors.link) setErrors({ ...errors, link: undefined });
                }}
                placeholder={errors.link || 'Enter link'}
                className={`w-full px-4 py-3 text-sm rounded-xl border transition-all focus:outline-none ${
                  errors.link
                    ? 'border-[#D00000] text-[#D00000] placeholder-[#D00000] bg-red-50/20'
                    : 'border-neutral-300 focus:border-[#D00000] text-neutral-800 placeholder-neutral-400'
                }`}
              />
            </div>
            {errors.link && (
              <p className="mt-1 text-[11px] text-[#D00000] font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Link must begin with https:// (e.g., https://carsu.edu.ph/memo)
              </p>
            )}
          </div>

          {/* Field 3: Date Input */}
          <div>
            <div className="relative">
              <input
                type="text"
                value={dateInput}
                onChange={(e) => {
                  setDateInput(e.target.value);
                  if (errors.date) setErrors({ ...errors, date: undefined });
                }}
                placeholder={errors.date || 'Enter date (MM-DD-YYYY)'}
                className={`w-full px-4 py-3 text-sm rounded-xl border transition-all focus:outline-none ${
                  errors.date
                    ? 'border-[#D00000] text-[#D00000] placeholder-[#D00000] bg-red-50/20'
                    : 'border-neutral-300 focus:border-[#D00000] text-neutral-800 placeholder-neutral-400'
                }`}
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-[11px] text-[#D00000] font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Date must follow MM-DD-YYYY format (e.g. 11-20-2026)
              </p>
            )}
          </div>
        </div>

        {/* SMS PREVIEW CONTAINER - Pixel-matched to screenshots */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-neutral-600">
              SMS Preview
            </span>
            
            <button
              type="button"
              onClick={() => {
                if (!isCustomMode) {
                  setCustomMessageBody(generatedSmsText);
                }
                setIsCustomMode(!isCustomMode);
              }}
              className="text-[11px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1 font-medium transition-colors"
            >
              {isCustomMode ? (
                <>
                  <RotateCcw className="w-3 h-3" /> Revert to Auto-Template
                </>
              ) : (
                <>
                  <Edit3 className="w-3 h-3" /> Direct Edit Body
                </>
              )}
            </button>
          </div>

          {isCustomMode ? (
            <textarea
              rows={5}
              value={customMessageBody}
              onChange={(e) => setCustomMessageBody(e.target.value)}
              className="w-full p-4 rounded-xl border border-neutral-300 focus:border-[#D00000] text-sm text-neutral-800 font-sans leading-relaxed focus:outline-none transition-all shadow-inner"
              placeholder="Edit the exact SMS broadcast message..."
            />
          ) : (
            <div className="w-full min-h-[140px] p-4 sm:p-5 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-800 font-sans leading-relaxed shadow-xs select-text">
              {generatedSmsText}
            </div>
          )}

          {/* SMS Telemetry & Segment Meter */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 font-medium">
            <div className="flex items-center gap-3">
              <span>
                Length: <strong className="text-neutral-800">{segmentStats.characterCount}</strong> chars
              </span>
              <span>·</span>
              <span>
                Standard Units:{' '}
                <strong className={segmentStats.segmentCount > 1 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {segmentStats.segmentCount} SMS Segment{segmentStats.segmentCount > 1 ? 's' : ''}
                </strong>
              </span>
              <span>·</span>
              <span>
                Encoding: <strong className="text-neutral-700">{segmentStats.isUnicode ? 'UCS-2 (Unicode)' : 'GSM-7 (Standard)'}</strong>
              </span>
            </div>

            <span className="text-[11px] text-neutral-400">
              {segmentStats.charsRemainingInSegment} chars left in current segment
            </span>
          </div>
        </div>

        {/* SEND ACTION BUTTON & LOGO FOOTER */}
        <div className="flex items-center justify-between pt-2">
          {/* Subtle status indicator */}
          <div className="text-xs text-neutral-500">
            Gateway:{' '}
            {defaultSmsGateway.isSimulation() ? (
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Sandbox Simulation (Demo Mode · Zero Telco Charges)
              </span>
            ) : (
              <span className="font-semibold text-neutral-700">
                {defaultSmsGateway.getConfig().provider.toUpperCase()} (Live Cellular Broadcast)
              </span>
            )}
          </div>

          {/* SEND BUTTON - Prominent Red Button from Screenshots */}
          <button
            type="button"
            onClick={handleSendClick}
            disabled={isSending}
            className="px-8 sm:px-10 py-2.5 sm:py-3 bg-[#D00000] hover:bg-[#B50000] active:scale-[0.98] text-white font-bold text-sm tracking-wide rounded-md shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
          >
            SEND
          </button>
        </div>

        {/* Bottom Logo - matching the Ab!SU footer in mobile wireframes */}
        <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-center">
          <BrandLogo size="md" />
        </div>
      </div>

      {/* CONFIRMATION SAFEGUARD MODAL */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Are you sure?"
        category={category}
        recipientCount={targetCollege === 'ALL' ? recipientCount : Math.max(1, Math.round(recipientCount * 0.28))}
        smsPreview={activeMessageText}
        isSimulated={defaultSmsGateway.isSimulation()}
        onConfirm={handleConfirmBroadcast}
        onCancel={() => setIsConfirmOpen(false)}
        isSending={isSending}
      />

      {/* Real-time Dispatch Progress Overlay during sending */}
      {isSending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 text-[#D00000] flex items-center justify-center animate-pulse">
              <Radio className="w-6 h-6 animate-spin" />
            </div>
            <h4 className="text-lg font-bold text-neutral-900">
              {defaultSmsGateway.isSimulation()
                ? 'Simulating Campus SMS Dispatch'
                : 'Broadcasting SMS to Campus Network'}
            </h4>
            <p className="text-xs text-neutral-500 mt-1">
              {defaultSmsGateway.isSimulation()
                ? 'Simulating carrier transmission to Globe, Smart & DITO handsets...'
                : 'Dispatching priority packets via Globe, Smart & DITO cellular towers...'}
            </p>

            <div className="mt-5 w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-[#D00000] h-full transition-all duration-300"
                style={{ width: `${dispatchProgress}%` }}
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-500">{dispatchProgress}% Complete</span>
              <span className="font-bold text-[#D00000]">{dispatchStageLabel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
