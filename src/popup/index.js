import React, { Fragment } from 'react'
import './popup.styl'
// 本地调试 content script 时开启
// import '@/content'
function Popup() {
    return (
        <Fragment>
            <div className="FF-header">chrome插件demo</div>
			<div className='FF-main'>
				<p>基于react+antd框架</p>
				<p>ffbot转写文本意图</p>
			</div>
        </Fragment>
    )
}

export default Popup
