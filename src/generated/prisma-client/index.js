"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "User",
    embedded: false
  },
  {
    name: "Budget",
    embedded: false
  },
  {
    name: "Expense",
    embedded: false
  },
  {
    name: "Savings",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `https://eu1.prisma.sh/shashank-neelagiri-a9eec7/personal-finance-pro-server/dev`
});
exports.prisma = new exports.Prisma();
