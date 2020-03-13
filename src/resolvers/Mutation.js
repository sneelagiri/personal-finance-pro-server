const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId } = require("../utils");

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
  const budgets = await context.prisma.budgets({
    where: {
      postedBy: {
        id: user.id
      }
    },
    orderBy: "endDate_DESC"
  });
  const latestBudget = budgets[0];
  // console.log(latestBudget);
  return {
    token: jwt.sign({ userId: user.id }, APP_SECRET),
    user,
    latestBudget
  };
}

async function postBudget(parent, args, context) {
  const { total, startDate, endDate, savingsTarget } = args;
  const userId = getUserId(context);
  const newBudget = await context.prisma.createBudget({
    total: total,
    startDate: startDate,
    endDate: endDate,
    savingsTarget: savingsTarget,
    postedBy: { connect: { id: userId } },
    totalSavings: 0.0,
    remainingAmount: total,
    totalExpenses: 0.0
  });
  return newBudget;
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
    } else {
      return acc;
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

async function postSavings(parent, args, context) {
  const userId = getUserId(context);
  const matchingBudget = await context.prisma.budget({
    id: args.budgetId
  });
  const matchingBudgetSavings = await context.prisma
    .budget({
      id: args.budgetId
    })
    .savings();
  let savingsRecord = {};
  if (matchingBudgetSavings.amount === undefined) {
    savingsRecord = await context.prisma.createSavings({
      amount: args.amount,
      user: { connect: { id: userId } },
      budget: { connect: { id: args.budgetId } }
    });
  } else {
    savingsRecord = await context.prisma.updateSavings({
      data: {
        amount: args.amount
      },
      where: {
        id: matchingBudgetSavings.id
      }
    });
  }
  const budgets = await context.prisma.budgets({
    where: {
      postedBy: {
        id: userId
      }
    },
    orderBy: "endDate_DESC"
  });
  budgets.map(async budget => {
    const allSavings = await context.prisma.savingses({
      where: {
        user: {
          id: userId
        },
        budget: {
          endDate_lte: budget.endDate
        }
      }
    });
    const totalSavings = allSavings.reduce((acc, curr) => {
      if (typeof curr.amount === "number" && typeof acc === "number") {
        return (acc = acc + curr.amount);
      } else {
        return acc;
      }
    }, 0.0);
    const newBudget = await context.prisma.updateBudget({
      data: {
        totalSavings: totalSavings
      },
      where: {
        id: budget.id
      }
    });
    // console.log(newBudget);
  });

  return savingsRecord;
}

module.exports = {
  signup,
  login,
  postBudget,
  postExpense,
  postSavings
};
