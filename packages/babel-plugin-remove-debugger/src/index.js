module.exports = function removeDebugger({ types: t }) {
    return {
        name: 'remove-debugger',
        visitor: {
            DebuggerStatement(path) {
                path.remove();
            }
        }
    }
}