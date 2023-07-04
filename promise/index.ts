type executor = (resolve: Function, reject: Function) => void;

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
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
}

// my
function useMyPromise() {
  let p1:any = new MyPromise((resolve, reject) => {
    console.log('executor')
    resolve('resolveValue');
    reject('rejectReason');
  })
  console.log('=========my start========')
  console.log(p1)
  console.log(p1.status)
  console.log(p1.value)
  console.log('=========my end========')
}
// origin
function usePromise() {
  let p2:any = new Promise((resolve, reject) => {
    console.log('origin executor')
    resolve('resolveValue');
    reject('rejectReason');
  })
  console.log('=========origin start========')
  console.log(p2)
  console.log(p2.status)
  console.log(p2.value)
  console.log('=========origin end========')
}

// executor
useMyPromise();
usePromise();

// excutor resolve reject