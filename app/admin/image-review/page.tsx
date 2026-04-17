'use client';

import { useEffect, useState } from 'react';

type Classified = {
  wineId: string;
  decision: 'keep' | 'auto-accept' | 'flag';
  chosen?: { imageUrl: string; validation: { confidence: string; reasons: string[] } };
  candidates: Array<{ imageUrl: string; sourcePageUrl: string; sourcePageTitle: string; source: string; validation: { confidence: string; reasons: string[] } }>;
};

type WineMeta = { id: string; name: string; region: string; country: string; grape: string; category: string; currentImage: string };

export default function ReviewPage() {
  const [queue, setQueue] = useState<Array<Classified & { wine: WineMeta }>>([]);
  const [decisions, setDecisions] = useState<Record<string, { action: string; imageUrl?: string; pastedUrl?: string }>>({});
  const [i, setI] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/admin/image-review/api/queue').then((r) => r.json()),
      fetch('/admin/image-review/api/decide').then((r) => r.json()),
    ]).then(([q, d]) => {
      setQueue(q);
      const seen: Record<string, any> = {};
      for (const dd of d) seen[dd.wineId] = dd;
      setDecisions(seen);
      const next = q.findIndex((item: any) => !seen[item.wineId]);
      setI(Math.max(0, next));
    });
  }, []);

  if (queue.length === 0) return <main className="p-8">Loading or no flagged wines.</main>;
  const item = queue[i];
  if (!item) return <main className="p-8">All done! {queue.length} wines reviewed.</main>;

  async function submit(action: string, payload: Record<string, unknown>) {
    const res = await fetch('/admin/image-review/api/decide', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ wineId: item.wineId, action, ...payload }),
    });
    if (res.ok) setI((n) => n + 1);
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold mb-2">{item.wine.name}</h1>
      <p className="text-sm text-gray-600 mb-4">
        {item.wine.country} · {item.wine.region} · {item.wine.grape} · ({i + 1}/{queue.length})
      </p>
      {item.wine.currentImage && (
        <div className="mb-4">
          <div className="text-xs text-gray-500">Current</div>
          <img src={item.wine.currentImage} alt="current" className="h-48 border" />
        </div>
      )}
      <div className="grid grid-cols-4 gap-3">
        {item.candidates.map((c, idx) => (
          <button key={idx} onClick={() => submit('accept', { imageUrl: c.imageUrl })}
                  className="border rounded p-2 hover:border-black text-left">
            <img src={c.imageUrl} alt="" className="h-48 w-full object-contain mb-2" />
            <div className="text-xs">
              <div><b>{c.source}</b> — {c.validation.confidence}</div>
              <div className="text-gray-500 truncate">{c.sourcePageTitle}</div>
              <div className="text-gray-500">{c.validation.reasons.join(', ')}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 flex gap-2 items-end">
        <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const url = f.get('url') as string; if (url) submit('pasted-url', { pastedUrl: url }); }}>
          <input name="url" placeholder="Paste a better image URL" className="border px-2 py-1 w-96" />
          <button className="ml-2 border px-3 py-1">Use URL</button>
        </form>
        <button onClick={() => submit('placeholder', { placeholderCategory: item.wine.category })} className="border px-3 py-1">
          Use category placeholder
        </button>
        <button onClick={() => setI((n) => n + 1)} className="border px-3 py-1">Skip</button>
      </div>
    </main>
  );
}
