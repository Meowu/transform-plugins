module.exports = function logger({ types: t}) {
    return {
        name: 'logger',
        visitor: {
            FunctionDeclaration: {
                enter(path) {
                    path.get('body')
                    .unshiftContainer( /* or we can also use insertBefore/insertAfter */
                        'body', 
                        t.callExpression(
                            t.memberExpression(
                                t.identifier('console'),
                                t.identifier('time')
                            ),
                            [
                                t.stringLiteral(path.node.id.name)
                            ]
                        )
                        )
                },
                exit(path) {
                    const blockStatement = path.get('body');
                    const lastExpression = blockStatement.get('body').pop();
                    const timeEndStatement = t.callExpression(
                        t.memberExpression(
                            t.identifier('console'),
                            t.identifier('timeEnd')
                        ),
                        [
                            t.stringLiteral(path.node.id.name)
                        ]
                    )
                    if (t.isReturnStatement(lastExpression.node)) {
                        lastExpression.insertBefore(timeEndStatement);
                    } else {
                        // or lastExpression.insertAfter(timeEndStatement);
                        blockStatement.pushContainer('body', timeEndStatement);
                    }
                }
            }
        }
    }
}