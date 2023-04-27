import React, { Fragment } from 'react'
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom'
import Login from './pages/login'
import './popup.styl'
// 本地调试 content script 时开启
// import '@/content'
function Popup() {
    return (
        <Fragment>
            <HashRouter>
                <Switch>
                    <Route path="/login" component={Login} />
                    <Redirect to={'/login'} />
                </Switch>
            </HashRouter>
        </Fragment>
    )
}

export default Popup
