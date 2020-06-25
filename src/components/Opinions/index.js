/* eslint-disable */
import React from 'react';
import axios from 'axios'
import Comment from './Comment'
import {message, Card, Row, Col, Drawer, List, Button} from 'antd'
import 'antd/dist/antd.css'
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/index.css'
import 'braft-editor/dist/output.css'
import Divider from "antd/es/divider";

// const OpenCommentAPI = 'http://127.0.0.1:3000/open/comment'
const OpenCommentAPI = 'https://tx2kiq48a2.execute-api.ap-southeast-1.amazonaws.com/Prod/open/comment'
const WhereIsCommenterAPI = ''

export default class Opinions extends React.Component {
    state = {
        editorState: BraftEditor.createEditorState(null),
        subEditorState: BraftEditor.createEditorState(null),
        comments: [],
        subComments: [],
        visible: false,
        currentFatherID: null,
        mainListLoading: false,
        subListLoading: true,
        mainSubmit: false,
        subSubmit: false,
        noMoreMainComment: true,
        noMoreSubComment: true,
        mainCommentLastId: '',
        subCommentLastId: '',
        mainMoreLoading: false,
        subMoreLoading: false
    }
    onLoadMore = async() => {
        await this.setState({...this.state, mainMoreLoading: true})
        axios.get(OpenCommentAPI,
            {
                params: {
                    url: window.location.href,
                    appKey: this.props.AppKey,
                    pageSize: this.props.pageSize,
                    lastID: this.state.mainCommentLastId,
                    userId:this.props.userId
                }
            }).then((response) => {
                message.success('Loading success')
                const newList = response.data.message
                if (newList.length === 0) {
                    this.setState({...this.state,
                        noMoreMainComment: true,
                        mainMoreLoading: false
                    })
                    return
                }
                let oldList = [...this.state.comments]
                oldList = oldList.concat(newList)
                this.setState({...this.state,
                    comments: oldList,
                    noMoreMainComment: newList.length < this.props.pageSize,
                    mainCommentLastId: newList[newList.length - 1].CommentId,
                    mainMoreLoading: false
                })
        }).catch((err) => {
            message.error('Loading fail')
            this.setState({
                ...this.state,
                mainMoreLoading: false
            })
        })
    }

    onLoadMoreSub = (fatherID) => {
        this.setState({...this.state, subMoreLoading: true})
        axios.get(OpenCommentAPI,
            {
                params: {
                    url: window.location.href,
                    appKey: this.props.AppKey,
                    pageSize: this.props.pageSize,
                    lastID: this.state.subCommentLastId,
                    fatherID: this.state.currentFatherID,
                    userId:this.props.userId
                }
            }).then((response) => {
            message.success('Loading success')
            const newList = response.data.message
            if (newList.length === 0) {
                this.setState({...this.state,
                    noMoreSubComment: true,
                    subMoreLoading: false
                })
                return
            }
            let oldList = [...this.state.subComments]
            oldList = oldList.concat(newList)
            this.setState({...this.state,
                subComments: oldList,
                noMoreSubComment: newList.length < this.props.pageSize,
                subCommentLastId: newList[newList.length - 1].CommentId,
                subMoreLoading: false
            })
        }).catch((err) => {
            message.error('Loading fail')
            this.setState({
                ...this.state,
                subMoreLoading: false
            })
        })

    }
    componentDidMount() {
        this.setState({...this.state, mainListLoading: true})
        axios.get( OpenCommentAPI,
        {
            params: {
                url: window.location.href,
                appKey: this.props.AppKey,
                pageSize: this.props.pageSize,
                userId:this.props.userId
            }
        }
        ).then(
             (response) => {
                message.success('Loading success')
                const data = response.data
                if (data.message.length === 0) {
                    this.setState({
                        ...this.state,
                        comments: data.message,
                        mainListLoading: false,
                        noMoreMainComment: false
                    })
                    return
                }
                this.setState({
                    ...this.state,
                    comments: data.message,
                    mainListLoading: false,
                    mainCommentLastId: data.message[data.message.length - 1].CommentId,
                    noMoreMainComment: data.message.length < this.props.pageSize
                })
            }
        ).catch(
             (errorMessage) => {
                message.error('Loading comment fail')
                this.setState({... this.state, mainListLoading: false})
                console.log(errorMessage)
            }
        )
    }

    getSubComment = (fatherID) => {
        axios.get(OpenCommentAPI,
            {
                params: {
                    url: window.location.href,
                    appKey: this.props.AppKey,
                    pageSize: this.props.pageSize,
                    fatherID,
                    userId:this.props.userId,
                }
            }
        ).then(
            (response) => {
                message.success('Loading success')
                const data = response.data
                if (data.message.length === 0) {
                    this.setState({
                        ...this.state,
                        currentFatherID: fatherID,
                        subComments: data.message,
                        subListLoading: false,
                        noMoreSubComment: true
                    })
                    return
                }
                this.setState({
                    ...this.state,
                    currentFatherID: fatherID,
                    subComments: data.message,
                    subListLoading: false,
                    subCommentLastId: data.message[data.message.length - 1].CommentId,
                    noMoreSubComment: data.message.length < this.props.pageSize
                })
            }
        ).catch(
             (errorMessage) => {
                 message.error('Loading fail')
                 console.log(errorMessage)
                 this.setState({...this.state, subListLoading: false})
            }
        )
    }

    openSubComment = (fatherID) => {
        this.setState({...this.state, subListLoading: true, currentFatherID: fatherID})
        this.getSubComment(fatherID)
        this.setState({...this.state, visible:true})
    }

    handleEditorChange = (editorState) => {
        this.setState({...this.state, editorState })
    }
    handleEditorSave =  () => {
        message.success('Your comment is saved locally')
    }
    onFinish = (values) => {
        // submit the comment to lambda
        this.setState({...this.state, mainSubmit: true})
        const contentInRAW = this.state.editorState.toRAW()
        const {email, name} = values
        console.log(email, name)
        // axios.post(WhereIsCommenterAPI, {
        //     userID: this.props.userId
        // }).then(
        //     () => {
        //         console.log('API Where Is OK')
        //     }
        // ).catch(
        //     (error)=>{
        //         console.log(error)
        //     }
        // )
        axios.post(OpenCommentAPI, {
            content: contentInRAW,
            url: window.location.href,
            authorName: name,
            email: email,
        }, {
            params: {
                AppKey: this.props.AppKey,
                userId:this.props.userId
            }
        }).then(
            () => {
                message.success('Please wait for admission :)')
                this.setState({...this.state, mainSubmit: false})
            }
        ).catch(
            () => {
                message.error('Comment failed :(')
                this.setState({...this.state, mainSubmit: false})
            }
        )
    };

    onFinishFailed = errorInfo => {
        message.error(errorInfo)
    };

    onClose = () => {
        this.setState({
            ...this.state,
            visible: false,
            subListLoading: true
        });
    };

    handleSubEditorChange = (editorState) => {
        this.setState({...this.state, subEditorState:editorState})
    }
    handleSubEditorSave = () => {
        message.success(' Your comment is saved locally')
    }
    onSubCommentFinish = (values) => {
        this.setState({...this.state, subSubmit: true})
        const subCommentInRAW = this.state.subEditorState.toRAW()
        const {email, name} = values
        // axios.post(WhereIsCommenterAPI, {
        //     userID: this.props.userId
        // }).then(
        //     () => {
        //         console.log('API Where Is OK')
        //     }
        // ).catch(
        //     (error)=>{
        //         console.log(error)
        //     }
        // )
        axios.post(OpenCommentAPI, {
            content: subCommentInRAW,
            url: window.location.href,
            authorName: name,
            email,
            FatherID: this.state.currentFatherID
        }, {
            params: {
                AppKey: this.props.AppKey,
                userId:this.props.userId
            }
        }).then(
            () => {
                message.success('Please wait for admission :)')
                this.setState({...this.state, subSubmit: false})
            }
        ).catch(
            () => {
                message.error('Comment failed :(')
                this.setState({...this.state, subSubmit: false})
            }
        )
    }
    onSubFinishFail = (err) => {
        message.error(err)
    }




    getDateFromId = (id) => {
        let beginIndex = 0
        for (let i = 0; i < 2; i++) {
            let index = id.indexOf('#', beginIndex)
            beginIndex = index + 1
        }
        let endIndex = id.indexOf('#', beginIndex + 1)
        let date = id.substr(beginIndex, (endIndex - beginIndex))
        let dateNum = parseInt(date)
        return new Date(dateNum)
    }

    render() {
        const loadMore =
            !this.state.mainListLoading && !this.state.mainListLoading ? (
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: 12,
                        height: 32,
                        lineHeight: '32px',
                    }}
                >
                    <Button disabled = {this.state.noMoreMainComment} loading={this.state.mainMoreLoading} onClick={this.onLoadMore}>Loading more</Button>
                </div>
            ) : null;

        const subLoadMore =
            !this.state.subListLoading && !this.state.subListLoading ? (
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: 12,
                        height: 32,
                        lineHeight: '32px',
                    }}
                >
                    <Button disabled = {this.state.noMoreSubComment} loading={this.state.subMoreLoading} onClick={this.onLoadMoreSub}>Loading more</Button>
                </div>
            ) : null;

        return(
            <div>
                <Row>
                    <Col span={6} />
                    <Col span={12}>
                        <Comment loading = {this.state.mainSubmit} editorState={this.state.editorState} handleEditorChange={this.handleEditorChange} handleEditorSave = {this.handleEditorSave} onFinish={this.onFinish} onFinishFailed={this.onFinishFailed}/>
                        {/*    display other comment here!*/}
                        <div style={{height: '40px'}}/>
                        <Divider>Comments</Divider>
                        <Drawer
                            title="Sub Comments"
                            placement="right"
                            closable={false}
                            width={'61.8%'}
                            onClose={this.onClose}
                            visible={this.state.visible}
                        >
                            <Comment loading = {this.state.subSubmit} editorState={this.state.subEditorState} handleEditorChange={this.handleSubEditorChange} handleEditorSave = {this.handleSubEditorSave} onFinish={this.onSubCommentFinish} onFinishFailed={this.onSubFinishFail}/>
                            <div style={{height: '40px'}}/>
                            <Divider>Sub Comments</Divider>
                            <List
                                loading = {this.state.subListLoading}
                                itemLayout = "vertical"
                                loadMore = {subLoadMore}
                                dataSource = {this.state.subComments}
                                renderItem = {item => (
                                    <List.Item>
                                        <div style={{marginBottom: '10px'}}>
                                            <Card
                                                style={{ width: '100%' }}
                                                title={
                                                    <div>
                                                        {item.authorName}
                                                        <div style={{fontSize: '10px'}}>{this.getDateFromId(item.CommentId).toDateString()}</div>
                                                    </div>
                                                }
                                            >
                                                <div className="braft-output-content" dangerouslySetInnerHTML={{__html: BraftEditor.createEditorState(item.Content).toHTML()}}/>
                                            </Card>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Drawer>
                        <List
                            loading = {this.state.mainListLoading}
                            itemLayout = "horizontal"
                            loadMore = {loadMore}
                            dataSource = {this.state.comments}
                            renderItem = {item => (
                                <List.Item
                                    actions = {[<a onClick={()=> this.openSubComment(item.CommentId)}>sub-comment</a>]}
                                >
                                    <List.Item.Meta
                                        style={{width: '20px'}}
                                        title={
                                            <div>
                                                {item.authorName}
                                            </div>}
                                        description = {<div style={{fontSize: '10px'}}>{this.getDateFromId(item.CommentId).toDateString()}</div>}
                                    />
                                    <div>
                                        <div className="braft-output-content" dangerouslySetInnerHTML={{__html: BraftEditor.createEditorState(item.Content).toHTML()}}/>
                                    </div>
                                </List.Item>
                            )}
                            />
                    </Col>
                    <Col span={6}/>
                </Row>

            </div>
        )
    }
}