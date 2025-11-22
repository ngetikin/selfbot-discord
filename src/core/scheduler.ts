import { EventEmitter } from 'events';

export type SchedulerTask = {
  id: string;
  runAt: number;
  data?: Record<string, unknown>;
};

export type SchedulerEvents = {
  taskReady: (task: SchedulerTask) => void;
};

export class Scheduler extends EventEmitter {
  private tasks: SchedulerTask[] = [];
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  add(task: SchedulerTask) {
    this.tasks = this.tasks.filter((t) => t.id !== task.id);
    this.tasks.push(task);
    this.sort();
    this.scheduleNextTick();
  }

  cancel(id: string) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.scheduleNextTick();
  }

  reschedule(id: string, runAt: number) {
    const target = this.tasks.find((t) => t.id === id);
    if (!target) return;
    target.runAt = runAt;
    this.sort();
    this.scheduleNextTick();
  }

  popReady(now: number): SchedulerTask[] {
    const ready = this.tasks.filter((t) => t.runAt <= now);
    this.tasks = this.tasks.filter((t) => t.runAt > now);
    this.scheduleNextTick();
    return ready;
  }

  load(tasks: SchedulerTask[]) {
    this.tasks = tasks;
    this.sort();
    this.scheduleNextTick();
  }

  snapshot(): SchedulerTask[] {
    return [...this.tasks];
  }

  shutdown() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.removeAllListeners();
  }

  private scheduleNextTick() {
    if (this.timer) clearTimeout(this.timer);
    const next = this.tasks[0];
    if (!next) return;
    const delay = Math.max(0, next.runAt - Date.now());
    this.timer = setTimeout(() => this.tick(), delay);
  }

  private tick() {
    const ready = this.popReady(Date.now());
    for (const task of ready) {
      this.emit('taskReady', task);
    }
  }

  private sort() {
    this.tasks.sort((a, b) => a.runAt - b.runAt);
  }
}
