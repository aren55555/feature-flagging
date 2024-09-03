import { describe, expect, it, vi } from 'vitest';
import { SyncFeatureFlagger } from './sync';
import type { SyncGenericFeatureFlagger } from '../generics';
import { DEFAULT } from './common';

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

    const ff: SyncGenericFeatureFlagger<TestConfig> =
      new SyncFeatureFlagger<TestConfig>({
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

  it('can call thru to the driver to obtain a value', () => {
    const { checkEnabled, loggerError, loggerInfo, ff } = prepare();
    vi.mocked(checkEnabled).mockReturnValue(true);

    const got1 = ff.enabled('feature1', { contextValue1: 'foo' });
    expect(got1).toStrictEqual(true);

    const got2 = ff.enabled('feature2');
    expect(got2).toStrictEqual(true);

    expect(loggerError).not.toHaveBeenCalled();
    expect(loggerInfo).not.toHaveBeenCalled();
  });

  it('handles the case where the driver returned undefined', () => {
    const { checkEnabled, loggerInfo, ff } = prepare();
    vi.mocked(checkEnabled).mockReturnValue(undefined);

    const got1 = ff.enabled('feature1', { contextValue1: 'foo' });
    expect(got1).toStrictEqual(DEFAULT);
    expect(loggerInfo).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/returning default/),
      expect.objectContaining({
        name: 'feature1',
      }),
    );

    const got2 = ff.enabled('feature2');
    expect(got2).toStrictEqual(DEFAULT);
    expect(loggerInfo).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/returning default/),
      expect.objectContaining({
        name: 'feature2',
      }),
    );
  });

  it('handles the case where the driver threw', () => {
    const { checkEnabled, loggerError, ff } = prepare();
    vi.mocked(checkEnabled).mockImplementation(() => {
      throw new Error();
    });

    const got1 = ff.enabled('feature1', { contextValue1: 'foo' });
    expect(got1).toStrictEqual(DEFAULT);
    expect(loggerError).toHaveBeenNthCalledWith(
      1,
      'driver#checkEnabled threw',
      expect.objectContaining({
        name: 'feature1',
      }),
    );

    const got2 = ff.enabled('feature2');
    expect(got2).toStrictEqual(DEFAULT);
    expect(loggerError).toHaveBeenNthCalledWith(
      2,
      'driver#checkEnabled threw',
      expect.objectContaining({
        name: 'feature2',
      }),
    );
  });
});
