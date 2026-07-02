import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface MainActionProps {
  onClick: () => void;
}

export default function MainAction({ onClick }: MainActionProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className="bg-brand-accent text-[#F0EBE2] p-4 rounded-2xl shadow-[0_8px_32px_rgba(204,70,12,0.4)] flex items-center justify-center border border-brand-accent/20 outline-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
