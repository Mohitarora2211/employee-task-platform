import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, department } = body;

    if (!name || !email || !department) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prisma schema ke mutabiq data create kar rahe hain
    const newEmployee = await prisma.employee.create({
      data: {
        name,
        email,
        department,
        clerkId: body.clerkId || `temp_${Date.now()}`, // Fallback agar clerkId required ho
        role: body.role || 'EMPLOYEE',
      },
    });

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}