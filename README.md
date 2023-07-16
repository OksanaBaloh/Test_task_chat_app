# Test_task_chat_app

This is a chat app developed with GraphQL, Apollo Server, Node.js, and written in TypeScript.

## Installation and usage

In the project folder:

1. Install dependencies: `npm install` or `npm i`. The following dependencies will be installed:
  - apollo-server
  - graphql
  - ts-node
  - typescript
  - ts-node-dev
  - date-fns

2. Run the server for Task 1: `npm run start-task-1`
3. Run the server for Task 2: `npm run start-task-2`
4. Once the server is started, the link to access the server will be displayed in the console.
5. Use the provided link to open the GraphQL Playground.

## Explanation to task 1

GraphQL schema:
`
  type Query {
    joinedForums: [Forum!]!
    availableForums: [Forum!]!
    members: [User!]!
  }

  type Mutation {
    createForum(title: String!): Forum!
    joinToForum(forumId: ID!): Forum!
    selectForum(forumId: ID!): Forum!
    postMessage(content: ID!): Message!
  }

  type Forum {
    id: ID!
    title: String!
    messages: [Message!]!
    membersIds: [String!]!
  }

  type Message {
    id: ID!
    content: String!
    createdAt: String!
    author: String!
  }

  type User {
    id: ID!
    name: String!
    picture: String!
    joinedForumsIds: [String!]!
    selectedForum: Forum
  }
`
For testing purposes, the user with ID "5" is already authenticated and has joined the forum with ID "2".
On this server, the user can:

1. Get the list of forums he has joined. Example request:
`
  query {
    joinedForums {
      id
      title
    }
  }
`
2. Get the list of available forums. Example request:
`
  query {
    availableForums {
      id
      title
    }
  }
`
3. Create a new forum (and automatically join it). Example request:
`
  mutation {
    createForum(title: "New forum") {
      id
      title
      membersIds
    }
  }
`
4. Join a forum using the forum ID. Example request:
`
  mutation {
    joinToForum(forumId: "4") {
      id
      title
    }
  }
`
5. Select a forum using the forum ID. After selecting a forum, the user can view messages, members, and post messages. Example request:
`
  mutation {
    selectForum (forumId: "2") {
      id
      title
      messages {
        content
        createdAt
        author
      }
    }
  }
`
6. View members of the selected forum. Example request:
`
  query {
    members {
      id
      name
    }
  }
`
7. Post messages in the selected forum. Example request:
`
  mutation {
    postMessage(content: "hello world") {
      id,
      content,
      createdAt,
      author
    }
  }
`

## Explanation to task 2

Explanation to task 2 is provided in the file `CHANGES.md` in the project folder.
