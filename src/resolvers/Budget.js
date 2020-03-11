function postedBy(parent, args, context) {
  return context.prisma.budget({ id: parent.id }).postedBy();
}

module.exports = {
  postedBy
};
