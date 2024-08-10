'use client';

/* eslint-disable @next/next/no-img-element */
import type {IconProps} from '@iconify/react';
// eslint-disable-next-line no-duplicate-imports
import {Icon} from '@iconify/react';

import '@/styles/globals.css';
import '@/styles/landing-guide.css';
import '@/styles/landing.css';
import {Button, Link, Spacer, Modal, ModalContent, ModalHeader, ModalBody} from '@nextui-org/react';
import React, {useState} from 'react';
import {SignUpButton} from '@/components/user/signup';

type SocialIconProps = Omit<IconProps, 'icon'>;

const socialItems = [
  {
    name: 'X',
    href: 'https://x.com/lixun910',
    icon: (props: SocialIconProps) => <Icon {...props} icon="ri:twitter-x-fill" />
  },
  {
    name: 'GitHub',
    href: 'https://github.com/orgs/geodaai/discussions/categories/bugs',
    icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:github" />
  },
  {
    name: 'Slack',
    href: 'https://csds-uchicago.slack.com/join/shared_invite/zt-2o8sy8fgn-a_EW0ZxPYzj3OaOMjAGVww#/shared-invite/email',
    icon: (props: SocialIconProps) => <Icon {...props} icon="mdi:slack" />
  }
];

const mainItems = [
  {
    image: 'img/ask-1.gif',
    title: 'Ask Anything About Spatial Data Analysis',
    content: [
      'GeoDa.AI is a customized large language model that can assist users with spatial analysis tasks by responding to their text, voice and screenshot prompts. The model is fine-tuned on a corpus of spatial data and spatial analysis tasks, and it can understand and respond to a variety of natural language queries.',
      'You can ask anything about your data and apply spatial data analysis using GeoDa.AI. GeoDa AI can run spatial statistics, generate maps and charts, create spatial weights and even apply spatial regressions to help you understand your spatial data.'
    ]
  },
  {
    image: 'img/image-1.png',
    title: 'Get Insights With Powerful Tools',
    content: [
      'GeoDa provides powerful tools for spatial data analysis, including mapping, space-time exploration, spatial weights, spatial autocorrelation, spatial cluster analysis, and spatial regression. GeoDa.AI will leverage these tools in conjunction with the AI model to enable users to gain insights from their spatial data and solve spatial problems more quickly and easily.',
      'In comparison to traditional spatial analysis tools, the GeoDa.AI model is capable of learning and improving itself from the spatial analyses that all users perform. As the model is used by more and more users, it will continue to learn and improve, making it an increasingly powerful and valuable tool for spatial analysis.'
    ]
  },
  {
    image: 'img/interactive-map-1.gif',
    title: 'Interactive Spatial Data Analysis',
    content: [
      'GeoDa.AI extends the classic brushing-and-linking functionality of desktop GeoDa to the browser. It enables users to perform interactive spatial data analysis across maps, tables, plots, and chats. GeoDa.AI also supports SQL queries on browser-based data. This provides a novel and convenient way to explore spatial data.',
      'GeoDa.AI is designed and developed based on libgeoda, Arrow, DuckDB, WebAssembly, and Kepler.GL. This enables us to run the entire GeoDa library in the browser quickly and efficiently.'
    ]
  },
  {
    image: 'img/image-4.png',
    title: 'Share Your Analysis Dashboard With Style',
    content: [
      'A good dashboard helps you to visualize data, communicate results, and collaborate with others. GeoDa.AI makes creating and sharing a dashboard so easy: you can drag-n-drop any text, plot and map from your chat with GeoDa.AI into the dashboard. They can also use the text editor to add titles, labels, and annotations. When users are finished creating their dashboard, they can share it with others by simply sharing the dashboard file.'
    ]
  }
];

export default function Page() {
  const [showSignUp, setShowSignUp] = useState(false);
  return (
    <div className="flex w-screen items-center justify-center bg-gradient-to-br from-black via-rose-950 to-black">
      <div className="flex w-full max-w-full flex-col gap-4">
        <div className="mt-10 flex flex-col items-center justify-center gap-2 p-4 md:mt-20 md:gap-8 xl:mb-40 xl:flex-row">
          <div className="flex flex-col items-center gap-4 xl:ml-6 xl:items-start">
            <div className="flex flex-row items-start gap-4">
              <h2 className="inline bg-gradient-to-br from-foreground-800 to-foreground-200 bg-clip-text text-7xl font-semibold tracking-tight text-transparent dark:to-foreground-200">
                GeoDa.AI
              </h2>
              <img className="relative" alt="Geoda ai logo" src="img/geoda-ai-logo.png" />
            </div>
            <h2 className="max-w-[500px] bg-gradient-to-br from-foreground-800 to-foreground-200 bg-clip-text pl-2 text-4xl font-normal leading-relaxed text-slate-50 dark:to-foreground-200">
              Free, Open-Sourced and AI Powered Spatial Data Analysis
            </h2>
            <Button
              radius="lg"
              className="bg-gradient-to-tr from-pink-500 to-yellow-500 p-6 text-large text-white shadow-lg"
              endContent={<Icon icon="akar-icons:arrow-right" />}
              onClick={() => setShowSignUp(true)}
            >
              Try Techinical Preview
            </Button>
          </div>
          <div className="scale-[0.4] items-start md:scale-100">
            <div className="relative top-[5px] h-[436px] w-[810px]">
              <div className="absolute left-[51px] top-0 h-[421px] w-[726px] rounded-lg bg-[#717171]"></div>
              <img
                className="absolute left-0 top-[415px] h-[22px] w-[810px]"
                alt="Base"
                src="img/base-1.png"
              />
              <img
                className="absolute left-[56px] top-[12px] h-[388px] w-[717px]"
                alt="Geoda.AI"
                src="img/geoda-ai-main-screenshot-1.png"
              />
            </div>
          </div>
        </div>
        <div className="main-content flex flex-col gap-10 text-stone-800 dark:text-stone-300">
          {mainItems.map((item, i) => (
            <div
              key={i}
              className="backdrop-saturate-5 m-2 flex flex-col-reverse items-center gap-10 rounded-2xl bg-background/60 shadow-xl backdrop-blur-xl backdrop-saturate-200 md:m-auto md:flex-row md:items-start md:p-10"
            >
              <div className="min-w-[360px] max-w-[360px] gap-3 rounded-xl">
                <img className="rounded-xl" alt="Img intro" src={item.image} />
              </div>
              <div className="flex max-w-[700px] flex-col gap-10 p-2">
                <p className="text-4xl">{item.title}</p>
                {item.content.map((content, i) => (
                  <span key={i} className="leading-relaxed">
                    {content}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <footer className="flex w-full flex-col">
          <div className="flex w-full max-w-7xl flex-col items-center justify-center px-6 py-12 lg:px-8">
            <div className="flex items-center justify-center gap-4">
              <img className="" alt="Geoda ai logo" src="img/geoda-ai-logo.png" />
              <span className="text-2xl font-semibold text-stone-50 dark:text-stone-500">
                GeoDa.AI
              </span>
            </div>
            <Spacer y={6} />
            <div className="flex justify-center gap-x-4">
              {socialItems.map(item => (
                <Link key={item.name} isExternal className="text-default-400" href={item.href}>
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" className="w-5" />
                </Link>
              ))}
            </div>
            <Spacer y={4} />
            <p className="mt-1 text-center text-small text-default-400">
              &copy; 2024 GeoDa.AI All rights reserved.
            </p>
          </div>
        </footer>
      </div>
      <Modal
        size="lg"
        isOpen={showSignUp}
        isDismissable={true}
        onClose={() => setShowSignUp(false)}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <Icon icon="twemoji:building-construction" width="1.2em" height="1.2em" />
          </ModalHeader>
          <ModalBody>
            <SignUpButton />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
