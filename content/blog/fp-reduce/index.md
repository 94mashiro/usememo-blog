---
title: 函数式编程之 Reduce
date: "2018-04-22T13:00:00.000Z"
description: "今天在群里有位大佬出了一道这样的题目。"
---

今天在群里有位大佬出了一道这样的题目
```javascript
const ajax1 = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('ajax1')
    console.log('hello')
  }, 3000)
})


const ajax2 = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    reject('ajax2')
    console.log('india')
  }, 1000)
})

const ajax3 = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('ajax3')
    console.log('mifans')
  }, 2000)
})

loader([ajax1, ajax2, ajax3], (res) => console.log(res))
```


<!--more-->


要求写出 `loader` 函数，使得 `console` 上顺序输出 `hello india mifans`，回调函数中输出 `['ajax1', 'ajax2', 'ajax3']` ，不管 Promise 失败还是成功。

下面一位大佬的解答方法是值得去学习的
```javascript
function loader(ajaxArray, callback) {
  const res = []
  const job = ajaxArray.reduceRight((prev, curr) => {
    return () => {
      const cb = (re) => { res.push(re); prev() }
      curr().then(cb).catch(cb)
    }
  }, () => callback(res))
  job()
}
```
相信很多刚接触函数式编程的朋友们和我一样，肯定是很懵逼的。
`Array.prototype.reduce` 这个方法大家一定不会陌生，但是大多在文档中的例子都是：
```javascript
[1, 2, 3, 4].reduce((prev, curr) => {
  return prev + curr
})
```
但是这段代码中，返回的不是一个具体的值，而是一个函数，在 `reduce` 中返回函数会发生什么呢？

首先 `reduceRight` 与 `reduce` 的作用很相似，只不过前者是从后向前取 `ajaxArray` 中的值来执行回调函数，和 `reduce` 一样，`reduceRight` 的第二个可选参数是作为第一次回调函数中的第一个参数。

那么第一次回调，`prev` 参数为 `() => callback(res)`，`curr` 参数为 `ajax3` 函数，这次回调函数返回了一个函数，第一次回调执行完毕。
执行第二次回调，`prev` 参数变为了第一次回调执行完毕所返回的函数，`curr` 参数为 `ajax2` 函数，这次回调函数返回的还是同一个函数。
执行第三次回调，`prev` 参数变为了第二次回调执行完毕所返回的函数，`curr` 参数为 `ajax1` 函数，这次回调函数返回的还是同一个函数。

那么通过前两次回调，我们可以总结出一个规律，`curr` 参数是 `ajaxArray` 数组中从后向前取出的一个值。而除了第一次回调，后面的每次回调的 `prev` 参数都是同一个函数，也就是回调函数中显式返回的那个函数。

理清了每次回调后，接下来我们就会发现递归的出现，也就是最后一次回调返回的函数中的 `prev()` 会执行上一次回调中所返回的那个函数，就形成了递归，假设把每次递归所返回的函数命名为 `cb3`, `cb2` 和 `cb1`，那么最后的 `job` 变量会变成， `cb1(cb2(cb3(() => callback(res))))`，经过这样的变化就能变得很好理解了，最后每次执行 `curr().then(cb).catch(cb)` 就可以依次输出 `hello` `india` `mifan` 了，`res` 数组中也会依次 `push` 进 `ajax1` `ajax2` 和 `ajax3`，在最后一次递归中 `res` 为 `['ajax1', 'ajax2', 'ajax3']`，被作为参数在回调函数中输出。

其实这种 `reduce` 的操作在 `redux` 源码中也有展现，`redux` 的 `compose` 方法就是运用了这一点。

```javascript
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```

最后还是感谢大神能给出如此优雅的解答，如果本文有什么错误也希望大家能提出指正。
代码链接：https://codeshare.io/5OlBrv