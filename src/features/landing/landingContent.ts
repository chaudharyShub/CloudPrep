/** Landing page text that differs by exam (D-066). */

export interface LandingExample {
  /** An original question for the hero card, not from a real exam. */
  readonly stem: string;
  readonly options: readonly { readonly letter: 'A' | 'B' | 'C' | 'D'; readonly text: string }[];
  /** The option the demo picks. */
  readonly picked: 'A' | 'B' | 'C' | 'D';
}

export interface LandingContent {
  /**
   * Published questions, for the metrics strip; null hides that metric. Update it when the
   * published bank grows (README has the count).
   */
  readonly bankSize: string | null;
  readonly example: LandingExample;
}

const CLF: LandingContent = {
  bankSize: '2,000',
  example: {
    stem: 'A startup wants to run code only when an image is uploaded, without managing servers, and pay only for the time the code runs. Which service fits best?',
    options: [
      { letter: 'A', text: 'Amazon EC2 Reserved Instances' },
      { letter: 'B', text: 'AWS Lambda' },
      { letter: 'C', text: 'Amazon Lightsail' },
      { letter: 'D', text: 'AWS Outposts' },
    ],
    picked: 'B',
  },
};

const CONTENT: Readonly<Record<string, LandingContent>> = {
  'clf-c02': CLF,
  'saa-c03': {
    bankSize: '1,000',
    example: {
      stem: 'A web application runs on Amazon EC2 instances in one Availability Zone. It must keep serving users if that zone fails, with the least operational effort. Which design meets this?',
      options: [
        { letter: 'A', text: 'Take nightly AMI backups of each instance' },
        {
          letter: 'B',
          text: 'An Auto Scaling group across several Availability Zones behind an Application Load Balancer',
        },
        { letter: 'C', text: 'A larger instance type in the same Availability Zone' },
        { letter: 'D', text: 'A second Amazon EBS volume on each instance' },
      ],
      picked: 'B',
    },
  },
  'dva-c03': {
    bankSize: '1,000',
    example: {
      stem: 'A Lambda function calls a partner API with a key that must not be stored in code and must be rotated automatically. Where should the developer keep the key?',
      options: [
        { letter: 'A', text: 'A plain-text Lambda environment variable' },
        { letter: 'B', text: 'AWS Secrets Manager' },
        { letter: 'C', text: 'A file in the deployment package' },
        { letter: 'D', text: 'An Amazon S3 object with public read access' },
      ],
      picked: 'B',
    },
  },
};

export function landingContent(examId: string): LandingContent {
  return CONTENT[examId] ?? CLF;
}
