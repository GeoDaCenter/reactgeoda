import {Button, Popover, PopoverContent, PopoverTrigger} from '@nextui-org/react';
import {Icon} from '@iconify/react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {sendMessageToAI, setGuidanceMessages, setGuidingUser} from '@/actions';
import {DEFAULT_GUIDENCE_MESSAGES} from '@/reducers/ai-reducer';

export default function GuidanceButton() {
  const dispatch = useDispatch<any>();

  const [isOpen, setIsOpen] = useState(false);

  const userAction = useSelector((state: GeoDaState) => state.root.uiState.userAction);

  const isGuidingUser = useSelector((state: GeoDaState) => state.root.uiState.isGuidingUser);

  const guidenceMessages = useSelector((state: GeoDaState) => state.root.ai.guidenceMessages);

  const onGuidanceClick = useCallback(async () => {
    setIsOpen(false);
    if (isGuidingUser === false) {
      // start guiding the user
      dispatch(setGuidingUser(true));
      // send initial guidence messages to the LLM
      dispatch(
        sendMessageToAI('Please guide me how to create a thematic map.', DEFAULT_GUIDENCE_MESSAGES)
      );
    } else {
      // stop guiding the user
      dispatch(setGuidingUser(false));
      // reset guidence messages
      setGuidanceMessages(DEFAULT_GUIDENCE_MESSAGES);
    }
  }, [dispatch, isGuidingUser]);

  useEffect(() => {
    if (isGuidingUser && userAction.length > 0 && guidenceMessages) {
      const updatedGuidanceMessages = [...guidenceMessages, {role: 'user', text: userAction}];
      // add user action to the guidence messages
      setGuidanceMessages(updatedGuidanceMessages);
      // send user action to the LLM
      dispatch(sendMessageToAI('', updatedGuidanceMessages));
    }
  }, [dispatch, guidenceMessages, isGuidingUser, userAction]);

  return (
    <Popover showArrow placement="top" backdrop="blur" isOpen={isOpen} className="hidden">
      <PopoverTrigger>
        <Button
          size="sm"
          startContent={
            <Icon
              className="text-default-500"
              // icon="svg-spinners:wind-toy"
              icon="tabler:windmill"
              width={18}
            />
          }
          color={isGuidingUser ? 'warning' : 'default'}
          variant="bordered"
          onClick={() => setIsOpen(!isOpen)}
        >
          Guidance
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px]">
        <div className="w-full px-1 py-2">
          <div className="mt-2 flex w-full flex-col gap-2">
            <Button
              className="w-full text-left"
              onClick={onGuidanceClick}
              startContent={<Icon icon="ri:guide-line" width="1.2em" height="1.2em" />}
            >
              How to create a thematic map
            </Button>
            <Button className="w-full">How to create a spatial rates map</Button>
            <Button className="w-full">How to create a spatial weights</Button>
            <Button className="w-full">How to create query the dataset</Button>
            <Button className="w-full">How to run Local Moran statistics</Button>
            <Button className="w-full">How to run spatial regression</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
