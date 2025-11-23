export type SchedulerTask = {
  id: string;
  runAt: number;
  data?: Record<string, unknown>;
};
