import React, {Dispatch, useState} from 'react';
import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {UnknownAction} from 'redux';

import {CustomFunctionNames} from '@/utils/custom-functions';
import {useMapping} from '@/utils/mapping-functions';
import {GeoDaState} from '@/store';
import {CustomWeightsMessage} from './custom-weights-message';

type CustomFunctionOutputProps = {
  type: string;
  name: string;
  result: unknown;
  data?: unknown;
};

export type CustomMessagePayload = {
  type: string;
  // one of the CustomFunctionNames
  functionName: CustomFunctionNames;
  functionArgs: Record<string, any>;
  output: CustomFunctionOutputProps;
};

export type CustomMessageProps = {
  key: number;
  functionArgs: Record<string, any>;
  output: CustomFunctionOutputProps;
  dispatch: Dispatch<UnknownAction>;
  geodaState: GeoDaState;
};

/**
 * Create a custom message component contains a confirm button with text "Click to Create a Quantile Map"
 */
export function CreateCustomMessage({props}: {props: CustomMessageProps}) {
  const [hide, setHide] = useState(false);
  const {key, functionArgs, output, dispatch, geodaState} = props;

  const {createCustomScaleMap} = useMapping();

  // handle click event
  const onClick = () => {
    if ('mapping' === output.type) {
      const breaks = output.result as Array<number>;
      const {variableName} = functionArgs;
      createCustomScaleMap({
        breaks,
        mappingType: output.name,
        colorFieldName: variableName,
        dispatch,
        geodaState
      });
    }
    // hide the button once clicked
    setHide(true);
  };

  return (
    <>
      {output.type === 'mapping' && !hide && (
        <Button
          radius="full"
          className="mt-2 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-none"
          key={key}
          onClick={onClick}
        >
          <Typewriter
            options={{
              strings: `Click to Create a ${output.name} Map`,
              autoStart: true,
              loop: false,
              delay: 10
            }}
          />
        </Button>
      )}
      {output.type === 'weights' && <CustomWeightsMessage props={props} />}
    </>
  );
}
