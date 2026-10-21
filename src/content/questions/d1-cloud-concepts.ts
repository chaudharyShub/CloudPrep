import type { Question } from '@/domain/questions/types';

const SIX_ADVANTAGES = {
  title: 'Overview of AWS: Six advantages of cloud computing',
  url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-overview/six-advantages-of-cloud-computing.html',
};
const WA_PILLARS = {
  title: 'AWS Well-Architected Framework: The pillars of the framework',
  url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html',
};
const REVIEW = { status: 'checked', lastVerified: '2026-10-21' } as const;

/** Domain 1: Cloud Concepts. Original questions written from the cited AWS documentation. */
export const D1_QUESTIONS: readonly Question[] = [
  {
    id: 'clf-d1-0001',
    revision: 1,
    type: 'single',
    stem: 'A retail company wants to offer its website to customers in Europe and Asia within days, without building or leasing data centers in those regions. Which advantage of cloud computing does this describe?',
    options: [
      {
        id: 'a',
        text: 'Go global in minutes',
        explanation:
          'Correct. You can deploy an application in multiple AWS Regions around the world with a few clicks, giving customers lower latency without building facilities.',
      },
      {
        id: 'b',
        text: 'Trade fixed expense for variable expense',
        explanation:
          'This advantage is about paying only for what you consume instead of investing up front. It does not address reaching customers in new geographies.',
      },
      {
        id: 'c',
        text: 'Benefit from massive economies of scale',
        explanation:
          'This advantage is about lower prices from usage aggregated across many customers, not about deploying in new locations.',
      },
      {
        id: 'd',
        text: 'Stop guessing capacity',
        explanation:
          'This advantage is about scaling capacity up or down to match demand, not about expanding to other parts of the world.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      '"Go global in minutes" describes deploying applications in multiple Regions quickly, which lowers latency for customers worldwide at minimal cost.',
    domain: 'D1',
    taskStatement: '1.1',
    difficulty: 'easy',
    tags: ['Global infrastructure', 'Cloud benefits'],
    references: [SIX_ADVANTAGES],
    review: REVIEW,
  },
  {
    id: 'clf-d1-0002',
    revision: 1,
    type: 'single',
    stem: 'Which term describes the ability of an application to automatically add compute resources when demand rises and remove them when demand falls?',
    options: [
      {
        id: 'a',
        text: 'Elasticity',
        explanation:
          'Correct. Elasticity means acquiring resources as you need them and releasing them when you no longer need them, for example with Amazon EC2 Auto Scaling.',
      },
      {
        id: 'b',
        text: 'Durability',
        explanation:
          'Durability describes how well stored data is protected against loss. It is not about adjusting capacity to demand.',
      },
      {
        id: 'c',
        text: 'High availability',
        explanation:
          'High availability means a system keeps running when components fail. A highly available system is not necessarily able to grow and shrink with demand.',
      },
      {
        id: 'd',
        text: 'Economies of scale',
        explanation:
          'Economies of scale explain why AWS can offer lower prices. They do not describe how an application responds to changing demand.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Elasticity lets you scale capacity up and down with demand, so you avoid both idle resources and capacity shortages. Amazon EC2 Auto Scaling is a common way to achieve it.',
    domain: 'D1',
    taskStatement: '1.1',
    difficulty: 'easy',
    tags: ['Elasticity', 'Amazon EC2 Auto Scaling'],
    references: [
      SIX_ADVANTAGES,
      {
        title: 'What is Amazon EC2 Auto Scaling?',
        url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d1-0003',
    revision: 1,
    type: 'multiple',
    stem: 'A company is considering moving from its own data center to AWS. Which benefits of the AWS Cloud apply?',
    options: [
      {
        id: 'a',
        text: 'Paying only for the computing resources it consumes instead of investing heavily in servers up front',
        explanation: 'Correct. This is the "trade fixed expense for variable expense" advantage.',
      },
      {
        id: 'b',
        text: 'Reducing the time needed to make new IT resources available from weeks to minutes',
        explanation: 'Correct. This is the "increase speed and agility" advantage.',
      },
      {
        id: 'c',
        text: 'Transferring all security responsibility for its applications to AWS',
        explanation:
          'Incorrect. Under the shared responsibility model, customers remain responsible for security in the cloud, such as their data, permissions, and configurations.',
      },
      {
        id: 'd',
        text: 'A guarantee that its applications will never experience downtime',
        explanation:
          'Incorrect. AWS provides infrastructure for building highly available systems, but customers must design their workloads for resilience. No provider guarantees zero downtime.',
      },
      {
        id: 'e',
        text: 'No longer needing to decide where its data is stored',
        explanation:
          'Incorrect. Customers choose the AWS Regions where their data and resources are located.',
      },
    ],
    correctOptionIds: ['a', 'b'],
    explanation:
      'Two of the six advantages of cloud computing are trading fixed expense for variable expense and increasing speed and agility. Security remains shared, and customers still choose where their data lives.',
    domain: 'D1',
    taskStatement: '1.1',
    difficulty: 'medium',
    tags: ['Cloud benefits'],
    references: [
      SIX_ADVANTAGES,
      {
        title: 'Shared Responsibility Model',
        url: 'https://aws.amazon.com/compliance/shared-responsibility-model/',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d1-0004',
    revision: 1,
    type: 'single',
    stem: 'Which pillar of the AWS Well-Architected Framework focuses on the ability of a workload to perform its intended function correctly and consistently, including recovering from failures?',
    options: [
      {
        id: 'a',
        text: 'Reliability',
        explanation:
          'Correct. The reliability pillar covers a workload performing its intended function correctly and consistently, including recovering from failure and meeting demand.',
      },
      {
        id: 'b',
        text: 'Performance efficiency',
        explanation:
          'Performance efficiency is about using computing resources efficiently to meet requirements as demand and technology change.',
      },
      {
        id: 'c',
        text: 'Operational excellence',
        explanation:
          'Operational excellence is about running and monitoring systems and continually improving processes and procedures.',
      },
      {
        id: 'd',
        text: 'Cost optimization',
        explanation:
          'Cost optimization is about running systems to deliver business value at the lowest price point.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'The six pillars are operational excellence, security, reliability, performance efficiency, cost optimization, and sustainability. Recovering from failure and consistent operation belong to reliability.',
    domain: 'D1',
    taskStatement: '1.2',
    difficulty: 'easy',
    tags: ['AWS Well-Architected Framework'],
    references: [
      WA_PILLARS,
      {
        title: 'AWS Well-Architected Framework: Reliability',
        url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/reliability.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d1-0005',
    revision: 1,
    type: 'single',
    stem: 'A company wants to reduce the energy consumption and environmental impact of its cloud workloads. Which pillar of the AWS Well-Architected Framework addresses this goal?',
    options: [
      {
        id: 'a',
        text: 'Sustainability',
        explanation:
          'Correct. The sustainability pillar focuses on minimizing the environmental impacts of running cloud workloads.',
      },
      {
        id: 'b',
        text: 'Cost optimization',
        explanation:
          'Cost optimization can reduce waste, but its focus is delivering business value at the lowest price, not environmental impact.',
      },
      {
        id: 'c',
        text: 'Performance efficiency',
        explanation:
          'Performance efficiency is about using resources efficiently to meet performance requirements.',
      },
      {
        id: 'd',
        text: 'Security',
        explanation: 'The security pillar is about protecting data, systems, and assets.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Sustainability is the sixth Well-Architected pillar. It covers reducing energy consumption and improving efficiency across all components of a workload.',
    domain: 'D1',
    taskStatement: '1.2',
    difficulty: 'easy',
    tags: ['AWS Well-Architected Framework', 'Sustainability'],
    references: [
      WA_PILLARS,
      {
        title: 'AWS Well-Architected Framework: Sustainability',
        url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/sustainability.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d1-0006',
    revision: 1,
    type: 'single',
    stem: 'A team wants to review its workloads against the AWS Well-Architected Framework by answering questions about each pillar, and then get a list of high-risk issues to fix. Which AWS service should it use?',
    options: [
      {
        id: 'a',
        text: 'AWS Well-Architected Tool',
        explanation:
          "Correct. The AWS Well-Architected Tool lets you review workloads against the framework's best practices, identifies high and medium risks, and tracks improvements.",
      },
      {
        id: 'b',
        text: 'AWS Config',
        explanation:
          'AWS Config records resource configurations and evaluates them against rules. It does not run a question-based review against the framework pillars.',
      },
      {
        id: 'c',
        text: 'AWS Artifact',
        explanation:
          'AWS Artifact provides AWS compliance reports and agreements. It does not review your workloads.',
      },
      {
        id: 'd',
        text: 'AWS CloudTrail',
        explanation:
          'AWS CloudTrail records API activity in your account. It does not assess architectures.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      "The AWS Well-Architected Tool guides you through the framework's questions for a workload and produces an improvement plan based on the risks it finds.",
    domain: 'D1',
    taskStatement: '1.2',
    difficulty: 'medium',
    tags: ['AWS Well-Architected Tool'],
    references: [
      {
        title: 'What is AWS Well-Architected Tool?',
        url: 'https://docs.aws.amazon.com/wellarchitected/latest/userguide/intro.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d1-0007',
    revision: 1,
    type: 'single',
    stem: 'Which perspective of the AWS Cloud Adoption Framework (AWS CAF) focuses on culture, organizational structure, leadership, and workforce during a cloud transformation?',
    options: [
      {
        id: 'a',
        text: 'People perspective',
        explanation:
          'Correct. The People perspective bridges technology and business, focusing on culture, organizational structure, leadership, and workforce.',
      },
      {
        id: 'b',
        text: 'Governance perspective',
        explanation:
          'The Governance perspective helps orchestrate cloud initiatives while maximizing benefits and minimizing transformation-related risks.',
      },
      {
        id: 'c',
        text: 'Platform perspective',
        explanation:
          'The Platform perspective helps build an enterprise-grade, scalable, hybrid cloud platform and modernize workloads.',
      },
      {
        id: 'd',
        text: 'Operations perspective',
        explanation:
          'The Operations perspective helps ensure cloud services are delivered at a level that meets business needs.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'AWS CAF groups its capabilities into six perspectives: Business, People, Governance, Platform, Security, and Operations. Culture and workforce belong to the People perspective.',
    domain: 'D1',
    taskStatement: '1.3',
    difficulty: 'medium',
    tags: ['AWS Cloud Adoption Framework'],
    references: [
      {
        title: 'Overview of the AWS Cloud Adoption Framework: Foundational capabilities',
        url: 'https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/foundational-capabilities.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d1-0008',
    revision: 1,
    type: 'single',
    stem: 'A company plans to move an application from its on-premises servers to Amazon EC2 without making any changes to the application. Which migration strategy is this?',
    options: [
      {
        id: 'a',
        text: 'Rehost',
        explanation:
          'Correct. Rehost, also called "lift and shift", moves an application to the cloud without changing it.',
      },
      {
        id: 'b',
        text: 'Replatform',
        explanation:
          'Replatform ("lift, tinker, and shift") introduces some optimization during the move, such as moving a database to Amazon RDS.',
      },
      {
        id: 'c',
        text: 'Refactor',
        explanation:
          "Refactor (re-architect) changes the application's architecture to take full advantage of cloud-native features.",
      },
      {
        id: 'd',
        text: 'Repurchase',
        explanation:
          'Repurchase ("drop and shop") replaces the application with a different product, such as a SaaS offering.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'The 7 Rs of migration are retire, retain, rehost, relocate, repurchase, replatform, and refactor. Moving an application unchanged is rehosting.',
    domain: 'D1',
    taskStatement: '1.3',
    difficulty: 'easy',
    tags: ['Migration', '7 Rs'],
    references: [
      {
        title: 'AWS Prescriptive Guidance: About the migration strategies',
        url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d1-0009',
    revision: 1,
    type: 'single',
    stem: 'Compared with buying its own servers, how does pay-as-you-go pricing on AWS change the way a company pays for IT infrastructure?',
    options: [
      {
        id: 'a',
        text: 'Large up-front investments are replaced by variable costs that follow actual usage.',
        explanation:
          'Correct. You pay only when you consume computing resources, and only for how much you consume.',
      },
      {
        id: 'b',
        text: 'The company must pay for its expected peak capacity in advance.',
        explanation:
          'Paying in advance for peak capacity is typical of on-premises infrastructure, which pay-as-you-go pricing avoids.',
      },
      {
        id: 'c',
        text: 'Variable costs are converted into fixed monthly costs.',
        explanation:
          'This is the reverse of what happens. Fixed expenses become variable expenses.',
      },
      {
        id: 'd',
        text: 'All usage is free until the company exceeds a monthly threshold.',
        explanation:
          'Some services offer limited free usage, but AWS usage in general is billed as it is consumed.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      '"Trade fixed expense for variable expense" means you don\'t invest heavily in data centers and servers before knowing how you will use them. You pay as you consume.',
    domain: 'D1',
    taskStatement: '1.4',
    difficulty: 'easy',
    tags: ['Cloud economics'],
    references: [SIX_ADVANTAGES],
    review: REVIEW,
  },
  {
    id: 'clf-d1-0010',
    revision: 1,
    type: 'single',
    stem: 'A company finds that many of its Amazon EC2 instances average less than 10% CPU utilization. Which practice would most directly reduce costs while still meeting performance needs?',
    options: [
      {
        id: 'a',
        text: 'Rightsizing the instances to smaller or better-matched instance types',
        explanation:
          'Correct. Rightsizing matches instance types and sizes to workload requirements at the lowest possible cost.',
      },
      {
        id: 'b',
        text: 'Adding more instances behind a load balancer',
        explanation:
          'Adding instances increases cost and does nothing about the existing unused capacity.',
      },
      {
        id: 'c',
        text: 'Copying the instances to a second AWS Region',
        explanation:
          'A second Region can help with disaster recovery or latency, but it adds cost rather than reducing waste.',
      },
      {
        id: 'd',
        text: 'Moving the instances to Dedicated Hosts',
        explanation:
          'Dedicated Hosts provide physical servers for your use, typically for licensing or compliance needs. They do not address underused instances.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Consistently low utilization means the instances are oversized. Rightsizing to smaller or better-suited types cuts cost without hurting performance. AWS Compute Optimizer can recommend rightsizing changes based on utilization metrics.',
    domain: 'D1',
    taskStatement: '1.4',
    difficulty: 'medium',
    tags: ['Rightsizing', 'Cost optimization'],
    references: [
      {
        title: 'What is AWS Compute Optimizer?',
        url: 'https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html',
      },
    ],
    review: REVIEW,
  },
];
