import React, {Dispatch, useState} from 'react';
import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {UnknownAction} from 'redux';

import {CustomFunctionNames} from '@/utils/custom-functions';
import {useMapping} from '@/utils/mapping-functions';
import {GeoDaState} from '@/store';

type CustomFunctionOutputProps = {
  type: string;
  name: string;
  result: Array<unknown>;
};

export type CustomMessagePayload = {
  type: string;
  // one of the CustomFunctionNames
  functionName: CustomFunctionNames;
  functionArgs: Record<string, any>;
  output: CustomFunctionOutputProps;
};

type CustomMessageProps = {
  key: number;
  functionArgs: Record<string, any>;
  output: CustomFunctionOutputProps;
  dispatch: Dispatch<UnknownAction>;
  geodaState: GeoDaState;
};

/**
 * Create a custom message component contains a confirm button with text "Click to Create a Quantile Map"
 */
export const CreateCustomMessage = (props: CustomMessageProps) => {
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
    output.type === 'mapping' &&
    !hide && (
      <Button
        radius="full"
        className="m-2 bg-white  text-black  shadow-sm"
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
    )
  );
};
