import React, { useState } from 'react';
import { defaultSmsGateway } from '../services/smsService';
import { SmsGatewayConfig, SmsMode } from '../types';
import { 
  Server, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Eye, 
  EyeOff,
  Radio
} from 'lucide-react';

interface SmsGatewaySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsGatewaySettings: React.FC<SmsGatewaySettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const current = defaultSmsGateway.getConfig();
  const [mode, setMode] = useState<SmsMode>(current.mode || 'simulation');
  const [provider, setProvider] = useState<SmsGatewayConfig['provider']>(current.provider || 'simulation');
  const [apiKey, setApiKey] = useState(current.apiKey || '');
  const [senderName, setSenderName] = useState(current.senderName || 'Ab!SU');
  const [accountSid, setAccountSid] = useState(current.accountSid || '');
  const [authToken, setAuthToken] = useState(current.authToken || '');
  const [showKey, setShowKey] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Safeguard: Check if attempting Production mode without credentials
    if (mode === 'production') {
      if (provider === 'semaphore' && !apiKey.trim()) {
        setErrorMessage('Cannot enable Production Mode without a Semaphore API Key. Please switch back to Simulation Mode for prototype demo testing.');
        return;
      }
      if (provider === 'twilio' && (!accountSid.trim() || !authToken.trim())) {
        setErrorMessage('Cannot enable Production Mode without Twilio Account SID and Auth Token. Please switch back to Simulation Mode for prototype demo testing.');
        return;
      }
    }

    defaultSmsGateway.updateConfig({
      mode,
      provider: mode === 'simulation' ? 'simulation' : provider,
      apiKey: apiKey.trim(),
      senderName: senderName.trim() || 'Ab!SU',
      accountSid: accountSid.trim(),
      authToken: authToken.trim(),
    });

    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 1000);
  };

  const envSnippet = `# Ab!SU University SMS Notification System Environment Configuration
# Default Mode: Simulation Mode runs with ZERO credentials required!
SMS_MODE="${mode}"

# (Optional) Production Gateway Credentials:
${mode === 'production' && provider === 'semaphore' ? `SEMAPHORE_API_KEY="${apiKey}"\nSEMAPHORE_SENDER_NAME="${senderName}"` : '# SEMAPHORE_API_KEY=""\n# SEMAPHORE_SENDER_NAME="Ab!SU"'}
${mode === 'production' && provider === 'twilio' ? `TWILIO_ACCOUNT_SID="${accountSid}"\nTWILIO_AUTH_TOKEN="••••••••"\nTWILIO_PHONE_NUMBER="+15550192834"` : '# TWILIO_ACCOUNT_SID=""\n# TWILIO_AUTH_TOKEN=""\n# TWILIO_PHONE_NUMBER=""'}`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-[#D00000]" />
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                SMS Gateway Settings & Mode Configuration
              </h3>
              <p className="text-xs text-neutral-500">
                Switch between School Prototype Demo Mode (Simulated SMS) and Live Production Gateway
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
          
          {/* PRIMARY MODE SELECTOR: SIMULATION VS PRODUCTION */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-2">
              System Dispatch Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Simulation Mode (Recommended & Default) */}
              <button
                type="button"
                onClick={() => {
                  setMode('simulation');
                  setErrorMessage(null);
                }}
                className={`p-4 text-left rounded-xl border transition-all cursor-pointer ${
                  mode === 'simulation'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/30'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-blue-950">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Simulation Demo Mode
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-200/80 text-blue-800">
                    Default
                  </span>
                </div>
                <p className="text-xs text-blue-900/80 leading-relaxed">
                  Recommended for school project testing. Runs with <strong>zero real credentials</strong>. Simulates cellular delivery stages without external API calls or telco costs.
                </p>
              </button>

              {/* Option 2: Production Mode */}
              <button
                type="button"
                onClick={() => setMode('production')}
                className={`p-4 text-left rounded-xl border transition-all cursor-pointer ${
                  mode === 'production'
                    ? 'border-[#D00000] bg-red-50/50 ring-2 ring-red-500/30'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-neutral-900">
                    <Radio className="w-4 h-4 text-[#D00000]" />
                    Production Mode
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-500">
                    Live Telco
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Connects to external gateways (Semaphore, Twilio). Requires valid API credentials and active carrier SMS credits.
                </p>
              </button>
            </div>
          </div>

          {/* SIMULATION MODE INFO BANNER */}
          {mode === 'simulation' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">Simulation Active: No Credentials Required</strong>
                <p className="leading-relaxed text-emerald-800">
                  You can compose alerts, select target student departments, dispatch broadcasts, and inspect delivery logs without entering API keys or configuring environment variables.
                </p>
              </div>
            </div>
          )}

          {/* PRODUCTION CONFIGURATION (ONLY ACTIVE / REQUIRED IN PRODUCTION MODE) */}
          {mode === 'production' && (
            <div className="space-y-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                  Live Gateway Provider
                </span>
                {provider === 'semaphore' && (
                  <a
                    href="https://semaphore.co/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#D00000] hover:underline flex items-center gap-1 font-semibold"
                  >
                    Semaphore API Docs <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Provider Selection */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'semaphore', name: 'Semaphore SMS', desc: 'Philippine Telcos (Globe/Smart/DITO)' },
                  { id: 'twilio', name: 'Twilio SMS', desc: 'Global telecom gateway' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id as any)}
                    className={`p-2.5 text-left rounded-lg border text-xs font-semibold cursor-pointer ${
                      provider === p.id
                        ? 'border-[#D00000] bg-red-50/50 text-[#D00000]'
                        : 'border-neutral-200 bg-white text-neutral-700'
                    }`}
                  >
                    <div>{p.name}</div>
                    <div className="text-[10px] text-neutral-400 font-normal">{p.desc}</div>
                  </button>
                ))}
              </div>

              {provider === 'semaphore' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Semaphore API Key (Required for Production)
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste your Semaphore API Key..."
                        className="w-full px-3 py-2 pr-9 text-xs font-mono border border-neutral-300 rounded-lg bg-white focus:outline-none focus:border-[#D00000]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                      >
                        {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Sender Name (Alpha Tag)
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Ab!SU or CarSU-ALERT (max 11 chars)"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white focus:outline-none focus:border-[#D00000]"
                    />
                  </div>
                </div>
              )}

              {provider === 'twilio' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Twilio Account SID
                    </label>
                    <input
                      type="text"
                      value={accountSid}
                      onChange={(e) => setAccountSid(e.target.value)}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg bg-white focus:outline-none focus:border-[#D00000]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Twilio Auth Token
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        placeholder="Your Twilio Auth Token..."
                        className="w-full px-3 py-2 pr-9 text-xs font-mono border border-neutral-300 rounded-lg bg-white focus:outline-none focus:border-[#D00000]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                      >
                        {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#D00000] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Environment Variables Reference snippet */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-neutral-700">
                Environment Configuration (.env.example reference)
              </span>
              <button
                type="button"
                onClick={handleCopyEnv}
                className="text-[11px] font-semibold text-neutral-700 hover:text-black flex items-center gap-1 cursor-pointer"
              >
                {copiedEnv ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" /> Copied Snippet
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy .env
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed select-text">
              {envSnippet}
            </pre>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#D00000] hover:bg-[#B50000] rounded-lg transition-all shadow-xs cursor-pointer"
            >
              {savedMessage ? 'Saved Settings!' : 'Apply SMS Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
