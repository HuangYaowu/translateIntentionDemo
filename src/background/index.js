import { apiRequest } from '@/api'

/*global chrome*/
chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            // 运行插件运行的页面URL规则
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({ pageUrl: {  }}),
            ],
            actions: [new window.chrome.declarativeContent.ShowPageAction()]
        }])
    })
})

// 这是用来接收需要触发代理请求的
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // 接受来自content-script的消息，requset里不允许传递function类型的参数
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        const { contentRequest } = request
        // 接收来自content的api请求
        if (contentRequest === 'apiRequest') {
            let { config } = request
            // API请求成功的回调
            config.success = (data) => {
                data.result = 'succ'
                sendResponse(data)
            }
            // API请求失败的回调
            config.fail = (msg) => {
                sendResponse({
                    result: 'fail',
                    msg
                })
            }
            // 发起请求
            apiRequest(config)
        }
    })
    return true
})

// 获取当前选项卡ID
function getCurrentTabId(callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if(callback) callback(tabs.length ? tabs[0].id: null);
    });
}
// 注入js文件，处理web页面事件
getCurrentTabId(tabId => {
    chrome.tabs.executeScript(tabId, {file: 'insert.js'})
});

if (chrome.runtime) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log('background 的 onMessage', request);
        // 接收web页面发送过来的信息
        if (request.from === 'web') {
            console.log('background收到的数据', request)
            // 通过tabid，发送到指定content script
            getCurrentTabId(tabId => {
                chrome.tabs.sendMessage(tabId, {
                    from: 'background',
                    rangeContent: request.rangeContent,
                    pageMouseInfo: request.pageMouseInfo
                })
            });
        }
        return true
    })
}

