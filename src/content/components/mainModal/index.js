import React, { useState, useEffect } from 'react'
import { Button, Input }  from 'antd'
import { ReactComponent as CloseOutlined } from './close.svg'
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
        setUserContent(props.rangeContent)
    }, [props.rangeContent]);

    useEffect(() => {
        const ffContainer = document.querySelector('.FF-content-modal')
        if (ffContainer) {
            // 容器的宽高
            const chromeConWdith = ffContainer.clientWidth
            const chromeConHeight = ffContainer.clientHeight
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
                ffContainer.style.left = maxWidth + 'px'
            } else {
                ffContainer.style.left = finalX + 'px'
            }

            if (diffHeight === finalY) {
                ffContainer.style.top = maxHeight + 'px'
            } else {
                ffContainer.style.top = finalY + 'px'
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
        <div className="FF-content-modal">
            <div className="header">
                <span>获取文本意图</span>
                <CloseOutlined className='close-btn' onClick={onClose} />
            </div>
            <div className="main">
                <div className="form">
                    <div className="form-item">
                        <span className="label">文本内容：</span>
                        <TextArea
                            className='ff-textarea'
                            value={userContent}
                            placeholder="请输入文本内容"
                            autoSize={{ minRows: 3, maxRows: 3 }}
                            onChange={handleUserContent}
                        />
                    </div>
                    <div className="form-item">
                        <span className="label">文本意图：</span>
                        <TextArea
                            className='ff-textarea'
                            value={userIntention}
                            autoSize={{ minRows: 3, maxRows: 3 }}
                            placeholder="这是文本内容返回用户意图"
                            onChange={handleUserIntention}
                        />
                    </div>
                </div>
                <div className="send-btn-wrap">
                    <Button
                        type="primary"
                        value="small"
                        className="send-btn"
                        onClick={sendContent}
                    >
                        发送
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default MainModal
