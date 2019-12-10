/**
 * Promise 实现 遵循promise/A+规范
 * Promise/A+规范译文:
 * https://malcolmyu.github.io/2015/06/12/Promises-A-Plus/#note-4
 */

// promise 三个状态
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function Promise(callback) {
  var that = this;
  that.status = PENDING;
  that.value = undefined;
  that.reason = undefined;
  that.fulFilledCallbacks = [];
  that.rejectedCallbacks = [];

  function resolve(value) {
    setTimeout(() => {
      if (that.status === PENDING) {
        that.status = FULFILLED;
        that.value = value;
        that.fulFilledCallbacks.forEach(fn=> fn())
      }
    }, 0);
  }


  function reject(reason) {
    setTimeout(() => {
      if (that.status === PENDING) {
        that.status = REJECTED;
        that.value = value;
        that.rejectedCallbacks.forEach(fn=> fn())
      }
    }, 0);
  }

  try {
    callback(resolve, reject)
  } catch (error) {
    reject(error)
  }
}

Promise.prototype.resolvePromise = (promise, x, resolve, reject) => {
  if (promise === x) {
    return reject(new TypeError('循环调用'))
  }
  let called = false;
  const that = this;
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      const then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return;
          called = true;
          that.resolvePromise(promise, y, resolve, reject)
        }, err => {
          if (called) return;
          called = true;
          reject(err)
        })
      } else {
        if (called) return;
        called = true;
        resolve(x)
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error)
    }
  } else {
    resolve(x)
  }
}

Promise.prototype.then = (onFulfilled, onRejected) => {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => { return value }
  onRejected = typeof onRejected === 'function' ? onRejected : (value) => { return value }
  const that = this;
  const promise2 = new Promise((resolve, reject) => {
    if (that.status === PENDING) {
      that.fulFilledCallbacks.push(() => {
        setTimeout(() => {
          try {
            const x = onFulfilled(that.value);
            that.resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0);
      })
      that.rejectedCallbacks.push(() => {
        setTimeout(() => {
          try {
            const x = onRejected(that.reason);
            that.resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0);
      })
    } else if (that.status === FULFILLED) {
      setTimeout(() => {
        try {
          const x = onFulfilled(that.value);
          that.resolvePromise(promise2, x, resolve, reject)
        } catch (error) {
          reject(error)
        }
      }, 0);
    } else {
      setTimeout(() => {
        try {
          const x = onRejected(that.reason);
          that.resolvePromise(promise2, x, resolve, reject)
        } catch (error) {
          reject(error)
        }
      }, 0);
    }
  })

  return promise2
}


Promise.prototype.all = (promises) => {
  return new Promise((resolve, reject) => {
    let result = [];
    promises.forEach((promise, index) => {
      promise.then((value) => {
        result[index] = value;
        if (result.length === promise.length) {
          resolve(result)
        }
      }, reject)
    })
  })
}


Promise.prototype.race = (promises) => {
  return new Promise((resolve, reject) => {
    promises.forEach((promise) => {
      promise.then((value) => {
        resolve(value)
      }, reject)
    })
  })
}

Promise.prototype.catch =  (onRejected) => {
  return this.then(null, onRejected)
}

Promise.prototype.done =  () => {
  return this.catch((reason) => {
    throw reason
  })
}

Promise.prototype.finally = (fn) => {
  return this.then((value) => {
    fn();
    return value
  }, (reason) => {
    fn();
    throw reason
  })
}


Promise.resolve = (value) => {
  let promise;
  const that = this;
  promise =  new Promise((resolve, reject) => {
    const x = resolve(x)
    that.resolvePromise(promise, x, resolve, reject)
  })

  return promise
}


Promise.reject = (reason) => {
  return new Promise((resolve, reject) => {
    reject(reason)
  })
}


Promise.deferred = function() { // 延迟对象
  let defer = {};
  defer.promise = new Promise((resolve, reject) => {
      defer.resolve = resolve;
      defer.reject = reject;
  });
  return defer;
}

try {
  module.exports = Promise
} catch (e) {
}