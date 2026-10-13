import type { CommandCenterDataSource, CommandCenterSourceKind } from "./commandCenterDataSource";
import type { CommandCenterViewModel } from "./commandCenterViewModel";

export type CommandCenterRuntimePhase =
  | "idle"
  | "loading"
  | "ready"
  | "refreshing"
  | "error";

export interface CommandCenterRuntimeError {
  code: "READ_FAILED";
  message: string;
  occurredAt: string;
}

export interface CommandCenterRuntimeState {
  phase: CommandCenterRuntimePhase;
  sourceKind: CommandCenterSourceKind;
  viewModel?: CommandCenterViewModel;
  lastAttemptAt?: string;
  lastSuccessfulAt?: string;
  error?: CommandCenterRuntimeError;
}

export type CommandCenterRefreshOutcome = "success" | "error" | "superseded";
export type CommandCenterRuntimeListener = (state: CommandCenterRuntimeState) => void;

function safeRuntimeError(occurredAt: string): CommandCenterRuntimeError {
  return {
    code: "READ_FAILED",
    message: "به‌روزرسانی نمای مدیریتی انجام نشد. لطفاً دوباره تلاش کنید.",
    occurredAt,
  };
}

export class CommandCenterRuntime {
  private requestSequence = 0;
  private state: CommandCenterRuntimeState;
  private readonly listeners = new Set<CommandCenterRuntimeListener>();
  private readonly dataSource: CommandCenterDataSource;

  constructor(dataSource: CommandCenterDataSource) {
    this.dataSource = dataSource;
    this.state = {
      phase: "idle",
      sourceKind: dataSource.sourceKind,
    };
  }

  getState = () => this.state;

  /** Invalidates inflight responses and erases the prior snapshot after access loss. */
  invalidate() {
    this.requestSequence += 1;
    this.publish({phase: "idle", sourceKind: this.dataSource.sourceKind});
  }

  subscribe = (listener: CommandCenterRuntimeListener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private publish(next: CommandCenterRuntimeState) {
    this.state = next;
    for (const listener of this.listeners) listener(next);
  }

  async refresh(now = new Date().toISOString()): Promise<CommandCenterRefreshOutcome> {
    const requestId = ++this.requestSequence;
    const hasSnapshot = Boolean(this.state.viewModel);

    this.publish({
      ...this.state,
      phase: hasSnapshot ? "refreshing" : "loading",
      lastAttemptAt: now,
      // Keep the historical-data warning visible until a successful read.
      error: hasSnapshot && this.state.phase === "error" ? this.state.error : undefined,
    });

    try {
      const viewModel = await this.dataSource.read(now);
      if (requestId !== this.requestSequence) return "superseded";
      // Reject a forged synthetic view on the manager's Live data path.
      const expectedLabel = this.dataSource.sourceKind === "live" ? "LIVE/READ-ONLY" : "DEMO/MOCK";
      if (!viewModel || viewModel.dataLabel !== expectedLabel) throw new Error("SOURCE_MODE_MISMATCH");

      this.publish({
        phase: "ready",
        sourceKind: this.dataSource.sourceKind,
        viewModel,
        lastAttemptAt: now,
        lastSuccessfulAt: now,
      });
      return "success";
    } catch {
      if (requestId !== this.requestSequence) return "superseded";

      this.publish({
        ...this.state,
        phase: "error",
        lastAttemptAt: now,
        error: safeRuntimeError(now),
      });
      return "error";
    }
  }
}
