import fs from 'fs';
import path from 'path';
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { format } from 'date-fns';
import crypto from 'crypto';

import { User } from './types/User';
import { Forum } from './types/Forum';
import { Message } from './types/Message';
import { Request } from './types/Request';

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
      return forums.filter((forum) => !user.joinedForumsIds.includes(forum.id) && !forum.isPrivate);
    },

    members: (parent: any, args: any, { user } : { user: User }) => {
      if (!user.selectedForum) {
        throw new Error('Forum is not selected');
      };

      const members = users.filter(u => user.selectedForum.membersIds.includes(u.id));

      return members;
    },

    requests: (parent: any, args: any, { user } : { user: User }) => {
      if (!user.selectedForum) {
        throw new Error('Forum is not selected');
      };

      if (user.selectedForum.admin.id !== user.id) {
        throw new Error('Only admin can view requests');
      };

      const requests  = user.selectedForum.requests;

      return requests;
    }
  },

  Mutation: {
    createForum: (
      parent: any,
      args: { title: string, isPrivate: boolean },
      { user } : { user: User }
    ) => {
      const forumId = crypto.randomBytes(16).toString("hex");;
    
      const forum: Forum = {
        id: forumId,
        title: args.title,
        isPrivate: args.isPrivate,
        admin: user,
        messages: [],
        membersIds: [ user.id ],
        requests: []
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
    
      if (forum.isPrivate) {
        throw new Error('This forum is private');
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
    
    sendRequestToJoin: (parent: any, args: { forumId: string }, { user } : { user: User }) => {
      const forum = forums.find((forum: Forum) => forum.id === args.forumId);
    
      if (!forum) {
        throw new Error('Forum is not exist');
      };
    
      if (user.joinedForumsIds.includes(args.forumId)) {
        throw new Error('You already joined to this forum');
      };
    
      if (!forum.isPrivate) {
        throw new Error('This forum is not private');
      };
    
      if (forum.requests.some(req => req.user.id === user.id)) {
        throw new Error('You already sent request');
      };
    
      const newRequest: Request = {
        id: crypto.randomBytes(16).toString("hex"),
        user,
      }
    
      forum.requests.push(newRequest);
    
      return newRequest;
    },
    
    processRequest: (
      parent: any,
      args: { requestId: string, status: boolean },
      { user } : { user: User }
    ) => {
      const forum = user.selectedForum;
    
      if (!forum) {
        throw new Error('No forum selected');
      };
    
      if (forum.admin.id !== user.id) {
        throw new Error('Only admin can process requests');
      };
    
      const request = forum.requests.find(req => req.id === args.requestId);
    
      if (!request) {
        throw new Error('Request is not exist');
      };
    
      if (args.status) {
        const joinedUser = request.user;
        joinedUser.joinedForumsIds.push(forum.id);
        forum.membersIds.push(joinedUser.id);
      } 
    
      forum.requests = forum.requests.filter(req => req.id !== args.requestId);
    
      return forum.requests;
    }
  }
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
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
