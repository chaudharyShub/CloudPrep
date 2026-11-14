import { CLF_C02 } from '@/domain/exam-guide';
import type { Question } from '@/domain/questions/types';
import { placeholderQuestions, withWritten } from './generate';

/** Bump when the sample questions change. */
export const BANK_VERSION = '2026-11-14.1';

/** Written for the sample bank only; tests rely on their wording. */
const WRITTEN: readonly Question[] = [
  {
    id: 'clf-d1-0001',
    revision: 1,
    type: 'single',
    stem: 'A startup wants to reach customers on several continents and launch its application in a new AWS Region in a few clicks. Which advantage of cloud computing does this describe?',
    options: [
      {
        id: 'a',
        text: 'Go global in minutes',
        explanation:
          'Correct. You can deploy an application in multiple AWS Regions around the world with a few clicks, giving users lower latency at little cost.',
      },
      {
        id: 'b',
        text: 'Trade fixed expense for variable expense',
        explanation:
          'Incorrect. This advantage is about paying only for what you consume instead of investing in data centres up front, not about reach.',
      },
      {
        id: 'c',
        text: 'Benefit from massive economies of scale',
        explanation:
          'Incorrect. This advantage is about lower prices because usage is aggregated across many customers.',
      },
      {
        id: 'd',
        text: 'Stop guessing capacity',
        explanation:
          'Incorrect. This advantage is about scaling up or down with demand instead of predicting capacity in advance.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'AWS lists "go global in minutes" among the six advantages of cloud computing: the AWS global infrastructure lets you deploy in Regions worldwide quickly.',
    domain: 'D1',
    taskStatement: '1.1',
    difficulty: 'easy',
    tags: ['sample', 'cloud benefits'],
    references: [
      {
        title: 'Six advantages of cloud computing',
        url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-overview/six-advantages-of-cloud-computing.html',
      },
    ],
    review: { status: 'checked', lastVerified: '2026-11-14' },
  },
  {
    id: 'clf-d2-0003',
    revision: 1,
    type: 'multiple',
    stem: 'A company stores files in Amazon S3. Under the AWS shared responsibility model, which tasks are the responsibility of the company? (Select TWO.)',
    options: [
      {
        id: 'a',
        text: 'Managing who has permission to read and write the files',
        explanation:
          'Correct. Customers are responsible for identity and access management, such as IAM and bucket policies.',
      },
      {
        id: 'b',
        text: 'Maintaining the storage hardware that holds the files',
        explanation: 'Incorrect. AWS maintains the hardware that runs its services.',
      },
      {
        id: 'c',
        text: 'Deciding whether and how to encrypt the files',
        explanation:
          'Correct. Customers choose and configure encryption for their data; AWS provides the features.',
      },
      {
        id: 'd',
        text: 'Securing the buildings of the AWS data centres',
        explanation: 'Incorrect. Physical security of data centres is the responsibility of AWS.',
      },
      {
        id: 'e',
        text: 'Patching the software that runs the Amazon S3 service',
        explanation:
          'Incorrect. For managed services such as Amazon S3, AWS operates and patches the service itself.',
      },
    ],
    correctOptionIds: ['a', 'c'],
    explanation:
      'AWS is responsible for security of the cloud (hardware, facilities, managed service software). Customers are responsible for security in the cloud, including access to their data and how it is encrypted.',
    domain: 'D2',
    taskStatement: '2.1',
    difficulty: 'easy',
    tags: ['sample', 'shared responsibility'],
    references: [
      {
        title: 'Shared responsibility model',
        url: 'https://aws.amazon.com/compliance/shared-responsibility-model/',
      },
    ],
    review: { status: 'checked', lastVerified: '2026-11-14' },
  },
  {
    id: 'clf-d2-0005',
    revision: 1,
    type: 'single',
    stem: 'A security team needs to find out which IAM user deleted an Amazon S3 bucket last week. Which AWS service records this information?',
    options: [
      {
        id: 'a',
        text: 'AWS CloudTrail',
        explanation:
          'Correct. CloudTrail records actions taken by users, roles and AWS services as events, including who made each API call and when.',
      },
      {
        id: 'b',
        text: 'Amazon CloudWatch',
        explanation:
          'Incorrect. CloudWatch collects metrics, logs and alarms about resources; it is not the record of who called which API.',
      },
      {
        id: 'c',
        text: 'AWS Trusted Advisor',
        explanation:
          'Incorrect. Trusted Advisor gives best-practice checks and recommendations, not a history of user actions.',
      },
      {
        id: 'd',
        text: 'Amazon Inspector',
        explanation:
          'Incorrect. Inspector scans workloads for software vulnerabilities and unintended network exposure.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'AWS CloudTrail keeps an event history of account activity, so you can see which identity deleted the bucket and when.',
    domain: 'D2',
    taskStatement: '2.2',
    difficulty: 'medium',
    tags: ['sample', 'CloudTrail'],
    references: [
      {
        title: 'What is AWS CloudTrail?',
        url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html',
      },
    ],
    review: { status: 'checked', lastVerified: '2026-11-14' },
  },
];

/** The public CLF-C02 sample bank (D-072): enough for a full 65-question exam. */
export const QUESTION_BANK: readonly Question[] = withWritten(
  placeholderQuestions(CLF_C02, { D1: 20, D2: 24, D3: 28, D4: 18 }),
  WRITTEN,
);
