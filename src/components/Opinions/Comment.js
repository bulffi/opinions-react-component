/* eslint-disable */
import React from 'react';
import axios from 'axios'
import {message, Form, Input, Button, Row, Col, Space} from 'antd'
import 'antd/dist/antd.css'
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/index.css'

export default class Comment extends React.Component{

    render() {
        const editorControls = ['bold', 'italic', 'underline', 'strike-through', 'emoji','list-ul','list-ol','code','remove-styles']
        return(
            <div>
                <div style={{borderStyle: 'solid', borderWidth: '1px', borderColor: '#F0F0F0'}}>
                    <BraftEditor
                        controls={editorControls}
                        value={this.props.editorState}
                        onChange={this.props.handleEditorChange}
                        onSave={this.props.handleEditorSave}
                        language={'en'}
                        fontSizes={10}
                        placeholder={'What do you think?'}
                        contentStyle={{height:'auto'}}
                    />
                </div>
                <div style={{height: '20px'}} />
                <div>
                    <Form
                        layout={'inline'}
                        name="basic"
                        initialValues={{
                            remember: true,
                        }}
                        onFinish={this.props.onFinish}
                        onFinishFailed={this.props.onFinishFailed}
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    type: 'email',
                                    message: 'Please enter your email correctly :)',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter your name :)',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        )
    }
}