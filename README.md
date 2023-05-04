# react-crx

基于React+Antd开发Chrome Extension的项目Demo

本项目架构实现了以下功能：

- 集成Stylus
- 集成React+Ant Design
- 集成mock.js
- 集成react-router-dom
- 实现Ant Design按需加载
- 将popup、content、background目录互相独立，便于团队协作开发维护
- 按照Chrome Extension最终生成目录要求配置webpack
- 封装axios，可以将API请求委托给background script执行，从而实现跨域请求
- 设置.env.development环境变量，便于在开发环境下禁止委托background script发起请求
- 实现了popup、content、background简单Demo

## 教程

##### 核心配置文件 manifest.json 解释

```json
{
  // 插件的基本信息（名称、版本号、描述信息）
  "name": "Chrome插件Demo",
  "version": "1.0",
  "description": "React开发chrome插件Demo。",
   // 插件的图标
  "icons": {
    "16": "images/icon.png",
    "48": "images/icon.png",
    "128": "images/icon.png"
  },
  // 这里必须设置为2
  "manifest_version": 2,
  // 需要注意的是，page_action 字段中的配置会在访问到特定页面时才会生效，因此如果需要在所有页面上展示图标，可以使用 browser_action 字段。同时，使用 page_action 字段时需要在 permissions 字段中添加 "activeTab" 权限，以便扩展可以访问当前标签页的信息。
  "page_action": {
    "default_icon": "images/icon.png",
    "default_title": "React CRX",
    "default_popup": "index.html"
  },
  "background": {
    "scripts": [
      "static/js/background.js"
    ],
    // 表示后台脚本是否持久运行。
	// 如果将 persistent 设置为 true，则表示后台脚本将一直运行，直到扩展被禁用或卸载。这对于需要一直运行的任务非常有用，例如截存当前标签页的屏幕截图或者监控操作等。
	// 如果将 persistent 设置为 false（默认值），则表示后台脚本将会在脚本完成任务后自动终止。这种情况适用于一些简单的任务，例如捕捉网页的点击事件或者查找当前标签页的 DOM 节点。
    "persistent": false,
    "run_at": "document_idle"
  },
  "content_scripts": [
    {
      // 匹配的网址，可以是具体的 URL 或者符合某个模式的 URL,这里设置为所有地址
      "matches": [
        "<all_urls>"
      ],
      // 注入的css
      "css": [
        "static/css/content.css"
      ],
      // 注入的js
      "js": [
        "static/js/content.js",
        "insert.js"
      ],
      // 内容脚本的注入时机，可以分为 document_start、document_end 和 document_idle 三种状态，默认为 document_idle。  
      "run_at": "document_end"
    }
  ],
  // 说明扩展需要使用的浏览器 API 和访问的资源范围等权限。
  "permissions": [
    "tabs",
    "declarativeContent",
    "storage",
    "notifications",
    "windows",
    "chrome.runtime.sendMessage",
    "http://*/*",
	  "https://*/*",
    "*://*/*"
  ],
  // 指定扩展中可以被网页访问的资源（例如图片、字体、样式表等）。
  "web_accessible_resources": ["insert.js"]
}
```

##### 核心三部分

1. Popup：弹出式窗口，是浏览器用户与插件交互的主要窗口，通常在插件按钮旁边单击时出现，允许插件提供交互性的用户界面。
2. Content Script：内容脚本，用于操作网站（例如修改 DOM 元素、注入 JavaScript、添加 CSS 等），允许插件对网站进行操作和修改，但不能访问 Chrome 扩展 API。
3. Background Script：后台脚本，允许插件对浏览器进行更高级的管理（例如监听地址变化、处理请求、管理本地存储等），提供用于在后台 No Window 的环境中执行的 API，但无法访问网页的DOM元素。

##### 特殊文件说明

1. insert.js 是插入到浏览器中执行的代码

## 安装

执行npm install或cnpm install安装依赖。

## 开发调试

执行：
```javascript
npm run start
```

即可在开发环境预览调试popup页面

如果需要在开发环境预览调试content script，

修改src/popup/index.js

引入content script
```javascript
    import React, { Fragment } from 'react'
    import './popup.styl'
	// 引入content script
+   import '@/content' 
```

## build项目

执行：
```javascript
npm run build
```
即可生成最终Chrome Extension文件。

### svg组件说明

1. 安装 babel-plugin-named-asset-import 插件

2. 安装 @svgr/webpack 依赖 webpack loader

3. webpack.config.js 中配置

   ```javascript
   plugins: [
     [
       require.resolve('babel-plugin-named-asset-import'),
       {
         loaderMap: {
           svg: {
             ReactComponent:
               '@svgr/webpack?-svgo,+titleProp,+ref![path]',
           },
         },
       },
     ],
   ],
   ```

   

4. 组件如何去使用

   ```javascript
   // 导入并重命名组件名称
   import { ReactComponent as Logo } from './svg/logo.svg';
   
   // 在组件中使用
   function Demo() {
       return (
           <div>
           	<Logo />
   		</div>
       )
   }
   
   ```

   

## 简化build文件

build生成的最终文件，对于插件来说，有很多是不必要的。

可删除以下文件：
```javascript
    ├─ /images
    ├─ /static
    |  ├─ /css
    |  |  ├─ content.css
-   |  |  ├─ content.css.map
    |  |  ├─ main.css
-   |  |  └─ main.css.map
    |  ├─ /js
    |  |  ├─ background.js
-   |  |  ├─ background.js.LICENSE.txt
-   |  |  ├─ background.js.map
    |  |  ├─ content.js
-   |  |  ├─ content.js.LICENSE.txt
-   |  |  ├─ content.js.map
    |  |  ├─ main.js
-   |  |  ├─ main.js.LICENSE.txt
-   |  |  └─ main.js.map
-   ├─ asset-manifest.json
    ├─ favicon.ico
    ├─ index.html
    ├─ insert.js
    ├─ manifest.json
-   ├─ precache-manifest.xxxxxxx.js
-   ├─ service-worker.js
```
