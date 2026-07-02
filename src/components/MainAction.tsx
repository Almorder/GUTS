import { Zap } from 'lucide-react';

interface MainActionProps {
  onClick: () => void;
}

export default function MainAction({ onClick }: MainActionProps) {
  return (
    <div className="fixed bottom-6 left-0 w-full px-5 z-40 flex justify-center">
      <button
        onClick={onClick}
        className="w-full max-w-md bg-brand-accent text-brand-bg font-bold py-4 rounded-xl shadow-[0_4px_24px_rgba(204,70,12,0.3)] active:scale-[0.97] active:shadow-[0_2px_12px_rgba(204,70,12,0.2)] transition-all duration-150 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
      >
        <Zap size={18} fill="currentColor" />
        Log New Top Set
      </button>
    </div>
  );
}
