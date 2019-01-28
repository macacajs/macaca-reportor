'use strict';

import React from 'react';
import ReactDom from 'react-dom';

import {
  Affix,
  Progress,
  Icon,
  Card,
  Col,
  Row,
  Layout,
  Radio,
  Empty,
  BackTop,
  Modal,
} from 'antd';

import io from 'socket.io-client';

const Header = Layout.Header;
const Footer = Layout.Footer;
const Content = Layout.Content;
const { Meta } = Card;

import _ from './common/helper';
import Suite from './components/Suite';
import NavBar from './components/NavBar';
import Screen from './components/Screen';

const pkg = require('../package.json')

window.images = [];

require('./app.less');

let container;
const dataAttr = 'data-output';
const configAttr = 'config-output';

class App extends React.Component {

  constructor(props) {
    super(props);
    container = document.querySelector(`#${pkg.name}`);

    const output = JSON.parse(decodeURI(container.getAttribute(dataAttr)));

    let caseShowType = 'tree';
    const hashMode = location.hash.replace('#mode=', '');

    if (hashMode) {
      caseShowType = hashMode;
    } else if (output.stats.failures) {
      caseShowType = 'error';
    }

    this.state = {
      output,
      caseShowType,
      hashError: output.stats.failures,
      images: [],
      modalVisible: false,
      currentModalImage: '',
      currentModalTitle: 'Test Image',
    };
  }

  componentDidMount() {
    this.addImageEvent();

    let timer = setInterval(() => {
      if (window.images) {
        clearInterval(timer)
        this.setState({
          images: window.images
        })
      }
    }, 100);
  }

  addImageEvent() {
    document.body.addEventListener('click', e => {
      const target = e.target;
      const tagName = target.tagName.toUpperCase();
      let href = '';
      let title = '';

      if (tagName === 'IMAGE') {
        href = target.getAttribute('href');
        const titleContainer = target.nextElementSibling;
        title = titleContainer && titleContainer.querySelector('tspan').innerHTML;
      } else if (tagName === 'IMG') {
        href = target.getAttribute('src');
        title = target.getAttribute('data-title');
      }

      if (href && title) {
        this.showModal(href, title);
      }
    }, false);
  }

  showModal(href, title) {
    this.setState({
      modalVisible: true,
      currentModalImage: href,
      currentModalTitle: title || 'Test Image',
    });
  }

  handleModalCancel(e) {
    this.setState({
      modalVisible: false,
    });
  }

  handleRadioChange(e) {
    const radio = e.target.value;
    location.hash = `mode=${radio}`;

    this.setState({
      caseShowType: e.target.value,
    });
  }

  handleOpenImg(e) {
    const href = e.target.src;
    const title = e.target.getAttribute('data-title');
    if (href) {
      this.showModal(href, title)
    }
  }

  renderImages(images) {
    if (this.state.caseShowType !== 'image') {
      return null;
    }

    let imgs = _.uniqBy(images, item => item.src);

    imgs = imgs.filter(img => img.src && !~img.src.indexOf('undefined'));

    let cards = imgs.map((img, index) => {
      return (
        <Col key={ index } span={4} style={{ padding: '5px' }}>
          <Card
            hoverable
            cover={<img onClick={this.handleOpenImg.bind(this)} className="picture-item" src={ img.src } data-title={ img.text } />}
          >
            <Meta
              description={ img.text }
            />
          </Card>
        </Col>
      );
    });

    if (!imgs.length) {
      cards = <Empty />;
    }

    return (
      <Row style={{
        width: '1280px',
        margin: '30px auto'
      }}>
        {cards}
      </Row>
    );
  }

  render() {

    const stats = this.state.output && this.state.output.stats;
    const current = this.state.output && this.state.output.current;
    const originSuites = this.state.output && this.state.output.suites;
    const caseShowType = this.state.caseShowType;
    const imgs = this.state.images;

    return (
      <Layout>
        <Affix>
          <Header>
            <NavBar stats={ stats }/>
          </Header>
        </Affix>
        <Content>
          <div className="panel-container">
            <div className="case-show-panel">
              <Radio.Group className="case-show-radio" value={caseShowType} onChange={this.handleRadioChange.bind(this)}>
                <Radio.Button value="tree">
                  <Icon type="eye-o" />
                </Radio.Button>
                <Radio.Button value="image">
                  <Icon type="picture" />
                </Radio.Button>
                <Radio.Button value="text">
                  <Icon type="table" />
                </Radio.Button>
                {this.state.hashError ? <Radio.Button value="error">
                  <Icon type="question-circle" theme="twoTone" twoToneColor="red" />
                </Radio.Button> : ''}
              </Radio.Group>
            </div>
          </div>
          <Screen current={ current } />
          {
            originSuites.suites && originSuites.suites.map((suite, index) => {
              return (
                <Suite
                  showSuite={ caseShowType !== 'image' }
                  showSvg={ caseShowType !== 'text' && caseShowType !== 'error' }
                  showError={ caseShowType === 'error' }
                  suite={ suite }
                  key={ index }
                />
              )
            })
          }
          { this.renderImages(imgs) }
          <Modal
            title={this.state.currentModalTitle}
            width="70%"
            style={{ textAlign: 'center' }}
            visible={this.state.modalVisible}
            onCancel={this.handleModalCancel.bind(this)}
            footer={null}
          >
            <a target="_blank" href={ this.state.currentModalImage }>
              <img
                style={{ height: document.body.clientHeight * 0.67 + 'px' }}
                src={ this.state.currentModalImage }>
              </img>
            </a>
          </Modal>
        </Content>
        <Footer>
          &copy;&nbsp;<a href={ pkg.homepage }>Macaca Team</a> { new Date().getFullYear() }
        </Footer>
        <BackTop />
      </Layout>
     )
  }
}

window._macaca_reportor = {

  _render: () => {
    console.log('reporter view render');
    ReactDom.render(<App />, container);
  },

  _update: data => {
    console.log('reporter view update');
    container.innerHTML = '';
    container.setAttribute(dataAttr, data);
    ReactDom.render(<App />, container);
  }

};

container = document.querySelector(`#${pkg.name}`);

if (container.getAttribute(configAttr)) {
  var config = JSON.parse(decodeURI(container.getAttribute(configAttr)));

  if (config && config.socket) {
    const socket = io(config.socket.server);
    socket.on('update reporter', function(data) {
      window._macaca_reportor._update(encodeURI(JSON.stringify(data)));
    });

    socket.on('disconnect', (data) => {
      socket.close();
    });
  }
}
