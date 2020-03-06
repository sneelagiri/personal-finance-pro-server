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

async function postExpense(parent, args, context) {
  const userId = getUserId(context);
  const expense = await context.prisma.createExpense({
    expenseAmount: args.expenseAmount,
    expenseDesc: args.expenseDesc,
    expenseCategory: args.expenseCategory,
    user: { connect: { id: userId } },
    budget: { connect: { id: args.budgetId } }
  });
  const budget = await context.prisma.budget({
    id: args.budgetId
  });
  const allExpenses = await context.prisma.expenses({
    where: {
      user: {
        id: userId
      },
      budget: {
        id: args.budgetId
      }
    }
  });
  const totalExpenses = allExpenses.reduce((acc, curr) => {
    if (curr.expenseAmount) {
      return (acc = acc + curr.expenseAmount);
    }
  }, 0.0);
  const remainingBudget = budget.total - totalExpenses;
  context.prisma.updateBudget({
    data: {
      remainingAmount: remainingBudget,
      totalExpenses: totalExpenses
    },
    where: {
      id: args.budgetId
    }
  });
  return expense;
}

module.exports = {
  signup,
  login,
  postBudget,
  postExpense
};
