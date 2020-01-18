module.exports = function parameterProperty({ types: t }) {
    return {
        name: 'parameter-properties',
        visitor: {
            ClassDeclaration(path) {
                // we can also detect type of decorators, and support what args can be assigned.
                const decorators = path.node.decorators;
                const assigns = decorators.filter(decorator => {
                    return t.isIdentifier(decorator.expression) && decorator.expression.name === 'AutoAssign'
                })
                if (!assigns.length) return;
                assigns.forEach(assign => {
                    path.node.decorators = decorators.filter(d => d !== assign);
                });
            }
        }
    }
}