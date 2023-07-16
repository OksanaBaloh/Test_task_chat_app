import { Message } from "./Message";

export interface Forum {
  id: string,
  title: string,
  messages: Message[],
  membersIds: string[],
}
