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
    executor(this.onResolved, this.onRejected); 
    // 执行完毕如果没有resolve或者reject，那么状态还是pending
  }

  then: Function = (onFulfilled: Function, onRejected: Function) => {
    let res:any = null;
    if(this.status === FULFILLED && onFulfilled) {
      res = isFunction(onFulfilled)
        ? onFulfilled(this.value) // 返回值作为下一个then的参数
        : console.warn('onFulfilled不是函数')
    } else if(this.status === REJECTED && onRejected) {
      isFunction(onRejected) 
        ? onRejected(this.reason)
        : console.warn('onRejected不是函数')
    } else {
      console.warn('pending状态，不能执行then方法')
    }
    let p2 = null;
    // 返回一个新的Promise
    if(res instanceof MyPromise) { 
      p2 = res;
    }else {
      p2 = new MyPromise((resolve: Function, reject: Function) => {
        if(res) {
          resolve(res);
        }
      });
    }
    return p2;
  }
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