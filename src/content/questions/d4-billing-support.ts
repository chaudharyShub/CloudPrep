import type { Question } from '@/domain/questions/types';

const REVIEW = { status: 'checked', lastVerified: '2026-10-21' } as const;

/** Domain 4: Billing, Pricing, and Support. Original questions written from the cited AWS documentation. */
export const D4_QUESTIONS: readonly Question[] = [
  {
    id: 'clf-d4-0001',
    revision: 1,
    type: 'single',
    stem: 'A company runs batch data-analysis jobs that can be interrupted and restarted, and their start times are flexible. Which Amazon EC2 purchasing option is the most cost-effective?',
    options: [
      {
        id: 'a',
        text: 'Spot Instances',
        explanation:
          'Correct. Spot Instances use spare EC2 capacity at steep discounts and suit flexible, interruptible work such as batch jobs and data analysis.',
      },
      {
        id: 'b',
        text: 'On-Demand Instances',
        explanation:
          'On-Demand works but costs more than Spot for workloads that tolerate interruption.',
      },
      {
        id: 'c',
        text: 'Dedicated Hosts',
        explanation:
          'Dedicated Hosts are physical servers for your use, typically for licensing or compliance needs. They are not the low-cost option.',
      },
      {
        id: 'd',
        text: 'Reserved Instances',
        explanation:
          "Reserved Instances require a one- or three-year commitment, which doesn't fit intermittent, flexible jobs.",
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Amazon EC2 can reclaim Spot capacity with a two-minute warning, so Spot is best for workloads that can handle interruptions.',
    domain: 'D4',
    taskStatement: '4.1',
    difficulty: 'easy',
    tags: ['Amazon EC2', 'Spot Instances', 'Pricing'],
    references: [
      {
        title: 'Amazon EC2 User Guide: Spot Instances',
        url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d4-0002',
    revision: 1,
    type: 'single',
    stem: 'A company will run a database on the same Amazon EC2 instance type continuously for the next three years. It can commit to this usage and wants the lowest cost. Which purchasing option should it choose?',
    options: [
      {
        id: 'a',
        text: 'Reserved Instances with a three-year term',
        explanation:
          'Correct. Reserved Instances give a significant discount compared with On-Demand pricing in exchange for a one- or three-year commitment, which suits steady, predictable usage.',
      },
      {
        id: 'b',
        text: 'On-Demand Instances',
        explanation:
          'On-Demand has no commitment, but it costs more for steady, long-running usage.',
      },
      {
        id: 'c',
        text: 'Spot Instances',
        explanation:
          'Spot Instances can be interrupted, which is unsuitable for a database that must run continuously.',
      },
      {
        id: 'd',
        text: 'Dedicated Instances',
        explanation:
          "Dedicated Instances run on hardware dedicated to one customer for isolation. That isn't a discount option.",
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Steady, predictable usage over a long period is the classic case for a commitment-based discount such as Reserved Instances.',
    domain: 'D4',
    taskStatement: '4.1',
    difficulty: 'medium',
    tags: ['Amazon EC2', 'Reserved Instances', 'Pricing'],
    references: [
      {
        title: 'Amazon EC2 User Guide: Reserved Instances',
        url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d4-0003',
    revision: 1,
    type: 'multiple',
    stem: 'Which statements about AWS Savings Plans are correct?',
    options: [
      {
        id: 'a',
        text: 'They lower prices in exchange for a commitment to a consistent amount of compute usage, measured per hour, for a one- or three-year term.',
        explanation: 'Correct. This is how a Savings Plans commitment works.',
      },
      {
        id: 'b',
        text: 'Compute Savings Plans can apply to AWS Fargate and AWS Lambda usage as well as Amazon EC2.',
        explanation:
          'Correct. Compute Savings Plans apply to EC2 regardless of instance family, size, OS, tenancy, or Region, and also to Fargate and Lambda.',
      },
      {
        id: 'c',
        text: 'AWS can interrupt the covered compute with a two-minute warning.',
        explanation:
          'That describes Spot Instances. Savings Plans are a pricing model, not interruptible capacity.',
      },
      {
        id: 'd',
        text: 'The full commitment must always be paid up front.',
        explanation:
          'Savings Plans offer All Upfront, Partial Upfront, and No Upfront payment options.',
      },
      {
        id: 'e',
        text: 'They provide additional savings on top of Spot Instance prices.',
        explanation: 'Spot Instances are not covered by Savings Plans.',
      },
    ],
    correctOptionIds: ['a', 'b'],
    explanation:
      'Savings Plans trade a one- or three-year hourly spend commitment for lower prices. Compute Savings Plans are the most flexible type.',
    domain: 'D4',
    taskStatement: '4.1',
    difficulty: 'hard',
    tags: ['Savings Plans', 'Pricing'],
    references: [
      {
        title: 'What are Savings Plans?',
        url: 'https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html',
      },
      {
        title: 'Amazon EC2 User Guide: Spot Instances',
        url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d4-0004',
    revision: 1,
    type: 'single',
    stem: 'A company wants to receive an email when its AWS costs for the month are forecast to exceed $5,000. Which service should it use?',
    options: [
      {
        id: 'a',
        text: 'AWS Budgets',
        explanation:
          'Correct. AWS Budgets tracks cost and usage against amounts you set and can alert you on actual or forecasted spend by email or Amazon SNS.',
      },
      {
        id: 'b',
        text: 'AWS Pricing Calculator',
        explanation:
          "The Pricing Calculator estimates the cost of planned architectures. It doesn't monitor actual spend.",
      },
      {
        id: 'c',
        text: 'AWS Artifact',
        explanation: 'AWS Artifact provides compliance documents.',
      },
      {
        id: 'd',
        text: 'AWS Trusted Advisor',
        explanation:
          "Trusted Advisor recommends best-practice improvements, including cost savings, but doesn't alert on budget thresholds you define.",
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Use AWS Budgets to set cost or usage thresholds and get alerts when actual or forecasted values cross them.',
    domain: 'D4',
    taskStatement: '4.2',
    difficulty: 'easy',
    tags: ['AWS Budgets', 'Cost management'],
    references: [
      {
        title: 'Managing your costs with AWS Budgets',
        url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d4-0005',
    revision: 1,
    type: 'single',
    stem: "A finance team wants to explore the company's AWS costs over the past several months using charts, filtered by service and by account. Which tool should it use?",
    options: [
      {
        id: 'a',
        text: 'AWS Cost Explorer',
        explanation:
          'Correct. Cost Explorer lets you view and analyze your costs and usage over time, with filtering and grouping.',
      },
      {
        id: 'b',
        text: 'AWS Budgets',
        explanation:
          "AWS Budgets tracks spending against thresholds and sends alerts. It isn't the main tool for exploring historical costs.",
      },
      {
        id: 'c',
        text: 'AWS Pricing Calculator',
        explanation: 'The Pricing Calculator estimates the cost of resources you plan to use.',
      },
      {
        id: 'd',
        text: 'Amazon CloudWatch',
        explanation:
          'CloudWatch monitors operational metrics, not cost analysis by service and account.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'AWS Cost Explorer is the interactive tool for analyzing past and current spending and spotting trends.',
    domain: 'D4',
    taskStatement: '4.2',
    difficulty: 'easy',
    tags: ['AWS Cost Explorer', 'Cost management'],
    references: [
      {
        title: 'Analyzing your costs and usage with AWS Cost Explorer',
        url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d4-0006',
    revision: 1,
    type: 'multiple',
    stem: 'A company uses consolidated billing in AWS Organizations for its 20 AWS accounts. Which benefits does this provide?',
    options: [
      {
        id: 'a',
        text: 'One bill for all the accounts in the organization',
        explanation:
          'Correct. The management account pays the charges of all member accounts on one bill.',
      },
      {
        id: 'b',
        text: 'Combined usage across accounts, which can qualify for volume pricing discounts',
        explanation:
          'Correct. Usage is combined across accounts, sharing volume pricing discounts, Reserved Instance discounts, and Savings Plans.',
      },
      {
        id: 'c',
        text: 'AWS Enterprise Support for every member account at no extra cost',
        explanation: "Consolidated billing doesn't include a Support plan.",
      },
      {
        id: 'd',
        text: 'A lower per-account fee for using consolidated billing',
        explanation:
          'Consolidated billing is offered at no additional cost; there is no per-account fee.',
      },
      {
        id: 'e',
        text: 'Member accounts no longer need IAM to control access',
        explanation:
          "Each account still uses IAM to manage access. Billing consolidation doesn't change that.",
      },
    ],
    correctOptionIds: ['a', 'b'],
    explanation:
      'Consolidated billing gives one bill, easy tracking across accounts, combined usage for discounts, and no extra fee.',
    domain: 'D4',
    taskStatement: '4.2',
    difficulty: 'medium',
    tags: ['AWS Organizations', 'Consolidated billing'],
    references: [
      {
        title: 'Consolidating billing for AWS Organizations',
        url: 'https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d4-0007',
    revision: 1,
    type: 'single',
    stem: 'A startup uses only the free AWS Basic Support plan. Which of the following does it include?',
    options: [
      {
        id: 'a',
        text: '24/7 customer service, documentation, whitepapers, and access to the AWS re:Post community',
        explanation: 'Correct. These are included with Basic Support for all AWS customers.',
      },
      {
        id: 'b',
        text: 'A designated Technical Account Manager (TAM)',
        explanation: 'A designated TAM is part of AWS Enterprise Support, not Basic Support.',
      },
      {
        id: 'c',
        text: 'Access to all AWS Trusted Advisor checks through the Trusted Advisor API',
        explanation:
          'All checks and API access require Business Support+, Enterprise Support, or Unified Operations. Basic Support includes only selected checks in the console.',
      },
      {
        id: 'd',
        text: 'A response within 15 minutes when a business-critical system is down',
        explanation:
          'Response-time commitments like this come with paid plans such as Enterprise Support.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Basic Support covers customer service, documentation, re:Post, AWS Health, and a core set of Trusted Advisor checks. Technical support cases and response-time targets need a paid plan.',
    domain: 'D4',
    taskStatement: '4.3',
    difficulty: 'medium',
    tags: ['AWS Support', 'Basic Support', 'AWS Trusted Advisor'],
    references: [
      {
        title: 'Compare AWS Support plans',
        url: 'https://aws.amazon.com/premiumsupport/plans/',
      },
      {
        title: 'AWS Support User Guide: AWS Trusted Advisor',
        url: 'https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html',
      },
    ],
    review: {
      ...REVIEW,
      notes:
        'AWS Support plans are changing: Developer, Business, and Enterprise On-Ramp end on 1 January 2027. Re-check before release.',
    },
  },
];
