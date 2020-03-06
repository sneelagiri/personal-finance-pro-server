function budgets(parent, args, context) {
  return context.prisma.user({ id: parent.id }).budgets();
}

module.exports = {
  budgets
};
