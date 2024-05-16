import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';

import {GreenCheckIcon} from '../icons/green-check';
import {HeartIcon} from '../icons/heart';

export function CustomCreateButton({
  onClick,
  hide,
  label
}: {
  onClick: () => void;
  hide: boolean;
  label: string;
}) {
  return (
    <Button
      radius="full"
      className="mt-2 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-none"
      onClick={onClick}
      startContent={hide ? <GreenCheckIcon /> : <HeartIcon />}
      isDisabled={hide}
    >
      <Typewriter
        options={{
          strings: label,
          autoStart: true,
          loop: false,
          delay: 10
        }}
      />
    </Button>
  );
}
