import {Button} from '@nextui-org/react';

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
      className="mt-2 h-6 bg-gradient-to-tr from-pink-300 to-yellow-200 text-white shadow-none"
      onClick={onClick}
      startContent={hide ? <GreenCheckIcon /> : <HeartIcon />}
      isDisabled={hide}
    >
      {label}
    </Button>
  );
}
