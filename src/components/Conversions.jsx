import { useEffect, useState } from 'react';

export default function Conversions({ backendUrl }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    load();
  }, [backendUrl]);

  async function load(url='') {
    setLoading(true);
    setError('');
    try {
      const qs = url ? `?page_url=${encodeURIComponent(url)}` : '';
      const res = await fetch(`${backendUrl}/api/conversions${qs}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      setError('Failed to load conversions');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpsert(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const page_url = form.page_url.value.trim();
    const page_title = form.page_title.value.trim();
    const source = form.source.value.trim();
    const target = form.target.value.trim();
    const rate = parseFloat(form.rate.value.trim());
    if (!page_url || !source || !target || !rate) return;

    try {
      const res = await fetch(`${backendUrl}/api/conversions/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_url, page_title, items: [{ source, target, rate }] })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      await load(pageUrl);
      form.reset();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-slate-100 font-semibold">Conversions</h2>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <input placeholder="Filter by page URL" value={pageUrl} onChange={(e)=>setPageUrl(e.target.value)}
            className="px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-slate-200 w-64" />
          <button onClick={()=>load(pageUrl)} className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-white">Apply</button>
        </div>
      </div>

      {loading && <div className="text-slate-300">Loading…</div>}
      {error && <div className="text-red-400">{error}</div>}

      <div className="grid gap-2">
        {items.map((it) => (
          <div key={it.id} className="p-3 rounded-md border border-slate-800/70 bg-slate-900/40">
            <div className="text-sm text-slate-300">{it.page_title || it.page_url}</div>
            <div className="text-slate-200"><span className="font-medium">1 {it.source}</span>
            <span className="mx-2 text-slate-400">→</span>
            <span className="font-medium">{it.rate} {it.target}</span></div>
            {it.text && <div className="text-xs text-slate-500 mt-1 truncate">{it.text}</div>}
          </div>
        ))}
      </div>

      <form onSubmit={handleUpsert} className="mt-4 space-y-2">
        <div className="text-slate-300 text-sm">Add or correct a conversion</div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <input name="page_url" placeholder="Page URL" className="px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-slate-200 col-span-2" />
          <input name="page_title" placeholder="Page Title (optional)" className="px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-slate-200 col-span-2" />
          <input name="source" placeholder="Source (e.g., Gem)" className="px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-slate-200" />
          <input name="target" placeholder="Target (e.g., Coin)" className="px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-slate-200" />
          <input name="rate" type="number" step="0.0001" placeholder="Rate" className="px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-slate-200" />
          <button className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white col-span-2 md:col-span-1">Save</button>
        </div>
      </form>
    </div>
  );
}
