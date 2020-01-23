
const createThisMemberExpression = (t, key) => {
  return t.memberExpression(
      t.thisExpression(),
      t.identifier(key),
  )
};

module.exports = {
  createThisMemberExpression
}