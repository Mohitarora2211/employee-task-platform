export function calculateProductivity(tasks: Array<{ status: string }>) {
  if (!tasks || tasks.length === 0) {
    return { score: 0, completedCount: 0 };
  }
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const score = Math.round((completedCount / tasks.length) * 100);
  return { score, completedCount };
}