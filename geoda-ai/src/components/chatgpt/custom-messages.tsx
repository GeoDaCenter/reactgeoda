import React, {Dispatch} from 'react';
import {Button} from '@nextui-org/react';
import {CustomFunctionNames} from '@/hooks/use-chatgpt';
import Typewriter from 'typewriter-effect';

import {useMapping} from '@/hooks/use-mapping';
import {UnknownAction} from 'redux';
import {GeoDaState} from '@/store';

export type CustomMessagePayload = {
  type: string;
  // one of the CustomFunctionNames
  functionName: CustomFunctionNames;
  functionArgs: Record<string, any>;
  output: any;
};

type CustomMessageProps = {
  key: number;
  functionArgs: Record<string, any>;
  output: any;
  dispatch: Dispatch<UnknownAction>;
  geodaState: GeoDaState;
};

/**
 * Create a custom message component contains a confirm button with text "Click to Create a Quantile Map"
 */
export const CreateQuantileMapMessage = (props: CustomMessageProps) => {
  // const intl = useIntl();
  const {key, functionArgs, output, dispatch, geodaState} = props;

  const {createCustomScaleMap} = useMapping();

  // handle click event
  const onClick = () => {
    console.log('create quantile map');
    if ('quantile_breaks' in output) {
      // todo: add typing for 'quantile_breaks'
      const breaks = output['quantile_breaks'];
      const {variableName} = functionArgs;
      // todo: add typing for 'Quantile'
      createCustomScaleMap({
        breaks,
        mappingType: 'Quantile',
        colorFieldName: variableName,
        dispatch,
        geodaState
      });
    }
  };

  return (
    <Button
      radius="full"
      className="m-2 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
      key={key}
      onClick={onClick}
    >
      <Typewriter
        options={{
          strings: 'Click to Create a Quantile Map',
          autoStart: true,
          loop: false,
          delay: 10
        }}
      />
    </Button>
  );
};
