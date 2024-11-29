import {Dispatch, RefObject, useEffect} from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {geodaBrushLink} from '@/actions';
import {EChartsType} from 'echarts';
import {selectKeplerDataset} from '@/store/selectors';
import debounce from 'lodash/debounce';

type EChartsUpdaterProps = {
  dataId: string;
  eChartsRef: RefObject<ReactEChartsCore>;
  seriesIndex?: number | number[];
};

// Update the chart when the filteredIndexes change by other components
export const EChartsUpdater = ({dataId, eChartsRef, seriesIndex}: EChartsUpdaterProps) => {
  const filteredIndexes = useSelector(
    (state: GeoDaState) => state.root.interaction?.brushLink?.[dataId]
  );

  // get dataset from store
  const dataset = useSelector(selectKeplerDataset(dataId));
  const numberOfRows = dataset?.length || 0;

  // when filteredIndexTrigger changes, update the chart option using setOption
  useEffect(() => {
    if (eChartsRef.current && filteredIndexes) {
      const chart = eChartsRef.current;
      const chartInstance = chart?.getEchartsInstance();
      chartInstance?.dispatchAction({type: 'downplay'});
      if (filteredIndexes.length < numberOfRows) {
        // chartInstance.dispatchAction({type: 'brush', command: 'clear', areas: []});
        chartInstance?.dispatchAction({
          type: 'highlight',
          dataIndex: filteredIndexes,
          ...(seriesIndex ? {seriesIndex} : {})
        });
        // const updatedOption = getChartOption(filteredIndexes, props);
        // chartInstance.setOption(updatedOption, true);
      }
    }
  }, [eChartsRef, filteredIndexes, numberOfRows, seriesIndex]);

  return null;
};

// Define the type first
type OnSelectedCallback = (params: {dataId: string; filteredIndex: number[]}) => void;

const debouncedOnSelected = debounce(
  (params: {dataId: string; filteredIndex: number[]}, callback?: OnSelectedCallback) => {
    callback?.(params);
  },
  500
);

export function onBrushSelected(
  params: any,
  dispatch: Dispatch<any>,
  dataId: string,
  id: string,
  eChart?: EChartsType,
  onSelected?: ({dataId, filteredIndex}: {dataId: string; filteredIndex: number[]}) => void
) {
  if (!id || !params.batch || params.batch.length === 0) {
    return;
  }

  const brushed = [];
  const brushComponent = params.batch[0];
  for (let sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
    const rawIndices = brushComponent.selected[sIdx].dataIndex;
    // merge rawIndices to brushed
    brushed.push(...rawIndices);
  }

  // check if brushed.length is 0 after 100ms, since brushSelected may return empty array for some reason?!
  setTimeout(() => {
    if (eChart && brushed.length === 0) {
      // clear any highlighted if no data is brushed
      eChart.dispatchAction({type: 'downplay'});
    }
  }, 100);

  // Dispatch action to highlight selected in other components
  dispatch(geodaBrushLink({sourceId: id, dataId, filteredIndex: brushed}));

  if (brushed.length > 0) {
    // Debounce the onSelected callback
    debouncedOnSelected({dataId, filteredIndex: brushed}, onSelected);
  }
}
