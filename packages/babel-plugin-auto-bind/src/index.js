const { createThisMemberExpression } = require('../../../src/utils');

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
                let ctorBody;
                if (!constructor) {
                    // why methods created by user do not have get, pushContainer method?
                    constructor = t.classMethod(
                        'constructor' /* kind */, 
                        t.identifier('constructor')/**key */, 
                        []/**params */, 
                        t.blockStatement([]) /**body */
                    );
                    console.log('ctor', constructor);
                    // append created constructor.
                    path.get('body').unshiftContainer('body', constructor);
                    ctorBody = constructor.body.body;
                } else {
                    // ctorBody = constructor.get('body.body');
                    // console.log('existed ctor', constructor);
                    // ctorBody = constructor.get('body');
                }
                // console.log('ctor body', constructor.body);
                // const ctorBody = constructor.body.body; // why we cannot constructor.get('body');
                classMethods.forEach(cls => {
                    // console.log('cls name', cls.get('key').name);
                    const id = t.identifier(cls.node.key.name); // method id.
                    const name = cls.node.key.name; // TODO: handle computed key.
                    const left = createThisMemberExpression(t, name);
                    const right = t.callExpression(
                        t.memberExpression(
                            createThisMemberExpression(t, name),
                            t.identifier('bind')
                        )/**callee */,
                        [
                            t.thisExpression()
                        ]
                    )
                    const statement = t.expressionStatement(
                        t.assignmentExpression('='/**operator */, left, right)
                    )
                    console.log('body', ctorBody)
                    const lastExpression = ctorBody && ctorBody.pop();
                    // TestThis.
                    // lastExpression maybe undefined.
                    if (lastExpression && t.isReturnStatement(lastExpression.node)) {
                        lastExpression.insertBefore(statement);
                    } else {
                        if (ctorBody) {
                            ctorBody.push(statement);
                        } else {
                            constructor.get('body').unshiftContainer('body', statement);
                        }
                        // ctorBody.push(statement);
                        // console.log('append statement', ctorBody.length);
                        // ctorBody.body ? ctorBody.body.push(statement) : ctorBody.get('body').push(statement);
                    }
                })
                
            }
        }
    }
}