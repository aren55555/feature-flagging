import type { Logger } from './common';

export const mergeContextsWithOverrideWarning = ({
  localContext,
  globalContext,
  logger,
}: {
  globalContext: Record<string, string> | undefined;
  localContext: Record<string, string>;
  logger?: Partial<Pick<Logger, 'warn'>>;
}): Record<string, string> => {
  if (!globalContext) {
    return localContext;
  }

  const commonKeys = intersectingKeys(globalContext, localContext);
  if (commonKeys.length) {
    // We had some overlapping keys, so we need to log a warning
    logger?.warn?.(
      'The global context contained key/values that will override the ones in the local context',
      { commonKeys },
    );
  }

  // Regardless of overlap, we merge these two Records, with the globalContext's
  // key/values overriding the ones in the localContext (if there were any)
  return {
    ...localContext,
    ...globalContext,
  };
};

const intersectingKeys = (
  a: Record<string, string>,
  b: Record<string, string>,
): string[] => Object.keys(a).filter((key) => b.hasOwnProperty(key));
