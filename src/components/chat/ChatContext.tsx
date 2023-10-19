import { trpc } from '@/app/_trpc/client';
import { useToast } from '@/components/ui/use-toast';
import { INFINTE_QUERY_LIMIT } from '@/config';
import { useMutation } from '@tanstack/react-query';
import { createContext, useRef, useState } from 'react';

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  isLoading: boolean;
};

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: '',
  handleInputChange: () => {},
  isLoading: false,
});

interface ChatContextProviderProps {
  fileId: string;
  children: React.ReactNode;
}

export const ChatContextProvider = ({
  fileId,
  children,
}: ChatContextProviderProps) => {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] =
    useState<boolean>(false);

  const utils = trpc.useContext();

  const { toast } = useToast();
  const backupMessage = useRef('');

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({
      message,
    }: {
      message: string;
    }) => {
      const res = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({ fileId, message }),
      });
      if (!res.ok)
        throw new Error('Failed to send message');
      return res.body;
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage('');
      await utils.getFileMessages.cancel();
      const previousMessages =
        utils.getFileMessages.getInfiniteData();
      utils.getFileMessages.setInfiniteData(
        {
          fileId,
          limit: INFINTE_QUERY_LIMIT,
        },
        (old) => {
          if (!old)
            return {
              pages: [],
              pageParams: [],
            };
          let newPages = [...old.pages];
          let latestPage = newPages[0]!;

          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            ...latestPage.messages,
          ];
          newPages[0] = latestPage;

          return {
            ...old,
            pages: newPages,
          };
        },
      );
      setIsLoading(true);

      return {
        previousMessages:
          previousMessages?.pages.flatMap(
            (page) => page.messages,
          ) ?? [],
      };
    },
    onSuccess: async (stream) => {
      setIsLoading(false);
      if (!stream)
        return toast({
          title: 'There was a problem sending the message',
          description: 'Please refresh and try again',
          variant: 'destructive',
        });
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      let accumulatedResponse = '';
      while (!done) {
        const { value, done: doneReading } =
          await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        accumulatedResponse += chunkValue;

        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINTE_QUERY_LIMIT },
          (old) => {
            if (!old) return { pages: [], pageParams: [] };

            let isAiResponseCreated = old.pages.some(
              (page) =>
                page.messages.some(
                  (message) => message.id === 'ai-response',
                ),
            );

            let updatedPages = old.pages.map((page) => {
              if (page === old.pages[0]) {
                let updatedMessages;
                if (!isAiResponseCreated) {
                  updatedMessages = [
                    {
                      createdAt: new Date().toISOString(),
                      id: 'ai-response',
                      text: accumulatedResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ];
                } else {
                  updatedMessages = page.messages.map(
                    (message) => {
                      if (message.id === 'ai-response') {
                        return {
                          ...message,
                          text: accumulatedResponse,
                        };
                      }
                      return message;
                    },
                  );
                }
                return {
                  ...page,
                  messages: updatedMessages,
                };
              }
              return page;
            });

            return { ...old, pages: updatedPages };
          },
        );
      }
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] },
      );
    },
    onSettled: async () => {
      setIsLoading(false);
      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  const addMessage = () => sendMessage({ message });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setMessage(e.target.value);
  };

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
