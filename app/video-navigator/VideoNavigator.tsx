'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Chapter = { time: number; title: string; description: string };
type Note = { time: number; type: string; text: string };
type Config = { version: number; title: string; video: string; chapters: Chapter[]; notes: Note[] };

const fallback: Config = {
  version: 1,
  title: 'A recording with a little more context',
  video: 'https://raw.githubusercontent.com/BagToad/github-video-navigator/main/public/demo/walkthrough.mp4',
  chapters: [
    { time: 0, title: 'Start with the recording', description: 'One GitHub link brings video and context together.' },
    { time: 10, title: 'Give the video chapters', description: 'Useful moments become jumpable.' },
    { time: 20, title: 'Follow the decisions', description: 'Recorded notes tell what happened and why.' },
    { time: 30, title: 'Share the exact moment', description: 'Send a link that opens where the conversation starts.' },
  ],
  notes: [
    { time: 0, type: 'Observation', text: 'The recording is only part of the story.' },
    { time: 5, type: 'Decision', text: 'Keep the context beside the work.' },
    { time: 10, type: 'Action', text: 'Mark useful changes of context.' },
    { time: 16, type: 'Result', text: 'Seeking works in both directions.' },
    { time: 20, type: 'Observation', text: 'Notes are not a transcript.' },
    { time: 25, type: 'Decision', text: 'Leave room to read.' },
    { time: 30, type: 'Action', text: 'Link to the moment under discussion.' },
    { time: 36, type: 'Result', text: 'Ready for another set of eyes.' },
  ],
};

function safeVideoUrl(value: string) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.toString() : ''; }
  catch { return ''; }
}
function stamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ':' + String(s).padStart(2, '0');
}

export default function VideoNavigator() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [config, setConfig] = useState<Config>(fallback);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('/video-navigator.config.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: Config) => {
        if (data && data.version === 1 && typeof data.title === 'string' && safeVideoUrl(data.video) && Array.isArray(data.chapters) && Array.isArray(data.notes)) setConfig(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const start = Number(new URLSearchParams(window.location.search).get('t') || 0);
    if (Number.isFinite(start) && start > 0) {
      const video = videoRef.current;
      if (video) {
        const seek = () => { video.currentTime = start; setCurrent(start); };
        if (video.readyState >= 1) seek();
        else video.addEventListener('loadedmetadata', seek, { once: true });
      }
    }
  }, [config]);

  const videoUrl = useMemo(() => safeVideoUrl(config.video), [config.video]);
  const activeChapter = [...config.chapters].filter(c => c.time <= current).sort((a,b) => b.time-a.time)[0];
  const seek = (time: number) => {
    if (videoRef.current) { videoRef.current.currentTime = time; setCurrent(time); }
  };
  const shareMoment = async (time = Math.floor(current)) => {
    const url = new URL(window.location.href);
    url.searchParams.set('t', String(Math.max(0, time)));
    try {
      await navigator.clipboard.writeText(url.toString());
      setStatus('Timestamp link copied');
    } catch {
      setStatus(url.toString());
    }
    window.setTimeout(() => setStatus(''), 3500);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#080b14', color: '#f4f6ff', padding: '28px 18px 60px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <a href="/" style={{ color: '#9ba9c6', textDecoration: 'none', fontSize: 14 }}>← Back to Kaouzn1</a>
        <header style={{ margin: '28px 0 22px' }}>
          <div style={{ color: '#67e8f9', fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase' }}>GitHub Video Navigator</div>
          <h1 style={{ fontSize: 'clamp(30px,5vw,48px)', letterSpacing: '-.04em', margin: '10px 0' }}>{config.title}</h1>
          <p style={{ color: '#aab5ca', lineHeight: 1.6, maxWidth: 720 }}>A recording, timestamped chapters, and decision notes in one place. Jump to a moment or share a link that opens at the exact time.</p>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(270px, .8fr)', gap: 18 }}>
          <section style={{ minWidth: 0, background: '#111827', border: '1px solid #263249', borderRadius: 18, padding: 14 }}>
            {videoUrl ? <video ref={videoRef} src={videoUrl} controls playsInline preload="metadata" onTimeUpdate={e => setCurrent(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(e.currentTarget.duration || 0)} style={{ display: 'block', width: '100%', borderRadius: 12, background: '#000', maxHeight: 620 }} /> : <p>Video URL must use HTTPS.</p>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
              <div><strong>{stamp(current)}</strong><span style={{ color: '#8491aa' }}> / {stamp(duration || 0)}</span><div style={{ color: '#9eabc2', fontSize: 13, marginTop: 4 }}>{activeChapter?.title || 'Recording'}</div></div>
              <button onClick={() => shareMoment()} style={buttonStyle}>Copy link to this moment</button>
            </div>
            <div style={{ marginTop: 24 }}>
              <h2 style={headingStyle}>Chapters</h2>
              <div style={{ display: 'grid', gap: 8 }}>
                {config.chapters.slice().sort((a,b) => a.time-b.time).map(ch => (
                  <button key={ch.time + ch.title} onClick={() => seek(ch.time)} style={{ ...chapterStyle, borderColor: activeChapter?.time === ch.time ? '#22d3ee' : '#29364d' }}>
                    <span style={{ color: '#67e8f9', fontVariantNumeric: 'tabular-nums' }}>{stamp(ch.time)}</span>
                    <span style={{ textAlign: 'left' }}><strong>{ch.title}</strong><small style={{ display: 'block', color: '#9eabc2', marginTop: 4 }}>{ch.description}</small></span>
                    <span aria-hidden>↗</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
          <aside style={{ background: '#111827', border: '1px solid #263249', borderRadius: 18, padding: 18, alignSelf: 'start' }}>
            <h2 style={headingStyle}>Decision notes</h2>
            <p style={{ color: '#9eabc2', fontSize: 13, lineHeight: 1.5, marginTop: -5 }}>Context markers—not a transcript. Select any note to jump to its moment.</p>
            <div style={{ display: 'grid', gap: 12 }}>
              {config.notes.slice().sort((a,b) => a.time-b.time).map((note, i) => (
                <button key={note.time + note.type + i} onClick={() => seek(note.time)} style={{ textAlign: 'left', color: 'inherit', background: '#0b1220', border: '1px solid #263249', borderRadius: 12, padding: 12, cursor: 'pointer' }}>
                  <span style={{ color: '#67e8f9', fontSize: 12, fontWeight: 800 }}>{stamp(note.time)} · {note.type}</span>
                  <span style={{ display: 'block', marginTop: 5, lineHeight: 1.45 }}>{note.text}</span>
                </button>
              ))}
            </div>
          </aside>
        </div>
        <footer style={{ color: '#8290a9', fontSize: 12, marginTop: 22 }}>Metadata is loaded from /video-navigator.config.json. Video and metadata URLs must be HTTPS. {status && <span role="status" style={{ color: '#67e8f9', marginLeft: 8 }}>{status}</span>}</footer>
      </div>
      <style jsx>{`@media (max-width: 760px) { div[style*="minmax(270px"] { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  );
}

const headingStyle = { fontSize: 18, margin: '0 0 12px', letterSpacing: '-.02em' } as const;
const buttonStyle = { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', border: 0, borderRadius: 10, padding: '11px 14px', fontWeight: 800, cursor: 'pointer' } as const;
const chapterStyle = { display: 'grid', gridTemplateColumns: '48px 1fr 16px', gap: 12, alignItems: 'center', width: '100%', background: '#0b1220', color: '#f4f6ff', border: '1px solid #29364d', borderRadius: 12, padding: 12, cursor: 'pointer', textAlign: 'left' as const } as const;
