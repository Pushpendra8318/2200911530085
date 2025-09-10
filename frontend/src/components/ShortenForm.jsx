import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

export default function ShortenForm() {
  const [url, setUrl] = useState("");
  const [shortcode, setShortcode] = useState("");
  const [validity, setValidity] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = { url };
    if (shortcode.trim()) payload.shortcode = shortcode.trim();
    if (validity.trim()) payload.validity = Number(validity);
     try {
      const res = await fetch(`${API_BASE}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResult(data);
      setUrl("");
      setShortcode("");
      setValidity("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="card">
      <h2>Create Short Link</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Original URL
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" required />
        </label>

        <label>
          Custom Shortcode (optional)
          <input value={shortcode} onChange={e => setShortcode(e.target.value)} placeholder="abcd1 (alphanumeric)" />
        </label>

        <label>
          Validity in minutes (optional, default 30)
          <input value={validity} onChange={e => setValidity(e.target.value)} type="number" min="1" />
        </label>

        <button disabled={loading} type="submit">{loading ? "Creating..." : "Create Short Link"}</button>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result">
          <p><strong>Short Link:</strong> <a href={result.shortLink} target="_blank" rel="noreferrer">{result.shortLink}</a></p>
          <p><strong>Expiry:</strong> {new Date(result.expiry).toLocaleString()}</p>
        </div>
        )}
    </div>
  );
}