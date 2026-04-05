import { useState } from 'react';

const initialForm = {
  title: '',
  author: '',
  type: 'Insight',
  summary: '',
  tags: '',
  date: '',
};

const types = ['Insight', 'Misinformation Response'];

export default function InsightsSignalsPanel({ data, setData, onSaveItem, onCreate }) {
  const [form, setForm] = useState(initialForm);

  const updateExisting = (id, field, value) => {
    setData((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const create = () => {
    if (!form.title.trim()) return;
    onCreate(form);
    setForm(initialForm);
  };

  return (
    <section>
      <h2 className="mb-5 text-2xl font-semibold text-slate-800">Insights & Signals</h2>

      <div className="mb-6 rounded-md border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">Add New Entry</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Author"
            value={form.author}
            onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
          />
          <select
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          >
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <input
            type="date"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
          />
        </div>
        <textarea
          rows={3}
          className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Summary"
          value={form.summary}
          onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
        />
        <input
          className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Tags (comma-separated)"
          value={form.tags}
          onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
        />
        <div className="mt-3 text-right">
          <button onClick={create} className="rounded bg-accent-500 px-4 py-2 text-sm text-white hover:bg-accent-700">
            Save Entry
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <article key={item.id} className="rounded-md border border-slate-200 bg-white p-5">
            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                className="rounded border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                value={item.title || ''}
                onChange={(event) => updateExisting(item.id, 'title', event.target.value)}
              />
              <select
                className="rounded border border-slate-300 px-3 py-2 text-sm"
                value={item.type || 'Insight'}
                onChange={(event) => updateExisting(item.id, 'type', event.target.value)}
              >
                {types.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
              <input
                className="rounded border border-slate-300 px-3 py-2 text-sm"
                value={item.author || ''}
                onChange={(event) => updateExisting(item.id, 'author', event.target.value)}
              />
              <input
                type="date"
                className="rounded border border-slate-300 px-3 py-2 text-sm"
                value={item.date ? new Date(item.date).toISOString().split('T')[0] : ''}
                onChange={(event) => updateExisting(item.id, 'date', event.target.value)}
              />
              <input
                className="rounded border border-slate-300 px-3 py-2 text-sm"
                value={item.tags || ''}
                onChange={(event) => updateExisting(item.id, 'tags', event.target.value)}
              />
            </div>
            <textarea
              rows={3}
              className="mb-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={item.summary || ''}
              onChange={(event) => updateExisting(item.id, 'summary', event.target.value)}
            />
            <button
              onClick={() => onSaveItem(item)}
              className="rounded border border-accent-500 px-3 py-1.5 text-xs text-accent-700 hover:bg-accent-50"
            >
              Update Entry
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
