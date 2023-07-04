async function test() {
  try {
      let someValue:any = await rejcetFn();
      console.log(someValue['a'])
  } catch (error) {
      console.log('catch', error);
  }
}
function rejcetFn() {
  return new Promise((resolve, reject) => {
      setTimeout(() =>{
          reject(123)
      }, 1000)
  })
  .catch((err) => Promise.reject(err))
}

// test();

function fn2(demo:any):Promise<any> {
  console.log('a', demo)
  try {
    return Promise.reject(demo)
  } catch (error) {
    console.log('cathc', error)
  }
  return Promise.reject('hh')
}
function test2() {
  try {
    fn2('123')
  } catch (error) {
    console.log(12111)
  }
}

try {
  test2(); // reject 不能通过try catch捕获
} catch (error) {
  console.log(123)
}