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
  Radio
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
    this.state = {
      output: JSON.parse(decodeURI(container.getAttribute(dataAttr))),
      caseShowType: location.hash.replace('#', '') || 'tree',
      images: []
    };
  }

  componentDidMount() {
    [].slice.call(document.querySelectorAll('image')).forEach(image => {
      image.addEventListener('click', function(e) {
        const href = e.target.getAttribute('href');
        window.open(href);
      }, false);
    })

    let timer = setInterval(() => {
      if (window.images) {
        clearInterval(timer)
        this.setState({
          images: window.images
        })
      }
    }, 100);
  }

  handleRadioChange(e) {
    const radio = e.target.value;
    location.hash = radio;

    this.setState({
      caseShowType: e.target.value,
    });
  }

  handleOpenImg(e) {
    window.open(e.target.src);
  }

  renderImages(images) {
    if (this.state.caseShowType !== 'image') {
      return null;
    }

    const imgs = _.uniqBy(images, item => item.src);

    const cards = imgs.map((img, index) => {
      return (
        <Col key={ index } span={4} style={{ padding: '5px' }}>
          <Card
            hoverable
            cover={<img onClick={this.handleOpenImg.bind(this)} className="picture-item" src={ img.src } />}
          >
            <Meta
              description={ img.text }
            />
          </Card>
        </Col>
      );
    })

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
          <div style={{
            background: this.state.caseShowType === 'image' ? '#fff' : '#f7f7f7'
          }}>
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
              </Radio.Group>
            </div>
          </div>
          <Screen current={ current } />
          {
            originSuites.suites && originSuites.suites.map((suite, index) => {
              return <Suite showSuite={ caseShowType !== 'image' } showSvg={ caseShowType !== 'text' } suite={ suite } key={ index } />
            })
          }
          { this.renderImages(imgs) }
        </Content>
        <Footer>
          &copy;&nbsp;<a href={ pkg.homepage }>Macaca Team</a> { new Date().getFullYear() }
        </Footer>
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
