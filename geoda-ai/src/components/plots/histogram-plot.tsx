import {HistogramPlotProps} from '@/actions/plot-actions';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';
// Import charts, all with Chart suffix
import {
  // LineChart,
  BarChart
  // PieChart,
  // ScatterChart,
  // RadarChart,
  // MapChart,
  // TreeChart,
  // TreemapChart,
  // GraphChart,
  // GaugeChart,
  // FunnelChart,
  // ParallelChart,
  // SankeyChart,
  // BoxplotChart,
  // CandlestickChart,
  // EffectScatterChart,
  // LinesChart,
  // HeatmapChart,
  // PictorialBarChart,
  // ThemeRiverChart,
  // SunburstChart,
  // CustomChart,
} from 'echarts/charts';
// import components, all suffixed with Component
import {
  // GridSimpleComponent,
  GridComponent,
  // PolarComponent,
  // RadarComponent,
  // GeoComponent,
  // SingleAxisComponent,
  // ParallelComponent,
  // CalendarComponent,
  // GraphicComponent,
  // ToolboxComponent,
  TooltipComponent,
  // AxisPointerComponent,
  // BrushComponent,
  TitleComponent
  // TimelineComponent,
  // MarkPointComponent,
  // MarkLineComponent,
  // MarkAreaComponent,
  // LegendComponent,
  // LegendScrollComponent,
  // LegendPlainComponent,
  // DataZoomComponent,
  // DataZoomInsideComponent,
  // DataZoomSliderComponent,
  // VisualMapComponent,
  // VisualMapContinuousComponent,
  // VisualMapPiecewiseComponent,
  // AriaComponent,
  // TransformComponent,
  // DatasetComponent
} from 'echarts/components';
// Import renderer, note that introducing the CanvasRenderer or SVGRenderer is a required step
import {
  CanvasRenderer
  // SVGRenderer,
} from 'echarts/renderers';
import {HistogramDataItemProps} from '@/utils/histogram-utils';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';

// Register the required components
echarts.use([TitleComponent, TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

const defaultBarColors = ['#FF6B6B', '#48BB78', '#4299E1', '#ED64A6', '#F6E05E'];
/**
 * The react component of a histogram plot using Nivo bar chart
 */
export const HistogramPlot = ({props}: {props: HistogramPlotProps}) => {
  const dispatch = useDispatch();

  // use selector to get tableName
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  const plotData = props.data;

  // use binStart values as the x axis tick values
  const xTickValues = plotData.map(d => d.binStart.toFixed(1));

  const barData = plotData.map((d, i) => {
    return {
      value: d.count,
      itemStyle: {
        color: defaultBarColors[i % defaultBarColors.length]
      },
      label: `[${d.binStart.toFixed(1)} - ${d.binEnd.toFixed(1)}]`,
      ids: d.items.map((item: HistogramDataItemProps) => item.index)
    };
  });

  const option = {
    xAxis: {
      type: 'category',
      data: xTickValues,
      axisTick: {
        alignWithLabel: false,
        // overflow: 'truncate' // or 'break' to continue in a new line
        interval: 0,
        showMinLabel: true,
        showMaxLabel: true,
        formatter: function (value: any, idx: any) {
          console.log(value, idx);
          return `${value}`;
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function (d: any) {
          return `${d}`;
        }
      }
    },
    series: [
      {
        data: barData,
        type: 'bar',
        barWidth: '90%',
        label: {
          show: false,
          position: [0, -15],
          formatter: function (params: {value: any}) {
            return params.value; //display series name
          }
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params: any) {
        // ids that associated with the bar
        const ids = params[0].data.ids;
        // dispatch action to highlight the selected ids
        dispatch({
          type: 'SET_FILTER_INDEXES',
          payload: {dataLabel: tableName, filteredIndex: ids}
        });
        return `Range: ${params[0].data.label}<br/> # Observations: ${params[0].value}`;
      }
    },
    grid: {
      left: '3%',
      right: '0%',
      top: '3%',
      bottom: '0%',
      containLabel: true,
      height: 'auto'
    }
  };

  return (
    <Card className="py-4">
      <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
        <p className="text-tiny font-bold uppercase">{props.type}</p>
        <small className="text-default-500">{props.variable}</small>
      </CardHeader>
      <CardBody className="w-full py-2">
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          notMerge={true}
          lazyUpdate={true}
          // theme={'theme_name'}
          // onChartReady={this.onChartReadyCallback}
          // onEvents={EventsDict}
          // opts={}
          style={{height: '200px', width: '100%'}}
        />
      </CardBody>
    </Card>
  );
};
