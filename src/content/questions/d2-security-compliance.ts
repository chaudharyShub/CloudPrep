import type { Question } from '@/domain/questions/types';

const SHARED_RESPONSIBILITY = {
  title: 'Shared Responsibility Model',
  url: 'https://aws.amazon.com/compliance/shared-responsibility-model/',
};
const ROOT_USER = {
  title: 'IAM User Guide: AWS account root user',
  url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html',
};
const REVIEW = { status: 'checked', lastVerified: '2026-10-21' } as const;

/** Domain 2: Security and Compliance. Original questions written from the cited AWS documentation. */
export const D2_QUESTIONS: readonly Question[] = [
  {
    id: 'clf-d2-0001',
    revision: 1,
    type: 'single',
    stem: "Under the AWS shared responsibility model, which task is the customer's responsibility for an application running on Amazon EC2 instances?",
    options: [
      {
        id: 'a',
        text: 'Patching the guest operating system on the instances',
        explanation:
          'Correct. Customers who run EC2 instances manage the guest operating system, including updates and security patches, and any software they install.',
      },
      {
        id: 'b',
        text: 'Maintaining physical security at AWS data centers',
        explanation: 'AWS is responsible for the physical security of its facilities.',
      },
      {
        id: 'c',
        text: 'Replacing failed hardware in the host servers',
        explanation: 'AWS manages the hardware that runs its services.',
      },
      {
        id: 'd',
        text: 'Patching the virtualization layer that runs the instances',
        explanation:
          'The host infrastructure, including the virtualization layer, is part of "security of the cloud", which is AWS\'s responsibility.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'AWS is responsible for security "of" the cloud: hardware, software, networking, and facilities. With EC2, the customer is responsible for the guest OS, installed software, and security group configuration.',
    domain: 'D2',
    taskStatement: '2.1',
    difficulty: 'easy',
    tags: ['Shared responsibility model', 'Amazon EC2'],
    references: [SHARED_RESPONSIBILITY],
    review: REVIEW,
  },
  {
    id: 'clf-d2-0002',
    revision: 1,
    type: 'single',
    stem: "Which of the following is AWS's responsibility under the shared responsibility model?",
    options: [
      {
        id: 'a',
        text: 'Protecting the hardware, networking, and facilities that run AWS services',
        explanation:
          'Correct. AWS is responsible for protecting the infrastructure that runs all of the services offered in the AWS Cloud.',
      },
      {
        id: 'b',
        text: "Classifying the customer's data and choosing encryption options",
        explanation:
          'Customers are responsible for managing their data, including encryption options.',
      },
      {
        id: 'c',
        text: "Configuring the rules in the customer's security groups",
        explanation: 'Customers configure their own security group firewall rules.',
      },
      {
        id: 'd',
        text: "Granting IAM permissions to the customer's employees",
        explanation: 'Customers use IAM to decide who can access their resources.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'AWS secures the cloud itself. Customers secure what they put in the cloud: their data, identities, permissions, and configurations.',
    domain: 'D2',
    taskStatement: '2.1',
    difficulty: 'easy',
    tags: ['Shared responsibility model'],
    references: [SHARED_RESPONSIBILITY],
    review: REVIEW,
  },
  {
    id: 'clf-d2-0003',
    revision: 1,
    type: 'multiple',
    stem: "A company stores data in Amazon S3 and Amazon DynamoDB. Under the shared responsibility model, which tasks remain the company's responsibility?",
    options: [
      {
        id: 'a',
        text: 'Managing who has permission to access the stored data',
        explanation:
          'Correct. For abstracted services, customers still manage access permissions, for example with IAM policies.',
      },
      {
        id: 'b',
        text: 'Deciding whether and how to encrypt the data',
        explanation:
          'Correct. Customers are responsible for managing their data, including encryption options.',
      },
      {
        id: 'c',
        text: 'Patching the operating systems of the servers that run these services',
        explanation:
          'For abstracted services such as S3 and DynamoDB, AWS operates the infrastructure layer, the operating system, and the platform.',
      },
      {
        id: 'd',
        text: 'Maintaining the storage hardware',
        explanation: 'AWS maintains the hardware that runs its services.',
      },
      {
        id: 'e',
        text: 'Securing the buildings where the data is stored',
        explanation: "Physical security of facilities is AWS's responsibility.",
      },
    ],
    correctOptionIds: ['a', 'b'],
    explanation:
      'The split of responsibilities depends on the service. With abstracted services, AWS runs the infrastructure, OS, and platform, while customers manage their data (including encryption) and permissions.',
    domain: 'D2',
    taskStatement: '2.1',
    difficulty: 'medium',
    tags: ['Shared responsibility model', 'Amazon S3', 'Amazon DynamoDB'],
    references: [SHARED_RESPONSIBILITY],
    review: REVIEW,
  },
  {
    id: 'clf-d2-0004',
    revision: 1,
    type: 'single',
    stem: "An auditor asks a company for AWS's SOC and PCI compliance reports. Where can the company download these reports?",
    options: [
      {
        id: 'a',
        text: 'AWS Artifact',
        explanation:
          'Correct. AWS Artifact provides on-demand downloads of AWS security and compliance documents, such as SOC reports and PCI reports, free of charge.',
      },
      {
        id: 'b',
        text: 'AWS Config',
        explanation: 'AWS Config records and evaluates the configuration of your own resources.',
      },
      {
        id: 'c',
        text: 'AWS Security Hub',
        explanation:
          "AWS Security Hub aggregates security findings about your own environment. It does not provide AWS's audit reports.",
      },
      {
        id: 'd',
        text: 'Amazon Inspector',
        explanation: 'Amazon Inspector scans your workloads for software vulnerabilities.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'AWS Artifact is where you get AWS compliance documents (for example ISO, PCI, and SOC reports) and manage agreements with AWS.',
    domain: 'D2',
    taskStatement: '2.2',
    difficulty: 'easy',
    tags: ['AWS Artifact', 'Compliance'],
    references: [
      {
        title: 'What is AWS Artifact?',
        url: 'https://docs.aws.amazon.com/artifact/latest/ug/what-is-aws-artifact.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d2-0005',
    revision: 1,
    type: 'single',
    stem: 'A security team needs to find out which IAM user deleted an Amazon S3 bucket yesterday. Which service records this information?',
    options: [
      {
        id: 'a',
        text: 'AWS CloudTrail',
        explanation:
          'Correct. CloudTrail records actions taken by users, roles, and AWS services as events, including who made a request and when.',
      },
      {
        id: 'b',
        text: 'Amazon CloudWatch',
        explanation:
          'CloudWatch monitors metrics, logs, and alarms for resources and applications. It is not the record of who called which API.',
      },
      {
        id: 'c',
        text: 'AWS Trusted Advisor',
        explanation:
          'Trusted Advisor checks your environment against best practices. It does not log individual API actions.',
      },
      {
        id: 'd',
        text: 'Amazon Inspector',
        explanation: 'Amazon Inspector scans workloads for software vulnerabilities.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'AWS CloudTrail is the auditing service for API activity. It answers "who did what, and when" for actions in your AWS account.',
    domain: 'D2',
    taskStatement: '2.2',
    difficulty: 'easy',
    tags: ['AWS CloudTrail', 'Auditing'],
    references: [
      {
        title: 'What is AWS CloudTrail?',
        url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d2-0006',
    revision: 1,
    type: 'single',
    stem: 'A company must keep a history of configuration changes to its AWS resources and automatically check whether resources follow internal rules, such as requiring encrypted Amazon EBS volumes. Which service meets these needs?',
    options: [
      {
        id: 'a',
        text: 'AWS Config',
        explanation:
          'Correct. AWS Config records resource configurations and how they change over time, and evaluates them against rules you define.',
      },
      {
        id: 'b',
        text: 'AWS CloudTrail',
        explanation:
          'CloudTrail logs API activity. It does not evaluate resource configurations against compliance rules.',
      },
      {
        id: 'c',
        text: 'AWS Artifact',
        explanation:
          'AWS Artifact provides AWS compliance reports, not checks on your own resources.',
      },
      {
        id: 'd',
        text: 'AWS Shield',
        explanation: 'AWS Shield protects applications against DDoS attacks.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      "AWS Config gives a detailed view of resource configurations, tracks changes, and uses rules to flag resources that don't comply.",
    domain: 'D2',
    taskStatement: '2.2',
    difficulty: 'medium',
    tags: ['AWS Config', 'Governance'],
    references: [
      {
        title: 'What is AWS Config?',
        url: 'https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d2-0007',
    revision: 1,
    type: 'single',
    stem: 'A company wants to collect CPU utilization metrics for its Amazon EC2 instances and be alerted when CPU utilization stays above 80% for 10 minutes. Which service should it use?',
    options: [
      {
        id: 'a',
        text: 'Amazon CloudWatch',
        explanation:
          'Correct. CloudWatch collects metrics from AWS resources, and CloudWatch alarms can notify you when a metric crosses a threshold for a period of time.',
      },
      {
        id: 'b',
        text: 'AWS CloudTrail',
        explanation: 'CloudTrail records API activity. It does not collect performance metrics.',
      },
      {
        id: 'c',
        text: 'AWS Config',
        explanation: 'AWS Config tracks resource configurations, not performance metrics.',
      },
      {
        id: 'd',
        text: 'AWS Artifact',
        explanation: 'AWS Artifact provides compliance documents.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Amazon CloudWatch monitors resources and applications in real time. Its alarms watch metrics and act, for example by sending a notification, when a threshold is breached.',
    domain: 'D2',
    taskStatement: '2.2',
    difficulty: 'easy',
    tags: ['Amazon CloudWatch', 'Monitoring'],
    references: [
      {
        title: 'What is Amazon CloudWatch?',
        url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d2-0008',
    revision: 1,
    type: 'single',
    stem: 'Which is a recommended practice for the AWS account root user?',
    options: [
      {
        id: 'a',
        text: 'Protect it with multi-factor authentication (MFA) and use it only for tasks that require root user credentials',
        explanation:
          'Correct. AWS strongly recommends not using the root user for everyday tasks and protecting it with MFA.',
      },
      {
        id: 'b',
        text: 'Use it for daily administration so that permissions are never missing',
        explanation:
          'AWS recommends an administrative user (for example in IAM Identity Center) for daily tasks, not the root user.',
      },
      {
        id: 'c',
        text: 'Share its credentials with the operations team for emergencies',
        explanation:
          'Sharing root credentials removes accountability and increases risk. They should be tightly safeguarded.',
      },
      {
        id: 'd',
        text: 'Create root user access keys for automated scripts',
        explanation:
          'Automation should use roles or least-privilege identities. Long-term root access keys are a significant risk.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'The root user has complete access to all resources in the account. Safeguard it with MFA and use it only for the few tasks that require it.',
    domain: 'D2',
    taskStatement: '2.3',
    difficulty: 'easy',
    tags: ['AWS IAM', 'Root user', 'MFA'],
    references: [ROOT_USER],
    review: REVIEW,
  },
  {
    id: 'clf-d2-0009',
    revision: 1,
    type: 'single',
    stem: 'An application running on an Amazon EC2 instance needs to read objects from one Amazon S3 bucket. What is the most secure way to give it access?',
    options: [
      {
        id: 'a',
        text: 'Attach an IAM role to the instance with a policy that allows reading only from that bucket',
        explanation:
          'Correct. An IAM role provides temporary credentials to the instance automatically, and a least-privilege policy limits access to what is needed.',
      },
      {
        id: 'b',
        text: "Store an IAM user's access keys in the application's configuration file",
        explanation:
          'Long-term access keys stored on the instance can leak and must be rotated manually. Roles avoid this.',
      },
      {
        id: 'c',
        text: 'Make the S3 bucket publicly readable',
        explanation: 'This exposes the data to anyone on the internet.',
      },
      {
        id: 'd',
        text: "Use the root user's access keys in the application",
        explanation:
          'Root credentials have unrestricted access to the account and should never be used by applications.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'IAM roles for EC2 deliver temporary credentials to applications on the instance. Combined with least privilege, this is the recommended way to grant AWS access to workloads.',
    domain: 'D2',
    taskStatement: '2.3',
    difficulty: 'medium',
    tags: ['AWS IAM', 'IAM roles', 'Least privilege'],
    references: [
      {
        title:
          'Use an IAM role to grant permissions to applications running on Amazon EC2 instances',
        url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d2-0010',
    revision: 1,
    type: 'multiple',
    stem: 'A company has a standalone AWS account that is not part of AWS Organizations. Which tasks can be performed only by signing in as the root user?',
    options: [
      {
        id: 'a',
        text: 'Close the AWS account',
        explanation:
          'Correct. Standalone accounts require root user credentials to close the account.',
      },
      {
        id: 'b',
        text: "Change the root user's email address",
        explanation:
          'Correct. Standalone accounts require root user credentials to update the email address, root password, and root access keys.',
      },
      {
        id: 'c',
        text: 'Create an IAM user with administrator permissions',
        explanation: 'An IAM identity with sufficient IAM permissions can create users.',
      },
      {
        id: 'd',
        text: "Update the account's alternate contacts",
        explanation:
          "Account settings such as account name, contact information, and alternate contacts don't require root user credentials.",
      },
      {
        id: 'e',
        text: 'Create a cost budget in AWS Budgets',
        explanation: 'Users with the right permissions can create budgets.',
      },
    ],
    correctOptionIds: ['a', 'b'],
    explanation:
      'Only a small set of tasks requires the root user, including closing a standalone account and changing its root email address or password. Everything else should be done with least-privilege identities.',
    domain: 'D2',
    taskStatement: '2.3',
    difficulty: 'hard',
    tags: ['Root user', 'AWS IAM'],
    references: [
      {
        title: 'IAM User Guide: Tasks that require root user credentials',
        url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html#root-user-tasks',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d2-0011',
    revision: 1,
    type: 'single',
    stem: 'Which service continuously monitors AWS accounts for malicious or unauthorized activity, such as unusual API calls or communication with known malicious IP addresses, and produces security findings?',
    options: [
      {
        id: 'a',
        text: 'Amazon GuardDuty',
        explanation:
          'Correct. GuardDuty is a threat detection service that analyzes sources such as CloudTrail events, VPC Flow Logs, and DNS logs to identify threats.',
      },
      {
        id: 'b',
        text: 'Amazon Inspector',
        explanation:
          'Amazon Inspector scans workloads for software vulnerabilities and unintended network exposure.',
      },
      {
        id: 'c',
        text: 'AWS Shield',
        explanation: 'AWS Shield protects against distributed denial of service (DDoS) attacks.',
      },
      {
        id: 'd',
        text: 'AWS Artifact',
        explanation: 'AWS Artifact provides AWS compliance reports.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Amazon GuardDuty uses threat intelligence and machine learning to detect suspicious activity across your accounts and reports it as findings.',
    domain: 'D2',
    taskStatement: '2.4',
    difficulty: 'easy',
    tags: ['Amazon GuardDuty', 'Threat detection'],
    references: [
      {
        title: 'What is Amazon GuardDuty?',
        url: 'https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d2-0012',
    revision: 1,
    type: 'single',
    stem: "A company's public web application is receiving SQL injection attempts in HTTP requests. Which service can inspect and block these requests?",
    options: [
      {
        id: 'a',
        text: 'AWS WAF',
        explanation:
          'Correct. AWS WAF is a web application firewall that filters HTTP(S) requests using rules, including protections against SQL injection.',
      },
      {
        id: 'b',
        text: 'AWS Shield Standard',
        explanation:
          'Shield Standard automatically protects all customers against common network and transport layer DDoS attacks at no additional charge. It does not filter application-layer requests like SQL injection.',
      },
      {
        id: 'c',
        text: 'Amazon GuardDuty',
        explanation:
          'GuardDuty detects threats and reports findings. It does not sit in front of the application to block web requests.',
      },
      {
        id: 'd',
        text: 'Amazon Macie',
        explanation: 'Amazon Macie discovers and protects sensitive data stored in Amazon S3.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'AWS WAF inspects web requests to resources such as Amazon CloudFront distributions and Application Load Balancers, and blocks requests that match attack patterns.',
    domain: 'D2',
    taskStatement: '2.4',
    difficulty: 'medium',
    tags: ['AWS WAF', 'AWS Shield'],
    references: [
      {
        title: 'AWS WAF Developer Guide: AWS WAF',
        url: 'https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html',
      },
      {
        title: 'AWS Shield Standard overview',
        url: 'https://docs.aws.amazon.com/waf/latest/developerguide/ddos-standard-summary.html',
      },
    ],
    review: REVIEW,
  },
];
