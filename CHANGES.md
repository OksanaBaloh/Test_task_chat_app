## Explanation to task 2

GraphQL schema: 
`
  type Query {
    joinedForums: [Forum!]!
    availableForums: [Forum!]!
    members: [User!]!
    requests: [Request!]!
  }

  type Mutation {
    createForum(title: String!, isPrivate: Boolean!): Forum!
    joinToForum(forumId: ID!): Forum!
    selectForum(forumId: ID!): Forum!
    postMessage(content: String!): Message!
    sendRequestToJoin(forumId: ID!): Request!
    processRequest(requestId: ID!, status: Boolean!): [Request]!
  }

  type Forum {
    id: ID!
    title: String!
    isPrivate: Boolean!
    admin: User!
    messages: [Message]
    membersIds: [String!]!
    requests: [Request!]!
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

  type Request {
    id: ID!
    user: User!
  }
`

On this server, all the functionalities from Task 1 are available. Additionally, forums can be public or private. For testing purposes, the user with ID "5" is the admin of the forum with ID "2", and one request is in the list of forum requests.
On this server, the user can also:

1. Create a new forum and mark it as private (the user will automatically become the admin of this forum).  Example request:
`
  mutation {
    createForum(title: "New forum", isPrivate: true) {
      id
      title
      membersIds
    }
  }
`

2. Send a request to join a private forum (if they know the forum ID). Example request:
`
  mutation {
    sendRequestToJoin (forumId: "3") {
      id
    }
  }
`
3. Admin can view list of requests of forum. Example request:
`
  query {
    requests {
      id
      user {
        id
        name
      }
    }
  }
`
4. Admin of forum can accept or refuse the request. Example request:
`
  mutation {
    processRequest(requestId: "1", status: true) {
      id
    }
  }
`
