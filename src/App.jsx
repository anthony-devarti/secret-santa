import React, { useMemo, useState, useEffect } from "react";
import { makeAssignment, b64encode, b64decode } from "./assign";

function Admin() {
  const [eventName, setEventName] = useState("Secret Santa 2025");
  const [namesRaw, setNamesRaw] = useState("");
  const [links, setLinks] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const names = useMemo(
    () => namesRaw.split(/\r?\n/).map(s => s.trim()).filter(Boolean),
    [namesRaw]
  );

  function generate() {
    setError(""); setSuccess(""); setLinks([]);
    try {
      const pairs = makeAssignment(names);
      const baseUrl = window.location.origin + window.location.pathname;
      const out = pairs.map(({ giver, receiver }) => {
        const token = b64encode({ event: eventName || "Secret Santa", giver, receiver });
        const url = `${baseUrl}#reveal=${token}`;
        return { giver, url };
      });
      setLinks(out);
      setSuccess("Assignments generated. Share each link privately.");
    } catch (e) {
      setError(e.message || "Generation failed.");
    }
  }

  function copyAll() {
    const text = links.map(l => `${l.giver}: ${l.url}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setSuccess("Copied all links.");
      setTimeout(() => setSuccess(""), 1200);
    });
  }

  return (
    <div>
      <h1>Secret Santa Generator</h1>
      <div className="card">
        <div className="row">
          <label style={{ minWidth: 110 }}>Event name</label>
          <input className="input" value={eventName} onChange={e => setEventName(e.target.value)} />
        </div>
        <div style={{ marginTop: "0.8rem" }}>
          <label>Participant names (one per line)</label>
          <textarea value={namesRaw} onChange={e => setNamesRaw(e.target.value)} placeholder="Alice&#10;Bob&#10;Charlie&#10;Dana" />
        </div>
        <div className="row" style={{ marginTop: "0.6rem" }}>
          <button className="btn" onClick={generate} disabled={names.length < 3}>Generate</button>
          <span className="muted">Rules: no self, no pair-swaps.</span>
        </div>
        {error && <div className="error" style={{ marginTop: "0.4rem" }}>{error}</div>}
        {success && <div className="success" style={{ marginTop: "0.4rem" }}>{success}</div>}
      </div>

      {links.length > 0 && (
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h3 style={{ margin: 0 }}>Private links</h3>
            <button className="btn" onClick={copyAll}>Copy all</button>
          </div>
          <ol>
            {links.map(({ giver, url }) => (
              <li key={giver} style={{ marginBottom: "0.5rem" }}>
                <strong>{giver}</strong>: <a href={url}>{url}</a>
              </li>
            ))}
          </ol>
          <div className="muted">Share each person’s link privately. Each link shows only their recipient.</div>
        </div>
      )}

      <div className="card">
        <h3>Privacy</h3>
        <p>Each link encodes only one pairing in the URL hash. Opening a link reveals just <code>giver → receiver</code> for that person.</p>
      </div>
    </div>
  );
}

function Reveal() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const m = (window.location.hash || "").match(/#reveal=([^&]+)/);
    if (!m) { setErr("Invalid or missing reveal link."); return; }
    const decoded = b64decode(m[1]);
    if (!decoded || !decoded.giver || !decoded.receiver) {
      setErr("Reveal link is corrupted.");
      return;
    }
    setData(decoded);
  }, []);

  if (err) return (
    <div>
      <h1>Secret Santa Reveal</h1>
      <div className="error">{err}</div>
      <p className="muted">Ask your organizer to resend your link.</p>
    </div>
  );

  if (!data) return null;

  return (
    <div>
      <h1>{data.event || "Secret Santa"}</h1>
      <div className="card">
        <p><strong>{data.giver}</strong>, you will give a gift to:</p>
        <h2 style={{ marginTop: 0 }}>{data.receiver}</h2>
      </div>
      <p className="muted">Only your assignment is shown.</p>
    </div>
  );
}

export default function App() {
  const isReveal = typeof window !== "undefined" && /#reveal=/.test(window.location.hash);
  return isReveal ? <Reveal /> : <Admin />;
}
