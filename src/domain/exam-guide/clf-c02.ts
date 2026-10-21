/**
 * Facts from the official AWS Certified Cloud Practitioner (CLF-C02) exam guide.
 * Source: https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/
 * Verified: 2026-10-21.
 */

export const EXAM_GUIDE_URL =
  'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/';

export const EXAM_CODE = 'CLF-C02';
export const EXAM_NAME = 'AWS Certified Cloud Practitioner';

export const EXAM_QUESTION_COUNT = 65;
export const EXAM_SCORED_QUESTION_COUNT = 50;
export const EXAM_DURATION_MINUTES = 90;

export type DomainId = 'D1' | 'D2' | 'D3' | 'D4';

// prettier-ignore
export type TaskStatementId =
  | '1.1' | '1.2' | '1.3' | '1.4'
  | '2.1' | '2.2' | '2.3' | '2.4'
  | '3.1' | '3.2' | '3.3' | '3.4' | '3.5' | '3.6' | '3.7' | '3.8'
  | '4.1' | '4.2' | '4.3';

export interface TaskStatement {
  id: TaskStatementId;
  title: string;
}

export interface ExamDomain {
  id: DomainId;
  number: 1 | 2 | 3 | 4;
  name: string;
  /** Share of scored content, as a percentage. */
  weightPercent: number;
  taskStatements: readonly TaskStatement[];
}

export const DOMAINS: readonly ExamDomain[] = [
  {
    id: 'D1',
    number: 1,
    name: 'Cloud Concepts',
    weightPercent: 24,
    taskStatements: [
      { id: '1.1', title: 'Define the benefits of the AWS Cloud' },
      { id: '1.2', title: 'Identify design principles of the AWS Cloud' },
      {
        id: '1.3',
        title: 'Understand the benefits of and strategies for migration to the AWS Cloud',
      },
      { id: '1.4', title: 'Understand concepts of cloud economics' },
    ],
  },
  {
    id: 'D2',
    number: 2,
    name: 'Security and Compliance',
    weightPercent: 30,
    taskStatements: [
      { id: '2.1', title: 'Understand the AWS shared responsibility model' },
      { id: '2.2', title: 'Understand AWS Cloud security, governance, and compliance concepts' },
      { id: '2.3', title: 'Identify AWS access management capabilities' },
      { id: '2.4', title: 'Identify components and resources for security' },
    ],
  },
  {
    id: 'D3',
    number: 3,
    name: 'Cloud Technology and Services',
    weightPercent: 34,
    taskStatements: [
      { id: '3.1', title: 'Define methods of deploying and operating in the AWS Cloud' },
      { id: '3.2', title: 'Define the AWS global infrastructure' },
      { id: '3.3', title: 'Identify AWS compute services' },
      { id: '3.4', title: 'Identify AWS database services' },
      { id: '3.5', title: 'Identify AWS network services' },
      { id: '3.6', title: 'Identify AWS storage services' },
      { id: '3.7', title: 'Identify AWS AI/ML services and analytics services' },
      { id: '3.8', title: 'Identify services from other in-scope AWS service categories' },
    ],
  },
  {
    id: 'D4',
    number: 4,
    name: 'Billing, Pricing, and Support',
    weightPercent: 12,
    taskStatements: [
      { id: '4.1', title: 'Compare AWS pricing models' },
      { id: '4.2', title: 'Understand resources for billing, budget, and cost management' },
      { id: '4.3', title: 'Identify AWS technical resources and AWS Support options' },
    ],
  },
];
