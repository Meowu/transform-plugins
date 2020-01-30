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
                console.log('key', path.key)
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
                    // Q：why methods created by user do not have get, pushContainer method?
                    // A：The constructor is a node object here. Those method belong to nodePath.
                    constructor = t.classMethod(
                        'constructor' /* kind */, 
                        t.identifier('constructor')/**key */, 
                        []/**params */, 
                        t.blockStatement([]) /**body */
                    );
                    console.log('ctor', constructor);
                    // append created constructor.
                    [constructor] = path.get('body').unshiftContainer('body', constructor);
                    // magic!经过 unshiftContainer 之后的构造函数已经被处理过，是一个全新的 path 所以它包含了 get 方法。
                    // ctorBody = constructor.body.body;
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
                        // ctorBody 是通过 t.classMethod 创建的方法对象，它没有 get 方法，只能通过 ctor.body.body 获取到 blockStatement 方法体。
                        // ctorBody = null;
                        // if (ctorBody) {
                        //     ctorBody.push(statement);
                        // } else {
                            // 这是已经定义了的方法对象，不知道为什么 constructor.get('body.body'); 获取的对象不能直接 push(statement) 而要通过 pushContainer 或者 unshiftContainer 。
                            constructor.get('body').unshiftContainer('body', statement);
                        // }

                        // ctorBody.push(statement);
                    }
                })
                
            }
        }
    }
}