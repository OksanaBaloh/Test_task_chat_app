import fs from 'fs';
import path from 'path';
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { format } from 'date-fns';
import crypto from 'crypto';

import { User } from './types/User';
import { Forum } from './types/Forum';
import { Message } from './types/Message';

const forums: Forum[] = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'fixtures', 'forums.json'),
  'utf8'
));

const users: User[] = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'fixtures', 'users.json'),
  'utf8'
));

const typeDefs = fs.readFileSync(
  path.join(__dirname, 'schema.graphql'),
  'utf8'
);

const resolvers = {
  Query: {
    joinedForums: (parent: any, args: any, { user } : { user: User }) => {
      return forums.filter((forum) => user.joinedForumsIds.includes(forum.id));
    },
    availableForums: (parent: any, args: any, { user } : { user: User }) =>{
      return forums.filter((forum) => !user.joinedForumsIds.includes(forum.id));
    },
    members: (parent: any, args: any, { user } : { user: User }) => {
      if (!user.selectedForum) {
        throw new Error('Forum is not selected');
      };

      const members = users.filter(u => user.selectedForum.membersIds.includes(u.id));

      return members;
    },
  },

  Mutation: {
    createForum: (parent: any, args: { title: string }, { user } : { user: User }) => {
      const forumId = crypto.randomBytes(16).toString("hex");

      const forum: Forum = {
        id: forumId,
        title: args.title,
        messages: [],
        membersIds: [ user.id ],
      };

      user.joinedForumsIds.push(forumId);
      forums.push(forum);

      return forum;
    },

    joinToForum: (parent: any, args: { forumId: string }, { user } : { user: User }) => {
      const forum = forums.find((forum: Forum) => forum.id === args.forumId);

      if (!forum) {
        throw new Error('Forum is not exist');
      };

      if (user.joinedForumsIds.includes(args.forumId)) {
        throw new Error('You already joined to this forum');
      };

      user.joinedForumsIds.push(args.forumId);
      forum.membersIds.push(user.id);

      return forum;
    },

    selectForum: (parent: any, args: { forumId: string }, { user } : { user: User }) => {
      if (!user.joinedForumsIds.includes(args.forumId)) {
        throw new Error('You do not joined to this forum');
      };

      const forum = forums.find((forum: Forum) => forum.id === args.forumId);

      if (!forum) {
        throw new Error('Forum is not exist');
      };

      user.selectedForum = forum;

      return forum;
    },

    postMessage: (parent: any, args: { content: string }, { user } : { user: User }) => {
      const forum = user.selectedForum;

      if (!forum) {
        throw new Error('No forum selected');
      };

      if (!args.content) {
        throw new Error('Message should have content');
      };

      const newMessage: Message = {
        id: crypto.randomBytes(16).toString("hex"),
        content: args.content,
        createdAt: format(new Date(), 'HH:mm:ss dd/MM/yyyy'),
        author: user.name
      };

      forum.messages.unshift(newMessage);

      return newMessage;
    },

  },
};


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    const userId = '5';
    const user = users.find((user) => user.id === userId);
    return { user };
  },
  
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

server
  .listen()
  .then(({ url } : { url: string }) => {
    console.log(`🚀  Server ready at ${url}`);
});
