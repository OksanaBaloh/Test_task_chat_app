import { Message } from "./Message";
import { Request } from "./Request";
import { User } from "./User";

export interface Forum {
  id: string,
  title: string,
  isPrivate: boolean,
  admin: User,
  messages: Message[],
  membersIds: string[],
  requests: Request[]
}
