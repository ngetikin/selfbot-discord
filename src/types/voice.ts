export type VoiceQueueItem = {
  id: string;
  text: string;
  lang: string;
  userId?: string;
  channelId?: string;
};

export type TtsDriver = {
  speak: (item: VoiceQueueItem) => Promise<void>;
};

export type VoiceService = {
  enqueue: (item: Omit<VoiceQueueItem, 'id'>) => VoiceQueueItem;
  join: (channelId: string) => Promise<void>;
  leave: () => Promise<void>;
  init: () => void;
  announce: (text: string, channelId?: string, lang?: string) => void;
};
