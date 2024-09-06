export type CommonConstructionArgs = {
  logger?: Partial<Logger>;
  globalContext?: Record<string, string>;
};

export type CheckArgs = {
  name: string;
  context?: Record<string, string>;
};

export const DEFAULT = false;

type LogCallback = (msg: string, context?: Record<string, unknown>) => void;

export interface Logger {
  error: LogCallback;
  info: LogCallback;
  warn: LogCallback;
}
