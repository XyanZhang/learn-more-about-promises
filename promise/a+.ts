// type PromiseFn<T> = (value?: T | PromiseLike<T>) => void; 

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

    // Promise 成功回调
    resolve: (value?: T | PromiseLike<T>) => void = (value?: T | PromiseLike<T>) => {
      if (this.status !== PromiseStatus.PENDING) {
        console.warn('不处于 pending 状态，不能 resolve');
        return;
      }
      this.status = PromiseStatus.FULFILLED;
      this.value = value;
    };

    // Promise 失败回调
    reject: (reason?: any) => void = (reason?: any) => {
      if (this.status !== PromiseStatus.PENDING) {
        console.warn('不处于 pending 状态，不能 reject');
        return;
      }
      this.status = PromiseStatus.REJECTED;
      this.reason = reason;
    };

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