"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <div className="fixed inset-0 bg-neutral/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn("relative my-auto w-full max-w-lg rounded-box border border-base-300 bg-base-100 p-6 shadow-2xl", className)}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <button className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
            {title && <h2 className="pr-8 font-display text-3xl font-bold leading-tight">{title}</h2>}
            {description && <p className="mt-1.5 text-base-content/70">{description}</p>}
            <div className={cn((title || description) && "mt-5")}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  reasonLabel?: string;
  reasonRequired?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", tone = "primary", loading, reasonLabel, reasonRequired, onConfirm, onClose }: ConfirmProps) {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) setReason("");
  }, [open]);
  const blocked = loading || (reasonRequired && reason.trim().length < 3);
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} className="max-w-md">
      {reasonLabel && (
        <label className="form-control block">
          <span className="mb-1.5 block text-sm font-semibold">{reasonLabel}</span>
          <textarea className="textarea textarea-bordered min-h-24 w-full" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} />
        </label>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Keep as is</button>
        <button className={cn("btn", tone === "danger" ? "btn-error" : "btn-primary")} disabled={blocked} onClick={() => onConfirm(reason.trim())}>
          {loading && <span className="loading loading-spinner loading-xs" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
