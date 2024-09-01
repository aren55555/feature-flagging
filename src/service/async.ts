import type { Promisable } from 'type-fest';
import type {
  MaybeAsyncGenericFeatureFlagger,
  FeatureFlagToContextConfiguration,
} from '../generics';
import { DEFAULT, type CheckArgs } from './common';

export type AsyncDriver = {
  checkEnabled: (args: CheckArgs) => Promisable<boolean | undefined>;
};

export class AsyncFeatureFlagger<C extends FeatureFlagToContextConfiguration>
  implements MaybeAsyncGenericFeatureFlagger<C>
{
  private readonly driver: AsyncDriver;

  constructor({ driver }: { driver: AsyncDriver }) {
    this.driver = driver;
  }

  public async enabled<K extends keyof C>(
    name: K,
    context?: C[K],
  ): Promise<boolean> {
    try {
      return (
        (await this.driver.checkEnabled({
          name: name.toString(),
          context,
        })) ?? DEFAULT
      );
    } catch (err) {
      // TODO: logger generic
      return DEFAULT;
    }
  }
}
