import {Button} from '@nextui-org/react';
import {ReactNode} from 'react';

export function CreateButton({
  onClick,
  isDisabled,
  children
}: {
  onClick: () => void;
  isDisabled: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      radius="sm"
      color="danger"
      className="bg-rose-900"
      onClick={onClick}
      isDisabled={isDisabled}
    >
      {children}
    </Button>
  );
}
