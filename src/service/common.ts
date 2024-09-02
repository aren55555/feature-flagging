export type CheckArgs = {
  name: string;
  context?: Record<string, string>;
};

export const DEFAULT = false;

export interface Logger {
  info: (msg: string, context?: Record<string, unknown>) => void;
}
