import { useState, useEffect } from 'react';
import { db } from '../lib/db';

export default function Header() {
  const [changelog, setChangelog] = useState('');

  useEffect(() => {
    setChangelog(db.getChangelog());
  }, []);

  const handleChangelogChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setChangelog(val);
    db.saveChangelog(val);
  };

  return (
    <header className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-bold tracking-tight">Nolan.Arc</h1>
        <h2 className="font-sans text-xs uppercase tracking-widest text-brand-text/60 mt-1">Performance System</h2>
      </div>

      <div className="border border-brand-border p-4 rounded-sm bg-brand-bg relative">
        <div className="absolute -top-2.5 left-4 px-2 bg-brand-bg text-xs font-bold uppercase tracking-wider text-brand-text/80">
          Strategic Changelog
        </div>
        <textarea
          value={changelog}
          onChange={handleChangelogChange}
          placeholder="Colle ici les consignes de la semaine..."
          className="w-full bg-transparent resize-none outline-none min-h-[100px] text-sm leading-relaxed"
        />
      </div>
    </header>
  );
}
