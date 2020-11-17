'use strict';

var _ = require("lodash");
var React = require('react');
var antd = require('antd');
let classnames = require('classnames');
import { Alert, Modal, Button, Form, Input, Cascader,Select, Row, Col, Checkbox, Tooltip, Spin, Icon} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

class CreateUserModal extends React.Component {
  state = {
    info: {
      name:'',
      password:''
    },
    isError: false,
    error: ''
  }
  onInfoChange = function(name, value){
    let editInfo = _.cloneDeep(this.state.info);
    editInfo[name] = value.target.value;
    this.setState({info: editInfo});
  }
  handleOk = (e) => {
    let editInfo = _.cloneDeep(this.state.info);
    // if (!editInfo.name) {
    //   this.setState({
    //     isError: true
    //   });
    //   return;
    // }
    // if (!editInfo.password) {
    //   this.setState({
    //     isError: true
    //   });
    //   return;
    // }
    // this.setState({
    //   isError: false
    // })
    this.props.createUser(editInfo).then(()=>{
      this.props.onHide && this.props.onHide.call({});
      this.setState({
        info:{},
        isError: false,
        error: ''
      });
    }).catch((err) => {
      this.setState({
        error: err.message
      })
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.edit && nextProps.visible) {
      this.setState({
        info: {
          name: nextProps.edit.name,
          password: nextProps.edit.password
        },
        isError: false,
        error: ''
      });
    }
  }
  handleCancel = (e) => {
    this.props.onHide && this.props.onHide.call({});
    this.setState({
      info:{},
      isError: false,
      error: ''
    });
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    let edit = this.props.edit;
    return (
      <div>
        <Modal
          title={edit ? '编辑用户' : '新建用户'}
          visible={this.props.visible}
          onCancel={this.handleCancel}
          footer={
            <div>
              <Button size="large" onClick={this.handleCancel}>取消</Button>
              <Button size="large" onClick={this.handleOk} type="primary">提交</Button>
            </div>
          }
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label="用户名:"
              >
              <Input onChange={this.onInfoChange.bind(this, "name")} value={this.state.info.name}  type="text"/>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="密 码:"
              >
              <Input onChange={this.onInfoChange.bind(this, "password")} value={this.state.info.password} type="password"/>
            </FormItem>
          </Form>
          {this.state.error && <Alert showIcon message={this.state.error} type="error" />}
        </Modal>
      </div>
    );
  }
}
module.exports = CreateUserModal;
