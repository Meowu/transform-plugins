const utils = require('../../../src/utils');

module.exports = function autoBind({ types: t }) {
    return {
        name: 'auto-bind',
        visitor: {
            ClassDeclaration(path) {
                const decorators = path.get('decorators') || [];
                if (!decorators.length) {
                    return;
                }
                // TODO: how to avoid duplicated bind.
                const nodes = decorators.filter(decorator => {
                    // identifier is not a node.
                    return t.isIdentifier(decorator.node.expression) && decorator.node.expression.name === 'AutoBind'
                })
                if (!nodes.length) {
                    return;
                }
                path.node.decorators = decorators.filter(d => !nodes.includes(d)); // remove AutoBind.
                const body = path.get('body.body');
                const classMethods = body.filter(cls => t.isClassMethod(cls) && !cls.node.static && cls.node.kind === 'method');
                if (!classMethods.length) {
                    /**only has methods we bind them. */
                    return;
                }
                let constructor = body.find(cls => t.isClassMethod(cls) && cls.node.kind === 'constructor');
                if (!constructor) {
                    constructor = t.classMethod(
                        'constructor' /* kind */, 
                        t.identifier('constructor')/**key */, 
                        []/**params */, 
                        t.blockStatement([]) /**body */
                    );
                    console.log('ctor', constructor);
                    // append created constructor.
                    path.get('body').pushContainer('body', constructor);
                }
                const ctorBody = constructor.body; // why we cannot constructor.get('body');
                classMethods.forEach(cls => {
                    const id = t.identifier(cls.get('key.name')); // method id.
                    const name = cls.get('key.name'); // TODO: handle computed key.
                    const left = utils.createThisMemberExpression(t, name);
                    const right = t.callExpression(
                        t.memberExpression(
                            t.createThisMemberExpression(t, name),
                            t.identifier('bind')
                        )/**callee */,
                        [
                            t.thisExpression()
                        ]
                    )
                    const statement = t.expressionStatement(
                        t.assignmentExpression('='/**operator */, left, right)
                    )
                    const lastExpression = ctorBody.get('body').pop();
                    // TestThis.
                    // lastExpression maybe undefined.
                    if (t.isReturnStatement(lastExpression.node)) {
                        lastExpression.insertBefore(statement);
                    } else {
                        ctorBody.pushContainer('body', statement);
                    }
                })
                
            }
        }
    }
}