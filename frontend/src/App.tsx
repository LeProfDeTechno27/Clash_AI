import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { io as ioClient, Socket } from 'socket.io-client';

type Analytics = { debates: number; videos: number; publications: number };

type Debate = { id:number; topic:string; status:string; created_at?:string };

type Video = { id:number; format:'long'|'short'; status:string; duration_seconds:number };

function progressForStatus(s?: string) {
  switch ((s||'').toLowerCase()) {
    case 'created':
    case 'generating':
    case 'queued':
      return 25;
    case 'audio':
      return 50;
    case 'video':
      return 75;
    case 'published':
      return 100;
    case 'failed':
      return 0;
    default:
      return 10;
  }
}

export default function App() {
  const [tab, setTab] = useState<'dashboard'|'debates'>('dashboard');
  const [topic, setTopic] = useState('');
  const [position1, setPosition1] = useState('');
  const [position2, setPosition2] = useState('');
  const [duration, setDuration] = useState(12);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [debates, setDebates] = useState<Debate[]>([]);
  const [selected, setSelected] = useState<Debate | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all'|'created'|'generating'|'audio'|'video'|'published'|'failed'>('all');

  const backendWs = useMemo(() => {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:5000`;
  }, []);

  useEffect(() => {
    const s: Socket = ioClient(backendWs, { transports: ['websocket'] });
    s.on('debate:update', async (payload: any) => {
      await loadDebates();
      if (selected && payload?.id === selected.id) {
        await loadVideos(selected.id);
      }
    });
    s.on('publish:update', async () => {
      if (selected) await loadVideos(selected.id);
    });
    return () => { s.disconnect(); };
  }, [backendWs, selected?.id]);

  const loadDebates = async () => {
    try {
      const r = await axios.get('/api/debates?limit=50');
      setDebates(r.data);
    } catch (e:any) { setError(e?.response?.data?.error || e.message); }
  };

  const loadVideos = async (debateId: number) => {
    try {
      const r = await axios.get(`/api/debates/${debateId}/videos`);
      setVideos(r.data);
    } catch (e:any) { setError(e?.response?.data?.error || e.message); }
  };

  const loadAnalytics = async () => {
    try {
      const r = await axios.get('/api/analytics');
      setAnalytics(r.data);
    } catch (e:any) { setError(e?.response?.data?.error || e.message); }
  };

  useEffect(() => { loadDebates(); loadAnalytics(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      const res = await axios.post('/api/debates', { topic, position1, position2, duration_target: duration });
      setResult(res.data);
      await loadDebates();
      setTab('debates');
    } catch (err: any) { setError(err?.response?.data?.error || err.message); }
  };

  const debatesFiltered = debates.filter(d => {
    const byStatus = filterStatus === 'all' || (d.status||'').toLowerCase() === filterStatus;
    const bySearch = !search || (d.topic||'').toLowerCase().includes(search.toLowerCase());
    return byStatus && bySearch;
  });

  return (
    <div style={{ maxWidth: 1080, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>AI Debate Platform</h1>
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <button onClick={() => setTab('dashboard')} disabled={tab==='dashboard'}>Dashboard</button>
        <button onClick={() => setTab('debates')} disabled={tab==='debates'}>Débats</button>
      </div>

      {tab==='dashboard' && (
        <section style={{ marginTop: 24 }}>
          <h2>Dashboard</h2>
          <button onClick={loadAnalytics}>Rafraîchir</button>
          <div style={{ display:'flex', gap:24, marginTop:12 }}>
            <div>Débats: {analytics?.debates ?? '-'}</div>
            <div>Vidéos: {analytics?.videos ?? '-'}</div>
            <div>Publications: {analytics?.publications ?? '-'}</div>
          </div>
          <hr style={{ margin:'24px 0' }} />
          <h3>Créer un débat</h3>
          <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
            <label>
              Sujet
              <input value={topic} onChange={e => setTopic(e.target.value)} required style={{ width: '100%' }} />
            </label>
            <label>
              Position 1
              <textarea value={position1} onChange={e => setPosition1(e.target.value)} style={{ width: '100%', height: 80 }} />
            </label>
            <label>
              Position 2
              <textarea value={position2} onChange={e => setPosition2(e.target.value)} style={{ width: '100%', height: 80 }} />
            </label>
            <label>
              Durée cible (min)
              <input type="number" value={duration} min={2} max={30} onChange={e => setDuration(parseInt(e.target.value, 10))} />
            </label>
            <button type="submit">Créer le débat</button>
          </form>
          {result && (<pre style={{ background: '#f6f6f6', padding: 12, marginTop: 16 }}>{JSON.stringify(result, null, 2)}</pre>)}
          {error && <p style={{ color: 'crimson' }}>{error}</p>}
        </section>
      )}

      {tab==='debates' && (
        <section style={{ marginTop: 24 }}>
          <h2>Débats</h2>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <button onClick={loadDebates}>Rafraîchir</button>
            <input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} />
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value as any)}>
              <option value="all">Tous</option>
              <option value="created">created</option>
              <option value="generating">generating</option>
              <option value="audio">audio</option>
              <option value="video">video</option>
              <option value="published">published</option>
              <option value="failed">failed</option>
            </select>
          </div>
          <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>ID</th>
                <th style={{ textAlign: 'left' }}>Sujet</th>
                <th style={{ textAlign: 'left' }}>Statut</th>
                <th style={{ textAlign: 'left', width: 240 }}>Progression</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {debatesFiltered.map(d => (
                <tr key={d.id} style={{ borderTop: '1px solid #ddd' }}>
                  <td>{d.id}</td>
                  <td>{d.topic}</td>
                  <td>{d.status}</td>
                  <td>
                    <div style={{ background:'#eee', height:8, borderRadius:4, overflow:'hidden' }}>
                      <div style={{ width: `${progressForStatus(d.status)}%`, height:'100%', background: d.status==='failed' ? 'crimson' : '#4caf50' }} />
                    </div>
                  </td>
                  <td>
                    <button onClick={async () => { setSelected(d); await loadVideos(d.id); }}>Détails</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selected && (
            <div style={{ marginTop: 24 }}>
              <h3>Vidéos du débat #{selected.id}</h3>
              <ul>
                {videos.map(v => (
                  <li key={v.id}>
                    {v.format} — {v.status} — {v.duration_seconds}s —
                    <a href={`/api/videos/${v.id}/download`} style={{ marginLeft: 8 }}>Télécharger</a>
                    <button style={{ marginLeft: 8 }} onClick={async () => {
                      try { await axios.post(`/api/videos/${v.id}/publish`, { platform: 'youtube' }); alert('Publication demandée'); }
                      catch (e:any) { alert(e?.response?.data?.error || e.message); }
                    }}>Publier (YouTube)</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
