---
title: HEVC/H.265 Video Format
date: "2018-05-02T13:00:00.000Z"
description: "今天在线上发现部分用户上传的视频只能听到音频却看不到画面的情况，但是在另外几个开发的电脑上却能正常播放。"
---

## 0. 背景
今天在线上发现部分用户上传的视频只能听到音频却看不到画面的情况，但是在另外几个开发的电脑上却能正常播放。

## 1. 调查视频编码格式
将该视频下载下来之后，发现使用系统自带的 QuickTime 打开该视频提示**文件不兼容**。

浏览器无法正常渲染视频画面，但是却能播放视频的音频，这种情况首先猜测是浏览器不支持视频的编码格式。
查看视频的编码信息可以祭出 `ffmpeg` 这个大杀器。

```bash
$ ffmpeg -i h265.mp4

...

com.apple.quicktime.make: Apple
com.apple.quicktime.model: iPhone X
com.apple.quicktime.software: 11.3
Stream #0:0(und): Video: hevc (Main) (hvc1 / 0x31637668)
```

在返回的结果中发现了这几段比较有价值的信息，首先可以发现这段视频是通过 `iPhone X` 拍摄，系统版本为 `iOS 11.3`。其次可以发现这段视频的视频编码格式为 `HEVC`。

通过这几个关键字，能搜出很多关于 **苹果的几款新机型在iOS11之后默认使用HEVC作为视频录制的默认编码格式** 的文章。

## 2. 浏览器对 HEVC 兼容性奇差无比

在 caniuse 中搜索各浏览器对于 HEVC 格式的编码格式兼容度，结果令我大吃一惊。
![WX20180427-161248@2x.png](https://i.loli.net/2018/04/27/5ae2db8b32c6d.png)
浏览器对于这种编码格式的视频兼容度居然如此之低，目前只有 `iOS Safari 11.2` 和 `11.3` 浏览器能够完全支持，而 `Safari 11` 以上和 `Edge` 浏览器只能部分支持（macOS 仅支持 High Sierra 以上的版本，这也就证明了我系统中为什么无法打开这个视频文件），`Chrome` 和 `Firefox` 全部阵亡！

## 3. 开始转码
最后讨论出的一个解决方案就是在用户上传视频文件之后自动转码生成一个 `H.264` 的视频文件。
由于这类视频文件通常都是时间短、容量小、文件多，因此转码函数不需要通过守护进程常驻后台，而是使用 `AWS LAMBDA` 这套函数运行的服务。
在该服务中用户无需考虑系统环境，只需要上传需要执行的代码以及设定该函数的触发器，当触发器触发时自动执行该函数。
于是结合实际情况设置触发器为 POST 提交后缀 `.mp4` 的文件到某前缀的目录下触发该触发器。

首先，在该系统环境下，用户只有 `/tmp` 路径下的所有权，所以转码必须都需要在该路径下执行。
其次 `ffmpeg` 的二进制文件该环境下并没有提供，所以首先需要下载一个 **x86_64 版本的 ffmpeg**，然后放在与 js 文件同目录下，打包上传到 AWS LAMBDA 中。
具体的实现方式可参考 [https://concrete5.co.jp/blog/creating-video-thumbnails-aws-lambda-your-s3-bucket](https://concrete5.co.jp/blog/creating-video-thumbnails-aws-lambda-your-s3-bucket)

## 4. 前端展示
通过之前的工作，每当用户向S3上传一份视频文件后，通过触发器执行LAMBDA中的转码函数，在S3的另一个桶中生成一份转码后的H.264视频。
修改后端接口代码，使其返回原始视频和转码视频的URL数组。
在前端搭配使用 `<video>` 和 `<source>` 两种 tag 可实现在能播放 h.265 的环境中播放原始视频，而在其他情况下播放转码视频。

```html
 <video id="video-preview-player" controls style="width:100%; height:300px">
     <!-- h.265 编码器 -->
    <source id="h265-video-preview" type="video/mp4; codecs=hevc" [src]="this.originalVideoUrl">
    <!-- h.264 编码器 -->
    <source id="h264-video-preview" type="video/mp4" [src]="this.convertVideoUrl ? this.convertVideoUrl : this.originalVideoUrl">
 </video>

```

## 5. 结语
通过这次业务上的处理，让我也了解到了视频编码方面的知识，还让我这个前端去接触了一下 AWS 上的一些产品，得到的收获还是非常多的。
