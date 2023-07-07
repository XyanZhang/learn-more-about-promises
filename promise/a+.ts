// type PromiseFn<T> = (value?: T | PromiseLike<T>) => void; 

import { isFunction } from ".";

export namespace MyNamespace {
  enum PromiseStatus {
    PENDING = 'pending',
    FULFILLED = 'fulfilled',
    REJECTED = 'rejected'
  }
  export class Promise {
    // Promise 状态
    status: PromiseStatus = PromiseStatus.PENDING;

    // Promise 值
    value: any = undefined;

    // Promise 原因
    reason: any = undefined;

    // 储存then 中的回调
    onFullFilledCallbacks: Function[] = [];
    onRejectedCallbacks: Function[] = [];

    // Promise 成功回调
    resolve: (value?: any) => void = (value?: any) => {
      if (value instanceof Promise) {
        // 如果是 Promise 类型，递归调用
        return value.then(this.resolve, this.reject)
      }
      // 异步改造
      setTimeout(() => {
        if (this.status !== PromiseStatus.PENDING) {
          console.warn('不处于 pending 状态，不能 resolve');
          return;
        }
        this.status = PromiseStatus.FULFILLED;
        this.value = value;

        // 为什么会有这一步？
        // 因为 resolve 之后，then 中的回调才会执行，此时pending状态已经变成了 fulfilled
        this.onFullFilledCallbacks.map(cb => cb(this.value)); // 此处表示 
      }, 0);
    };

    // Promise 失败回调
    reject: (reason?: any) => void = (reason?: any) => {
      setTimeout(() => {
        if (this.status !== PromiseStatus.PENDING) {
          console.warn('不处于 pending 状态，不能 reject');
          return;
        }
        this.status = PromiseStatus.REJECTED;
        this.reason = reason;

        this.onRejectedCallbacks.map(cb => cb(this.reason));
      }, 0);
    };
    // 
    then(onFulfilled: (value?: any) => void, onRejected: (reason?: any) => void) {
      // 新增p2 ，then 返回的是一个新的promise 对象
      onFulfilled = isFunction(onFulfilled) ? onFulfilled : v => v;
      onRejected = isFunction(onRejected) ? onRejected : r => { throw r };
      // resolve 调用之后，状态变成 fulfilled，value 赋值, 调用 onFulfilled
      let p2:any = null;
      if(this.status === PromiseStatus.PENDING) {
        /* 
          首先返回了一个新的 Promise 对象，并在 Promise 中传入了一个函数
          函数的基本逻辑还是和之前一样，往回调数组中 push 函数
          同样，在执行函数的过程中可能会遇到错误，所以使用了 try...catch 包裹
          规范规定，执行 onFulfilled 或者 onRejected 函数时会返回一个 x，并且执行 Promise 解决过程，这是为了不同的 Promise 都可以兼容使用，比如 JQuery 的 Promise 能兼容 ES6 的 Promise 
        */
        p2 = new Promise((resolve, reject) => {
          // // 如果是pending状态 则将回调存起来
          // this.onFullFilledCallbacks.push(onFulfilled);
          // this.onRejectedCallbacks.push(onRejected);
          // 此处为什么要push一个函数？而不是直接push onFulfilled? 因为需要在onFulfilled执行之后，执行then返回的promise的resolve方法
          this.onFullFilledCallbacks.push(() => {
            try {
              const x = onFulfilled(this.value);
              // 处理返回值
              handlePromiseX(p2, x, resolve, reject)
            } catch (r) {
              reject(r)
            }
          })
          this.onRejectedCallbacks.push(() => {
            try {
              const x = onRejected(this.reason);
              // 处理返回值
              handlePromiseX(p2, x, resolve, reject)
            } catch (r) {
              reject(r)
            }
          })
        })

        return p2
      }
      if(this.status === PromiseStatus.FULFILLED) {
        // onFulfilled(this.value);
        p2 = new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              // 处理返回值
              handlePromiseX(p2, x, resolve, reject)
            } catch (r) {
              reject(r)
            }
          }, 0);
        })
      }
      if(this.status === PromiseStatus.REJECTED) {
        onRejected(this.reason);
      }
      return p2;
    }

    // onResolved: Function = () => {};
    // onRejected: Function = () => {};

    // 自定义 Promise 类的实现
    constructor(executor: (resolve: (value?: any) => void, reject: (reason?: any) => void) => void) {
      // ...
      try {
        executor(this.resolve, this.reject);
      } catch (e) {
        this.reject(e)
      }
    }
  }

  function handlePromiseX(p2: any, x: any, resolve: any, reject: any) {
    if (p2 === x) { // 循环引用抛出异常
      return reject(new TypeError('Error'))
    }
    // 如果 x 为 Promise 的话，需要判断以下几个情况：
    // 如果 x 处于等待态，Promise 需保持为等待态直至 x 被执行或拒绝
    // 如果 x 处于其他状态，则用相同的值处理 Promise
    if (x instanceof Promise) {
      x.then(function(value) {
        handlePromiseX(p2, value, resolve, reject)
      }, reject)
    }
    let called = false;
    if(x !== null && (typeof x === 'object' || isFunction(x))) {
      try {
        let then = x.then;
        if(isFunction(then)) {
          then.call(x, (y: any) => {
            if(called) return ;
            called = true;
            handlePromiseX(p2, y, resolve, reject)
          },(e: any) => {
            if(called) return ;
            called = true;
            reject(e)
          })
        }else {
          // 非函数
          resolve(x)
        }
      } catch (error) {
        if(called) return ;
        called = true;
        reject(error)
      }
    }else {
      // 非空 ，非函数 非对象
      resolve(x)
    }
  }
}
