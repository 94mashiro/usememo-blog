---
title: 前端面试题 HTML & CSS
date: "2018-01-23T17:00:22.000Z"
description: "题目来源：16 年毕业的前端 er 在杭州求职 ing - 掘金"
---

题目来源：[16 年毕业的前端 er 在杭州求职 ing - 掘金](https://juejin.im/post/5a64541bf265da3e2d338862)
# CSS 常用布局
> 这个在面试上市公司和创业公司问的比较多。大概我会回答一些盒模型包括怪异盒模型，定位布局，流布局，浮动布局，flex 和 grid 布局，包括还有三栏布局中的圣杯和双飞翼。这些都还比较熟悉，所以问到都还知道。其中 flex 布局问的比较多，阿里的交叉面还有别的公司有问到子元素的一些属性。

## 盒模型
![](https://leohxj.gitbooks.io/front-end-database/html-and-css-basic/assets/box-model.svg)

盒模型分为两种：W3C 的**标准盒模型**和 IE 的**怪异盒模型**。
![](https://i.loli.net/2018/01/24/5a67e443bff17.jpg)
![](https://i.loli.net/2018/01/24/5a67e44391cf8.jpg)
* 在标准模式下，一个块的宽度 = width + padding（左右） + border（左右） + margin（左右）。width、height 只包含 content 内容区。
* 在怪异模式下，一个块的宽度 = width + margin（左右）。width、height 包含 content、padding、border。

CSS3 中新增了一种盒模型计算方式：`box-sizing` ，默认值为 `content-box` 。
* `content-box`：如果你设置一个元素的 width 属性为 100px，那么内容区的宽度就为 100px，边框和内边距的宽度最后都会被添加到绘制出来的元素宽度中。
* `border-box`：该模式下，元素的边框和内边距都是包含在 width 属性中的。
* `padding-box`：该模式下，只有元素的内边距是包含在 width 属性中。

## 定位布局
定位布局有三种形式：
* 相对定位 `position: relative`
* 绝对定位 `position: absolute`
* 固定定位 `position: fixed`

在一个相对定位的元素上设置 `top` `right` `bottom` `left` 属性会使其偏离其正常位置，**但是其他的元素不会因为该元素发生位置偏移而去添补它偏离后留下的空隙**。

绝对定位的元素会寻找离它最近的 postion 值不为 static 的父元素，并相对于它进行位置偏移。如果该父元素不存在，则相对于文档的 body 元素。

固定定位的元素与绝对定位类似，但是它相对移动的坐标是视图本身。它的位置不会随着窗口滚动条滚动而变化，也不会受文档流动影响。

## 浮动布局
[https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Floats](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Floats)

## 网格布局
[https://zhuanlan.zhihu.com/p/26757425](https://zhuanlan.zhihu.com/p/26757425)

## FlexBox
[Flex 布局教程：语法篇](http://www.ruanyifeng.com/blog/2015/07/flex-
grammar.html)
[Flex 布局教程：实例篇](http://www.ruanyifeng.com/blog/2015/07/flex-examples.html)

容器的属性：
* `flex-direction` 决定主轴的排列方向
* `flex-wrap` 决定轴线上的元素是否换行
* `flex-flow` 是 flex-direction 属性和 flex-wrap 属性的简写形式
* `justify-content` 定义了项目在主轴上的对齐方式
* `align-items` 定义项目在交叉轴上如何对齐
* `align-content` 定义了多根轴线的对齐方式，如果项目只有一根轴线，该属性不起作用

项目的属性：
* `order` 定义项目的排列顺序，数值越小，排列越靠前
* `flex-grow` 定义项目的放大比例，默认为 0，即如果存在剩余空间，也不放大
* `flex-shrink` 定义了项目的缩小比例，默认为 1，即如果空间不足，该项目将缩小
* `flex-basis` 定义了在分配多余空间之前，项目占据的主轴空间
* `flex` 是 `flex-grow`, `flex-shrink` 和 `flex-basis` 的简写，默认值为 `0 1 auto`
* `align-self` 允许单个项目有与其他项目不一样的对齐方式，可覆盖 `align-items` 属性

当 `flex` 取值为 `none`，则计算值为 `0 0 auto`。
当 `flex` 取值为 `auto`，则计算值为 `1 1 auto`。

# 垂直居中
## inline 元素
* inline 元素和父容器的上下两边内边距相等。

```css
.container {
    padding: 50px;
}
.container span {
    padding: 50px 0;
}
```

* inline 元素的行高与容器高度相等。

```css
.container {
    height: 100px;
}
.container span {
    line-height: 100px;
}
```

* 如果上面的代码都不生效的话，有可能行内元素是在表格里面，这个时候可以利用 inline 元素的 CSS 属性 vertical-align ，默认是 baseline 属性，将其设置为 middle，这个属性常用于 inline-level 和 table-cell 的元素。

```css
.container {
    height: 100px;
    display: table;
}
.container span {
    display: table-cell;
    vertical-align: middle;
}
```

## block 元素
* 利用绝对定位以及负外边距，适用于已知宽高的元素。

```css
.parent {
    position: relative;
}
.child {
    position: absolute;
    top: 50%;
    height: 100px;
    margin-top: -50px;
}
```

* 不知道宽高的 block 元素，使用绝对定位以及 transform。

```css
.parent {
    position: relative;
}
.child {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
}
```

* block 元素在外部的容器，使用 flex 属性。

```css
.parent {
    display: flex;
    flex-direction: column;
    justify-content: center;
}
```

# BFC
[http://kayosite.com/block-formatting-contexts-in-detail.html](http://kayosite.com/block-formatting-contexts-in-detail.html)
BFC 主要有三个特性（经常考）：
1. BFC 会阻止外边距折叠
2. BFC 可以包含浮动的元素
3. BFC 可以阻止元素被浮动元素覆盖

## 清除浮动
[http://kayosite.com/remove-floating-style-in-detail.html](http://kayosite.com/remove-floating-style-in-detail.html)

# session、cookie、sessionStorage、localStorage

## Web Storage API
https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API

## Cookie
### expires
expires 属性用来设置 Cookie 何时失效。
expires 必须是 GMT 格式的时间，通过 `new Date().toGMTString()` 或者 `new Date().toUTCString()` 来获得。

### max-age
`expries` 是 http/1.0 协议中的选项，在 http/1.1 协议中 `expires` 已经由 `max-age` 选项代替。
两者的作用都是限制 `Cookie` 的有效时间。
`expries` 的值是一个时间点，`Cookie 失效时刻 = expires`。
而 `max-age` 的值是一个以**秒** 为单位的时间段，`Cookie 失效时刻 = 创建时刻 + max-age`。

### Cookie 的作用域和作用路径
domain 属性对应 Cookie 的作用域，path 属性对应作用路径。
访问子域时，父域的 Cookie 会被带上。
作用路径同理，在子路径中可以访问到父路径的 Cookie，反过来不行。