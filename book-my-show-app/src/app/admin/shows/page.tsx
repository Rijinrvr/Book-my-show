'use client';

import { useEffect, useState } from 'react';
import { Show, Movie, Theater } from '@/lib/types';
import { Plus, Trash2, X, AlertCircle, CheckCircle, Film, Building2 } from 'lucide-react';

interface ShowWithDetails extends Show {
  movie?: Movie;
  theater?: Theater;
}

const emptyForm = { movieId: '', theaterId: '', date: '', time: '', price: '', language: 'English', format: '2D' };

export default function AdminShowsPage() {
  const [shows, setShows] = useState<ShowWithDetails[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const fetchAll = () => {
    Promise.all([
      fetch('/api/shows').then((r) => r.json()),
      fetch('/api/movies').then((r) => r.json()),
      fetch('/api/theaters').then((r) => r.json()),
    ]).then(([showsData, moviesData, theatersData]) => {
      setShows(showsData);
      setMovies(moviesData);
      setTheaters(theatersData);
      setLoading(false);
    });
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this show?')) return;
    await fetch(`/api/shows/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    const payload = { ...form, price: Number(form.price) };
    const res = await fetch('/api/shows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setMsg({ type: 'error', text: data.error || 'Failed.' }); return; }
    setMsg({ type: 'success', text: 'Show added!' });
    fetchAll();
    setTimeout(() => { setShowForm(false); setMsg(null); }, 1000);
  };

  const inputProps = (key: keyof typeof form) => ({
    className: 'input-field',
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  const selectStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="section-title" style={{ marginBottom: '4px' }}>Shows / Screenings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{shows.length} show(s) scheduled</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setMsg(null); setShowForm(true); }}>
          <Plus size={16} /> Add Show
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Movie</th>
                <th>Theater</th>
                <th>Date</th>
                <th>Time</th>
                <th>Format</th>
                <th>Price</th>
                <th>Seats Left</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => (
                <tr key={show.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Film size={14} color="var(--accent-red)" />
                      <span style={{ fontWeight: 600 }}>{show.movie?.title || show.movieId}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={14} color="var(--text-secondary)" />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{show.theater?.name || show.theaterId}</span>
                    </div>
                  </td>
                  <td>{show.date}</td>
                  <td style={{ fontWeight: 700 }}>{show.time}</td>
                  <td><span className="badge badge-gray">{show.format}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-red)' }}>₹{show.price}</td>
                  <td>
                    <span style={{ color: show.availableSeats > 20 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                      {show.availableSeats}
                    </span>
                  </td>
                  <td>
                    <button className="btn-ghost" style={{ padding: '6px 10px', color: '#ef4444' }} onClick={() => handleDelete(show.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Add New Show</h2>
              <button className="btn-ghost" style={{ padding: '6px' }} onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            {msg && (
              <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '16px' }}>
                {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Movie *</label>
                <select style={selectStyle} value={form.movieId} onChange={(e) => setForm({ ...form, movieId: e.target.value })}>
                  <option value="">Select Movie</option>
                  {movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Theater *</label>
                <select style={selectStyle} value={form.theaterId} onChange={(e) => setForm({ ...form, theaterId: e.target.value })}>
                  <option value="">Select Theater</option>
                  {theaters.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              {[
                { label: 'Date *', key: 'date', placeholder: 'YYYY-MM-DD' },
                { label: 'Time *', key: 'time', placeholder: '10:00 AM' },
                { label: 'Price per Seat (₹) *', key: 'price', placeholder: '250' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>{label}</label>
                  <input {...inputProps(key as keyof typeof form)} placeholder={placeholder} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Language</label>
                  <select style={selectStyle} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                    {['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam'].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Format</label>
                  <select style={selectStyle} value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
                    {['2D', '3D', 'IMAX', '4DX', 'Dolby'].map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Adding…</> : 'Add Show'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
