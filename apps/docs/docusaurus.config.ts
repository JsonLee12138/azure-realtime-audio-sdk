import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Azure Realtime Audio SDK',
  tagline: 'TypeScript/JavaScript SDK based on Azure OpenAI Realtime API, supporting real-time voice conversations',
  favicon: 'img/logo.svg',
  // Future flags
  future: {
    v4: true,
  },

  // Set the production url of your site here
  url: 'https://jsonlee12138.github.io',
  baseUrl: '/azure-realtime-audio-sdk/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/azure-realtime-audio-sdk/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'JsonLee12138', // Usually your GitHub org/user name.
  projectName: 'azure-realtime-audio-sdk', // Usually your repo name.

  // GitHub pages deployment config
  organizationName: 'JsonLee12138',
  projectName: 'azure-realtime-audio-sdk',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // 国际化核心配置
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    localeConfigs: {
      en: {
        label: 'English',
        htmlLang: 'en-US',
      },
      zh: {
        label: '简体中文',
        htmlLang: 'zh-CN',
        path: 'zh',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          editUrl: 'https://github.com/JsonLee12138/azure-realtime-audio-sdk/tree/main/apps/docs/',
        },
        blog: {
          blogTitle: 'Azure Realtime Audio SDK Blog',
          blogDescription: 'Keep up with the latest news from Azure Realtime Audio SDK',
          blogSidebarCount: 5,
          blogSidebarTitle: 'Recent Posts',
          routeBasePath: 'blog',
          include: ['**/*.{md,mdx}'],
          exclude: [
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
            '**/_*/**',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__tests__/**',
          ],
          postsPerPage: 10,
          truncateMarker: /<!--\s*(truncate)\s*-->/,
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/JsonLee12138/azure-realtime-audio-sdk/tree/main/apps/docs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // 已移除本地搜索插件
  ],

  themeConfig: {
    // 导航栏配置
    navbar: {
      title: 'Azure Realtime Audio SDK',
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        { to: '/blog', label: 'Blog', position: 'right' },
        {
          href: 'https://github.com/JsonLee12138/azure-realtime-audio-sdk',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },

    // 页脚配置
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Installation Guide',
              to: '/docs/intro',
            },
            {
              label: 'API Reference',
              to: '/docs/api-reference',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/666U6JTCQY',
            },
            {
              label: 'QQ Channel',
              href: 'https://pd.qq.com/s/fjwy3eo20?b=9',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/JsonLee12138/azure-realtime-audio-sdk',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Azure Realtime Audio SDK. `,
    },

    // Algolia DocSearch 占位配置
    // 请前往 https://docsearch.algolia.com/ 申请 appId、apiKey、indexName
    // algolia: {
    //   appId: 'YOUR_APP_ID', // 替换为你的 appId
    //   apiKey: 'YOUR_SEARCH_API_KEY', // 替换为你的 search-only apiKey
    //   indexName: 'YOUR_INDEX_NAME', // 替换为你的索引名
    //   contextualSearch: true,
    //   searchParameters: {},
    //   searchPagePath: 'search',
    // },

    // 代码高亮主题
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'diff', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
