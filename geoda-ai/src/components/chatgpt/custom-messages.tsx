import React, {Dispatch, useState} from 'react';
import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {UnknownAction} from 'redux';

import {CustomFunctionNames} from '@/utils/custom-functions';
import {useMapping} from '@/utils/mapping-functions';
import {GeoDaState} from '@/store';
import {CustomWeightsMessage} from './custom-weights-message';

export const HeartIcon = ({
  fill = 'currentColor',
  filled = true,
  size = 24,
  height = 24,
  width = 24,
  ...props
}) => {
  return (
    <svg
      width={size || width || 24}
      height={size || height || 24}
      viewBox="0 0 24 24"
      fill={filled ? fill : 'none'}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z"
        stroke={fill}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

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
          className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white  shadow-none"
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
