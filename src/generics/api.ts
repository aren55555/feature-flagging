import type { ConditionalPick, Except, Promisable } from 'type-fest';

export type FeatureFlagToContextConfiguration = Record<
  string,
  Record<string, string> | never
>;

export interface SyncGenericFeatureFlagger<
  C extends FeatureFlagToContextConfiguration,
> {
  /**
   * a feature WITHOUT a typed context (never), does not need to provide the second argument
   */
  enabled<K extends keyof ConditionalPick<C, never>>(name: K): boolean;

  /**
   * a feature WITH a typed context, MUST provide the second argument
   */
  enabled<K extends keyof Except<C, never>>(name: K, context: C[K]): boolean;
}

export interface MaybeAsyncGenericFeatureFlagger<
  C extends FeatureFlagToContextConfiguration,
> {
  /**
   * a feature WITHOUT a typed context (never), does not need to provide the second argument
   */
  enabled<K extends keyof ConditionalPick<C, never>>(
    name: K,
  ): Promisable<boolean>;

  /**
   * a feature WITH a typed context, MUST provide the second argument
   */
  enabled<K extends keyof Except<C, never>>(
    name: K,
    context: C[K],
  ): Promisable<boolean>;
}
