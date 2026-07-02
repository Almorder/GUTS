import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Changelog() {
  const [changelog, setChangelog] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setChangelog(db.getChangelog());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setChangelog(val);
    db.saveChangelog(val);
  };

  const hasContent = changelog.trim().length > 0;

  return (
    <div className="border border-brand-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-brand-text/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${hasContent ? 'bg-brand-accent' : 'bg-brand-border'}`} />
          <span className="text-xs font-bold uppercase tracking-widest">Strategic Changelog</span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-brand-text/40" /> : <ChevronDown size={16} className="text-brand-text/40" />}
      </button>

      {isOpen && (
        <div className="border-t border-brand-border p-3 animate-in slide-in-from-top-2 duration-200">
          <textarea
            value={changelog}
            onChange={handleChange}
            placeholder="Colle ici les consignes de la semaine..."
            className="w-full bg-transparent resize-none outline-none min-h-[120px] text-sm leading-relaxed placeholder:text-brand-text/30"
          />
        </div>
      )}
    </div>
  );
}
