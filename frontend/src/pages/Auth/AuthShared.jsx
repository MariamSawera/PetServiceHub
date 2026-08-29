import { PawPrint, ShieldCheck, Lock, Sparkles, Heart } from 'lucide-react';

/** Logo shown top-left on both Login and Signup */
export function PawCareLogo() {
  return (
    <div className="pc-logo">
      <span className="pc-logo-mark">
        <PawPrint size={24} fill="currentColor" strokeWidth={0} />
      </span>
      PawCare
    </div>
  );
}

/** The three trust badges at the bottom of the card */
export function TrustRow() {
  return (
    <div className="pc-trust-row">
      <div className="pc-trust-item">
        <ShieldCheck size={18} />
        Trusted by pet parents
      </div>
      <div className="pc-trust-item">
        <Lock size={18} />
        Secure &amp; Private
      </div>
      <div className="pc-trust-item">
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
    <div className="pc-image-col">
      <div className="pc-image-blob">
        <span className="pc-chat-bubble">
          <Heart size={18} fill="currentColor" strokeWidth={0} />
        </span>
        <PawPrint className="pc-paw-decor" size={64} fill="currentColor" strokeWidth={0} />
        <img
          src={src}
          alt="Happy cat and dog"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.style.background = '#f8fafc';
          }}
        />
      </div>
    </div>
  );
}
