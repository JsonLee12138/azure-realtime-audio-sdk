import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: React.ReactElement;
  icon: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: (
      <Translate id="homepage.features.feature1.title">
        Real-time Voice Interaction
      </Translate>
    ),
    description: (
      <>
        <Translate id="homepage.features.feature1.description">
          Supports streaming audio input/output, providing low-latency conversation experience. Supports multiple audio formats including PCM16, G.711 μ-law, G.711 A-law.
        </Translate>
      </>
    ),
    icon: '🎤',
  },
  {
    title: (
      <Translate id="homepage.features.feature2.title">
        WebSocket Communication
      </Translate>
    ),
    description: (
      <>
        <Translate id="homepage.features.feature2.description">
          Real-time bidirectional communication based on WebSocket, supporting browser and Node.js environments. Intelligent conversation state management with automatic connection maintenance.
        </Translate>
      </>
    ),
    icon: '🌐',
  },
  {
    title: (
      <Translate id="homepage.features.feature3.title">
        Tool Calling Support
      </Translate>
    ),
    description: (
      <>
        <Translate id="homepage.features.feature3.description">
          Supports Function Calling to extend AI capabilities. Built-in Whisper model for speech transcription with complete type definitions and documentation.
        </Translate>
      </>
    ),
    icon: '🛠️',
  },
  {
    title: (
      <Translate id="homepage.features.feature4.title">
        TypeScript Native Support
      </Translate>
    ),
    description: (
      <>
        <Translate id="homepage.features.feature4.description">
          Complete TypeScript type definitions and JSDoc documentation. Intelligent suggestions and type safety, reducing runtime errors.
        </Translate>
      </>
    ),
    icon: '🎯',
  },
  {
    title: (
      <Translate id="homepage.features.feature5.title">
        Cross-platform Support
      </Translate>
    ),
    description: (
      <>
        <Translate id="homepage.features.feature5.description">
          Supports browser and Node.js environments. Provides complete example code and best practice guides.
        </Translate>
      </>
    ),
    icon: '🌍',
  },
];

function Feature({title, description, icon}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <div className={styles.featureIcon}>{icon}</div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): React.ReactElement {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} title={props.title} description={props.description} icon={props.icon} />
          ))}
        </div>
      </div>
    </section>
  );
}
