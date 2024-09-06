import type {
  FeatureFlagToContextConfiguration,
  SyncGenericFeatureFlagger,
} from '../generics';
import { DEFAULT, type CheckArgs, type CommonConstructionArgs } from './common';
import { mergeContextsWithOverrideWarning } from './merge-contexts';

export type SyncDriver = {
  checkEnabled: (args: CheckArgs) => boolean | undefined;
};

export class SyncFeatureFlagger<C extends FeatureFlagToContextConfiguration>
  implements SyncGenericFeatureFlagger<C>
{
  private readonly driver: SyncDriver;
  private readonly logger: CommonConstructionArgs['logger'];
  private readonly globalContext: CommonConstructionArgs['globalContext'];

  constructor({
    driver,
    logger,
    globalContext,
  }: {
    driver: SyncDriver;
  } & CommonConstructionArgs) {
    this.driver = driver;
    this.logger = logger;
    this.globalContext = globalContext;
  }

  public enabled<K extends keyof C>(name: K, context?: C[K]): boolean {
    const mergedContext = context
      ? mergeContextsWithOverrideWarning({
          globalContext: this.globalContext,
          localContext: context,
        })
      : undefined;

    try {
      const result = this.driver.checkEnabled({
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
