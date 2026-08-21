'use client';

import { useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  project_name: string;
}

export default function MyTasksTable() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/v1/dashboard/tasks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string, classes: string }> = {
      'open': { label: 'To Do', classes: 'bg-surface-variant text-on-surface' },
      'in_progress': { label: 'In Bearbeitung', classes: 'bg-primary/10 text-primary border border-primary/20' },
      'review': { label: 'Review', classes: 'bg-amber/10 text-amber border border-amber/20' },
      'completed': { label: 'Abgeschlossen', classes: 'bg-green/10 text-green border border-green/20' }
    };
    const mapped = map[status] || map['open'];
    return <span className={`px-2 py-1 rounded-full text-label-caps ${mapped.classes}`}>{mapped.label}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { label: string, classes: string }> = {
      'high': { label: 'Hoch', classes: 'bg-red/10 text-red border border-red/20' },
      'low': { label: 'Niedrig', classes: 'bg-surface-variant text-outline' },
      'normal': { label: 'Normal', classes: 'bg-surface-variant text-on-surface' }
    };
    const mapped = map[priority] || map['normal'];
    return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${mapped.classes}`}>{mapped.label}</span>;
  };

  return (
    <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-white shadow-[0_14px_36px_rgba(45,55,95,0.08)] flex flex-col h-full overflow-hidden">
      <div className="p-[24px] border-b border-line flex justify-between items-center bg-white/50">
        <h2 className="text-h2 text-on-surface">Meine Aufgaben</h2>
        <span className="material-symbols-outlined text-outline">list_alt</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-surface-bright/50">
              <th className="p-4 text-label-caps text-outline uppercase">Aufgabe</th>
              <th className="p-4 text-label-caps text-outline uppercase">Projekt</th>
              <th className="p-4 text-label-caps text-outline uppercase">Priorität</th>
              <th className="p-4 text-label-caps text-outline uppercase">Status</th>
              <th className="p-4 text-label-caps text-outline uppercase text-right">Fällig am</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-outline">
                  <span className="animate-spin material-symbols-outlined text-[24px] text-primary">progress_activity</span>
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-outline">
                  Keine Aufgaben zugewiesen.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="border-b border-line/50 hover:bg-surface-tint/5 transition-colors group">
                  <td className="p-4 font-semibold text-on-surface text-[14px]">
                    {task.title}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-surface-dim text-on-surface">
                      <span className="material-symbols-outlined text-[14px] mr-1 text-primary">folder</span>
                      {task.project_name}
                    </span>
                  </td>
                  <td className="p-4">
                    {getPriorityBadge(task.priority)}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(task.status)}
                  </td>
                  <td className="p-4 text-right text-[13px] text-outline font-medium">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString('de-DE') : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
