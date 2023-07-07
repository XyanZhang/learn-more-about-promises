const Promise = require("../promise/a+.js");

const adapter = {
  deferred: function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return {
      promise,
      resolve,
      reject,
    };
  },
};

require('promises-aplus-tests')(adapter, function (err) {
  console.log(err);
});