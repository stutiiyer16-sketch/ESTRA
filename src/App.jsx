import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import LoginGate from './components/LoginGate';
import FlagshipProjectPanel from './components/FlagshipProjectPanel';
import GeopoliticsTrackerPanel from './components/GeopoliticsTrackerPanel';
import InsightsSignalsPanel from './components/InsightsSignalsPanel';
import { hasSupabaseConfig, supabase } from './supabaseClient';

const emailStorageKey = 'estra_user_email';

export default function App() {
  const [userEmail, setUserEmail] = useState(localStorage.getItem(emailStorageKey) || '');
  const [activeSection, setActiveSection] = useState('flagship');
  const [flagshipProject, setFlagshipProject] = useState([]);
  const [geopoliticsTracker, setGeopoliticsTracker] = useState([]);
  const [insightsSignals, setInsightsSignals] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [statusMessage, setStatusMessage] = useState('Ready.');

  const ensureFlagshipSections = (rows = []) => {
    const names = ['Overview', 'Cost', 'Prevention', 'Implementation'];
    return names.map((name) => rows.find((row) => row.section_name === name) || ({ section_name: name, content: '', updated_by: '', last_updated: null }));
  };

  const isLoggedIn = Boolean(userEmail);

  const fetchAll = async () => {
    if (!supabase) return;

    const [flagshipRes, geoRes, insightsRes] = await Promise.all([
      supabase.from('flagship_project').select('*').order('id', { ascending: true }),
      supabase.from('geopolitics_tracker').select('*').order('id', { ascending: true }),
      supabase.from('insights_signals').select('*').order('date', { ascending: false }),
    ]);

    if (!flagshipRes.error) setFlagshipProject(ensureFlagshipSections(flagshipRes.data || []));
    if (!geoRes.error) setGeopoliticsTracker(geoRes.data || []);
    if (!insightsRes.error) setInsightsSignals(insightsRes.data || []);
  };

  useEffect(() => {
    if (!supabase) {
      setStatusMessage('Supabase is not configured. Add env keys to connect shared data.');
      return;
    }

    fetchAll();
    setStatusMessage('Connected to shared Supabase workspace.');

    const channel = supabase
      .channel('estra-live-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flagship_project' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'geopolitics_tracker' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'insights_signals' }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const saveFlagshipSection = async (record, email) => {
    if (!supabase) return;

    const payload = {
      section_name: record.section_name,
      content: record.content || '',
      updated_by: email,
      last_updated: new Date().toISOString(),
    };

    const query = record.id
      ? supabase.from('flagship_project').update(payload).eq('id', record.id)
      : supabase.from('flagship_project').insert(payload);

    const { error } = await query;
    setStatusMessage(error ? error.message : `${record.section_name} section saved.`);
    if (!error) fetchAll();
  };

  const saveTrackerRow = async (row) => {
    if (!supabase) return;

    const payload = {
      country: row.country || '',
      policy: row.policy || '',
      status: row.status || 'Planned',
      impact: row.impact || '',
      source: row.source || '',
      notes: row.notes || '',
      last_updated: new Date().toISOString(),
    };

    const query = row.id
      ? supabase.from('geopolitics_tracker').update(payload).eq('id', row.id)
      : supabase.from('geopolitics_tracker').insert(payload);

    const { error } = await query;
    setStatusMessage(error ? error.message : 'Geopolitics row saved.');
    if (!error) fetchAll();
  };

  const addTrackerRow = async (row) => {
    setGeopoliticsTracker((prev) => [{ ...row, id: Date.now(), isTemporary: true }, ...prev]);
  };

  const saveInsight = async (item) => {
    if (!supabase) return;

    const payload = {
      title: item.title || '',
      author: item.author || '',
      type: item.type || 'Insight',
      summary: item.summary || '',
      tags: item.tags || '',
      date: item.date || new Date().toISOString().split('T')[0],
    };

    const query = item.id
      ? supabase.from('insights_signals').update(payload).eq('id', item.id)
      : supabase.from('insights_signals').insert(payload);

    const { error } = await query;
    setStatusMessage(error ? error.message : 'Insights entry saved.');
    if (!error) fetchAll();
  };

  const view = useMemo(() => {
    if (activeSection === 'geopolitics') {
      return (
        <GeopoliticsTrackerPanel
          data={geopoliticsTracker}
          setData={setGeopoliticsTracker}
          onSaveRow={saveTrackerRow}
          onAddRow={addTrackerRow}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      );
    }

    if (activeSection === 'insights') {
      return (
        <InsightsSignalsPanel
          data={insightsSignals}
          setData={setInsightsSignals}
          onSaveItem={saveInsight}
          onCreate={saveInsight}
        />
      );
    }

    return <FlagshipProjectPanel data={flagshipProject} setData={setFlagshipProject} onSave={saveFlagshipSection} currentUser={userEmail} />;
  }, [activeSection, filterStatus, flagshipProject, geopoliticsTracker, insightsSignals, userEmail]);

  if (!isLoggedIn) {
    return (
      <LoginGate
        onLogin={(email) => {
          localStorage.setItem(emailStorageKey, email);
          setUserEmail(email);
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        active={activeSection}
        onChange={setActiveSection}
        userEmail={userEmail}
        onLogout={() => {
          localStorage.removeItem(emailStorageKey);
          setUserEmail('');
        }}
      />
      <main className="flex-1 p-8">
        <div className="mb-5 rounded-md border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">{statusMessage}</div>
        {hasSupabaseConfig ? view : <p className="text-sm text-slate-600">Add Supabase keys to enable collaboration.</p>}
      </main>
    </div>
  );
}
