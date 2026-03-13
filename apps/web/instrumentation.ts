export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startMonitorWorker } = await import('./workers/monitor.worker');
    const { startEscalationWorker } = await import('./workers/escalation.worker');
    const { startNotificationWorker } = await import('./workers/notification.worker');
    const { startMonitorScheduler } = await import('./workers/scheduler');

    // Start all BullMQ workers
    startMonitorWorker();
    startEscalationWorker();
    startNotificationWorker();

    // Schedule all active monitors
    await startMonitorScheduler();

    console.log('[OnCallKit] Workers and scheduler initialized');
  }
}
