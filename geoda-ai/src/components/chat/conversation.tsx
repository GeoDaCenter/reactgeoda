import React, {useEffect} from 'react';

import MessageCard from './message-card';

export type Message = {
  role: string;
  message: string;
};

export default function Component({messages}: {messages: Message[]}) {
  // scroll to bottom when new message is added
  useEffect(() => {
    // hack to scroll to bottom
    const element = document.getElementById('chat-messages-list');
    if (element?.firstElementChild) {
      element.firstElementChild.scrollTop = element.firstElementChild.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 px-1" id="chat-messages-list">
      {messages.map(({role, message}, index) => (
        <MessageCard
          key={index}
          index={index}
          // attempts={index === 1 ? 2 : 1}
          // currentAttempt={index === 1 ? 2 : 1}
          avatar={
            role === 'assistant'
              ? 'https://www.iemoji.com/view/emoji/1855/smileys-people/robot-face'
              : 'https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/avatar_ai.png'
          }
          message={message}
          messageClassName={role === 'user' ? 'bg-content3 text-content3-foreground' : ''}
          showFeedback={role === 'assistant'}
        />
      ))}
    </div>
  );
}
