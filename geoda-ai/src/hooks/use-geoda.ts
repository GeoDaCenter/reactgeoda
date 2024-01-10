import {initGeoDa, localMoran, LocalMoranResultType} from 'geoda-wasm';

import {useCallback} from 'react';

/**
 * Initialize GeoDa
 */
// initial the global duckdb instance, delay 500ms to avoid blocking loading default page
setTimeout(async () => {
  await initGeoDa();
}, 600);

export function useGeoDa() {
  const runLocalMoran = useCallback(async (): Promise<LocalMoranResultType> => {
    const data = [3.0, 3.0, 0.0, 9.0, 8.0, 8.5];
    const neighbors = [[1], [0], [], [4, 5], [3, 5], [3, 4]];
    const perm = 99;

    const result = await localMoran(data, neighbors, perm);
    console.log('local moran result:', result);
    return result;
  }, []);

  return {runLocalMoran};
}
