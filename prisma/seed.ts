import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Sample Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Employee Task Platform',
      description: 'Building a full-stack Next.js productivity dashboard.',
    },
  });

  // Create Sample Employees
  const emp1 = await prisma.employee.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      department: 'Engineering',
    },
  });

  const emp2 = await prisma.employee.create({
    data: {
      name: 'Priya Verma',
      email: 'priya@example.com',
      department: 'Design',
    },
  });

  // Create Sample Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Setup Database Schema',
        description: 'Configure Prisma models for Employee, Project, and Task.',
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: new Date('2026-03-01'),
        employeeId: emp1.id,
        projectId: project1.id,
      },
      {
        title: 'Build Productivity Logic',
        description: 'Implement score calculation algorithm.',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        dueDate: new Date('2026-03-10'),
        employeeId: emp1.id,
        projectId: project1.id,
      },
      {
        title: 'Design UI Wireframes',
        description: 'Create clean Tailwind dark mode layouts.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2026-03-15'),
        employeeId: emp2.id,
        projectId: project1.id,
      },
    ],
  });

  console.log('Seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });