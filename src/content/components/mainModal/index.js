import React, { useState, useEffect } from 'react'
import { Button, Input }  from 'antd'
import './mainModal.styl'
import { apiReqs } from '@/api'
const { TextArea } = Input

function MainModal(props) {
    // 用户选中的文本内容
    const [userContent, setUserContent] = useState('')
    // 将来接口要返回的文本意图
    const [userIntention, setUserIntention] = useState('')

    // 接收父组件传递过来的数据方法
    const { onClose } = props
    // 监听父组件传递的数据
    useEffect(() => {
    }, [props.rangeContent]);

    useEffect(() => {
        const chromeContainer = document.querySelector('.chrome-container')
        console.warn('chromeContainer', chromeContainer)
        if (chromeContainer) {
            // 容器的宽高
            const chromeConWdith = chromeContainer.clientWidth
            const chromeConHeight = chromeContainer.clientHeight
            // 页面鼠标坐标信息
            const { documentWidth, documentHeight } = props.pageMouseInfo
            // 最大文档宽高
            const maxWidth = documentWidth - chromeConWdith
            const maxHeight = documentHeight - chromeConHeight
            // 计算是否超出边界
            const finalX = props.finalCoordinate.x || 0
            const finalY = props.finalCoordinate.y || 0
            const diffWidth = Math.max(maxWidth, finalX)
            const diffHeight = Math.max(maxHeight, finalY)
            // 超出边界处理
            if (diffWidth === finalX) {
                chromeContainer.style.left = maxWidth + 'px'
            } else {
                chromeContainer.style.left = finalX + 'px'
            }

            if (diffHeight === finalY) {
                chromeContainer.style.top = maxHeight + 'px'
            } else {
                chromeContainer.style.top = finalY + 'px'
            }
        }
    }, [props.finalCoordinate]);

    // 下面是自定义事件
    const sendContent = () => {
		// const params = {
		// 	userContent
		// };
        const params = {
            passWord: "c444f787ebd6335c9868297844765245",
            userName: "hyw002",
            agree: "true"
        }
		apiReqs.signIn({
			data: params,
			success: (res) => {
				alert('你好！' + res.data.userName)
			},
			fail: (res) => {
				alert(res)
			}
		})
	}
    
    const handleUserContent = (e) => {
        setUserContent(e.target.value || '')
    }
    // 
    const handleUserIntention = (e) => {
        setUserIntention(e.target.value || '')
    }

    return (
        <div className="chrome-container">
            <div className="header">
                <span>获取文本意图</span>
                <span className='close-btn' onClick={onClose}>x</span>
            </div>
            <div className="main">
                <div className="form">
                    <span>内容：</span>
                    <Input
                        type="text"
                        value={userContent}
                        placeholder="请输入内容"
                        onChange={handleUserContent}
                    />
                </div>
                <Button type="primary" className="send-btn" onClick={sendContent}>发送</Button>
                <div className="separate">下面是返回的意图展示</div>
                <TextArea
                    className='textarea'
                    value={userIntention}
                    readOnly
                    placeholder="返回用户意图"
                    onChange={handleUserIntention}
                />
            </div>
        </div>
    )
}

export default MainModal
