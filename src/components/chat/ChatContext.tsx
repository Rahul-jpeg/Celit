import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import { createContext, useState } from 'react';

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
  const { toast } = useToast();

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
