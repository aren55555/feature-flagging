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
    const ff: SyncGenericFeatureFlagger<TestConfig> =
      new SyncFeatureFlagger<TestConfig>({
        driver: {
          checkEnabled,
        },
      });

    return {
      checkEnabled,
      ff,
    };
  };

  it('can call thru to the driver to obtain a value', () => {
    const { checkEnabled, ff } = prepare();
    vi.mocked(checkEnabled).mockReturnValue(true);

    const got1 = ff.enabled('feature1', { contextValue1: 'foo' });
    expect(got1).toStrictEqual(true);

    const got2 = ff.enabled('feature2');
    expect(got2).toStrictEqual(true);
  });

  it('handles the case where the driver returned undefined', () => {
    const { checkEnabled, ff } = prepare();
    vi.mocked(checkEnabled).mockReturnValue(undefined);

    const got1 = ff.enabled('feature1', { contextValue1: 'foo' });
    expect(got1).toStrictEqual(DEFAULT);

    const got2 = ff.enabled('feature2');
    expect(got2).toStrictEqual(DEFAULT);
  });

  it('handles the case where the driver threw', () => {
    const { checkEnabled, ff } = prepare();
    vi.mocked(checkEnabled).mockImplementation(() => {
      throw new Error();
    });

    const got1 = ff.enabled('feature1', { contextValue1: 'foo' });
    expect(got1).toStrictEqual(DEFAULT);

    const got2 = ff.enabled('feature2');
    expect(got2).toStrictEqual(DEFAULT);
  });
});
