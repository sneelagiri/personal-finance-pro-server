function budget(parent, args, context) {
  return context.prisma.savings({ id: parent.id }).budget();
}

function user(parent, args, context) {
  return context.prisma.savings({ id: parent.id }).user();
}

module.exports = {
  budget,
  user
};
