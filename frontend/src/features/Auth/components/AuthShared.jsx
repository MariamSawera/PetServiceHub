import { PawPrint, ShieldCheck, Lock, Sparkles, Heart } from 'lucide-react';

/** Logo shown top-left on both Login and Signup */
export function PawCareLogo() {
  return (
    <div className="flex items-center gap-2 text-[22px] font-bold text-[var(--theme-text)]">
      <span className="flex text-[var(--theme-primary)]">
        <PawPrint size={24} fill="currentColor" strokeWidth={0} />
      </span>
      PawCare
    </div>
  );
}

/** The three trust badges at the bottom of the card */
export function TrustRow() {
  return (
    <div className="mt-7 flex justify-between gap-3 border-t border-[var(--theme-border-soft)] pt-[22px] max-[860px]:flex-col max-[860px]:gap-3.5">
      <div className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--theme-text-muted)]">
        <ShieldCheck size={18} />
        Trusted by pet parents
      </div>
      <div className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--theme-text-muted)]">
        <Lock size={18} />
        Secure &amp; Private
      </div>
      <div className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--theme-text-muted)]">
        <Sparkles size={18} />
        AI Powered care
      </div>
    </div>
  );
}

/**
 * Right-hand illustration column.
 * Keep the default path aligned with the file in /public.
 */
export function PetImagePanel({ src = './images/pets-hero.png' }) {
  return (
    <div className="relative flex h-full items-center justify-center max-[860px]:hidden">
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[40%_60%_55%_45%/50%_45%_55%_50%] bg-[var(--theme-image-bg)]">
        <span className="absolute left-[8%] top-[6%] flex h-10 w-10 items-center justify-center rounded-full bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] shadow-[0_6px_16px_var(--theme-shadow)]">
          <Heart size={18} fill="currentColor" strokeWidth={0} />
        </span>
        <PawPrint className="absolute right-[4%] top-[2%] text-[var(--theme-primary-soft)] opacity-90" size={64} fill="currentColor" strokeWidth={0} />
        <img
          src={src}
          alt="Happy cat and dog"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.style.background = 'var(--theme-surface-muted)';
          }}
        />
      </div>
    </div>
  );
}
