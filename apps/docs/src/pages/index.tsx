import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import Translate from '@docusaurus/Translate';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          <Translate id="homepage.title">
            Azure Realtime Audio SDK
          </Translate>
        </Heading>
        <p className="hero__subtitle">
          <Translate id="homepage.tagline">
            TypeScript/JavaScript SDK based on Azure OpenAI Realtime API, supporting real-time voice conversations
          </Translate>
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started">
            <Translate id="home.get-started">
              Get Started - 5min ⏱️
            </Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <div className={styles.gettingStarted}>
          <div className="container">
            <div className="row">
              <div className="col col--8 col--offset-2">
                <Heading as="h2" className={styles.gettingStartedTitle}>
                  <Translate id="home.getting-started.title">
                    Getting Started
                  </Translate>
                </Heading>
                  <CodeBlock language="ts">
{`npm install @azure-realtime-audio/core

import { AzureRealTimeAudio } from '@azure-realtime-audio/core';

const client = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: 'your-api-key'
});

client.once('init', (session) => {
  console.log('Session established:', session);
});

client.on('response.audio.delta', (audioData) => {
  console.log('Audio data received:', audioData.delta);
});`}
                  </CodeBlock>
                <div className={styles.gettingStartedLinks}>
                  <Link
                    className="button button--primary button--lg"
                    to="/docs/intro">
                    <Translate id="home.installation.guide">
                      Installation Guide
                    </Translate>
                  </Link>
                  <Link
                    className="button button--secondary button--lg"
                    to="/docs/api-reference">
                    <Translate id="home.api.docs">
                      API Documentation
                    </Translate>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
