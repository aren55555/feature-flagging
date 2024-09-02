import { describe, expect, it, vi } from 'vitest';
import { SyncFeatureFlagger } from './sync';
import type {
  MaybeAsyncGenericFeatureFlagger,
  SyncGenericFeatureFlagger,
} from '../generics';
import { DEFAULT } from './common';
import { AsyncFeatureFlagger } from './async';

type TestConfig = {
  feature1: { contextValue1: string };
  feature2: never;
  feature3: { contextValue2: 'bar' };
};

describe('SyncFeatureFlagger', () => {
  const prepare = () => {
    const checkEnabled = vi.fn();
    const loggerInfo = vi.fn();

    const ff: MaybeAsyncGenericFeatureFlagger<TestConfig> =
      new AsyncFeatureFlagger<TestConfig>({
        driver: {
          checkEnabled,
        },
        logger: {
          info: loggerInfo,
        },
      });

    return {
      checkEnabled,
      loggerInfo,
      ff,
    };
  };

  it('can call thru to the driver to obtain a value', async () => {
    const { checkEnabled, ff } = prepare();
    vi.mocked(checkEnabled).mockResolvedValue(true);

    const got1 = await ff.enabled('feature1', { contextValue1: 'foo' });
    expect(got1).toStrictEqual(true);

    const got2 = await ff.enabled('feature2');
    expect(got2).toStrictEqual(true);
  });

  it('handles the case where the driver returned undefined', async () => {
    const { checkEnabled, ff } = prepare();
    vi.mocked(checkEnabled).mockResolvedValue(undefined);

    const got1 = await ff.enabled('feature1', { contextValue1: 'foo' });
    expect(got1).toStrictEqual(DEFAULT);

    const got2 = await ff.enabled('feature2');
    expect(got2).toStrictEqual(DEFAULT);
  });

  it('handles the case where the driver threw', async () => {
    const { checkEnabled, loggerInfo, ff } = prepare();
    vi.mocked(checkEnabled).mockRejectedValue(new Error());

    const got1 = await ff.enabled('feature1', { contextValue1: 'foo' });
    expect(got1).toStrictEqual(DEFAULT);
    expect(loggerInfo).toHaveBeenNthCalledWith(
      1,
      'driver#checkEnabled threw',
      expect.objectContaining({
        name: 'feature1',
      }),
    );

    const got2 = await ff.enabled('feature2');
    expect(got2).toStrictEqual(DEFAULT);
    expect(loggerInfo).toHaveBeenNthCalledWith(
      2,
      'driver#checkEnabled threw',
      expect.objectContaining({
        name: 'feature2',
      }),
    );
  });
});
