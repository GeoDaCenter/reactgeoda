import {
  initGeoDa,
  localMoran,
  LocalMoranResultType,
  quantileBreaks,
  naturalBreaks
} from 'geoda-wasm';

// @ts-ignore we import geoda.wasm explicitly so it can be bundled by webpack
import geodawasm from 'geoda-wasm/dist/geoda.wasm';

import {useCallback} from 'react';

// initial the global geoda instance, delay 1000ms to avoid blocking loading default page
setTimeout(async () => {
  await initGeoDa();
}, 1000);

export function useGeoDa() {
  const runLocalMoran = useCallback(async (): Promise<LocalMoranResultType> => {
    const data = [3.0, 3.0, 0.0, 9.0, 8.0, 8.5];
    const neighbors = [[1], [0], [], [4, 5], [3, 5], [3, 4]];
    const perm = 99;

    const result = await localMoran({data, neighbors, permutation: perm});
    console.log('local moran result:', result, geodawasm);
    return result;
  }, []);

  const runQuantileBreaks = useCallback(async (k: number, data: number[]) => {
    const result = await quantileBreaks(k, data);
    console.log('quantile breaks:', result);
    return result;
  }, []);

  const runNaturalBreaks = useCallback(async (k: number, data: number[]) => {
    const result = await naturalBreaks(k, data);
    console.log('natural breaks:', result);
    return result;
  }, []);

  return {runLocalMoran, runQuantileBreaks, runNaturalBreaks};
}
