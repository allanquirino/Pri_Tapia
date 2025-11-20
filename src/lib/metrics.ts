import db from '@/services/database';

export async function measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = Math.round(performance.now() - start);
    await db.addSystemLog({ type: 'performance', action: name, status: 'success', durationMs: duration });
    return result;
  } catch (e) {
    const duration = Math.round(performance.now() - start);
    await db.addSystemLog({ type: 'performance', action: name, status: 'error', durationMs: duration, details: e instanceof Error ? e.message : 'unknown error' });
    throw e;
  }
}
