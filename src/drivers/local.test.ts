import { describe, expect, it } from 'vitest';
import { LocalDriver } from './local';
import type { SyncGenericFeatureFlagger } from '../generics';
import { SyncFeatureFlagger } from '../service';

type TestConfig = {
  dynamic: { a: string } | { b: string };
  static: never;
  miss: never;
};

describe('LocalDriver', () => {
  const prepare = () => {
    const driver = new LocalDriver({
      static: true,
      dynamic: ({ context }) => context?.a === 'a',
    });

    return driver;
  };

  it('can handle a static lookup', () => {
    const driver = prepare();

    const got = driver.checkEnabled({
      name: 'static',
    });

    expect(got).toStrictEqual(true);
  });

  it('can handle a dynamic lookup', () => {
    const driver = prepare();

    const got1 = driver.checkEnabled({
      name: 'dynamic',
      context: { a: 'a' },
    });
    expect(got1).toStrictEqual(true);

    const got2 = driver.checkEnabled({
      name: 'dynamic',
      context: { b: 'b' },
    });
    expect(got2).toStrictEqual(false);
  });

  it('can handle a miss', () => {
    const driver = prepare();

    const got = driver.checkEnabled({
      name: 'miss',
    });
    expect(got).toStrictEqual(undefined);
  });

  it('can be used in a FeatureFlagger', () => {
    const driver = prepare();

    const ff: SyncGenericFeatureFlagger<TestConfig> =
      new SyncFeatureFlagger<TestConfig>({
        driver,
      });

    const got1 = ff.enabled('static');
    expect(got1).toStrictEqual(true);

    const got2 = ff.enabled('dynamic', { a: 'b' });
    expect(got2).toStrictEqual(false);

    const got3 = ff.enabled('miss');
    expect(got3).toStrictEqual(false);
  });
});
