import type {
  FeatureFlagToContextConfiguration,
  SyncGenericFeatureFlagger,
} from '../generics';
import { DEFAULT, type CheckArgs } from './common';

export type SyncDriver = {
  checkEnabled: (args: CheckArgs) => boolean | undefined;
};

export class SyncFeatureFlagger<C extends FeatureFlagToContextConfiguration>
  implements SyncGenericFeatureFlagger<C>
{
  private readonly driver: SyncDriver;

  constructor({ driver }: { driver: SyncDriver }) {
    this.driver = driver;
  }

  public enabled<K extends keyof C>(name: K, context?: C[K]): boolean {
    try {
      return (
        this.driver.checkEnabled({ name: name.toString(), context }) ?? DEFAULT
      );
    } catch (err) {
      // TODO: logger generic
      return DEFAULT;
    }
  }
}
