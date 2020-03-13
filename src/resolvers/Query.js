const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId } = require("../utils");
const moment = require("moment");
const today = moment().format();

async function budget(parent, args, context) {
  const count = await context.prisma
    .budgetsConnection({
      where: {
        OR: [
          {
            total_contains: args.filter
          },
          {
            startDate_contains: args.filter
          },
          {
            endDate_contains: args.filter
          },
          {
            savingsTarget_contains: args.filter
          }
        ]
      }
    })
    .aggregate()
    .count();
  const budgets = await context.prisma.budgets({
    where: {
      OR: [
        {
          total_contains: args.filter
        },
        {
          startDate_contains: args.filter
        },
        {
          endDate_contains: args.filter
        },
        {
          savingsTarget_contains: args.filter
        }
      ]
    },
    skip: args.skip,
    first: args.first,
    orderBy: args.orderBy
  });

  return {
    count,
    budgets
  };
}

async function currentBudget(parent, args, context) {
  const userId = getUserId(context);
  const budgets = await context.prisma.budgets({
    where: {
      postedBy: {
        id: userId
      }
    },
    orderBy: "endDate_DESC"
  });
  // console.log(budgets[0]);
  return budgets[0];
}

module.exports = {
  budget,
  currentBudget
};
