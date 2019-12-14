---
title: 讲一下 table 元素的 table-layout 属性
date: "2019-12-14T10:36:03.205Z"
description: "最近接手了一个将模块升级 [zent](https://youzan.github.io/zent/zh/guides/changelog-v7) 的大版本升至 7 的项目，在升级过程中发现 Grid 组件出现了一点问题，通过调查最终发现了问题所在，并告知负责该项目的大哥，修复了这个问题，最后想把整个过程水一篇文章记录一下，以免以后继续踩坑。"
---

最近接手了一个将模块升级 [zent](https://youzan.github.io/zent/zh/guides/changelog-v7) 的大版本升至 7 的项目，在升级过程中发现 Grid 组件出现了一点问题，通过调查最终发现了问题所在，并告知负责该项目的大哥，修复了这个问题，最后想把整个过程水一篇文章记录一下，以免以后继续踩坑。

这边首先使用官网 DEMO 来还原当时的场景：

![image-20191214195147911](https://tva1.sinaimg.cn/large/006tNbRwly1g9whv5rx5hj31a80n0408.jpg)

如上图所示，在升级组件库之后能明显看到这个 Grid 组件的 Checkbox 和第一列的内容贴的太近了。当时怀疑可能是 td 元素的 padding 属性设置不当导致，使用 DevTools 查看这个 Checkbox 元素，发现其实 Checkbox 已经脱离的父容器（td.zent-grid-td）溢出。

![image-20191214195513977](https://tva1.sinaimg.cn/large/006tNbRwgy1g9whyq8l70j30g407udg8.jpg)

另外也发现如果点击 checkbox 溢出的那部分 ，是不会触发 checkbox 的事件的，通过观察发现那部分 checkbox 其实已经是在第二列元素之下，因此无法点击。

![image-20191214195906291](https://tva1.sinaimg.cn/large/006tNbRwly1g9wi2r4aw3j30iw0bgjsg.jpg)

因为之前对 table 元素不太了解，排查过程基本就是在 table 元素和其子元素的 css 属性上下手，最后发现最外层的 table 元素上，有一个 table-layout: fixed 属性，将其关闭发现 checkbox 所在的 td 宽度变为正常，因此基本定位是因为这个属性造成第一列容器宽度过小，导致容器内的子元素超出父容器的宽度，但是由于第二列容器内设 padding 属性，导致在视觉上看不出 checkbox 和第二列文字已经重叠了。

在 MDN 对于这个属性是这么说明的：

> The **`table-layout`** CSS property sets the algorithm used to lay out <table> cells, rows, and columns.
>
> 1. [`auto`](https://developer.mozilla.org/en-US/docs/Web/CSS/auto)
>
>    By default, most browsers use an automatic table layout algorithm. The widths of the table and its cells are adjusted to fit the content.
>
> 2. **fixed**
>
>    Table and column widths are set by the widths of `table` and `col` elements or by the width of the first row of cells. Cells in subsequent rows do not affect column widths.
>
>    Under the "fixed" layout method, the entire table can be rendered once the first table row has been downloaded and analyzed. This can speed up rendering time over the "automatic" layout method, but subsequent cell content might not fit in the column widths provided. Cells use the [`overflow`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow) property to determine whether to clip any overflowing content, but only if the table has a known width; otherwise, they won't overflow the cells.

其实这个属性规定了单元格宽度的计算方式，默认值为 auto，此时单元格的宽度由其内容决定，如果设置为 fixed，单元格的宽度由第一行的单元格决定，此时可以通过 overflow 属性来控制单元格里的内容是否溢出。

一般 table 元素会通过 colgroup 这个子元素开控制列的样式，它没有具体内容。

![image-20191214201920544](https://tva1.sinaimg.cn/large/006tNbRwly1g9wint8bnuj30j20620tm.jpg)

最终我们发现 colgroup 中的第一个 col，也就是第一列，也是 checkbox 所处的那一列，它的宽度被定义为了 20px，再加上 table-layout: fixed 这个属性，导致每一行的第一列的宽度始终被设定成了 20px，最终导致内部元素溢出。

最终的解决办法是将 20px 替换为一个合适的宽度。

至于为什么溢出部分无法点击，这是因为 BFC 之间的层叠关系导致的。

最后只能说想要驾驭 CSS 真的需要积累和沉淀，不然就会像我一样没有方向。