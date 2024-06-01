const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodayParser = require("body-parser");
const cors = require("cors");
const { default: axios } = require("axios");

async function startServer() {
  const app = express();
  const server = new ApolloServer({
    typeDefs: `
        type User {
            id: ID!
            name: String!
            userName: String!
            email: String!
            phone: String!
            website: String!
        }
        type Todo {
            id: ID!
            title: String!
            completed: Boolean
            userId: ID!
            user: User
        }
        type Query {
            getAllUser: [User]
            getUser(id: ID!): User
            getTodos(completed: Boolean): [Todo]

        }
    `,
    resolvers: {
      Todo: {
        user: async (todo) =>
          (
            await axios.get(
              `https://jsonplaceholder.typicode.com/users/${todo.userId}`
            )
          ).data,
      },
      Query: {
        getTodos: async (_, { completed }) => {
          const todo = (
            await axios.get(`https://jsonplaceholder.typicode.com/todos`)
          ).data;
          if (completed !== undefined) {
            return todo.filter((t) => t?.completed === completed);
          }
          return todo;
        },

        getAllUser: async () =>
          (await axios.get(`https://jsonplaceholder.typicode.com/users`)).data,
        getUser: async (parent, { id }) =>
          (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`))
            .data,
      },
    },
  });
  app.use(bodayParser.json());
  app.use(cors());

  await server.start();
  app.use("/graphql", expressMiddleware(server));

  app.listen(8000, () => {
    console.log("server started");
  });
}
startServer();
