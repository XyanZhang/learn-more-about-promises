# learn-more-about-promises

深入学习promise

## Promises/A+ 规范

### 1. 术语

- 1.1 'promise' 是一个函数或者对象，该对象或者函数有一个then方法
- 1.2 'thenable' 是一个对象或者函数，该对象或者函数定义了then方法
- 1.3 'value' 是任何合法的JavaScript值（包括undefined, thenable, promise）
- 1.4 'exception' 是一个由throw语句抛出的异常值
- 1.5 'reason' 是一个用于描述promise被拒绝原因的值

### 2. 要求

**2.1 Promise 状态**

一个promise必须处于以下三种状态之一：pending, fulfilled, rejected

- pending: 初始状态，可能会变成 fulfilled 或者 rejected
- fulfilled，不能变成其他状态，必须有一个不可变的 value
- rejected，不能变成其他状态，必须有一个不可变的 reason

**2.2 then 方法**

一个promise 必须有一个then方法来访问其当前或最终的 value 或者 reason。

一个promise 的then方法接受两个参数：`promise.then(onFulfilled, onRejected)`

- onFulfilled 和 onRejected 都是可选参数, 如果 onFulfilled 不是一个函数，必须忽略, 如果 onRejected 不是一个函数，必须忽略
- 如果 onFulfilled 是一个函数
  - 当 promise fulfilled 时，onFulfilled 必须被调用，第一个参数是 promise 的 value
  - onFulfilled 在 promise fulfilled 之前不能被调用
  - onFulfilled 只能被调用一次
- 如果 onRejected 是一个函数
  - 当 promise rejected 时，onRejected 必须被调用，第一个参数是 promise 的 reason
  - onRejected 在 promise rejected 之前不能被调用
  - onRejected 只能被调用一次
- onFulfilled 或者 onRejected 执行上下文堆栈仅包含平台代码之前，不得调用
- onFulfilled 和 onRejected 必须作为函数调用
- then 方法可以被同一个 promise 多次调用
  - 当 promise fulfilled 时，所有 onFulfilled 必须按照其注册顺序执行
  - 当 promise rejected 时，所有 onRejected 必须按照其注册顺序执行
- then 方法必须返回一个 promise `promise2 = promise1.then(onFulfilled, onRejected);`
  - onFulfilled 或者 onRejected 返回一个值 x，运行 Promise 解决过程 `[[Resolve]](promise2, x)`
  - onFulfilled 或者 onRejected 抛出一个异常 e，promise2 必须被拒绝 并且 reason 是 e
  - 如果 onFulfilled 不是一个函数，并且 promise1 fulfilled，promise2 必须被 fulfilled 并且 value 是 promise1 的 value
  - 如果 onRejected 不是一个函数，并且 promise1 rejected，promise2 必须被 rejected 并且 reason 是 promise1 的 reason

### Promise 解决过程

promise 解析过程是一个抽象操作，将promise和值作为输入，我们将其表示为 [[Resolve]](promise, x)。如果是一个 thenable ，它 x 试图采用 promise 的状态 x x ，假设其行为至少有点像一个 promise。否则，它满足 promise 值 x .

这种对 Thenable 的处理允许 promise 实现进行互操作，只要它们公开符合 Promises/A+ 的方法 then 。它还允许 Promises/A+ 实现以合理的 then 方法“吸收”不符合标准的实现。

promise & x 处理过程

- 如果 promise 和 x 指向同一个对象，以 TypeError 为 reason 拒绝 promise
- 如果 x 是一个 promise
  - 如果 x 处于 pending 状态，promise 必须保持 pending 状态直到 x 被 fulfilled 或者 rejected
  - 如果 x 处于 fulfilled 状态，用相同的 value fulfill promise
  - 如果 x 处于 rejected 状态，用相同的 reason reject promise
- 否则，x 是一个对象或者函数
  - 让 then = x.then
  - 如果 x.then 报错抛出异常e, 用 e 作为 reason 拒绝 promise
  - 如果 x.then 为一个函数，调用 x.then，传入 resolvePromise 和 rejectPromise 作为它的第一个和第二个参数
  - 如果 resolvePromise 被一个值 y 调用，运行 [[Resolve]](promise, y)
  - 如果 rejectPromise 被一个 reason r 调用，用 r 作为 reason 拒绝 promise
  - 如果 resolvePromise 和 rejectPromise 都被调用，或者被调用多次，只有第一次调用有效，后面的调用被忽略
  - 如果调用 then 抛出异常 e
    - 如果 resolvePromise 或者 rejectPromise 已经被调用，忽略它
    - 否则，用 e 作为 reason 拒绝 promise
- 如果 x 不是一个对象或者函数，用 x fulfill promise