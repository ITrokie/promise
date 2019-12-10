// var Promise = require('./Promise')

let a = new Promise((resolve, reject) => {
    resolve(100)
    console.log(1111111111)
})
a.then((value) => { // 此时p1.status 由pedding状态 => fulfilled状态
    console.log(value); // resolve
    // console.log(p1.status); // fulfilled
    return a.then(value => { // 再次p1.then 这时已经为fulfilled状态 走的是fulfilled状态判断里的逻辑 所以我们也要确保判断里面onFuilled异步执行
        console.log(value); // 'resolve'
    });
    console.log('当前执行栈中同步代码');
})