type executor = (resolve: Function, reject: Function) => void;

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

let isFunction = (fn: any) => typeof fn === 'function';
class MyPromise {
  private status: string = PENDING; // 初始pending 状态
  private value: any = undefined;
  private reason: any = undefined;

  onResolved: Function = (value:any) => {
    // resolve之后状态变成fulfilled
    if(this.status !== PENDING) {
      console.warn('不处于pending状态，不能resolve')
      return; // 状态只能改变一次,并且是有pending变成其他状态
    }
    this.status = FULFILLED;
    this.value = value;
  };
  onRejected: Function = (reason:any) => {
    if(this.status !== PENDING) {
      console.warn('不处于pending状态，不能reject')
      return; // 状态只能改变一次,并且是有pending变成其他状态
    }
    this.status = REJECTED;
    this.reason = reason;
  };

  constructor(executor: executor) {
    try {
      executor(this.onResolved, this.onRejected); 
    } catch (error) {
      this.onRejected(error);
    }
  }

  then: Function = (onFulfilled: Function, onRejected: Function) => {
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : (value: any) => value;
    onRejected = isFunction(onRejected) ? onRejected : (reason: any) => { throw reason };

    let p2:any = null;
    if(this.status === FULFILLED) {
      p2 = new MyPromise((resolve: Function, reject: Function) => {
        setTimeout(() => {
          try {
            let res = onFulfilled(this.value);
            // 处理 res 和 p2 的关系 
            handlePromise(p2, res, resolve, reject)
          } catch (error) {
            reject(error);
          }
        }, 0);
      });
    }
    if(this.status === REJECTED) {
      p2 = new MyPromise((resolve: Function, reject: Function) => {
        setTimeout(() => {
          try {
            let res = onRejected(this.reason);
            // 处理 res 和 p2 的关系 
            handlePromise(p2, res, resolve, reject)
          } catch (error) {
            reject(error);
          }
        }, 0);
      });
    }
    // todo：pending状态
    if(this.status === PENDING) {
    
    }
    return p2;
  }
}

function handlePromise(p2: any, res: any, resolve: Function, reject: Function) {
}

// my
function useMyPromise() {
  let p1:any = new MyPromise((resolve, reject) => {
    console.log('executor')
    resolve('resolveValue');
    // reject('rejectReason');
  })
  console.log('---------my start---------')
  console.log(p1)
  console.log(p1.status)
  console.log(p1.value)
  p1.then((res:any) => {
    console.log('my then', res) // => resolveValue
  }, (reason:any) => {
    console.log('my reject', reason) // => rejectReason
  })
  p1.then((res:any) => {
    console.log('my then 2', res) // => resolveValue
    return new Promise((resolve, reject) => {

    })
  }, (reason:any) => {
    console.log('my reject 2', reason) // => rejectReason
  }).then((res: any) => {
    console.log('my promise 2')
  })
  console.log('---------my end---------')
}
// origin
function usePromise() {
  let p2:any = new Promise((resolve, reject) => {
    console.log('origin executor')
    resolve('resolveValue');
    // reject('rejectReason');
  })
  console.log('=========origin start========')
  console.log(p2)
  console.log(p2.status)
  console.log(p2.value)
  p2.then((res:any) => {
    console.log('then', res) // => resolveValue
  }, () => {});
  p2.then((res:any) => {
    console.log('then2', res) // => resolveValue
    return new Promise((resolve, reject) => {
      resolve('resolveValue level2')
    })
  }, (reason:any) => {
    console.log('then2 reason', reason) // => resolveValue
  }).then((res:any) => {
    console.log('then level 2', res)
  });
  console.log('=========origin end========')
}

function myPromiseThen() {
  let p1:any = new MyPromise((resolve, reject) => {
    resolve('resolveValue');
  });
  console.log('---------my start---------')
  let p2 = p1.then((res:any) => {
    console.log('my then 2', res) // => resolveValue
    return new MyPromise((resolve) => {
      resolve('myPromise level2')
    })
  })
  p2.then((res: any) => {
    console.log('my promise 2', res)
  })
  console.log('---------my end---------')
}

function promiseThen() {
  let p1:any = new Promise((resolve, reject) => {
    resolve('resolveValue');
  });
  console.log('---------my start---------')
  let p2 = p1.then((res:any) => {
    console.log('my then 2', res) // => resolveValue
    // return new Promise((resolve, reject) => {

    // })
    return 2; // 自动包装成Promise
  })
  p2.then((res: any) => {
    console.log('my promise 2', res)
  })
  console.log('---------my end---------')
}

// executor
// useMyPromise();
// usePromise();

myPromiseThen()
// promiseThen()
// excutor resolve reject