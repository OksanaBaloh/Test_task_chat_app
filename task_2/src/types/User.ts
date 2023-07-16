import { Forum } from "./Forum";

export interface User {
  id: string,
  name: string,
  joinedForumsIds: string[],
  selectedForum: Forum,
}
