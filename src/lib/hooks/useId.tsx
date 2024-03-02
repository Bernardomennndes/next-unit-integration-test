import * as React from 'react';

import { useLayoutEffect } from './useLayoutEffect';

// `toString()` is used to prevent bundlers from trying to `import { useId } from 'react';`
const useReactId = (React as any)['useId'.toString()] || (() => undefined);
let count = 0;

function useId(deterministicId?: string) {
  const [id, setId] = React.useState<string | undefined>(useReactId());

  useLayoutEffect(() => {
    if (!deterministicId) setId((reactId) => reactId ?? String(count++));
  }, [deterministicId]);

  return deterministicId ?? (id ? `next-${id}` : '');
}

export { useId };
