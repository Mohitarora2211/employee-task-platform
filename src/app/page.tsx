import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import TaskManager from '../components/TaskManager';
import CreationForms from '../components/CreationForms';
import { Users, FolderKanban, CheckSquare, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import UserMenu from '../components/UserMenu';
import { updateTaskStatus } from '../actions/taskActions';

const prisma = new PrismaClient();

export const instant = false;

export default async function DashboardPage() {
  let user = null;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Clerk fetch failed (Network/Offline issue), using fallback user.");
  }
  
  const currentUserObj = user || {
    publicMetadata: { role: 'admin' },
    emailAddresses: [{ emailAddress: 'admin@example.com' }]
  };

  const userEmail = currentUserObj.emailAddresses?.[0]?.emailAddress;

  let employees: any[] = [];
  let projects: any[] = [];
  let tasks: any[] = [];

  try {
    employees = await prisma.employee.findMany({
      include: { tasks: true },
    });

    projects = await prisma.project.findMany({
      include: { tasks: true },
    });

    tasks = await prisma.task.findMany({
      include: { employee: true, project: true },
      orderBy: { dueDate: 'asc' },
    });
  } catch (dbError) {
    console.error("Database fetch error:", dbError);
  }

  const currentEmployee = employees.find((emp: any) => emp.email === userEmail);
  const employeeTasks = tasks.filter((t: any) => t.employeeId === currentEmployee?.id);

  // Employee Stats Calculation
  const totalTasks = employeeTasks.length;
  const completedTasks = employeeTasks.filter((t: any) => t.status === 'COMPLETED').length;
  const pendingTasks = totalTasks - completedTasks;

  const metadataRole = (currentUserObj.publicMetadata as { role?: string })?.role;
  const role = metadataRole || (currentEmployee ? 'employee' : 'admin');

  return (
    <main className="min-h-screen bg-[#070b14] text-gray-100 p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900/45 backdrop-blur-xl border border-gray-800/80 p-6 rounded-3xl mb-8 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {role === 'admin' ? 'Admin Dashboard' : 'Employee Portal'}
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            {role === 'admin' ? 'Manage team, projects & workflow' : `Welcome back, ${currentEmployee?.name || userEmail || 'Employee'}`}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <UserMenu />
        </div>
      </header>

      {/* ADMIN VIEW */}
      {role === 'admin' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900/30 border border-gray-800/80 p-6 rounded-3xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                  <Users className="w-6 h-6" />
                </span>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Team</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">{employees.length}</h2>
              <p className="text-xs text-gray-400 mt-1">Total Active Employees</p>
            </div>

            <div className="bg-gray-900/30 border border-gray-800/80 p-6 rounded-3xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                  <FolderKanban className="w-6 h-6" />
                </span>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Workspace</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">{projects.length}</h2>
              <p className="text-xs text-gray-400 mt-1">Active Projects</p>
            </div>

            <div className="bg-gray-900/30 border border-gray-800/80 p-6 rounded-3xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <CheckSquare className="w-6 h-6" />
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Workflow</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">{tasks.length}</h2>
              <p className="text-xs text-gray-400 mt-1">Total Managed Tasks</p>
            </div>
          </div>

          <CreationForms employees={employees} projects={projects} />
          <TaskManager initialTasks={tasks} employees={employees} projects={projects} />
        </>
      ) : (
        /* EMPLOYEE VIEW: Stats & Interactive Task Portal */
        <div className="space-y-6">
          {/* Stats Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900/30 border border-gray-800/80 p-6 rounded-3xl backdrop-blur-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Total Assigned</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">{totalTasks}</h3>
              </div>
              <span className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                <CheckSquare className="w-6 h-6" />
              </span>
            </div>

            <div className="bg-gray-900/30 border border-gray-800/80 p-6 rounded-3xl backdrop-blur-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending / In Progress</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">{pendingTasks}</h3>
              </div>
              <span className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <Clock className="w-6 h-6" />
              </span>
            </div>

            <div className="bg-gray-900/30 border border-gray-800/80 p-6 rounded-3xl backdrop-blur-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Completed</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">{completedTasks}</h3>
              </div>
              <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </span>
            </div>
          </div>

          {/* Assigned Tasks List with Status Updater */}
          <div className="bg-gray-900/30 border border-gray-800/80 p-6 rounded-3xl backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-4">Your Assigned Tasks</h3>
            {employeeTasks.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks assigned to you yet.</p>
            ) : (
              <div className="space-y-3">
                {employeeTasks.map((task: any) => (
                  <div key={task.id} className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-semibold text-white text-base">{task.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{task.description || 'No description'}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>Project: <strong className="text-gray-300">{task.project?.name || 'N/A'}</strong></span>
                        <span>•</span>
                        <span>Priority: <strong className="text-gray-300">{task.priority}</strong></span>
                      </div>
                    </div>

                    {/* Status Update Form with Hidden Input */}
                    <form action={updateTaskStatus} className="flex items-center gap-2">
                      <input type="hidden" name="taskId" value={task.id} />
                      <select 
                        key={task.status}
                        name="status" 
                        defaultValue={task.status}
                        className="bg-gray-900 border border-gray-700 text-xs text-gray-200 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                      <button 
                        type="submit"
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg"
                      >
                        Update
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}