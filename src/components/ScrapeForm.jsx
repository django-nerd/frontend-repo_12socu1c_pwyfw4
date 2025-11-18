import { useState } from "react";

export default function ScrapeForm({ backendUrl, onDone }) {
  const [url, setUrl] = useState("https://sites.google.com/view/ball-td-tower-values-dps-list/currencies/gems/mythical-gems");
  const [crawl, setCrawl] = useState(true);
  const [maxPages, setMaxPages] = useState(10);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch(`${backendUrl}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, crawl, max_pages: Number(maxPages) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to scrape");
      setStatus(`Saved ${data.pages_saved} page(s)`);
      onDone?.();
    } catch (e) {
      setStatus(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm text-slate-300 mb-1">Start URL</label>
        <input
          className="w-full px-3 py-2 rounded-md bg-slate-800/60 border border-slate-700/60 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 text-slate-300 text-sm">
          <input type="checkbox" checked={crawl} onChange={(e) => setCrawl(e.target.checked)} />
          Crawl same site
        </label>
        <input
          type="number"
          min={1}
          max={200}
          value={maxPages}
          onChange={(e) => setMaxPages(e.target.value)}
          className="w-20 px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-slate-200"
        />
        <span className="text-slate-400 text-sm">pages</span>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white"
      >
        {loading ? "Scraping…" : "Scrape"}
      </button>
      {status && <div className="text-slate-300 text-sm">{status}</div>}
    </form>
  );
}
