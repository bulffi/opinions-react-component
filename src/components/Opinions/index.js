/* eslint-disable */
import React from 'react';
import axios from 'axios'
import Comment from './Comment'
import {message, Card, Row, Col, Drawer,} from 'antd'
import 'antd/dist/antd.css'
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/index.css'
import 'braft-editor/dist/output.css'
import Divider from "antd/es/divider";

const OpenCommentAPI = 'http://127.0.0.1:3000/open/comment'


export default class Opinions extends React.Component {

    componentDidMount() {
        axios.get( OpenCommentAPI,
        {
            params: {
                url: window.location.href,
                pageSize: 10
            }
        }
        ).then(
             (response) => {
                const data = response.data
                this.setState({
                    ...this.state,
                    comments: data.message
                })
            }
        ).catch(
            function (errorMessage) {
                console.log(errorMessage)
            }
        )
    }

    state = {
        editorState: BraftEditor.createEditorState(null),
        subEditorState: BraftEditor.createEditorState(null),
        comments: [],
        subComments: [],
        visible: false,
        currentFatherID: null
    }

    getSubComment = (fatherID) => {
        axios.get(OpenCommentAPI,
            {
                params: {
                    url: window.location.href,
                    pageSize: 10,
                    fatherID,
                }
            }
        ).then(
            (response) => {
                const data = response.data
                this.setState({
                    ...this.state,
                    currentFatherID: fatherID,
                    subComments: data.message
                })
            }
        ).catch(
            function (errorMessage) {
                console.log(errorMessage)
            }
        )
    }

    openSubComment = (fatherID) => {
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
        const contentInRAW = this.state.editorState.toRAW()
        const {email, name} = values
        console.log(email, name)
        axios.post(OpenCommentAPI, {
            content: contentInRAW,
            url: window.location.href,
            authorName: name,
            email: email
        }, {
            params: {
                AppKey: this.props.AppKey
            }
        }).then(
            () => message.success('Please wait for admission :)')
        ).catch(
            () => message.error('Comment failed :(')
        )
    };

    onFinishFailed = errorInfo => {
        message.error(errorInfo)
    };

    onClose = () => {
        this.setState({
            ...this.state,
            visible: false,
        });
    };

    handleSubEditorChange = (editorState) => {
        this.setState({...this.state, subEditorState:editorState})
    }
    handleSubEditorSave = () => {
        message.success(' Your comment is saved locally')
    }
    onSubCommentFinish = (values) => {
        const subCommentInRAW = this.state.subEditorState.toRAW()
        const {email, name} = values
        axios.post(OpenCommentAPI, {
            content: subCommentInRAW,
            url: window.location.href,
            authorName: name,
            email,
            FatherID: this.state.currentFatherID
        }, {
            params: {
                AppKey: this.props.AppKey
            }
        }).then(
            () => message.success('Please wait for admission :)')
        ).catch(
            () => message.error('Comment failed :(')
        )
    }
    onSubFinishFail = (err) => {
        message.error(err)
    }




    render() {
        return(
            <div>
                <Row>
                    <Col span={6} />
                    <Col span={12}>
                        <Comment editorState={this.state.editorState} handleEditorChange={this.handleEditorChange} handleEditorSave = {this.handleEditorSave} onFinish={this.onFinish} onFinishFailed={this.onFinishFailed}/>
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
                            <Comment editorState={this.state.subEditorState} handleEditorChange={this.handleSubEditorChange} handleEditorSave = {this.handleSubEditorSave} onFinish={this.onSubCommentFinish} onFinishFailed={this.onSubFinishFail}/>
                            <div style={{height: '40px'}}/>
                            <Divider>Sub Comments</Divider>
                            {this.state.subComments.map(((value, index) => {
                                return (
                                    <div key={index} style={{marginBottom: '10px'}}>
                                        <Card
                                            style={{ width: '100%' }}
                                            title={value.authorName}
                                        >
                                            <div className="braft-output-content" dangerouslySetInnerHTML={{__html: BraftEditor.createEditorState(value.Content).toHTML()}}/>
                                        </Card>
                                    </div>

                                )
                            }))}
                        </Drawer>
                        {this.state.comments.map(((value, index) => {
                            return (
                                <div key={index} style={{marginBottom: '10px'}}>
                                    <Card
                                        style={{ width: '100%' }}
                                        title={value.authorName}
                                        extra={<a onClick={()=> this.openSubComment(value.CommentId)}>View Sub Comment</a>}
                                    >
                                        <div className="braft-output-content" dangerouslySetInnerHTML={{__html: BraftEditor.createEditorState(value.Content).toHTML()}}/>
                                    </Card>
                                </div>
                            )
                        }))}
                    </Col>
                    <Col span={6}/>
                </Row>

            </div>
        )
    }
}