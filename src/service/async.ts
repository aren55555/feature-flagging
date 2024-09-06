import type { Promisable } from 'type-fest';
import type {
  MaybeAsyncGenericFeatureFlagger,
  FeatureFlagToContextConfiguration,
} from '../generics';
import {
  DEFAULT,
  type CheckArgs,
  type CommonConstructionArgs,
  type Logger,
} from './common';
import { mergeContextsWithOverrideWarning } from './merge-contexts';

export type AsyncDriver = {
  checkEnabled: (args: CheckArgs) => Promisable<boolean | undefined>;
};

export class AsyncFeatureFlagger<C extends FeatureFlagToContextConfiguration>
  implements MaybeAsyncGenericFeatureFlagger<C>
{
  private readonly driver: AsyncDriver;
  private readonly logger: CommonConstructionArgs['logger'];
  private readonly globalContext: CommonConstructionArgs['globalContext'];

  constructor({
    driver,
    logger,
    globalContext,
  }: {
    driver: AsyncDriver;
  } & CommonConstructionArgs) {
    this.driver = driver;
    this.logger = logger;
    this.globalContext = globalContext;
  }

  public async enabled<K extends keyof C>(
    name: K,
    context?: C[K],
  ): Promise<boolean> {
    const mergedContext = context
      ? mergeContextsWithOverrideWarning({
          globalContext: this.globalContext,
          localContext: context,
        })
      : undefined;

    try {
      const result = await this.driver.checkEnabled({
        name: name.toString(),
        context: mergedContext,
      });
      if (result === undefined) {
        if (this.logger?.info) {
          this.logger.info(
            'driver#checkEnabled did no receive a value from the driver#checkEnabled call (undefined), returning default',
            { name, context },
          );
        }
        return DEFAULT;
      }

      return result;
    } catch (err) {
      if (this.logger?.error) {
        this.logger.error('driver#checkEnabled threw', { name, context, err });
      }

      return DEFAULT;
    }
  }
}
