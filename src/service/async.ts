import type { Promisable } from 'type-fest';
import type {
  MaybeAsyncGenericFeatureFlagger,
  FeatureFlagToContextConfiguration,
} from '../generics';
import { DEFAULT, type CheckArgs, type Logger } from './common';

export type AsyncDriver = {
  checkEnabled: (args: CheckArgs) => Promisable<boolean | undefined>;
};

export class AsyncFeatureFlagger<C extends FeatureFlagToContextConfiguration>
  implements MaybeAsyncGenericFeatureFlagger<C>
{
  private readonly driver: AsyncDriver;
  private readonly logger?: Logger;

  constructor({ driver, logger }: { driver: AsyncDriver; logger?: Logger }) {
    this.driver = driver;
    this.logger = logger;
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
      this.logger?.info('driver#checkEnabled threw', { name, context, err });
      return DEFAULT;
    }
  }
}
