import { describe, expect, it, vitest, type Mock } from 'vitest';
import { mergeContextsWithOverrideWarning } from './merge-contexts';

describe('mergeContextsWithOverrideWarning', () => {
  it.each<{
    input: Parameters<typeof mergeContextsWithOverrideWarning>[0];
    want: ReturnType<typeof mergeContextsWithOverrideWarning>;
    expectWarn?: (warn: Mock) => void;
  }>([
    {
      input: {
        globalContext: undefined,
        localContext: {
          a: 'local',
        },
      },
      want: {
        a: 'local',
      },
      expectWarn: (warn) => expect(warn).not.toHaveBeenCalled(),
    },
    {
      input: {
        globalContext: {
          global: 'global',
        },
        localContext: {
          local: 'local',
        },
      },
      want: {
        global: 'global',
        local: 'local',
      },
      expectWarn: (warn) => expect(warn).not.toHaveBeenCalled(),
    },
    {
      input: {
        globalContext: {
          a: 'global',
          b: 'b',
        },
        localContext: {
          a: 'local',
          c: 'c',
        },
      },
      want: {
        a: 'global',
        b: 'b',
        c: 'c',
      },
      expectWarn: (warn) =>
        expect(warn).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            commonKeys: ['a'],
          }),
        ),
    },
  ])('$input => $want', ({ input, want, expectWarn }) => {
    const warn = vitest.fn();

    const got = mergeContextsWithOverrideWarning({
      ...input,
      logger: {
        warn,
      },
    });

    expect(got).toStrictEqual(want);
    expectWarn?.(warn);
  });
});
