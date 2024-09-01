import type { SyncGenericFeatureFlagger } from '.';
import { test, vi } from 'vitest';

type Config = {
  'feature-with-context': {
    a: string;
    b: string;
  };
  'feature-without-context': never;
};

type FeatureFlagger = SyncGenericFeatureFlagger<Config>;

const mockFeatureFlagger = {
  enabled: vi.fn(),
} as unknown as FeatureFlagger;

test('desired type api', () => {
  mockFeatureFlagger.enabled('feature-with-context', { a: 'a', b: 'b' });
  mockFeatureFlagger.enabled('feature-without-context');
});
