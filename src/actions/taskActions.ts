"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createTask(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const employeeId = formData.get("employeeId") as string;
  const projectId = formData.get("projectId") as string;
  const priorityRaw = formData.get("priority") as string;
  const dueDateRaw = formData.get("dueDate") as string;

  let priority = "MEDIUM";
  if (priorityRaw?.toUpperCase().includes("HIGH")) {
    priority = "HIGH";
  } else if (priorityRaw?.toUpperCase().includes("LOW")) {
    priority = "LOW";
  } else {
    priority = "MEDIUM";
  }

  if (!title || !employeeId || !projectId) {
    console.error("Validation Failed: Missing required fields");
    return;
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || "",
        status: "TODO",
        priority: priority as any,
        dueDate: dueDateRaw ? new Date(dueDateRaw) : new Date(),
        employeeId: employeeId,
        projectId: projectId,
      },
    });

    console.log("Task successfully created in DB:", newTask);
    revalidatePath("/");
  } catch (error) {
    console.error("Detailed Error creating task in DB:", error);
  }
}

export async function updateTaskStatus(formData: FormData) {
  const taskId = formData.get("taskId") as string;
  const status = formData.get("status") as string;

  if (!taskId || !status) {
    console.error("Missing taskId or status for update");
    return;
  }

  try {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: status as any },
    });

    console.log("Task status updated successfully:", updatedTask);
    revalidatePath("/");
  } catch (error) {
    console.error("Error updating task status:", error);
  }
}