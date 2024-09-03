import { describe, expect, it, vi } from 'vitest';
import type { MaybeAsyncGenericFeatureFlagger } from '../generics';
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
    const loggerError = vi.fn();

    const ff: MaybeAsyncGenericFeatureFlagger<TestConfig> =
      new AsyncFeatureFlagger<TestConfig>({
        driver: {
          checkEnabled,
        },
        logger: {
          info: loggerInfo,
          error: loggerError,
        },
      });

    return {
      checkEnabled,
      loggerInfo,
      loggerError,
      ff,
    };
  };

  it('can call thru to the driver to obtain a value', async () => {
    const { checkEnabled, loggerError, loggerInfo, ff } = prepare();
    vi.mocked(checkEnabled).mockResolvedValue(true);

    const got1 = await ff.enabled('feature1', { contextValue1: 'foo' });
    expect(got1).toStrictEqual(true);

    const got2 = await ff.enabled('feature2');
    expect(got2).toStrictEqual(true);

    expect(loggerError).not.toHaveBeenCalled();
    expect(loggerInfo).not.toHaveBeenCalled();
  });

  it('handles the case where the driver returned undefined', async () => {
    const { checkEnabled,loggerError, loggerInfo, ff } = prepare();
    vi.mocked(checkEnabled).mockReturnValue(undefined);

    const got1 = await ff.enabled('feature1', { contextValue1: 'foo' });
    expect(got1).toStrictEqual(DEFAULT);
    expect(loggerInfo).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/returning default/),
      expect.objectContaining({
        name: 'feature1',
      }),
    );

    const got2 = await ff.enabled('feature2');
    expect(got2).toStrictEqual(DEFAULT);
    expect(loggerInfo).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/returning default/),
      expect.objectContaining({
        name: 'feature2',
      }),
    );

    expect(loggerError).not.toHaveBeenCalled();
  });

  it('handles the case where the driver threw', async () => {
    const { checkEnabled, loggerError,loggerInfo, ff } = prepare();
    vi.mocked(checkEnabled).mockRejectedValue(new Error());

    const got1 = await ff.enabled('feature1', { contextValue1: 'foo' });
    expect(got1).toStrictEqual(DEFAULT);
    expect(loggerError).toHaveBeenNthCalledWith(
      1,
      'driver#checkEnabled threw',
      expect.objectContaining({
        name: 'feature1',
      }),
    );

    const got2 = await ff.enabled('feature2');
    expect(got2).toStrictEqual(DEFAULT);
    expect(loggerError).toHaveBeenNthCalledWith(
      2,
      'driver#checkEnabled threw',
      expect.objectContaining({
        name: 'feature2',
      }),
    );

    expect(loggerInfo).not.toHaveBeenCalled();
  });
});
