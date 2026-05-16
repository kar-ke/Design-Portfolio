import { useEffect, useState } from 'react';

export function Toast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setMsg(e.detail);
      setTimeout(() => setMsg(null), 2500);
    };
    window.addEventListener('show-toast', handler);
    return () => window.removeEventListener('show-toast', handler);
  }, []);

  if (!msg) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-[#1a1a1a] border border-white/10 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="font-sans text-xs uppercase tracking-widest text-[#f4f0e6] font-medium">{msg}</span>
      </div>
    </div>
  );
}
