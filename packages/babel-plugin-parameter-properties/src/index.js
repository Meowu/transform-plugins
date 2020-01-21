
const createThisMemberExpression = (t, key) => {
  return t.memberExpression(
      t.thisExpression(),
      t.identifier(key),
  )
};

const createParamsAssignment = (t, key) => {
    return t.assignmentExpression('=', createThisMemberExpression(t, key), t.identifier(key))
}

module.exports = function parameterProperty({ types: t }) {
    return {
        name: 'parameter-properties',
        visitor: {
            ClassDeclaration(path) {
                // we can also detect type of decorators, and support what args can be assigned.
                const decorators = path.node.decorators || [];
                const assigns = decorators.filter(decorator => {
                    return t.isIdentifier(decorator.expression) && decorator.expression.name === 'AutoAssign'
                })
                if (!assigns.length) return;
                assigns.forEach(assign => {
                    path.node.decorators = decorators.filter(d => d !== assign);
                });

                // 类定义体，包含 methods 以及 properties, static methods 等。
                const body = path.get('body.body');
                // or path.isClassMethod({'kind': 'constructor'});
                let constructor = body.find(path => path.equals('kind', 'constructor'));
                if (!constructor) {
                    return;
                }
                const params = constructor.get('params').map(id => id.node.name);
                const funcBody = constructor.get('body');
                params.forEach(param => {
                    funcBody.pushContainer('body', 
                        t.expressionStatement(
                            createParamsAssignment(t, param)
                        )
                    );
                })
            }
        }
    }
}