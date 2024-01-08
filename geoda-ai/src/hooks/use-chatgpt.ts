import {MessageModel} from '@chatscope/chat-ui-kit-react';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const systemMessage = {
  role: 'system',
  content:
    "Explain things like you're talking to a software professional with 2 years of experience."
};

/**
 * custom hook to use ChatGPT
 */
export function useChatGPT() {
  async function processMessageToChatGPT(
    chatMessages: Array<MessageModel>,
    data: any
  ): Promise<MessageModel | null> {
    let apiMessages = chatMessages.map(messageObject => {
      let role = messageObject.sender === 'ChatGPT' ? 'assistant' : 'user';
      return {role: role, content: messageObject.message};
    });

    let dataContent = typeof data === 'string' ? data : JSON.stringify(data);

    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        systemMessage,
        {role: 'system', content: dataContent}, // passing data
        ...apiMessages
      ]
    };

    const returnMessage = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiRequestBody)
    });

    const returnMessageJson = await returnMessage.json();
    console.log(returnMessageJson);

    if (returnMessageJson && returnMessageJson.choices && returnMessageJson.choices.length > 0) {
      return {
        message: returnMessageJson.choices[0].message.content,
        sender: 'ChatGPT',
        direction: 'incoming',
        position: 'normal'
      };
    }
    console.error('The data.choices is undefined or empty.');
    return null;
  }

  return {processMessageToChatGPT};
}
