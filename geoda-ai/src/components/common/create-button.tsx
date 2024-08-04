import {Button} from '@nextui-org/react';
import {ReactNode} from 'react';

export function CreateButton({
  onClick,
  isDisabled,
  isRunning = false,
  children
}: {
  onClick: () => void;
  isDisabled: boolean;
  isRunning?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      radius="sm"
      color="danger"
      className="bg-rose-900"
      onClick={onClick}
      isDisabled={isDisabled}
      isLoading={isRunning}
    >
      {children}
    </Button>
  );
}
