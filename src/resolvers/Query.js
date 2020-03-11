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

module.exports = {
  budget
};
