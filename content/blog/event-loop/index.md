---
title: JavaScript 的运行机制
date: "2017-09-04T07:19:34.000Z"
description: "在浏览器中，每个窗口都只有一个 JavaScript 线程，所以既然是单线程，那么程序的执行顺序是从上到下依次执行，且在某个特定的时刻就只有一个特定的代码能够被执行，会阻塞其它的代码。"
---

## JavaScript 是单线程的，但浏览器并不是
在浏览器中，每个窗口都只有一个 JavaScript 线程，所以既然是单线程，那么程序的执行顺序是从上到下依次执行，且在某个特定的时刻就只有一个特定的代码能够被执行，会阻塞其它的代码。
那么就有人问了，既然 JavaScript 是单线程语言，那么异步调用是如何实现的？计时器是靠谁来计时？耗时的 I/O 操作为什么没把线程阻塞？
这是因为虽然 JavaScript 运行在浏览器中是单线程的，每个窗口一个 JavaScript 线程，但是**浏览器并不是单线程的**。
例如 Webkit 或是 Gecko 引擎，都可能有如下线程：

* JavaScript 引擎线程
* 界面渲染线程
* 浏览器事件触发线程
* Http 请求线程

所谓的单线程可以理解是 JavaScript 引擎是单线程处理它的任务队列，包括普通函数和回调函数构成。

下面是知乎上的一段回答

> JavaScript 引擎是单线程运行的，浏览器无论在什么时候都只且只有一个线程在运行 JavaScript 程序。

> 浏览器的内核是多线程的，它们在内核控制下相互配合以保持同步，一个浏览器至少实现三个常驻线程：JavaScript 引擎线程，GUI 渲染线程，浏览器事件触发线程。

> 1. JavaScript 引擎是基于事件驱动单线程执行的，JavaScript 引擎一直等待着任务队列中任务的到来，然后加以处理，浏览器无论什么时候都只有一个 JavaScript 线程在运行 JavaScript 程序。
> 2. GUI 渲染线程负责渲染浏览器界面，当界面需要重绘（Repaint）或由于某种操作引发回流 (Reflow) 时，该线程就会执行。但需要注意，GUI 渲染线程与 JavaScript 引擎是互斥的，当 JavaScript 引擎执行时 GUI 线程会被挂起，GUI 更新会被保存在一个队列中等到 JavaScript 引擎空闲时立即被执行。
> 3. 事件触发线程，当一个事件被触发时该线程会把事件添加到待处理队列的队尾，等待 JavaScript 引擎的处理。这些事件可来自 JavaScript 引擎当前执行的代码块如 setTimeout、也可来自浏览器内核的其他线程如鼠标点击、Ajax 异步请求等，但由于 JavaScript 的单线程关系所有这些事件都得排队等待 JavaScript 引擎处理（当线程中没有执行任何同步代码的前提下才会执行异步代码）。

## 同步任务与异步任务
所有任务可以分为同步任务与异步任务两种。

* 同步任务指在主线程上排队执行的任务，只有当前一个任务执行完毕，下一个任务才会执行。
* 异步任务不进入主线程，而存放在任务队列中，只有当任务队列通知主线程某个异步任务可以执行后，这个异步任务才会进入主线程执行。

## Event Loop

在 JavaScript 中，异步执行的运行机制基本为三个步骤：

1. 所有同步任务都在主线程上执行，形成一个执行栈。
2. 在主线程外还存在一个任务队列，只要异步任务有了运行结果，就在事件队列中放置一个事件。
3. 一旦执行栈中的所有同步任务全部执行完毕，系统就会读取事件队列中的事件，事件对应的异步任务结束等待状态，进入执行栈开始执行。

举个例子，拿 ajax 来说，当页面的单线程执行 `xhr.send()` 之后，对于页面来说发送任务已经完成了。怎么发送那是浏览器的事，和单线程无关。什么时候响应，这事说不准。为了及时地得到响应的内容，在单线程中注册相应的事件就好 `xhr.onreadystatechange = fn() {...}` 。注册之后，浏览器会在内部的其他线程中自动地帮我们监听该事件。直到该事件被触发，浏览器会在任务队列中添加一个任务等待该单线程执行。

## Macrotask 与 Microtask
上面所说的只是 Event Loop 的基本概念，具体我们引入两个新概念 `Macrotask` 和 `Mircotask`。在事件队列中，不同的异步任务是被存入不同的队列中的，而且它们也并不是简单的先进先出。

![](https://i.loli.net/2017/09/04/59ad06ee648bf.png)

一个 Event Loop 中会有一个正在执行的任务，而这个任务就是从 Macrotask 队列中来的。

> 按照 [WHATWG](https://html.spec.whatwg.org/multipage/webappapis.html#task-queue) 规范，每一次事件循环（one cycle of the event loop），只处理一个 (macro)task。待该 macrotask 完成后，所有的 microtask 会在同一次循环中处理。处理这些 microtask 时，还可以将更多的 microtask 入队，它们会一一执行，直到整个 microtask 队列处理完。

所以在同一个事件循环中，一次最多处理一个 Macrotask，却可以处理完所有的 Microtask。

基本来说，当我们想以同步的方式来处理异步任务的时候就使用 Microtask，其他情况就直接用 Macrotask。

这图基本能说明调用栈、后台线程、(Macro)task Queue 与 Microtask Queue 的流程关系了。

![](https://ooo.0o0.ooo/2017/09/04/59ad42a27241a.png)

### 举个例子

#### 例子 1

``` js
(function () {
    setTimeout(function() {console.log(4)}, 0);
    new Promise(function executor(resolve) {
        console.log(1);
        for( var i=0 ; i<10000 ; i++ ) {
            i == 9999 && resolve();
        }
        console.log(2);
    }).then(function() {
        console.log(5);
    });
    console.log(3);
})()
```

1. 当前 microtask 执行，`setTimeout` 中的 callback 函数被放入 microtask queue 中（即使时间为 0ms）。
2. 实例化 promise，输出 1。
3. 循环 10000 次之后，promise 的状态变为 resolved，这个 `promise.then()` 中的回调放入当前事件循环回合中的 microtask queue。
4. 输出 3。
5. 当前 macrotask 执行完毕，执行 microtask queue，输出 5，当前 microtask queue 执行完毕。
6. 执行下一个 macrotask，输出 4。

#### 例子 2
个人觉得下面这段代码的理解更加深刻，可以仔细思考一下它的执行顺序：

``` js
console.log('start')

const interval = setInterval(() => {
  console.log('setInterval')
}, 0)

setTimeout(() => {
  console.log('setTimeout 1')
  Promise.resolve()
      .then(() => {
        console.log('promise 3')
      })
      .then(() => {
        console.log('promise 4')
      })
      .then(() => {
        setTimeout(() => {
          console.log('setTimeout 2')
          Promise.resolve()
              .then(() => {
                console.log('promise 5')
              })
              .then(() => {
                console.log('promise 6')
              })
              .then(() => {
                clearInterval(interval)
              })
        }, 0)
      })
}, 0)

Promise.resolve()
    .then(() => {
        console.log('promise 1')
    })
    .then(() => {
        console.log('promise 2')
    })
```
1. 输出 start
2. setInterval，setTimeout，Promise.resolve 加入 macrotask queue。
3. 调用栈变空，microtask queue 开始执行，输出 promise1 和 promise2。
4. microtask queue 清空，setInterval 回调执行，输出 setInterval，又一个 setInterval 加入 macrotask queue。
5. setTimeout 回调执行，输出 setTimeout1，Promise.resolve 加入 macrotask queue，then() 中的回调函数加入 microtask queue。
6. 调用栈变空，microtask queue 执行，输出 promise3 和 promise4，setTimeout 加入 microtask queue。
7. microtask queue 清空，setInterval 回调再次执行，输出 setInterval，又一个 setInterval 加入 macrotask queue。
8. setTimeout 回调执行，输出 setTimeout2，Promise.resolve 加入 macrotask queue，then() 中的回调函数加入 microtask queue。
9. 调用栈变空，microtask queue 执行，输出 promise5 和 promise6，并且执行 clearInterval 清除 Interval。

### 具体实现

* macrotasks: setTimeout setInterval setImmediate I/O UI 渲染
* microtasks: Promise process.nextTick Object.observe MutationObserver

### 具体流程
当执行栈为空的时候，开始依次执行：

1. 把最早的任务 (task A) 放入任务队列
2. 如果 task A 为 null （那任务队列就是空），直接跳到第 6 步
3. 将 currently running task 设置为 task A
4. 执行 task A （也就是执行回调函数）
5. 将 currently running task 设置为 null 并移出 task A
6. 执行 microtask 队列
   - a. 在 microtask 中选出最早的任务 task X
   - b. 如果 task X 为 null （那 microtask 队列就是空），直接跳到 g
   - c. 将 currently running task 设置为 task X
   - d. 执行 task X
   - e. 将 currently running task 设置为 null 并移出 task X
   - f. 在 microtask 中选出最早的任务 , 跳到 b
   - g. 结束 microtask 队列
7. 跳到第一步

## 参考文章
1. [JavaScript 运行机制详解：再谈 Event Loop](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)
2. [理解事件循环二 (macrotask 和 microtask)](https://github.com/ccforward/cc/issues/48)
3. [Understanding the Node.js Event Loop](https://blog.risingstack.com/node-js-at-scale-understanding-node-js-event-loop/)
4. [Javascript 是单线程的深入分析](https://www.cnblogs.com/Mainz/p/3552717.html)