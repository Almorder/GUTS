interface MainActionProps {
  onClick: () => void;
}

export default function MainAction({ onClick }: MainActionProps) {
  return (
    <div className="fixed bottom-24 left-0 w-full px-4 z-10 flex justify-center">
      <button
        onClick={onClick}
        className="w-full max-w-md bg-brand-accent text-brand-bg font-bold py-4 rounded-sm shadow-lg active:scale-[0.98] transition-transform uppercase tracking-widest text-sm"
      >
        Log New Top Set
      </button>
    </div>
  );
}
