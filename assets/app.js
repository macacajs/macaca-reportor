'use strict';

import React from 'react';
import ReactDom from 'react-dom';

import {
  Affix,
  Layout
} from 'antd';

import io from 'socket.io-client';

const Header = Layout.Header;
const Footer = Layout.Footer;
const Content = Layout.Content;

import Suite from './components/Suite';
import NavBar from './components/NavBar';
import Screen from './components/Screen';

const pkg = require('../package.json');

require('./app.less');

let container;
const dataAttr = 'data-output';
const configAttr = 'config-output';

class App extends React.Component {

  constructor(props) {
    super(props);
    container = document.querySelector(`#${pkg.name}`);
    this.state = {
      output: JSON.parse(decodeURI(container.getAttribute(dataAttr)))
    };
  }

  componentDidMount() {
    [].slice.call(document.querySelectorAll('image')).forEach(image => {
      image.addEventListener('click', function(e) {
        const href = e.target.getAttribute('href');
        window.open(href);
      }, false);
    })
  }

  render() {

    const stats = this.state.output && this.state.output.stats;
    const current = this.state.output && this.state.output.current;
    const originSuites = this.state.output && this.state.output.suites;

    return (
      <Layout>
        <Affix>
          <Header>
            <NavBar stats={ stats }/>
          </Header>
        </Affix>
        <Content>
          <Screen current={ current } />
          {
            originSuites.suites && originSuites.suites.map((suite, index) => {
              return <Suite suite={ suite } key={ index } />
            })
          }
        </Content>
        <Footer>
          &copy;&nbsp;<a target="_blank" href={ pkg.homepage }>Macaca Team</a> { new Date().getFullYear() }
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
