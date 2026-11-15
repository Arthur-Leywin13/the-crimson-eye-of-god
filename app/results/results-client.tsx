"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PLATFORMS } from "@/lib/platforms";

type PublicProfile = {
  login?: string;
  name?: string | null;
  avatar_url?: string;
  html_url?: string;
  bio?: string | null;
  blog?: string | null;
  company?: string | null;
  public_repos?: number;
  followers?: number;
  following?: number;
};

type SearchResult = {
  platform_id: string;
  platform: string;
  username: string;
  profile_url: string;
  status: string;
  verification: string;
  profile: PublicProfile | null;
};

export default function ResultsClient({ username, platform }: { username: string; platform?: string }) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [variants, setVariants] = useState<string[]>([]);
  const [selected, setSelected] = useState(platform || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, platform: platform || undefined, authorized: true }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Search failed.");
        if (active) {
          setResults(payload.results || []);
          setVariants(payload.variants || []);
          if (!selected && payload.results?.[0]) setSelected(payload.results[0].platform_id);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load results.");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (username) load();
    else { setError("No username was provided."); setLoading(false); }
    return () => { active = false; };
  }, [username, platform]);

  const current = useMemo(() => results.find((item) => item.platform_id === selected) || null, [results, selected]);

  function selectResult(id: string) {
    setSelected(id);
    const url = new URL(window.location.href);
    url.searchParams.set("platform", id);
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <main className="results-page">
      <header className="results-topbar">
        <Link href="/" className="back-home">← Back to search</Link>
        <span className="results-brand">THE CRIMSON EYE <small>RESULTS WORKSPACE</small></span>
      </header>
      <div className="results-content">
        <div className="results-heading">
          <span className="eyebrow">AUTHORIZED ACCOUNT AUDIT</span>
          <h1>Results for <em>@{username}</em></h1>
          <p>Exact matches and candidate profile links are shown separately. A prepared link is not proof that an account exists.</p>
        </div>

        {loading && <div className="results-message">Checking available public profile information…</div>}
        {error && <div className="results-message error" role="alert">{error}</div>}

        {!loading && !error && (
          <div className="results-layout">
            <section className="result-cards" aria-label="Platform results">
              <div className="section-heading"><div><span className="eyebrow">PLATFORM MATCHES</span><h2>{results.length} destinations</h2></div></div>
              {results.map((item) => {
                const exact = item.status === "exact_match";
                return (
                  <button className={selected === item.platform_id ? "profile-card selected" : "profile-card"} key={item.platform_id} onClick={() => selectResult(item.platform_id)} type="button">
                    {item.profile?.avatar_url
                      ? <img className="profile-avatar" src={item.profile.avatar_url} alt={`${item.platform} profile avatar`} />
                      : <span className="profile-avatar placeholder">{PLATFORMS.find((entry) => entry.id === item.platform_id)?.symbol || "?"}</span>}
                    <span className="profile-card-copy"><strong>{item.profile?.name || item.profile?.login || `@${item.username}`}</strong><small>{item.platform} · @{item.username}</small></span>
                    <span className={exact ? "match-status exact" : "match-status"}>{exact ? "Exact match" : item.status === "not_found" ? "Not found" : "Link only"}</span>
                  </button>
                );
              })}
            </section>

            <section className="profile-detail">
              <span className="eyebrow">SELECTED RESULT</span>
              {current ? (
                <>
                  <div className="detail-heading">
                    {current.profile?.avatar_url
                      ? <img className="detail-avatar" src={current.profile.avatar_url} alt="Public profile avatar" />
                      : <span className="detail-avatar placeholder">{PLATFORMS.find((entry) => entry.id === current.platform_id)?.symbol || "?"}</span>}
                    <div><h2>{current.profile?.name || current.profile?.login || `@${current.username}`}</h2><p>{current.platform} · @{current.username}</p></div>
                  </div>
                  {current.platform_id === "github" && current.profile ? (
                    <div className="public-fields">
                      <span className="match-banner">Exact username returned by GitHub's official public API</span>
                      {current.profile.bio && <div><small>BIO</small><p>{current.profile.bio}</p></div>}
                      {current.profile.company && <div><small>COMPANY</small><p>{current.profile.company}</p></div>}
                      {current.profile.blog && <div><small>WEBSITE</small><p><a href={current.profile.blog.startsWith("http") ? current.profile.blog : `https://${current.profile.blog}`} target="_blank" rel="noreferrer">{current.profile.blog}</a></p></div>}
                      <div className="profile-stats"><span><strong>{current.profile.public_repos ?? 0}</strong><small>PUBLIC REPOS</small></span><span><strong>{current.profile.followers ?? 0}</strong><small>FOLLOWERS</small></span><span><strong>{current.profile.following ?? 0}</strong><small>FOLLOWING</small></span></div>
                    </div>
                  ) : current.platform_id === "github" ? (
                    <p className="detail-note">{current.status === "not_found" ? "GitHub did not return a public account for this exact username." : "GitHub's public API could not confirm this username right now."}</p>
                  ) : (
                    <p className="detail-note">This platform does not provide an approved public profile lookup in this version. No profile photo or identity details are fetched. Open the platform and verify the account you own or are authorized to audit.</p>
                  )}
                  <a className="detail-open" href={current.profile?.html_url || current.profile_url} target="_blank" rel="noreferrer">Open official profile ↗</a>
                </>
              ) : <p className="detail-note">Select a platform result to see its available details.</p>}
            </section>
          </div>
        )}

        {!loading && variants.length > 1 && (
          <section className="variant-suggestions">
            <span className="eyebrow">USERNAME VARIANTS</span>
            <h2>Possible variations — not searched</h2>
            <p>These are spelling suggestions only. They are not treated as matches and are not checked against other people's profiles.</p>
            <div>{variants.filter((value) => value.toLowerCase() !== username.toLowerCase()).map((value) => <span key={value}>@{value}</span>)}</div>
          </section>
        )}
        <p className="results-disclaimer">Only GitHub profile details are retrieved through its official public API. Other platforms currently show candidate links only. Use this workspace solely for accounts you own or have explicit permission to audit.</p>
      </div>
    </main>
  );
}
