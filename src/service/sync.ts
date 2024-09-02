import type {
  FeatureFlagToContextConfiguration,
  SyncGenericFeatureFlagger,
} from '../generics';
import { DEFAULT, type CheckArgs, type Logger } from './common';

export type SyncDriver = {
  checkEnabled: (args: CheckArgs) => boolean | undefined;
};

export class SyncFeatureFlagger<C extends FeatureFlagToContextConfiguration>
  implements SyncGenericFeatureFlagger<C>
{
  private readonly driver: SyncDriver;
  private readonly logger?: Logger;

  constructor({ driver, logger }: { driver: SyncDriver; logger?: Logger }) {
    this.driver = driver;
    this.logger = logger;
  }

  public enabled<K extends keyof C>(name: K, context?: C[K]): boolean {
    try {
      return (
        this.driver.checkEnabled({ name: name.toString(), context }) ?? DEFAULT
      );
    } catch (err) {
      this.logger?.info('driver#checkEnabled threw', { name, context, err });
      return DEFAULT;
    }
  }
}
