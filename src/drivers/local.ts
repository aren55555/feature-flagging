import type { SyncDriver } from '../service';
import type { CheckArgs } from '../service/common';

type Value = ReturnType<SyncDriver['checkEnabled']>;
type ValueProducer = Value | ((args: CheckArgs) => Value);

export class LocalDriver implements SyncDriver {
  private readonly staticConfig: Record<string, ValueProducer>;

  constructor(staticConfig: Record<string, ValueProducer>) {
    this.staticConfig = staticConfig;
  }

  checkEnabled(args: CheckArgs): boolean | undefined {
    const valueProducer = this.staticConfig[args.name];
    if (valueProducer instanceof Function) {
      return valueProducer(args);
    }

    return valueProducer;
  }
}
