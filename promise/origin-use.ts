import { MyNamespace } from './a+';
function promiseTest() {
  // 测试
  const promise = new MyNamespace.Promise((resolve, reject) => {
    console.log('resolve 之前')
    setTimeout(() => {
      resolve('成功'); // !执行resolve 的时候会触发 promise.then 设置的回调函数 (关键)
      console.log('resolve 之后，setTimeout中')
    }, 0);
    // reject('失败'); // !执行reject 的时候会触发 promise.catch 设置的回调函数 (关键)
    console.log('resolve 之后')
  });
  // console.log(promise);
  console.log("外层")
}

function promiseOriginTest() {
  const promise = new Promise((resolve, reject) => {
    console.log('resolve 之前')
    resolve('成功'); // !执行resolve 的时候会触发 promise.then 设置的回调函数 (关键)
    // reject('失败'); // !执行reject 的时候会触发 promise.catch 设置的回调函数 (关键)
    console.log('resolve 之后')
  }).then((res) => {
    console.log(res)
  });
  // console.log(promise);
  console.log("外层")
}

promiseTest();
// resolve 之前
// resolve 之后
// 外层
// resolve 之后，setTimeout中

console.log("====================================")
// promiseOriginTest()