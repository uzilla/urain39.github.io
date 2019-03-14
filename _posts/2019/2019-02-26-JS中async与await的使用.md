---
title: 'JS中async与await的使用'
date: 2019-02-26
layout: post
tags:
    - JS
    - Javascript
    - ES8
    - ES2017
    - 异步
    - 编程语言
---

> 不得不说ES8真香！从ES8开始支持比Promise更强大的async/await关键字，你甚至可以使用async/await实现真正意义上的sleep。

async与await关键字
=================

ES8加入了许多新的机制与关键字，但其中最为强大的应该要数`async/await`机制了。众所周知JS是一门偏向于异步的编程语言，而想让代码同步执行那么我们就必须使用回调机制。但如果逻辑复杂起来，回调慢慢变多，那么代码基本上是无法阅读的。

前端逻辑上应该很少有这样的问题，但随着NodeJS的发展，逻辑需求的复杂化等，这些问题就一一展现出来了——使用JS编写与其他语言等价的代码变得越来越难。即使是在`Promise`机制出现后的代码中想转换其他代码也会觉得晕头转向的。好在这时`async/await`机制的出现及时解决了这一问题……

## 关键字解析
- `async`  
用于将普通函数**转换**为返回`Promise`对象的函数，只有在被async修饰后的函数里才能使用`await`关键字
- `await`  
用于**等待**`Promise`**完全**执行完毕(阻塞当前异步线程)，并**返回最终结果(即最后`resolve`的值)**

**注意**：这里的“当前异步线程”指的是执行异步任务的线程。

## 小试牛刀
下面这段代码可以用于模拟`sleep`操作并最终输出“Yet”结束。
```js
function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(null);
    }, ms);
  });
}

// await关键字只能用在async修饰过的函数里！
async function main(ms) {
  await sleep(1000);  // 等待sleep结束
  await sleep(1000);  // ...
  await sleep(1000);
  console.log("Yet"); // 输出最终值
}

main() // -> 新的Promise对象
// 休眠3秒后输出“Yet”
```
`await`会一直阻塞异步线程，直到`sleep`函数返回的`Promise`对象中的定时器归零后调用`resolve`函数时才往下执行。如果`await`的`Promise`对象是由多次调用`then`方法组成的**链式结构**，那么`await`则以最终的`resolve`结果为准。

## 返回值的处理
```js
async function f(x) {
  return Math.pow(x, 2);
}

(async function() {
  console.log(await f(9)); // => 81
})();
```

## 本文小结
- async/await比Promise更为强大。
- await能够等待Promise执行完毕。
- await只能够用在被async修饰的函数中。
- async可以将函数转换为返回Promise对象的函数。
- async函数中的return会被转换为resolve的值。
