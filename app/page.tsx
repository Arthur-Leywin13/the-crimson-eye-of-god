"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { PLATFORMS, type Platform } from "@/lib/platforms";
import AdSenseAd from "@/components/adsense-ad";

type Mode = "global" | "platform";

export default function Home() {
  const [username, setUsername] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [mode, setMode] = useState<Mode>("global");
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0].id);
  const [searched, setSearched] = useState(false);
  const [searchedUsername, setSearchedUsername] = useState("");
  const [showVariants, setShowVariants] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [preparedUrls, setPreparedUrls] = useState<Record<string, string>>({});
  const [searchedVariants, setSearchedVariants] = useState<string[]>([]);

  const normalized = username.trim().replace(/^@/, "");
  const visiblePlatforms = mode === "platform"
    ? PLATFORMS.filter((platform) => platform.id === selectedPlatform)
    : activeFilter === "all"
      ? PLATFORMS
      : PLATFORMS.filter((platform) => platform.id === activeFilter);

  async function runSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!normalized || !authorized || isSearching) return;

    setIsSearching(true);
    setSearchError("");
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: normalized,
          platform: mode === "platform" ? selectedPlatform : undefined,
          authorized,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Search could not be completed.");
      }

      const urls = Object.fromEntries(
        (payload.results as Array<{ platform_id: string; profile_url: string }>).map((item) => [item.platform_id, item.profile_url]),
      );
      setPreparedUrls(urls);
      setSearchedVariants(Array.isArray(payload.variants) ? payload.variants : []);
      setSearched(true);
      setSearchedUsername(payload.query);
      setShowVariants(false);
      setActiveFilter(mode === "global" ? "all" : selectedPlatform);
      const destination = new URL("/results", window.location.origin);
      destination.searchParams.set("username", payload.query);
      if (mode === "platform") destination.searchParams.set("platform", selectedPlatform);
      window.location.assign(destination.toString());
    } catch (error) {
      setSearched(false);
      setSearchError(error instanceof Error ? error.message : "Unexpected search error.");
    } finally {
      setIsSearching(false);
    }
  }

  function profileUrl(platform: Platform, handle: string) {
    return preparedUrls[platform.id] || platform.profileUrl(handle);
  }

  function exportReport(format: "json" | "csv") {
    if (!searchedUsername) return;
    const rows = visiblePlatforms.map((platform) => ({
      platform: platform.name,
      username: searchedUsername,
      profile_url: profileUrl(platform, searchedUsername),
      status: "link_prepared",
      verification: "manual_required",
    }));
    const csv = [
      ["platform", "username", "profile_url", "status", "verification"],
      ...rows.map((row) => [row.platform, row.username, row.profile_url, row.status, row.verification]),
    ].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const content = format === "json" ? JSON.stringify({ query: searchedUsername, results: rows, note: "Candidate links only; profiles are not confirmed." }, null, 2) : csv;
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `crimson-eye-${searchedUsername}-${format}.${format}`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="The Crimson Eye of God home">
          <span className="brand-mark"><span /></span>
          <span className="brand-copy"><strong>THE CRIMSON EYE</strong><small>PUBLIC INTELLIGENCE</small></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <a className="side-link active" href="#search"><span>⌕</span> Username discovery</a>
        <a className="side-link" href="#platforms"><span>◫</span> Platform explorer</a>
        <a className="side-link" href="#results"><span>▤</span> Search catalogue</a>
        <div className="side-bottom">
          <div className="privacy-card"><span className="privacy-dot" /> PUBLIC SOURCES ONLY<p>Search links are generated for public profile routes. Restricted or inconclusive pages are never presented as confirmed accounts.</p></div>
          <div className="side-version">EARLY ACCESS <span>v0.1.0</span></div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div><span className="eyebrow">INTELLIGENCE WORKSPACE</span><span className="top-title">Username discovery</span></div>
          <div className="top-right"><span className="status-indicator" /> SYSTEM READY <span className="avatar">CE</span></div>
        </header>

        <div className="content">
          <section className="intro" id="search">
            <div className="intro-copy">
              <div className="eyebrow">IDENTITY RESEARCH / 001</div>
              <h1>Every identity<br /><em>leaves a trace.</em></h1>
              <p>Explore publicly accessible profile links across social platforms. One username, one structured view.</p>
            </div>
            <div className="eye-art" aria-hidden="true"><div className="eye-ring"><div className="eye-core" /></div><span>OBSERVE · VERIFY · DOCUMENT</span></div>
          </section>

          <AdSenseAd slot={process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT ?? ""} />

          <section className="search-panel">
            <div className="panel-heading"><div><span className="eyebrow">NEW INVESTIGATION</span><h2>Start with a username</h2></div><span className="step-tag">01 / SEARCH</span></div>
            <form onSubmit={runSearch}>
              <label htmlFor="username">USERNAME OR HANDLE</label>
              <div className="input-wrap"><span className="at-sign">@</span><input id="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="e.g. arthurleywin" autoComplete="off" /><button type="submit" disabled={!normalized || !authorized || isSearching}>{isSearching ? "Preparing..." : "Initiate search"} <span>↗</span></button></div>
            </form>
            {searchError && <p className="search-error" role="alert">{searchError}</p>}
            <label className="authorization-check"><input type="checkbox" checked={authorized} onChange={(event) => setAuthorized(event.target.checked)} /><span>I own this account or have explicit permission to audit it.</span></label>
            <div className="search-options">
              <div className="mode-switch" role="group" aria-label="Search mode">
                <button className={mode === "global" ? "selected" : ""} onClick={() => { setMode("global"); setActiveFilter("all"); }} type="button">Global search <span>All platforms</span></button>
                <button className={mode === "platform" ? "selected" : ""} onClick={() => { setMode("platform"); setActiveFilter(selectedPlatform); }} type="button">Single platform <span>Focused search</span></button>
              </div>
              {mode === "platform" && <select value={selectedPlatform} onChange={(event) => { setSelectedPlatform(event.target.value); setActiveFilter(event.target.value); }} aria-label="Choose platform">{PLATFORMS.map((platform) => <option key={platform.id} value={platform.id}>{platform.name}</option>)}</select>}
            </div>
          </section>

          <section className="platform-section" id="platforms">
            <div className="section-heading"><div><span className="eyebrow">NETWORK COVERAGE</span><h2>Platform catalogue</h2></div><span className="count-pill">10 PLATFORMS</span></div>
            <div className="platform-grid">{PLATFORMS.map((platform, index) => <button className="platform-tile platform-tile-button" key={platform.id} type="button" onClick={() => { setMode("platform"); setSelectedPlatform(platform.id); setActiveFilter(platform.id); document.getElementById("search")?.scrollIntoView({ behavior: "smooth" }); }}><span className="platform-index">0{index + 1}</span><span className="platform-symbol">{platform.symbol}</span><span className="platform-name">{platform.name}</span><span className="platform-arrow">↗</span></button>)}</div>
          </section>

          {searched && <section className="results-section" id="results">
            <div className="section-heading"><div><span className="eyebrow">INVESTIGATION OUTPUT</span><h2>Search catalogue</h2></div><span className="count-pill">{visiblePlatforms.length.toString().padStart(2, "0")} DESTINATIONS</span></div>
            <div className="result-summary"><div><span className="summary-label">SEARCHED HANDLE</span><strong>@{searchedUsername}</strong></div><div><span className="summary-label">SEARCH MODE</span><strong>{mode === "global" ? "Global discovery" : "Single platform"}</strong></div><div><span className="summary-label">DESTINATIONS SHOWN</span><strong>{visiblePlatforms.length.toString().padStart(2, "0")} / 10</strong></div></div>
            {mode === "global" && <nav className="result-filters" aria-label="Filter results by platform"><button type="button" className={activeFilter === "all" ? "filter-chip active" : "filter-chip"} onClick={() => setActiveFilter("all")}>All platforms <span>10</span></button>{PLATFORMS.map((platform) => <button type="button" key={platform.id} className={activeFilter === platform.id ? "filter-chip active" : "filter-chip"} onClick={() => setActiveFilter(platform.id)}>{platform.name}</button>)}</nav>}
            <div className="results-list">{visiblePlatforms.map((platform) => <article className="result-row" key={platform.id}><div className="result-platform"><span className="platform-symbol">{platform.symbol}</span><div><strong>{platform.name}</strong><small>{platform.domain}</small></div></div><div className="result-state"><span className="state-dot" /> Link prepared · verification required</div><a className="open-link" href={profileUrl(platform, searchedUsername)} target="_blank" rel="noreferrer">Open profile <span>↗</span></a></article>)}</div>
            <div className="disclaimer">These are candidate profile URLs, not confirmed account matches. A platform may redirect, require sign-in, restrict access or return an inconclusive response. Verify identity using the platform itself and do not infer that a handle is available from a failed request.</div>
            <div className="export-actions"><span>EXPORT CURRENT VIEW</span><button type="button" onClick={() => exportReport("json")}>Download JSON ↧</button><button type="button" onClick={() => exportReport("csv")}>Download CSV ↧</button></div>
            <button className="variant-toggle" onClick={() => setShowVariants((value) => !value)} type="button">{showVariants ? "Hide" : "Explore"} username variants <span>{showVariants ? "−" : "+"}</span></button>
            {showVariants && <div className="variant-list">{searchedVariants.map((variant) => <div key={variant}><span>@{variant}</span><button onClick={() => setUsername(variant)} type="button">Use handle ↗</button></div>)}</div>}
          </section>}
          <footer><span>THE CRIMSON EYE OF GOD</span><span>PUBLIC DATA · RESPONSIBLE RESEARCH · 2026</span></footer>
        </div>
      </section>
    </main>
  );
}
