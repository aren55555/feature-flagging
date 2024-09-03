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
  private readonly logger?: Partial<Logger>;

  constructor({
    driver,
    logger,
  }: {
    driver: SyncDriver;
    logger?: Partial<Logger>;
  }) {
    this.driver = driver;
    this.logger = logger;
  }

  public enabled<K extends keyof C>(name: K, context?: C[K]): boolean {
    try {
      const result = this.driver.checkEnabled({
        name: name.toString(),
        context,
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
