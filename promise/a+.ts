// type PromiseFn<T> = (value?: T | PromiseLike<T>) => void; 

import { isFunction } from ".";

export namespace MyNamespace {
  enum PromiseStatus {
    PENDING = 'pending',
    FULFILLED = 'fulfilled',
    REJECTED = 'rejected'
  }
  export class Promise<T> {
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
    resolve: (value?: T | PromiseLike<T>) => void = (value?: T | PromiseLike<T>) => {
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

    then(onFulfilled: (value?: T | PromiseLike<T>) => void, onRejected: (reason?: any) => void) {
      onFulfilled = isFunction(onFulfilled) ? onFulfilled : v => v;
      onRejected = isFunction(onRejected) ? onRejected : r => { throw r };
      // resolve 调用之后，状态变成 fulfilled，value 赋值, 调用 onFulfilled
      if(this.status === PromiseStatus.PENDING) {
        // 如果是pending状态 则将回调存起来
        this.onFullFilledCallbacks.push(onFulfilled);
        this.onRejectedCallbacks.push(onRejected);
      }
      if(this.status === PromiseStatus.FULFILLED) {
        onFulfilled(this.value);
      }
      if(this.status === PromiseStatus.REJECTED) {
        onRejected(this.reason);
      }
    }

    // onResolved: Function = () => {};
    // onRejected: Function = () => {};

    // 自定义 Promise 类的实现
    constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
      // ...
      try {
        executor(this.resolve, this.reject);
      } catch (e) {
        this.reject(e)
      }
    }
  }
}