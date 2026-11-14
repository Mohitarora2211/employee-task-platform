"use client";
import React, { useRef } from "react";
import { createTask } from "../actions/taskActions";

interface Employee {
  id: number | string;
  name: string;
}

interface Project {
  id: number | string;
  name: string;
}

interface CreationFormsProps {
  employees?: Employee[];
  projects?: Project[];
}

export default function CreationForms({ employees = [], projects = [] }: CreationFormsProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-white shadow-xl w-full my-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-blue-600 text-white p-1.5 rounded-full text-xs">➕</span>
        <h2 className="text-lg font-semibold">Assign New Task</h2>
      </div>

      <form 
        ref={formRef}
        action={async (formData) => {
          await createTask(formData);
          formRef.current?.reset(); // Form submit hone ke baad fields clear kar dega
        }} 
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Task Title */}
          <div>
            <input
              type="text"
              name="title"
              placeholder="Task Title *"
              defaultValue=""
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <input
              type="text"
              name="description"
              placeholder="Task Description"
              defaultValue=""
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Assignee Dropdown */}
          <div>
            <select
              name="employeeId"
              defaultValue=""
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="" disabled>Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">
                  👤 {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Dropdown */}
          <div>
            <select
              name="projectId"
              defaultValue=""
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="" disabled>Select Project</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id} className="bg-slate-900 text-white">
                  📁 {proj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Dropdown */}
          <div>
            <select
              name="priority"
              defaultValue="Medium Priority"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="High Priority" className="bg-slate-900 text-white">🔴 High Priority</option>
              <option value="Medium Priority" className="bg-slate-900 text-white">🟡 Medium Priority</option>
              <option value="Low Priority" className="bg-slate-900 text-white">🟢 Low Priority</option>
            </select>
          </div>

          {/* Due Date Input */}
          <div>
            <input
              type="date"
              name="dueDate"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition"
          >
            <span>➕</span> Add Task
          </button>
        </div>
      </form>
    </div>
  );
}