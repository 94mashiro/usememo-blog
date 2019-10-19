---
title: 小程序踩坑
date: "2018-09-06T13:56:47.000Z"
description: "根据小程序文档给出的登录时序图，登录的流程大致可以理解为用户在打开小程序的时候通过调用..."
---
## 1. 登录
<!-- ![](http://pem3txmpo.bkt.clouddn.com/15362399293599.jpg) -->
根据小程序文档给出的登录时序图，登录的流程大致可以理解为用户在打开小程序的时候通过调用`wx.login()`获得一个持续时间较短的临时登录凭证，通过这个凭证回传到后端服务器中，通过这个凭证向微信接口换取`session_key`与用户的`openid`（或`unionid`）。
这里我踩了一个坑，首先项目是通过`unionid`来区分用户的，在开发的过程中调用该接口，返回的结果中存在`openid` `session_key` 与 `unionid`。但是后来仔细读文档，发现`unionid`这个参数只会在特定情况下才会返回，
其中一种情况就是该用户已经关注了同主体下的公众号或服务号，这也就说明为什么在开发过程中该接口会返回`unionid`，但是正常情况下会有一部分用户并没有关注公众号，所以通过该接口并不会返回`unionid`。
取而代之的方式应该是通过调用`wx.getUserInfo()`的方法通过用户的主动授权来获得用户的用户信息，但是我们需要的`unionid`是在返回的加密数据中，加密数据需要通过`session_key`来解密，而`session_key`又需要通过`code`来获取。因此实际情况下，在用户按下登录按钮之后，通过`bindgetuserinfo`的回调函数获得加密后的用户信息`encryptedData`与初始化向量`iv`。紧接着调用`wx.login()`获得`code`，将这三个参数发送给后端，后端首先通过`code`获取用户的`session_key`，然后使用`session_key`与`iv`解密`encryptedData`获得明文数据保存在数据库中，并返回自定义登录态`token`，小程序获得`token`后保存在`Storage`中，至此登录流程才算完成，与官方给出的登录流程稍有不同。
```
wx.login（获取 code) ===> wx.getUserInfo（用户授权） ===> 获取 unionid
```

## 2. Page 间的数据传递
在小程序中`Page`与`Page`中`Component`之间的数据传递就像`React`中父子组件数据传递一样，`Page`通过`property`将数据传递到`Component`中，而`Component`则通过`dataset`与`triggerEvent`来将数据传递到`Page`中。
在项目中遇到了一种情况，A 页面中通过触发`wx.navigeteTo()`将页面导航到 B 页面中，然后在 B 中通过`wx.navigateBack()`返回 A 页面，同时需要携带部分 B 页面的数据到 A 页面中。
页面之间不存在父子关系，所以并不能通过`property`与`triggerEvent`这种方法来传递。
但是微信给出了`getCurrentPages`方法来获得当前页面栈的实例数组，并定义第一个元素为`首页 Page`的实例，最后一个元素为`当前显示 Page`的实例。
``` javascript
const pages = getCurrentPages()
const prevPage = pages[pages.length - 2]
prevPage.setData({
  ....
})
```
通过调用前一个页面的`setData`方法将该页面中需要传递的数据存入前一个页面的`data`中，即可完成 Page 间（页面栈中的 Page) 数据传递。

## 3. Android 全面屏 Bug
在一个聊天界面的场景中，底部的 `<Input />` 获得焦点唤起虚拟键盘，而此时该 `<Input />` 需要被虚拟键盘顶起。可是在开发中，我使用 `坚果 Pro2` 却发现 `<Input />` 实际上是被虚拟键盘覆盖遮挡。

查阅资料后发现是微信的 bug，目前解决办法为将安卓机型的全面屏手势控制换成虚拟按键控制。
9 月 16 日更新：微信 6.7.2 已经修复该 bug。

## 4.iOS 时间解析
项目中有很多场景需要展示时间，后端返回 ISO 格式的时间字符串，通过 `Moment.js` 进行解析、格式化，展示在界面上。然而在 iOS 设备上，这些格式化后的时间均无法显示，查看控制台发现提示 `invalid date`。

原因是后端返回的时间字符串格式 `"2018-09-16T04:26:09.129Z"`，然而 `new Date("2018-09-16T04:26:09.129Z")` 这行代码在 Android 上是可以成功执行的，但是在 iOS 上却无法被执行，导致无法生成 Date 对象。

目前的解决方法是将"2018-09-16"这种格式转换成"2018/09/16"这种可以被 iOS 和 Android 都能识别的格式。
