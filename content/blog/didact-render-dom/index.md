---
title: "[译] Didact: 渲染 DOM 元素"
date: "2019-01-28T05:50:00.000Z"
description: "这篇文章是系列《 Didact：一步步构建属于自己的 React 》中的一部分。"
---

![](https://cdn-images-1.medium.com/max/2560/1*9VubAng-r08AkzxMzRN-5A.jpeg)

> 这篇文章是系列《 Didact：一步步构建属于自己的 React 》中的一部分。

> [Didact: a DIY guide to build your own React](https://engineering.hexacta.com/didact-learning-how-react-works-by-building-it-from-scratch-51007984e5c5)

## DOM 回顾

在开始之前，让我们回顾一下我们将要使用到的 DOM API。

```javascript
// 通过 ID 获取一个元素
const domRoot = document.getElementById("root");
// 通过 Tag 名称创建一个新元素
const domInput = document.createElement("input");
// 设置属性（property）
domInput["type"] = "text";
domInput["value"] = "Hi world";
domInput["className"] = "my-class";
// 监听事件
domInput.addEventListener("change", e => alert(e.target.value));
// 创建一个文本节点
const domText = document.createTextNode("");
// 设置一个文本节点的内容
domText["nodeValue"] = "Foo";
// 附加一个元素
domRoot.appendChild(domInput);
// 附加一个文本节点（和上面一行一样）
domRoot.appendChild(domText);
```

注意我们设置的是元素的 [Property 而不是 Attribute](http://stackoverflow.com/questions/6003819/properties-and-attributes-in-html)。这意味着元素只允许被设置合法的属性。

## Didact 元素

我们将使用简单对象来描述需要渲染的内容，我们称它为 `Didact 元素`。这类元素有两个必要的属性：`type` 和 `props`。`type` 可以是一个字符串，也可以是一个函数，但是我们现在将使用字符串，直到我们介绍在后面的章节中介绍组件。`props` 是一个可以为没有属性的空对象（但是不可以是null）。`props` 可能有一个 `children`属性，它是一个拥有 Didact 元素的数组。

> 我们将大量使用 Didact 元素，所以从现在开始我们将称它元素。不要将它与 HTML 元素相混淆，我们将称这些元素为 DOM 元素，或者在命名变量的时候直接称作 dom（就像 preact 一样）。

举个例子，一个元素就像这样：

```javascript
const element = {
  type: "div",
  props: {
    id: "container",
    children: [
      { type: "input", props: { value: "foo", type: "text" } },
      { type: "a", props: { href: "/bar" } },
      { type: "span", props: {} }
    ]
  }
};
```

将这个元素描述成 DOM 会是这样：

```jsx
<div id="container">
  <input value="foo" type="text">
  <a href="/bar"></a>
  <span></span>
</div>
```

Didact 元素和 React 元素十分相似。但是你通常在使用 React 的时候不需要像创建 JS 对象那样创建 React 元素，你大概会使用 JSX 或者使用 `createElement`。在 Didact 中我们也将会这么做，但是我们将在系列的下一篇文章中展示元素的创建代码。

## 渲染 DOM 元素

下一步我们要渲染一个元素和它的子元素到 DOM 中。我们将会使用 `render` 函数（相当于 `ReactDOM.render`）来接收一个元素和一个 DOM 容器。这个函数会根据传入的元素创建一个子 DOM 树并附加在这个 DOM 容器中：

```javascript
function render(element, parentDom) {
  const { type, props } = element;
  const dom = document.createElement(type);
  const childElements = props.children || [];
  childElements.forEach(childElement => render(childElement, dom));
  parentDom.appendChild(dom);
```

现在我们的元素仍然缺少属性和事件监听器，让我们通过 `Object.keys` 遍历 `props` 属性来获取属性名并相应地设置它们。

```javascript
function render(element, parentDom) {
  const { type, props } = element;
  const dom = document.createElement(type);

  const isListener = name => name.startsWith("on");
  Object.keys(props).filter(isListener).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, props[name]);
  });

  const isAttribute = name => !isListener(name) && name != "children";
  Object.keys(props).filter(isAttribute).forEach(name => {
    dom[name] = props[name];
  });

  const childElements = props.children || [];
  childElements.forEach(childElement => render(childElement, dom));

  parentDom.appendChild(dom);
}
```

## 渲染 DOM 文字节点

现在 `render` 函数还并不支持文字节点。首先我们需要思考如何描述文字节点。举个例子，描述 `<span>Foo</span>` 的元素在 React 中是这个样子的：

```javascript
const reactElement = {
  type: "span",
  props: {
    children: ["Foo"]
  }
};
```

注意它的子元素，它是一个字符串，而不是另一个元素对象。这与我们之前定义 Didact 元素相违背： `children` 需是拥有 `type` 和 `props` 元素对象的数组。如果我们遵循这些规则，我们将可以在未来避免很多意外情况。所以，Didact 文字元素将会有一个值为 `TEXT ELEMENT` 的 `type`，而实际的文本将会在 `nodeValue` 这个属性中，就像这样：

```javascript
const textElement = {
  type: "span",
  props: {
    children: [
      {
        type: "TEXT ELEMENT",
        props: { nodeValue: "Foo" }
      }
    ]
  }
};
```

现在我们定义了一个可渲染的文本元素。文本元素和其他元素的区别是它需要使用 `createTextNode` 而不是 `createElement` 来创建。是的， `nodeValue` 的设置方式将会和其它属性一样。

```javascript
function render(element, parentDom) {
  const { type, props } = element;

  // 创建 DOM 元素
  const isTextElement = type === "TEXT ELEMENT";
  const dom = isTextElement
    ? document.createTextNode("")
    : document.createElement(type);

  // 添加事件监听器
  const isListener = name => name.startsWith("on");
  Object.keys(props).filter(isListener).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, props[name]);
  });

  // 设置属性
  const isAttribute = name => !isListener(name) && name != "children";
  Object.keys(props).filter(isAttribute).forEach(name => {
    dom[name] = props[name];
  });

  // 渲染子元素
  const childElements = props.children || [];
  childElements.forEach(childElement => render(childElement, dom));

  // 附加在父元素上
  parentDom.appendChild(dom);
}
```

我们创建了一个 `render` 函数，它能使我们渲染一个元素和它的子元素到 DOM 中。下一步我们需要一个更加简单的方法去创建元素。我们将在下一篇文章中让 JSX 作用于 Didact 中。

如果你想尝试文中的代码，访问这个 [CodePen](https://codepen.io/pomber/pen/eWbwBq?editors=0010)，你也可以在 [GitHub](https://github.com/pomber/didact/commit/fc4d360d91a1e68f0442d39dbce5b9cca5a08f24) 中找到本节的代码更新。

下一节：[Didact: 元素创建和 JSX](https://engineering.hexacta.com/didact-element-creation-and-jsx-d05171c55c56)

感谢阅读！