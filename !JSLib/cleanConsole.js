
console.logC = function (...args) {
    queueMicrotask(console.log.bind(console, ...args));
}

console.errorC = function (...args) {
    queueMicrotask(console.error.bind(console, ...args));
}

console.tableC = function (...args) {
    queueMicrotask(console.table.bind(console, ...args));
}

console.groupC = function (...args) {
    queueMicrotask(console.group.bind(console, ...args));
}

console.groupCollapsedC = function (...args) {
    queueMicrotask(console.groupCollapsed.bind(console, ...args));
}

console.groupEndC = function (...args) {
    queueMicrotask(console.groupEnd.bind(console, ...args));
}