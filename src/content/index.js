import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import MainModal from './components/mainModal'
import './content.styl'

function Content() {
    // 控制图标的显隐
    const [iconVisible, setIconVisible] = useState(false)
    // 控制子组件的显隐
    const [mainModalVisiable, setMainModalVisiable] = useState(false)
    // 用户选中的内容文本
    const [rangeContent, setRangeContent] = useState('')
    // 用户操作的页面鼠标信息
    const [pageMouseInfo, setPageMouseInfo] = useState({})
    // 最终的坐标信息
    const [finalCoordinate, setFinalCoordinate] = useState({ x: 0, y: 0})

    function handleMessage(request, sender, sendResponse) {
        // 每次监听完要销毁
        if (window.chrome.runtime) {
            window.chrome.runtime.onMessage.removeListener(handleMessage)
        }
        // 接收来自background模块的内容
        if (request.from === 'background' && request.rangeContent) {
            console.warn('content模块收到信息', request)
            setPageMouseInfo(request.pageMouseInfo)
            setIconVisible(true)
            setRangeContent(request.rangeContent)
            setMainModalVisiable(false)
        } else {
            setIconVisible(false)
            setMainModalVisiable(false)
        }
        return true
    }
    if (window.chrome.runtime) {
        window.chrome.runtime.onMessage.addListener(handleMessage)
    }

    // 选中的文本内容发生变化
    useEffect(() => {
        const CRXcontent = document.querySelector('.CRX-content')
        const contentEntry = CRXcontent.querySelector('.content-entry')
        if (contentEntry) {
            // 图标的高宽
            const iconDomWt = contentEntry.clientWidth
            const iconDomHt = contentEntry.clientHeight
            // 坐标，文档参数
            const { x, y, documentWidth, documentHeight } = pageMouseInfo
            // 最大文档宽高
            const maxWidth = documentWidth - iconDomWt
            const maxHeight = documentHeight - iconDomHt
            // 计算是否超出边界
            const diffWidth = Math.max(maxWidth, x)
            const diffHeight = Math.max(maxHeight, y)
            // 如果超过边界值，则位置为最大边界值
            let finalX = 0
            let finalY = 0
            if (diffWidth == x) {
                finalX = maxWidth
            } else {
                const calcWt = x + iconDomWt
                if (calcWt >= maxWidth) {
                    finalX = maxWidth
                } else {
                    finalX = calcWt
                }
            }
            // 如果超过边界值，则位置为最大边界值
            if (diffHeight == y) {
                finalY = maxHeight
            } else {
                const calcHt = y + iconDomHt
                if (calcHt >= maxHeight) {
                    finalY = maxHeight
                } else {
                    finalY = calcHt
                }
            }
            contentEntry.style.left = finalX + 'px'
            contentEntry.style.top = finalY + 'px'
            const finalObj = Object.assign({}, finalCoordinate, { x: finalX, y: finalY })
            setFinalCoordinate(finalObj);
        }
        console.warn('监听icon容器', contentEntry)
    }, [rangeContent])
    return (
        <div className="CRX-content">
            {iconVisible ? (
                <div
                    className="content-entry"
                    onMouseEnter={() => setMainModalVisiable(true)}
                    onMouseLeave={() => setIconVisible(false)}
                ></div>
            ) : null}
            {mainModalVisiable ? (
                <MainModal
                    rangeContent={rangeContent}
                    pageMouseInfo={pageMouseInfo}
                    finalCoordinate={finalCoordinate}
                    onClose={() => {
                        setMainModalVisiable(false)
                    }}
                />
            ) : null}
        </div>
    )
}

const app = document.createElement('div')
app.id = 'CRX-container'
document.body.appendChild(app)

ReactDOM.render(<Content />, app)

