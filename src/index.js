const { GraphQLServer } = require("graphql-yoga");
const { prisma } = require("./generated/prisma-client");
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const User = require("./resolvers/User");
const Budget = require("./resolvers/Budget");
const Expense = require("./resolvers/Expense");
const Savings = require("./resolvers/Savings");
const resolvers = {
  Query,
  Mutation,
  User,
  Budget,
  Expense,
  Savings
};

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: request => ({
    ...request,
    prisma
  })
});
server.start(() => console.log(`Server is running on http://localhost:4000`));
