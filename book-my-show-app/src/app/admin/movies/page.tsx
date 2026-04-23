'use client';

import { useEffect, useState } from 'react';
import { Movie } from '@/lib/types';
import { Plus, Pencil, Trash2, Star, X, AlertCircle, CheckCircle } from 'lucide-react';

const emptyForm = {
  title: '', description: '', poster: '', genre: '', duration: '', rating: '', language: 'English', releaseDate: '', cast: '', director: '',
};

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const fetchMovies = () => {
    fetch('/api/movies')
      .then((r) => r.json())
      .then((data) => { setMovies(data); setLoading(false); });
  };

  useEffect(() => { fetchMovies(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setMsg(null);
    setShowForm(true);
  };

  const openEdit = (movie: Movie) => {
    setForm({
      title: movie.title, description: movie.description, poster: movie.poster,
      genre: movie.genre.join(', '), duration: String(movie.duration), rating: String(movie.rating),
      language: movie.language, releaseDate: movie.releaseDate,
      cast: movie.cast.join(', '), director: movie.director,
    });
    setEditId(movie.id);
    setMsg(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this movie? This cannot be undone.')) return;
    await fetch(`/api/movies/${id}`, { method: 'DELETE' });
    fetchMovies();
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    const payload = {
      ...form,
      genre: form.genre.split(',').map((s) => s.trim()).filter(Boolean),
      cast: form.cast.split(',').map((s) => s.trim()).filter(Boolean),
      duration: Number(form.duration),
      rating: Number(form.rating),
    };
    const url = editId ? `/api/movies/${editId}` : '/api/movies';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setMsg({ type: 'error', text: data.error || 'Failed to save.' }); return; }
    setMsg({ type: 'success', text: editId ? 'Movie updated!' : 'Movie added!' });
    fetchMovies();
    setTimeout(() => { setShowForm(false); setMsg(null); }, 1000);
  };

  const inputProps = (key: keyof typeof form) => ({
    className: 'input-field',
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="section-title" style={{ marginBottom: '4px' }}>Movies</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{movies.length} movie(s) in database</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Movie</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Poster</th>
                <th>Title</th>
                <th>Genre</th>
                <th>Rating</th>
                <th>Duration</th>
                <th>Language</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <td>
                    <img src={movie.poster} alt={movie.title} style={{ width: '40px', height: '56px', borderRadius: '6px', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/40x56/1a1a2e/fff?text=🎬'; }} />
                  </td>
                  <td style={{ fontWeight: 600 }}>{movie.title}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {movie.genre.slice(0, 2).map((g) => <span key={g} className="badge badge-red" style={{ fontSize: '10px' }}>{g}</span>)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                      <Star size={12} fill="currentColor" /> {movie.rating}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{movie.duration}m</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{movie.language}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-ghost" style={{ padding: '6px 10px', color: '#3b82f6' }} onClick={() => openEdit(movie)}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn-ghost" style={{ padding: '6px 10px', color: '#ef4444' }} onClick={() => handleDelete(movie.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{editId ? 'Edit Movie' : 'Add New Movie'}</h2>
              <button className="btn-ghost" style={{ padding: '6px' }} onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            {msg && (
              <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '16px' }}>
                {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Title *', key: 'title', placeholder: 'Movie Title' },
                { label: 'Poster URL', key: 'poster', placeholder: 'https://...' },
                { label: 'Genre (comma-separated)', key: 'genre', placeholder: 'Action, Drama, Sci-Fi' },
                { label: 'Duration (minutes)', key: 'duration', placeholder: '120' },
                { label: 'Rating (0–10)', key: 'rating', placeholder: '7.5' },
                { label: 'Language', key: 'language', placeholder: 'English' },
                { label: 'Release Date', key: 'releaseDate', placeholder: 'YYYY-MM-DD' },
                { label: 'Cast (comma-separated)', key: 'cast', placeholder: 'Actor 1, Actor 2' },
                { label: 'Director', key: 'director', placeholder: 'Director Name' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>{label}</label>
                  <input {...inputProps(key as keyof typeof form)} placeholder={placeholder} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Description *</label>
                <textarea {...inputProps('description')} placeholder="Movie description..." rows={3}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', resize: 'vertical', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Saving…</> : 'Save Movie'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
