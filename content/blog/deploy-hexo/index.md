---
title: 使用 Travis CI 自动化部署 Hexo
date: "2018-09-07T13:57:00.000Z"
description: "前阵子 Mojave Beta 出来，兴冲冲的拿自己电脑格盘更新，唯独没有备份 Hexo 文件夹，导致之前写得 Markdown 文件全部丢失了。"
---

## 0x00 前言
前阵子 Mojave Beta 出来，兴冲冲的拿自己电脑格盘更新，唯独没有备份 Hexo 文件夹，导致之前写得 Markdown 文件全部丢失了。

因为之前 Hexo 博客为了偷懒只将 Generate 之后的静态文件给 Deploy 到远程仓库的 master 分支上，结果这一次也为之前的偷懒行为付出了一点代价。

因此需要在现有基础上创建一个新的分支用于储存 blog 的项目代码，但是这么做之后就不可能像以前那样只用 `hexo d -g` 一行命令解决部署问题，于是一个持续集成的系统就很有必要了。

在查阅资料后发现如今 GitHub + Hexo 架构的博客系统通常使用 Travis CI 来进行持续集成，因为本身 Travis CI 对 GitHub 的支持也很好。

于是经过构想，希望系统能够做到以下的流程进行部署：
1. 在更新文章之后，手动将更新 push 到远程仓库的 dev 分支中。
2. 通过 Travis CI 自动编译静态文件并 push 到远程仓库的 master 分支中。
3. 同时将静态文件传输到自己的 VPS 上。

## 0x01 配置 GitHub Repo
经过之前的构想，用于存放 Hexo 的 Repo 需要有两个分支：
1. master 分支，用于存放编译后的静态页面，并生成 GitHub Pages。
2. dev 分支，用于存放 hexo-cli 生成出来的项目。

一通操作猛如虎，于是就把项目传到了 dev 分支
```shell
> hexo init blog
> git init
> git remote add origin git@github.com:MashiroWang/blog.git
> git checkout --orphan dev
> git add .
> git commit -m "init commit"
> git push origin dev:dev
```

## 0x02 配置 Travis CI
通过授权使用 GitHub 账号登录，可以发现在 Setting-Repositories 中，已经列出了所有账户下的 Repo，只用选中之前创建的 Repo 就能完成绑定。
![-w400](https://ws1.sinaimg.cn/large/0069RVTdgy1fv232lcsduj310u032q2r.jpg)
另外进入 Setting，选中 Build pushed branches，表示仅在分支更新时候进行构建。
![-w315](https://ws2.sinaimg.cn/large/0069RVTdgy1fv232v8xq0j30hi06wglk.jpg)

### 配置 SSH 密钥
在部署流程中，有以下两个流程会使用到 SSH 秘钥。
1. 将编译好的静态文件 push 到 master 分支。
2. 将编译好的静态文件 push 到 vps 中。

首先，通过 `ssh-keygen` 生成一个新的密钥对，我这边是存放在 `~/.ssh/travis_deploy.key`。
```shell
> ssh-keygen -f ~/.ssh/travis_deploy.key
```
然后得到一个 `travis_deploy.key` 的私钥文件，和一个叫 `travis_deploy.key.pub` 的公钥文件，首先将公钥文件添加到 Repo 的 **GitHub Deploy Key** 中，以及 VPS 上的 `~/.ssh/authorized_keys` 文件里，这样 Travis CI 就能直接通过私钥 push 代码到 master 分支以及访问 VPS 了。（这样做比直接使用 Personal Access Token 要保险的多）

关于传输密钥在 [阅读文档](https://docs.travis-ci.com/user/encrypting-files/) 之后发现可以使用他们的 CLI 工具，对私钥进行 aes-256-cbc 加密上传至 Repo 中，并将解密用到的字符串自动保存在 Travis 的环境变量中。

```shell
> sudo gem install travis
> travis login --auto
> travis encrypt-file ~/.ssh/travis_deploy.key -add
```

Travis CLI 会将加密后的私钥存放在当前目录下，例如 `travis_deploy.key.enc`，也会很贴心的修改项目的 `.travis.yml` 文件，将解密代码添加进去，稍微修改一下生成的解密代码，将私钥的输入输出路径稍作修改（完全是个人习惯问题），然后会发现解密代码中有用到两个变量分别为 `encrypted_0a6446eb3ae3_key` 和 `encrypted_0a6446eb3ae3_iv`，这两个变量是 CLI 自动生成的，并保存在部署环境的环境变量中，而且在这两个变量的值也不会显示在部署的日志中，各位客官大可放心使用。

```shell
> openssl aes-256-cbc -K $encrypted_0a6446eb3ae3_key -iv $encrypted_0a6446eb3ae3_iv -in .travis/travis_deploy.key.enc -out ~/.ssh/travis_deploy.key -d
```

另外需要保证部署过程中，不会因为第一次通过 SSH 访问 VPS 出现的 `The authenticity of host 'xxxxx'...` 的提示而阻碍部署的正常流程，所以需要将这个确认过程给屏蔽掉。

具体的方法可以通过在 `ssh_config` 中添加 `StrictHostKeyChecking no` 的命令来进行屏蔽检查。

## 0x03 rsync
将编译后的静态文件 push 到 Repo 之后，也需要将其 push 到 VPS 中，这里我使用了 `rsync` 这个工具。

``` shell
rsync -rv --delete -e 'ssh -o stricthostkeychecking=no' ./ root@blog.mashiro.wang:/usr/local/src/blog
```

## 0x04 .travis.yml
这份配置文件也是参考（复制）了网上很多大佬的配置文件，再次也感谢他们的无私分享，有什么地方看不懂的可以直接搜，肯定有大佬会有注解进行解释，别找我。
```yaml
language: node_js
sudo: required
node_js: stable
addons:
  ssh_known_hosts:
  - github.com
  - blog.mashiro.wang
cache:
  yarn: true
  apt: true
  directories:
  - node_modules
before_install:
- export TZ='Asia/Shanghai'
- openssl aes-256-cbc -K $encrypted_46687ffe6a2d_key -iv $encrypted_46687ffe6a2d_iv
  -in .travis/travis.key.enc -out ~/.ssh/travis.key -d
- chmod 600 ~/.ssh/travis.key
- mv -fv .travis/ssh-config ~/.ssh/config
- git config user.name "Mashiro Wang"
- git config user.email "hyperoot@gmail.com"
- chmod +x .travis/deploy.sh
install:
- yarn
- if [ ! -d "themes/typography" ]; then git clone git@github.com:SumiMakito/hexo-theme-typography.git themes/typography; fi
- cp .travis/theme.config.yml themes/typography/_config.yml
script:
- node_modules/.bin/hexo clean
- node_modules/.bin/hexo generate
after_success:
- ".travis/deploy.sh"
branches:
  only:
  - dev
```

``` shell
git clone -b master git@github.com:MashiroWang/blog.git .deploy_git
cd .deploy_git
git checkout master
mv .git/ ../public
cd ../public
git init
git add .
git commit -m "site updated: `date +"%Y-%m-%d %H:%M:%S"`"
git push origin master:master --force --quiet
rsync -rv --delete -e 'ssh -o stricthostkeychecking=no' ./ root@blog.mashiro.wang:/usr/local/src/blog
```

## 0x05 参考链接
1. [使用 Travis CI 自动部署 Hexo 博客](https://blessing.studio/deploy-hexo-blog-automatically-with-travis-ci/)
2. [使用 Travis 自动部署 Hexo 到 Github 与 自己的服务器](https://www.jianshu.com/p/1226d159d514)