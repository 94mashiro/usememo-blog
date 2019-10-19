---
title: 在你的 create-react-app 项目添加 SASS/SCSS
date: "2018-01-23T01:32:14.000Z"
description: "如果开发一个小型 SPA 应用的话，使用 create-react-app 搭建项目固然是个很方便的选择。但是默认情况下，这个项目中并没有加入 SASS/SCSS 的预编译器，所以无法支持 SASS/SCSS，我们需要手动修改配置文件。"
---

如果开发一个小型 SPA 应用的话，使用 `create-react-app` 搭建项目固然是个很方便的选择。但是默认情况下，这个项目中并没有加入 SASS/SCSS 的预编译器，所以无法支持 SASS/SCSS，我们需要手动修改配置文件。

## Eject
默认情况下，由 `create-react-app` 生成的项目文件下，是没有 webpack 的配置文件，因为在一般情况下是开发者是不需要去手动修改这个配置文件。但是如果你需要，它也提供了项目弹出的功能，顾名思义，将你的项目从安全舱中弹出，也就是说你对配置文件的修改可能会导致项目无法正常启动。
**注意的是，此操作是不可逆的。**

```
yarn run eject
```

## 安装 SASS
弹出项目后，项目中会多出一个 `config` 文件夹。
SASS 预编译器只会在编译时运行而不是在运行时，所以我们需要使用 `--dev` 选项来保存它。

```
yarn add sass-loader node-sass --dev
```

## 修改 Webpack 配置
找到文件 `config/webpack.config.dev.js`。

```javascript
{
  test: /\.css$/,
  ...
```

找到该 CSS 规则代码块，下它的后方插入如下的规则代码块。

```javascript
{
  test: /\.scss$/,
  use: [
    {
      loader: require.resolve('style-loader'),
    },
    {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 1,
      }
    },
    {
      loader: require.resolve('sass-loader'),
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          autoprefixer({
            browsers: [
              '>1%',
              'last 4 versions',
              'Firefox ESR',
              'not ie < 9',
            ],
            flexbox: 'no-2009',
          }),
        ],
      },
    },
  ]
},
```

你可能会觉得在 SCSS 规则中加入了 `css-loader` 会很奇怪，这是因为必须让 webpack 能够正确处理在 SCSS 文件被编译后的 CSS 代码。

最后找到 `config/webpack.config.prod.js` 文件，也进行同样的处理，这是因为我们也需要在生产环境中正确处理 SCSS 文件。