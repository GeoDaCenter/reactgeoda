import {Button, Tooltip} from '@nextui-org/react';
import React from 'react';
import {useDispatch} from 'react-redux';
import {Icon} from '@iconify/react';

import {takeSnapshot} from '../../utils/ui-utils';
import {setDefaultPromptText, setScreenCaptured} from '../../actions';

export function ChartInsightButton({parentElementId}: {parentElementId: string}) {
  const dispatch = useDispatch();

  const getChartInsights = async () => {
    // get screenshot from the parent element
    const chartElement = document.getElementById(parentElementId);
    if (chartElement) {
      const screenshot = await takeSnapshot(chartElement);
      // dispatch the screenshot to the AI
      dispatch(setScreenCaptured(screenshot));
      // dispatch to set default prompt message in chat panel
      dispatch(setDefaultPromptText('Can you get some insights from this chart?'));
    }
  };

  return (
    <Tooltip content="Get AI Insights" size="sm">
      <Button
        className="absolute right-1 top-1 z-10"
        isIconOnly={true}
        radius="full"
        size="sm"
        color="primary"
        variant="light"
        onClick={getChartInsights}
      >
        <Icon icon="ri:gemini-fill" width={18} />
      </Button>
    </Tooltip>
  );
}
