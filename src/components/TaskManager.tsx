'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { createTask } from '../actions/taskActions';

interface Employee {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | string;
  employee: Employee;
  project: Project;
}

export default function TaskManager({
  initialTasks,
  employees,
  projects,
}: {
  initialTasks: Task[];
  employees: Employee[];
  projects: Project[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add New Task Form */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-800 p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-100">Assign New Task</h2>
        </div>

        <form 
          ref={formRef}
          action={async (formData) => {
            setLoading(true);
            try {
              await createTask(formData);
              formRef.current?.reset();
              router.refresh();
            } catch (error) {
              console.error("Error creating task:", error);
            } finally {
              setLoading(false);
            }
          }} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <input
            type="text"
            name="title"
            placeholder="Task Title *"
            required
            className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />

          <input
            type="text"
            name="description"
            placeholder="Short Description"
            className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />

          <select
            name="employeeId"
            defaultValue=""
            required
            className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="" disabled>Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id} className="bg-gray-900">
                👤 {emp.name}
              </option>
            ))}
          </select>

          <select
            name="projectId"
            defaultValue=""
            required
            className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="" disabled>Select Project</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id} className="bg-gray-900">
                📁 {proj.name}
              </option>
            ))}
          </select>

          <select
            name="priority"
            defaultValue="MEDIUM"
            className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="LOW" className="bg-gray-900">🟢 Low Priority</option>
            <option value="MEDIUM" className="bg-gray-900">🟡 Medium Priority</option>
            <option value="HIGH" className="bg-gray-900">🟠 High Priority</option>
            <option value="URGENT" className="bg-gray-900">🔴 Urgent</option>
          </select>

          <input
            type="date"
            name="dueDate"
            required
            className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition"
          />

          <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition shadow-lg shadow-blue-600/20 flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Adding...' : 'Add Task'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Active Tasks List */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-800 p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-100">All Tasks & Management</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {initialTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500 text-sm">
                    No tasks found. Create a new task above!
                  </td>
                </tr>
              ) : (
                initialTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-800/30 transition text-sm">
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-gray-200">{task.title}</p>
                      {task.description && <p className="text-xs text-gray-400">{task.description}</p>}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">👤 {task.employee?.name || 'Unassigned'}</td>
                    <td className="py-3.5 px-4 text-gray-400">📁 {task.project?.name || 'No Project'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        task.priority === 'URGENT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        task.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-gray-800 text-gray-300'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold border focus:outline-none transition ${
                          task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          'bg-gray-800 text-gray-300 border-gray-700'
                        }`}
                      >
                        <option value="TODO" className="bg-gray-900">TODO</option>
                        <option value="IN_PROGRESS" className="bg-gray-900">IN PROGRESS</option>
                        <option value="COMPLETED" className="bg-gray-900">COMPLETED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}