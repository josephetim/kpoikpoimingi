import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
}

const Modal = ({ open, title, onClose, children, widthClassName = 'max-w-xl' }: ModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div
        className={`max-h-[92vh] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft ${widthClassName}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="max-h-[calc(92vh-58px)] overflow-y-auto p-4">{children}</div>
      </div>
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 -z-10 h-full w-full cursor-default bg-transparent"
        onClick={onClose}
      />
    </div>
  );
};

export default Modal;
