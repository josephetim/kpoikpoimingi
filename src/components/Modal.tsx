import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
}

const Modal = ({ open, title, onClose, children, widthClassName = 'sm:max-w-xl' }: ModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-slate-900/60"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-full items-center justify-center">
        <div
          className={`max-h-[90vh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft sm:w-full ${widthClassName}`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
            <h2 className="truncate pr-2 text-base font-semibold text-slate-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
          <div className="max-h-[calc(90vh-58px)] overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
