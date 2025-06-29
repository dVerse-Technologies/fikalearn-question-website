'use client';

import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const result = await response.json();
      if (result.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const triggerSync = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_sheets' })
      });
      const result = await response.json();
      alert(result.message);
      if (result.success) {
        fetchSettings();
      }
    } catch (error) {
      alert('Sync failed');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Configure your FikaLearn Question Bank</p>
        </div>

        {message && (
          <div className={mb-6 p-4 rounded-lg }>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Sheets Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Google Sheets</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sheet ID
                </label>
                <input
                  type="text"
                  value={settings?.googleSheetId || ''}
                  onChange={(e) => setSettings({...settings, googleSheetId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1PfL4o_RBqm8itgwlGuZuIV6J5SyGWj6G"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoSync"
                  checked={settings?.autoSyncEnabled || false}
                  onChange={(e) => setSettings({...settings, autoSyncEnabled: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoSync" className="ml-2 block text-sm text-gray-900">
                  Enable automatic sync
                </label>
              </div>

              <button
                onClick={triggerSync}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                 Sync Now
              </button>
            </div>

            {/* Paper Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Paper Generation</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Difficulty
                </label>
                <select
                  value={settings?.defaultPaperDifficulty || 'Mixed'}
                  onChange={(e) => setSettings({...settings, defaultPaperDifficulty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showAnswers"
                  checked={settings?.showAnswersInPreview || false}
                  onChange={(e) => setSettings({...settings, showAnswersInPreview: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showAnswers" className="ml-2 block text-sm text-gray-900">
                  Show answers in preview
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Last updated: {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleString() : 'Never'}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={fetchSettings}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                   Refresh
                </button>
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? ' Saving...' : ' Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/papers"
            className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-lg font-semibold text-gray-900"> View Papers</div>
            <div className="text-sm text-gray-600">Browse generated papers</div>
          </a>
          <a
            href="/generate-paper"
            className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-lg font-semibold text-gray-900"> Generate Paper</div>
            <div className="text-sm text-gray-600">Create new question paper</div>
          </a>
          <a
            href="/admin/scheduler"
            className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-lg font-semibold text-gray-900"> CRON Scheduler</div>
            <div className="text-sm text-gray-600">Manage automation</div>
          </a>
        </div>
      </div>
    </div>
  );
}
