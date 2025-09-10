import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

export default function StatsPage() {
  const [shortcode, setShortcode] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchStats(e) {
    e.preventDefault();
    setData(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/shorturls/${encodeURIComponent(shortcode)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch stats");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="card">
      <h2>Get Short Link Statistics</h2>
      <form onSubmit={fetchStats}>
        <label>
          Shortcode
          <input value={shortcode} onChange={e => setShortcode(e.target.value)} placeholder="abcd1" required />
        </label>
        <button disabled={loading} type="submit">{loading ? "Loading..." : "Get Stats"}</button>
      </form>

      {error && <div className="error">{error}</div>}

      {data && (
        <div className="result">
          <p><strong>Short Link:</strong> <a href={data.shortLink} target="_blank" rel="noreferrer">{data.shortLink}</a></p>
          <p><strong>Original URL:</strong> {data.originalUrl}</p>
          <p><strong>Created At:</strong> {new Date(data.createdAt).toLocaleString()}</p>
          <p><strong>Expiry:</strong> {new Date(data.expiryAt).toLocaleString()}</p>
          <p><strong>Clicks:</strong> {data.clicks}</p>
 <h3>Click Metadata</h3>
          {data.clicksMeta && data.clicksMeta.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Referrer</th>
                  <th>Country</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {data.clicksMeta.map((c, i) => (
                  <tr key={i}>
                    <td>{new Date(c.timestamp).toLocaleString()}</td>
                    <td>{c.referrer || "-"}</td>
                    <td>{c.country || "-"}</td>
                    <td>{c.ip || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No clicks yet.</p>}
        </div>
      )}
    </div>
  );
}