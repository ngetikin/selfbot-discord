export type SchedulerTask = {
  id: string;
  runAt: number;
  data?: Record<string, unknown>;
};

export class Scheduler {
  private tasks: SchedulerTask[] = [];

  add(task: SchedulerTask) {
    this.tasks.push(task);
    this.sort();
  }

  popReady(now: number): SchedulerTask[] {
    const ready = this.tasks.filter((t) => t.runAt <= now);
    this.tasks = this.tasks.filter((t) => t.runAt > now);
    return ready;
  }

  private sort() {
    this.tasks.sort((a, b) => a.runAt - b.runAt);
  }
}
