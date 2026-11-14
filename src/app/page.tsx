import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import TaskManager from '../components/TaskManager';
import CreationForms from '../components/CreationForms';
import { Users, FolderKanban, CheckSquare, Sparkles } from 'lucide-react';
import UserMenu from '../components/UserMenu';

const prisma = new PrismaClient();

export const instant = false;

export default async function DashboardPage() {
  let user = null;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Clerk fetch failed (Network/Offline issue), using fallback user.");
  }
  
  // Fallback user object agar Clerk fail ya abort ho jaye
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

    console.log("Fetched Tasks from DB:", tasks);
  } catch (dbError) {
    console.error("Database fetch error:", dbError);
  }

  const currentEmployee = employees.find((emp: any) => emp.email === userEmail);
  const employeeTasks = tasks.filter((t: any) => t.employeeId === currentEmployee?.id);

  // Smart Role Detection: Agar metadata me role defined hai toh woh use hoga, warna agar user employee list me hai toh 'employee' ban jayega
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

      {/* ADMIN VIEW: Complete Management Panel */}
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
        /* EMPLOYEE VIEW: Personal Tasks Portal */
        <div className="space-y-6">
          <div className="bg-gray-900/30 border border-gray-800/80 p-6 rounded-3xl backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-4">Your Assigned Tasks</h3>
            {employeeTasks.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks assigned to you yet.</p>
            ) : (
              <div className="space-y-3">
                {employeeTasks.map((task: any) => (
                  <div key={task.id} className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-white">{task.title}</h4>
                      <p className="text-xs text-gray-400">{task.description || 'No description'}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs rounded-full">
                      {task.status}
                    </span>
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