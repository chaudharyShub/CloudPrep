import type { ExamGuide } from './types.ts';

/**
 * Facts from the official AWS Certified Developer – Associate (DVA-C03) exam guide.
 * DVA-C03 replaces DVA-C02, whose last exam day is 30 November 2026. Exam time from the
 * certification page.
 * Source: https://docs.aws.amazon.com/aws-certification/latest/developer-associate-03/developer-associate-03.html
 */
export const DVA_C03: ExamGuide = {
  id: 'dva-c03',
  code: 'DVA-C03',
  name: 'AWS Certified Developer – Associate',
  shortName: 'Developer',
  level: 'Associate',
  questionPrefix: 'dva',
  guideUrl:
    'https://docs.aws.amazon.com/aws-certification/latest/developer-associate-03/developer-associate-03.html',
  verified: '2026-11-05',
  questionCount: 65,
  scoredQuestionCount: 50,
  durationMinutes: 130,
  passingScore: 720,
  feeUsd: 150,
  launched: true,
  domains: [
    {
      id: 'D1',
      number: 1,
      name: 'Development with AWS Services',
      weightPercent: 30,
      taskStatements: [
        { id: '1.1', title: 'Develop code for applications that are hosted on AWS' },
        { id: '1.2', title: 'Develop code for AWS Lambda' },
        { id: '1.3', title: 'Use data stores during application development' },
      ],
    },
    {
      id: 'D2',
      number: 2,
      name: 'Security',
      weightPercent: 26,
      taskStatements: [
        {
          id: '2.1',
          title:
            'Implement authentication and authorization mechanisms for applications and AWS services',
        },
        {
          id: '2.2',
          title: 'Implement encryption and manage sensitive data by using AWS services',
        },
        {
          id: '2.3',
          title:
            'Identify and mitigate security risks associated with using and integrating AI services into application development',
        },
      ],
    },
    {
      id: 'D3',
      number: 3,
      name: 'Testing and Deployment',
      weightPercent: 22,
      taskStatements: [
        { id: '3.1', title: 'Prepare application artifacts to be deployed to AWS' },
        { id: '3.2', title: 'Implement and automate application testing in AWS environments' },
        {
          id: '3.3',
          title:
            'Deploy code by using AWS continuous integration and continuous delivery (CI/CD) services',
        },
      ],
    },
    {
      id: 'D4',
      number: 4,
      name: 'Troubleshooting and Optimization',
      weightPercent: 22,
      taskStatements: [
        { id: '4.1', title: 'Assist in a root cause analysis' },
        { id: '4.2', title: 'Apply logging, monitoring, and observability best practices' },
        { id: '4.3', title: 'Optimize applications by using AWS services and features' },
      ],
    },
  ],
};
