'use strict';

const macacaEcosystem = require('macaca-ecosystem');

const name = 'macaca-reporter';

module.exports = {
  dest: 'docs_dist',
  base: `/${name}/`,

  locales: {
    '/': {
      lang: 'en-US',
      title: 'Macaca Reporter',
      description: 'Reporter used for mocha and other frameworks.',
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'Macaca Reporter',
      description: 'Macaca 测试报告器',
    },
  },
  head: [
    ['script', {
      async: true,
      src: 'https://www.googletagmanager.com/gtag/js?id=UA-49226133-2',
    }, ''],
    ['script', {}, `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'UA-49226133-2');
    `],
    ['style', {}, `
      img {
        width: 100%;
      }
    `]
  ],
  serviceWorker: true,
  themeConfig: {
    repo: `macacajs/${name}`,
    editLinks: true,
    docsDir: 'docs',
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        editLinkText: 'Edit this page on GitHub',
        lastUpdated: 'Last Updated',
        serviceWorker: {
          updatePopup: {
            message: 'New content is available.',
            buttonText: 'Refresh',
          },
        },
        nav: [
          {
            text: 'Guide',
            link: '/guide/install.html'
          },
          macacaEcosystem.en,
        ],
        sidebar: {
          '/guide/': genSidebarConfig([
            'Guide',
            'Advanced',
            'Community'
          ])
        }
      },
      '/zh/': {
        label: '简体中文',
        selectText: '选择语言',
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: '上次更新',
        serviceWorker: {
          updatePopup: {
            message: '发现新内容可用',
            buttonText: '刷新',
          },
        },
        nav: [
          {
            text: '指南',
            link: '/zh/guide/install.html'
          },
          macacaEcosystem.zh,
        ],
        sidebar: {
          '/zh/guide/': genSidebarConfig([
            '使用指南',
            '高级进阶',
            '社区支持'
          ])
        }
      },
    },
  },
};

function genSidebarConfig(title) {
  return [
    {
      title,
      collapsable: false,
      children: [
        'install',
        'quick-start',
      ],
    },
  ];
}

function genSidebarConfig(arr) {
  return [
    {
      title: arr[0],
      collapsable: false,
      children: [
        'install',
        'feature',
        'quick-start',
      ],
    },
    {
      title: arr[1],
      collapsable: false,
      children: [
        'integration',
      ],
    },
    {
      title: arr[2],
      collapsable: false,
      children: [
        'presentations',
      ],
    },
  ];
}
