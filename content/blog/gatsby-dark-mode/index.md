---
title: "给 Gatsby 添加暗黑模式"
date: "2019-10-16T15:58:06.692Z"
description: "我们之前在 CSS-Tricks 就已经了解过 React Hooks。我有 一篇文章 介绍它们，来说明如何使用它们通过函数来创建组件。这两篇文章都大概地介绍了它们的运作方式，但也开辟了很多可能性。"
---

最近无论是 Native APP 还是 Web APP，似乎都掀起了暗黑模式（Dark Mode）的潮流。似乎好像哪家不出暗黑模式，就落伍了一样。

最近 V2EX 也悄悄的添加了暗黑模式的功能，Overreacted（我个人很喜欢的一个技术博客）同样也有，于是我在想是不是也给自己的博客加一个暗黑模式的功能呢？

首先，暗黑模式和普通模式其实就是两套样式的切换，由一个状态来控制，并且给一个顶层的元素设置对应的类。其次，我们希望这个状态是持久性的，并不希望在暗黑模式下刷新就立刻回到普通模式了。

然后最好可以将这个状态和修改这个状态的方法可以传递给任何组件进行复用，这时候 React Hooks 就特别适合这个场景，可以将这个逻辑抽象成一个 Custom Hook 传递给任何函数组件。

所以大概就有这么几点工作要做：

* 编写两种模式下的样式。

* 需要维护一个状态来表示暗黑模式是否开启。

* 这个状态需要持久化。

* 使用 React Hooks 对逻辑进行抽象。

### 样式处理

暗黑模式和普通模式说白了就是两个主题，想起以前使用 AntD 的时候，可以通过 Less-Loader 的 modifyVars 进行配置，从而改变主题的配色，在这里也是同样的思路，只不过因为 Gatsby 没必要上 Less，这边就直接使用 CSS Variables 来处理了。

只需要定义两套主题色，举例如下：

```css
body {
  --blue2: #d6e4ff;
  --blue4: #85a5ff;
  --blue6: #2f54eb;
  --blue8: #10239e;
  --blue10: #030852;
}

body.light {
  --bg: #ffffff;
  --header: var(--blue6);
  --textNormal: #222;
  --textTitle: #222;
  --textLink: var(--blue6);
}

body.dark {
  --bg: #263444;
  --header: var(--blue4);
  --textNormal: #9caec7;
  --textTitle: #d1d5d9;
  --textLink: var(--blue4);
}
```

接下来就只需要对 body 元素设置对应的类名就可以了。（当然每个组件的样式也都需要进行处理）

### useDarkMode

首先我们需要维护一个状态，这里可以直接使用 `useState` 来生成，而且需要传入一个默认值。因为这个数据需要让它做到持久化，所以初始状态可以直接从 localStorage 中取出。

```javascript
 const defaultMode = useMemo(() => {
 	try {
 		return window.localStorage.getItem('mode') || 'light'
 	} catch (err) {
 		return 'light'
 	}
 }, [])
 
 const [darkMode, setDarkMode] = useState(defaultMode)
```

defaultMode 这边使用了 `useMemo` 进行缓存，因为我们不需要它去重复获取。

通过 `useState` 获取到状态之后，接下来就需要实现根据状态对节点设置类的功能。

```javascript
const effectBodyClass = useCallback(
	mode => {
		const classList = document.querySelector('body').classList
	if (mode === 'light') {
		classList.add(lightClassName)
		classList.remove(darkClassName)
	} else {
		classList.add(darkClassName)
		classList.remove(lightClassName)
	}
}, [lightClassName, darkClassName])
```

实现代码很简单，无非就是通过调用 DOM API 来增删对应的类名，不过这个函数也可以使用 `useCallback` 进行缓存。

然后在首次调用的时候需要执行这个函数来设置初始显示模式。

```javascript
useEffect(() => {
	effectBodyClass(defaultMode)
}, [])
```

有了状态，还需要有一个修改状态的逻辑，在 `setDarkMode` 的基础上需要加入持久化的逻辑，并且应用对应的类。

```javascript
const toggleDarkMode = (mode) => {
	setDarkMode(mode)
	if (typeof window !== 'undefined') {
		window.localStorage.setItem('mode', mode)
	}
	effectBodyClass(mode)
}
```

最后将 `darkMode` 和 `toggleDarkMode` 的值进行返回。

```javascript
return {
	darkMode,
	toggleDarkMode,
}
```

这样一个基本的实现暗黑模式切换的 Hook 就实现完成了，使用起来也十分简单，如下示例：

```jsx
const { darkMode, toggleDarkMode } = useDarkMode()
const isChecked = useMemo(() => {
  return darkMode === 'dark'
}, [darkMode])

const handleToggleDarkMode = useCallback(event => {
  const checked = event.target.checked
  const updatedMode = checked ? 'dark' : 'light'
  toggleDarkMode(updatedMode)
}, [toggleDarkMode])

return (
  <div style={{height: 24}}>
    <Toggle checked={isChecked} onChange={handleToggleDarkMode} icons={{ checked: <Moon />, unchecked: <Sun /> }}/>
  </div>
)
```



### 不足

这次暗黑模式的实现在使用过程中发现了以下不足：

1. 如果在暗黑模式下进行刷新，页面加载完毕后会有一段很短的时间显示普通模式。
2. 还未考虑 Gatsby 的服务端渲染模式。

第一个方案暂时已经有了头绪，是因为第一次是通过 `useEffect` 来执行类的修改，所以必须要等到组件挂载之后才会执行，所以从**组件挂载后**到**类名修改完毕前**的这段时间内会出现通过默认样式进行渲染的问题。

所以必须在**挂载组件的时候**就让这个类名设置正确。

第二个问题暂时还没有头绪，还需要多看看文档。