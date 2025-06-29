'use client';

import React, { useState, useEffect } from 'react';

interface SchedulerStatus {
  isRunning: boolean;
  schedule: string;
  timezone: string;
  nextWeekStart: string;
}

interface CronLog {
  id: string;
  level: string;
  message: string;
  data: string | null;
  createdAt: string;
}

interface WeeklySchedule {
  id: string;
  weekStartDate: string;
  status: string;
  paperId: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  paper?: {
    id: string;
    title: string;
    createdAt: string;
  } | null;
}

interface SchedulerData {
  status: SchedulerStatus;
  recentLogs: CronLog[];
  recentSchedules: WeeklySchedule[];
}

export default function SchedulerAdmin() {
  const [schedulerData, setSchedulerData] = useState<SchedulerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch scheduler data
  const fetchData = async () => {
    try {
      const response = await fetch('/api/cron/schedule');
      const data = await response.json();
      setSchedulerData(data);
    } catch (error) {
      console.error('Failed to fetch scheduler data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Control scheduler
  const controlScheduler = async (action: string) => {
    setActionLoading(action);
    try {
      const response = await fetch('/api/cron/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchData(); // Refresh data
        alert(result.message);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to control scheduler:', error);
      alert('Failed to ' + action + ' scheduler');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scheduler dashboard...</p>
        </div>
      </div>
    );
  }

  const { status, recentLogs, recentSchedules } = schedulerData || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CRON Scheduler Admin</h1>
          <p className="mt-2 text-gray-600">Manage automated weekly paper generation</p>
        </div>

        {/* Scheduler Status Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Scheduler Status</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                status?.isRunning 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {status?.isRunning ? '🟢 Running' : '🔴 Stopped'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Schedule</p>
                <p className="font-mono text-sm">{status?.schedule}</p>
                <p className="text-xs text-gray-400">Every Sunday at 6:00 AM</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Timezone</p>
                <p className="font-mono text-sm">{status?.timezone}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Next Week Start</p>
                <p className="font-mono text-sm">
                  {status?.nextWeekStart ? new Date(status.nextWeekStart).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => controlScheduler('start')}
                disabled={status?.isRunning || actionLoading === 'start'}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'start' ? '⏳ Starting...' : '▶️ Start Scheduler'}
              </button>
              
              <button
                onClick={() => controlScheduler('stop')}
                disabled={!status?.isRunning || actionLoading === 'stop'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'stop' ? '⏳ Stopping...' : '⏹️ Stop Scheduler'}
              </button>
              
              <button
                onClick={() => controlScheduler('trigger')}
                disabled={actionLoading === 'trigger'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'trigger' ? '⏳ Generating...' : '🔧 Manual Trigger'}
              </button>
              
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Recent Schedules:</span>
                <span className="font-semibold">{recentSchedules?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Recent Logs:</span>
                <span className="font-semibold">{recentLogs?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Completed Papers:</span>
                <span className="font-semibold text-green-600">
                  {recentSchedules?.filter(s => s.status === 'COMPLETED').length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Failed Papers:</span>
                <span className="font-semibold text-red-600">
                  {recentSchedules?.filter(s => s.status === 'FAILED').length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Schedules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Weekly Schedules</h3>
            <div className="space-y-3">
              {recentSchedules?.length ? recentSchedules.map((schedule) => (
                <div key={schedule.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      Week of {new Date(schedule.weekStartDate).toLocaleDateString()}
                    </span>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      schedule.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      schedule.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {schedule.status}
                    </div>
                  </div>
                  
                  {schedule.paper && (
                    <p className="text-sm text-gray-600">
                      📄 Paper: {schedule.paper.id}
                    </p>
                  )}
                  
                  {schedule.errorMessage && (
                    <p className="text-sm text-red-600 mt-1">
                      ❌ Error: {schedule.errorMessage}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2">
                    Updated: {new Date(schedule.updatedAt).toLocaleString()}
                  </p>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No recent schedules</p>
              )}
            </div>
          </div>

          {/* Recent Logs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity Logs</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentLogs?.length ? recentLogs.map((log) => (
                <div key={log.id} className="border-l-4 pl-3 py-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                      log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.level}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{log.message}</p>
                  {log.data && (
                    <details className="mt-1">
                      <summary className="text-xs text-gray-500 cursor-pointer">Show details</summary>
                      <pre className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded overflow-x-auto">
                        {JSON.stringify(JSON.parse(log.data), null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No recent logs</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 