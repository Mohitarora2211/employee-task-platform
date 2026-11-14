import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch all tasks with employee and project details
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        employee: true,
        project: true,
      },
    });
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST: Create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, status, priority, dueDate, employeeId, projectId } = body;

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: new Date(dueDate),
        employeeId,
        projectId,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}