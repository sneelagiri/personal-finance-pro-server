const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId } = require("../utils");
const { prisma } = require("../generated/prisma-client");

async function signup(parent, args, context) {
  const password = await bcrypt.hash(args.password, 10);
  const user = await context.prisma.createUser({ ...args, password });
  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user
  };
}

async function login(parent, args, context) {
  const user = await context.prisma.user({ email: args.email });
  if (!user) {
    throw new Error("No such user found");
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error("Invalid password");
  }

  return {
    token: jwt.sign({ userId: user.id }, APP_SECRET),
    user
  };
}

function postBudget(parent, args, context) {
  const userId = getUserId(context);
  return context.prisma.createBudget({
    total: args.total,
    startDate: args.startDate,
    endDate: args.endDate,
    savingsTarget: args.savingsTarget,
    postedBy: { connect: { id: userId } }
  });
}

module.exports = {
  signup,
  login,
  postBudget
};
