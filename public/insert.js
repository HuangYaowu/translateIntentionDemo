window.onload = () => {
  // onselectionchange
  document.onmouseup = (event) => {
    filterClickDom(event)
  }

  // 处理点击插件本身的情况
  function filterClickDom(event) {
    const node = event.target
    const result = getParent(node)
    function getParent(node) {
      const idName = node.id
      if (idName) {
        if (idName.indexOf('CRX-container') !== -1) {
          return true
        }
      }
      if (node.parentNode) {
        return getParent(node.parentNode)
      }
    }
    if (!result) {
      handleSelection(event, null)
    }
  }

  // 处理网页中嵌套iframe的情况
  function checkIframeLoaded() {
    const iframeList = document.querySelectorAll('iframe')
    const length = iframeList && iframeList.length
    if (length) {
      for (let i = 0; i < length; i++) {
        const iframeDocument = iframeList[i].contentDocument || iframeList[i].contentWindow.document
        const head = iframeDocument.querySelector('html head')
        const body = iframeDocument.querySelector('html body')
        if (head && body) {
          const headChild = head.childNodes || []
          const bodyChild = body.childNodes || []
          if (headChild.length && bodyChild.length) {
            iframeDocument.onmouseup = (event) => {
              console.log('event 触发了')
              handleSelection(event, iframeDocument)
            }
          } else {
            openTimeout(300)
          }
        }
      }
    } else {
      openTimeout(300)
    }
  }
  checkIframeLoaded()

  // 这里需要定时器再去递归调用获取一次，不然取不到，暂时没有更好的办法
  function openTimeout(delay) {
    setTimeout(() => {
      checkIframeLoaded()
    }, delay)
  }

  /**
   * 
   * @param {*} event 事件对象
   * @param {*} iframeDom iframe文档需要传递当前iframe文档对象
   * @returns 
   */
  function handleSelection(event, iframeDom) {
    console.log('event', event)
    // 获取用户选中的文本范围,传参
    let selection = {}
    if (iframeDom) {
      selection = iframeDom.getSelection()
    } else {
      selection = window.getSelection()
    }
    console.log('selection', selection)
    // 判断选区的起始点和终点是否在同一个位置
    const isCollapsed = selection.isCollapsed
    // TODO 这个值有时候需要点两次才能获取到最新的值？？
    const type = selection.type
    // 区分表单还是普通文本
    let rangeContent = ''
    // 为 type === Range 表示选中内容，其它类型都是没有选中内容
    if (type === 'Range') {
      // true表示表单的选中，false表示文本的选中
      if (isCollapsed) {
        const anchorNode = selection.anchorNode
        const childNodes = anchorNode && anchorNode.childNodes
        const length = childNodes && childNodes.length
        if (length) {
          // 表单元素的类型大致为这两类
          const formElement = ['INPUT', 'TEXTAREA']
          let element = null
          for (let i = 0; i < length; i++) {
            const nodeName = childNodes[i].nodeName
            let flag = formElement.includes(nodeName)
            if (flag) {
              element = childNodes[i]
              // 中止不必要的循环
              break
            }
          }
          // 获取到表单的value值，通过选中区间的开始位和结束位截取出来对应的内容
          if (element) {
            const anchorChildVal = element.value
            const start = element.selectionStart
            const end = element.selectionEnd
            rangeContent = anchorChildVal.substring(start, end)
          }
        }
      } else {
        // 兼容处理，火狐浏览器下会存在大于1的情况，其它浏览器都是1，ie暂不处理
        const rangeCount = selection.rangeCount
        if (rangeCount > 0) {
          for (let i = 0; i < rangeCount; i++) {
            rangeContent += selection.getRangeAt(i).toString()
          }
        } else {
          rangeContent = ''
        }
      }
    } else {
      rangeContent = ''
    }
    // 获取文档的宽高
    const documentElement = document.documentElement
    let documentWidth = 0
    let documentHeight = 0
    if (documentElement) {
      documentWidth = documentElement.clientWidth
      documentHeight = documentElement.clientHeight
    }
    // 获取window窗口宽高
    let pageWith = window.innerWidth 
    let pageHeight = window.innerHeight
    // 计算滚动条
    let scrollWidth = 0
    let scrollHeight = 0
    if (documentWidth || documentWidth == 0) {
      scrollWidth = parseInt(pageWith - documentWidth)
    }
    if (documentHeight || documentHeight == 0) {
      scrollHeight = parseInt(pageHeight - documentHeight)
    }
    // 鼠标坐标、页面宽高的相关信息
    const pageMouseInfo = {
      // 鼠标坐标
      x: event.clientX,
      y: event.clientY,
      // 窗口相关
      pageWith,
      pageHeight,
      // 文档相关
      documentWidth,
      documentHeight,
      // 滚动条相关
      scrollWidth,
      scrollHeight
    }
    console.log('发送参数', rangeContent, pageMouseInfo)
    sendChromeExtension(rangeContent, pageMouseInfo)
  }

  /**
   * 将数据发送到插件的 background 模块
   * @param {*} rangeContent 选中的文本内容
   * @param {*} pageMouseInfo 页面宽高，鼠标坐标位置信息
   * @returns 
   */
  function sendChromeExtension(rangeContent, pageMouseInfo) {
    // 判断浏览器方法是否存在
    if (window.chrome && window.chrome.runtime) {
      // 向 content-script 发送获取到的文本范围
      const params = {
          from: 'web',
          rangeContent,
          pageMouseInfo
      }
      window.chrome.runtime.sendMessage(params)
    }
  }
}
