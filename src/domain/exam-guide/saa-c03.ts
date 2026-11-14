import type { ExamGuide } from './types.ts';

/**
 * Facts from the official AWS Certified Solutions Architect – Associate (SAA-C03) exam guide
 * (revision of 29 October 2026). Exam time from the certification page.
 * Source: https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html
 */
export const SAA_C03: ExamGuide = {
  id: 'saa-c03',
  code: 'SAA-C03',
  name: 'AWS Certified Solutions Architect – Associate',
  shortName: 'Solutions Architect',
  level: 'Associate',
  questionPrefix: 'saa',
  guideUrl:
    'https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html',
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
      name: 'Design Secure Architectures',
      weightPercent: 30,
      taskStatements: [
        { id: '1.1', title: 'Design secure access to AWS resources' },
        { id: '1.2', title: 'Design secure workloads and applications' },
        { id: '1.3', title: 'Determine appropriate data security controls' },
      ],
    },
    {
      id: 'D2',
      number: 2,
      name: 'Design Resilient Architectures',
      weightPercent: 26,
      taskStatements: [
        { id: '2.1', title: 'Design scalable and loosely coupled architectures' },
        { id: '2.2', title: 'Design highly available and/or fault-tolerant architectures' },
      ],
    },
    {
      id: 'D3',
      number: 3,
      name: 'Design High-Performing Architectures',
      weightPercent: 24,
      taskStatements: [
        { id: '3.1', title: 'Determine high-performing and/or scalable storage solutions' },
        { id: '3.2', title: 'Design high-performing and elastic compute solutions' },
        { id: '3.3', title: 'Determine high-performing database solutions' },
        { id: '3.4', title: 'Determine high-performing and/or scalable network architectures' },
        {
          id: '3.5',
          title: 'Determine high-performing data ingestion and transformation solutions',
        },
      ],
    },
    {
      id: 'D4',
      number: 4,
      name: 'Design Cost-Optimized Architectures',
      weightPercent: 20,
      taskStatements: [
        { id: '4.1', title: 'Design cost-optimized storage solutions' },
        { id: '4.2', title: 'Design cost-optimized compute solutions' },
        { id: '4.3', title: 'Design cost-optimized database solutions' },
        { id: '4.4', title: 'Design cost-optimized network architectures' },
      ],
    },
  ],
};
