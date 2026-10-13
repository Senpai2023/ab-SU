import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  category?: string;
  recipientCount?: number;
  smsPreview?: string;
  isSimulated?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSending?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title = 'Are you sure?',
  category,
  recipientCount,
  isSimulated = true,
  onConfirm,
  onCancel,
  isSending = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-[340px] sm:max-w-[380px] bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-neutral-100 transform transition-all duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="text-center py-2">
          <h3 className="text-xl sm:text-2xl font-semibold text-neutral-800 tracking-tight">
            {title}
          </h3>
          {category && (
            <p className="mt-2 text-xs text-neutral-500 font-medium">
              Broadcast dispatch: <span className="font-semibold text-neutral-800">{category}</span>
              {recipientCount !== undefined && (
                <> to <span className="text-[#D00000] font-bold">{recipientCount.toLocaleString()}</span> registered students</>
              )}
            </p>
          )}

          {isSimulated && (
            <div className="mt-3 py-1.5 px-3 bg-blue-50 border border-blue-200/70 rounded-lg text-[11px] text-blue-700 font-medium leading-tight">
              <span className="font-bold">SIMULATION MODE:</span> Simulated dispatch for school prototype demo. Zero telecom SMS credits used.
            </div>
          )}
        </div>

        <div className="mt-7 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={isSending}
            onClick={onConfirm}
            className="flex-1 max-w-[130px] py-2.5 px-4 bg-[#D00000] hover:bg-[#B50000] active:scale-[0.98] text-white font-medium text-sm rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 cursor-pointer"
          >
            {isSending ? 'Sending...' : 'Confirm'}
          </button>

          <button
            type="button"
            disabled={isSending}
            onClick={onCancel}
            className="flex-1 max-w-[130px] py-2.5 px-4 bg-white hover:bg-neutral-50 active:scale-[0.98] border border-neutral-300 text-neutral-700 font-medium text-sm rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
