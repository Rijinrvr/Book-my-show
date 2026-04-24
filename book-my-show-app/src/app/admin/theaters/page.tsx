'use client';

import { useEffect, useState } from 'react';
import { Theater } from '@/lib/types';
import { Plus, Pencil, Trash2, X, AlertCircle, CheckCircle, MapPin } from 'lucide-react';

const emptyForm = { name: '', location: '', city: '', amenities: '', rows: '', seatsPerRow: '' };

export default function AdminTheatersPage() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const fetchTheaters = () => {
    fetch('/api/theaters')
      .then((r) => r.json())
      .then((data) => { setTheaters(data); setLoading(false); });
  };

  useEffect(() => { fetchTheaters(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setMsg(null); setShowForm(true); };

  const openEdit = (t: Theater) => {
    setForm({
      name: t.name, location: t.location, city: t.city,
      amenities: t.amenities.join(', '), rows: t.rows.join(', '),
      seatsPerRow: String(t.seatsPerRow),
    });
    setEditId(t.id);
    setMsg(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this theater?')) return;
    await fetch(`/api/theaters/${id}`, { method: 'DELETE' });
    fetchTheaters();
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    const rowsArr = form.rows.split(',').map((r) => r.trim()).filter(Boolean);
    const payload = {
      ...form,
      amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
      rows: rowsArr,
      seatsPerRow: Number(form.seatsPerRow),
      totalSeats: rowsArr.length * Number(form.seatsPerRow),
    };
    const url = editId ? `/api/theaters/${editId}` : '/api/theaters';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setMsg({ type: 'error', text: data.error || 'Failed.' }); return; }
    setMsg({ type: 'success', text: editId ? 'Theater updated!' : 'Theater added!' });
    fetchTheaters();
    setTimeout(() => { setShowForm(false); setMsg(null); }, 1000);
  };

  const inputProps = (key: keyof typeof form) => ({
    className: 'input-field',
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '16px' }} className="mobile-stack">
        <div>
          <h1 className="section-title" style={{ marginBottom: '4px' }}>Theaters</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{theaters.length} theater(s) registered</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ width: 'auto' }}><Plus size={16} /> Add Theater</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : (
        <div className="admin-table-wrapper">
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', minWidth: '800px' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>City</th>
                  <th>Seats</th>
                  <th>Rows</th>
                  <th>Amenities</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {theaters.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={11} /> {t.location}
                      </div>
                    </td>
                    <td>{t.city}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-red)' }}>{t.totalSeats}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.rows.join(', ')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {t.amenities.slice(0, 2).map((a) => <span key={a} className="badge badge-gray" style={{ fontSize: '10px' }}>{a}</span>)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-ghost" style={{ padding: '6px 10px', color: '#3b82f6' }} onClick={() => openEdit(t)}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn-ghost" style={{ padding: '6px 10px', color: '#ef4444' }} onClick={() => handleDelete(t.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{editId ? 'Edit Theater' : 'Add Theater'}</h2>
              <button className="btn-ghost" style={{ padding: '6px' }} onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            {msg && (
              <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '16px' }}>
                {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Theater Name *', key: 'name', placeholder: 'PVR Cinemas...' },
                { label: 'Full Address *', key: 'location', placeholder: 'Street, Area, City' },
                { label: 'City *', key: 'city', placeholder: 'Mumbai' },
                { label: 'Amenities (comma-separated)', key: 'amenities', placeholder: 'Dolby, IMAX, 4K' },
                { label: 'Rows (comma-separated) *', key: 'rows', placeholder: 'A, B, C, D, E, F' },
                { label: 'Seats Per Row *', key: 'seatsPerRow', placeholder: '15' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>{label}</label>
                  <input {...inputProps(key as keyof typeof form)} placeholder={placeholder} />
                </div>
              ))}
              {form.rows && form.seatsPerRow && (
                <div className="alert alert-info">
                  Total seats: {form.rows.split(',').filter(Boolean).length * Number(form.seatsPerRow || 0)}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Saving…</> : 'Save Theater'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
