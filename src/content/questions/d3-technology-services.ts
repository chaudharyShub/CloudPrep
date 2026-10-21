import type { Question } from '@/domain/questions/types';

const AZ_DOC = {
  title: 'AWS Fault Isolation Boundaries: Availability Zones',
  url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/availability-zones.html',
};
const REVIEW = { status: 'checked', lastVerified: '2026-10-21' } as const;

/** Domain 3: Cloud Technology and Services. Original questions written from the cited AWS documentation. */
export const D3_QUESTIONS: readonly Question[] = [
  {
    id: 'clf-d3-0001',
    revision: 1,
    type: 'single',
    stem: 'A team wants to define its VPCs, Amazon EC2 instances, and databases in template files so it can create identical environments repeatedly. Which service supports this infrastructure as code approach?',
    options: [
      {
        id: 'a',
        text: 'AWS CloudFormation',
        explanation:
          'Correct. CloudFormation provisions and manages AWS resources from templates, so you can create the same environment repeatedly and predictably.',
      },
      {
        id: 'b',
        text: 'AWS Config',
        explanation:
          "AWS Config records and evaluates resource configurations. It doesn't create resources from templates.",
      },
      {
        id: 'c',
        text: 'AWS CloudTrail',
        explanation: 'CloudTrail logs API activity.',
      },
      {
        id: 'd',
        text: 'The AWS Management Console',
        explanation:
          'The console suits one-time, manual operations. Repeatable environments are better created from code.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      "Infrastructure as code turns environments into repeatable, version-controlled templates. AWS CloudFormation is AWS's IaC service.",
    domain: 'D3',
    taskStatement: '3.1',
    difficulty: 'easy',
    tags: ['AWS CloudFormation', 'Infrastructure as code'],
    references: [
      {
        title: 'What is AWS CloudFormation?',
        url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d3-0002',
    revision: 1,
    type: 'single',
    stem: 'Which statement describes an Availability Zone?',
    options: [
      {
        id: 'a',
        text: 'One or more discrete data centers with redundant power, networking, and connectivity in an AWS Region',
        explanation: 'Correct. This is how AWS defines an Availability Zone.',
      },
      {
        id: 'b',
        text: 'A geographic area that contains several AWS Regions',
        explanation:
          'This reverses the relationship. A Region contains multiple Availability Zones.',
      },
      {
        id: 'c',
        text: 'A site that caches content close to users for Amazon CloudFront',
        explanation: 'That describes an edge location.',
      },
      {
        id: 'd',
        text: 'A single server rack inside an AWS data center',
        explanation: 'An Availability Zone is much larger: one or more entire data centers.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      "Availability Zones in a Region are physically separated so they don't share common points of failure, but are connected with high-bandwidth, low-latency networking.",
    domain: 'D3',
    taskStatement: '3.2',
    difficulty: 'easy',
    tags: ['Global infrastructure', 'Availability Zones'],
    references: [AZ_DOC],
    review: REVIEW,
  },
  {
    id: 'clf-d3-0003',
    revision: 1,
    type: 'single',
    stem: 'A company runs its web application on Amazon EC2 instances in a single Availability Zone. How can it keep the application available if that Availability Zone fails?',
    options: [
      {
        id: 'a',
        text: 'Run instances in at least two Availability Zones behind a load balancer',
        explanation:
          "Correct. Availability Zones don't share single points of failure, so spreading instances across them keeps the application running if one zone has a problem.",
      },
      {
        id: 'b',
        text: 'Use larger instance types in the same Availability Zone',
        explanation: 'Bigger instances in the same zone still fail together with that zone.',
      },
      {
        id: 'c',
        text: 'Take daily Amazon EBS snapshots',
        explanation:
          "Snapshots help recover data, but they don't keep the application running during an Availability Zone failure.",
      },
      {
        id: 'd',
        text: 'Move the instances to a Dedicated Host',
        explanation:
          'A Dedicated Host is a single physical server in one Availability Zone. It does not add resilience.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'High availability on AWS starts with deploying across multiple Availability Zones. A load balancer sends traffic only to healthy instances.',
    domain: 'D3',
    taskStatement: '3.2',
    difficulty: 'medium',
    tags: ['High availability', 'Availability Zones', 'Elastic Load Balancing'],
    references: [
      AZ_DOC,
      {
        title: 'What is Elastic Load Balancing?',
        url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d3-0004',
    revision: 1,
    type: 'multiple',
    stem: 'Which are valid reasons for a company to deploy a workload in more than one AWS Region?',
    options: [
      {
        id: 'a',
        text: 'To keep certain data within a specific country to meet data sovereignty requirements',
        explanation:
          'Correct. Customers choose the Regions where their data is stored, which helps meet data residency requirements.',
      },
      {
        id: 'b',
        text: 'To recover from a disaster that affects an entire Region',
        explanation:
          'Correct. Disaster recovery and business continuity are common reasons to use multiple Regions.',
      },
      {
        id: 'c',
        text: 'To remove the need to back up data',
        explanation:
          "Multi-Region deployments don't replace backups. Backups protect against problems such as accidental deletion or corruption, which replication can copy.",
      },
      {
        id: 'd',
        text: 'To automatically lower the price of every AWS service',
        explanation:
          "Using more Regions doesn't lower prices. Running in additional Regions usually adds cost.",
      },
      {
        id: 'e',
        text: 'To stop being responsible for security configuration',
        explanation: 'The shared responsibility model applies in every Region.',
      },
    ],
    correctOptionIds: ['a', 'b'],
    explanation:
      'The exam guide lists disaster recovery, business continuity, low latency for end users, and data sovereignty as reasons to use multiple Regions.',
    domain: 'D3',
    taskStatement: '3.2',
    difficulty: 'medium',
    tags: ['Global infrastructure', 'Regions', 'Disaster recovery'],
    references: [
      {
        title: 'CLF-C02 exam guide: Content Domain 3',
        url: 'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02-domain3.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d3-0005',
    revision: 1,
    type: 'single',
    stem: 'A company serves images and videos to users around the world. It wants to reduce latency by caching this content at locations close to viewers. Which service should it use?',
    options: [
      {
        id: 'a',
        text: 'Amazon CloudFront',
        explanation:
          'Correct. CloudFront is a content delivery network that caches content at edge locations, so requests are served from a location close to the viewer.',
      },
      {
        id: 'b',
        text: 'Amazon Route 53',
        explanation:
          "Route 53 is a DNS service. It routes users to endpoints but doesn't cache content.",
      },
      {
        id: 'c',
        text: 'AWS Direct Connect',
        explanation:
          "Direct Connect provides a dedicated network connection from on-premises to AWS. It doesn't deliver content to end users.",
      },
      {
        id: 'd',
        text: 'Amazon EBS',
        explanation: 'Amazon EBS provides block storage volumes for EC2 instances.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Edge locations let CloudFront serve cached content close to users, which lowers latency for a global audience.',
    domain: 'D3',
    taskStatement: '3.2',
    difficulty: 'easy',
    tags: ['Amazon CloudFront', 'Edge locations'],
    references: [
      {
        title: 'What is Amazon CloudFront?',
        url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d3-0006',
    revision: 1,
    type: 'single',
    stem: 'A developer wants to run code whenever a file is uploaded to an Amazon S3 bucket, without provisioning or managing servers, and pay only for the compute time used. Which service fits best?',
    options: [
      {
        id: 'a',
        text: 'AWS Lambda',
        explanation:
          'Correct. Lambda runs code in response to events without servers to manage, and you pay only for the compute time you use.',
      },
      {
        id: 'b',
        text: 'Amazon EC2',
        explanation:
          'EC2 provides virtual servers that you provision, manage, and pay for while they run, even when idle.',
      },
      {
        id: 'c',
        text: 'AWS Elastic Beanstalk',
        explanation:
          "Elastic Beanstalk deploys applications onto resources such as EC2 instances that run continuously. It isn't event-driven, per-invocation compute.",
      },
      {
        id: 'd',
        text: 'Amazon EBS',
        explanation: "Amazon EBS is block storage. It doesn't run code.",
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'AWS Lambda is serverless, event-driven compute. S3 events can invoke a Lambda function directly.',
    domain: 'D3',
    taskStatement: '3.3',
    difficulty: 'easy',
    tags: ['AWS Lambda', 'Serverless'],
    references: [
      {
        title: 'What is AWS Lambda?',
        url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d3-0007',
    revision: 1,
    type: 'single',
    stem: 'Which service automatically distributes incoming application traffic across multiple targets, such as Amazon EC2 instances, in one or more Availability Zones?',
    options: [
      {
        id: 'a',
        text: 'Elastic Load Balancing',
        explanation:
          'Correct. Elastic Load Balancing distributes incoming traffic across healthy targets in one or more Availability Zones.',
      },
      {
        id: 'b',
        text: 'Amazon EC2 Auto Scaling',
        explanation:
          "Auto Scaling adds and removes instances to match demand. It doesn't route traffic between them.",
      },
      {
        id: 'c',
        text: 'Amazon CloudFront',
        explanation: 'CloudFront caches and delivers content from edge locations.',
      },
      {
        id: 'd',
        text: 'AWS Direct Connect',
        explanation: 'Direct Connect links on-premises networks to AWS.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'A load balancer spreads traffic across targets and stops sending traffic to unhealthy ones. It is often used together with Auto Scaling.',
    domain: 'D3',
    taskStatement: '3.3',
    difficulty: 'easy',
    tags: ['Elastic Load Balancing'],
    references: [
      {
        title: 'What is Elastic Load Balancing?',
        url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d3-0008',
    revision: 1,
    type: 'single',
    stem: 'An application needs a fully managed NoSQL key-value database that delivers single-digit millisecond performance at any scale. Which service fits best?',
    options: [
      {
        id: 'a',
        text: 'Amazon DynamoDB',
        explanation:
          'Correct. DynamoDB is a serverless, fully managed NoSQL database designed for single-digit millisecond performance at any scale.',
      },
      {
        id: 'b',
        text: 'Amazon RDS',
        explanation: 'Amazon RDS runs relational databases, not a NoSQL key-value store.',
      },
      {
        id: 'c',
        text: 'Amazon Aurora',
        explanation: 'Aurora is a relational database compatible with MySQL and PostgreSQL.',
      },
      {
        id: 'd',
        text: 'Amazon Redshift',
        explanation:
          'Redshift is a data warehouse for analytics, not an application key-value store.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'For key-value and document data that needs consistent low latency at scale with no servers to manage, DynamoDB is the AWS NoSQL choice.',
    domain: 'D3',
    taskStatement: '3.4',
    difficulty: 'easy',
    tags: ['Amazon DynamoDB', 'NoSQL'],
    references: [
      {
        title: 'What is Amazon DynamoDB?',
        url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d3-0009',
    revision: 1,
    type: 'single',
    stem: 'A company runs MySQL on its own Amazon EC2 instances and spends a lot of time on backups, software patching, and setting up failover. Which option reduces this operational work the most?',
    options: [
      {
        id: 'a',
        text: 'Migrate the database to Amazon RDS for MySQL',
        explanation:
          'Correct. Amazon RDS is a managed service that automates tasks such as backups, software patching, and Multi-AZ failover.',
      },
      {
        id: 'b',
        text: 'Move the database to larger EC2 instances',
        explanation:
          'Larger instances add capacity but leave all the administration with the company.',
      },
      {
        id: 'c',
        text: 'Store the database files in Amazon S3 Glacier Deep Archive',
        explanation: "Archive storage can't serve a live database.",
      },
      {
        id: 'd',
        text: 'Run the database on EC2 Spot Instances',
        explanation:
          "Spot Instances can be interrupted, which is risky for a database, and they don't reduce administration.",
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Choosing a managed database over a self-managed one on EC2 shifts routine administration to AWS, so the team can focus on the application and data.',
    domain: 'D3',
    taskStatement: '3.4',
    difficulty: 'medium',
    tags: ['Amazon RDS', 'Managed services'],
    references: [
      {
        title: 'What is Amazon Relational Database Service (Amazon RDS)?',
        url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d3-0010',
    revision: 1,
    type: 'single',
    stem: 'Which VPC feature acts as a stateful virtual firewall at the instance level and supports allow rules only?',
    options: [
      {
        id: 'a',
        text: 'Security group',
        explanation:
          'Correct. Security groups operate at the instance level, support allow rules only, and are stateful: return traffic is automatically allowed.',
      },
      {
        id: 'b',
        text: 'Network ACL',
        explanation:
          'Network ACLs operate at the subnet level, support allow and deny rules, and are stateless.',
      },
      {
        id: 'c',
        text: 'Internet gateway',
        explanation:
          "An internet gateway connects a VPC to the internet. It doesn't filter traffic.",
      },
      {
        id: 'd',
        text: 'Route table',
        explanation:
          "Route tables direct traffic between subnets and gateways. They don't filter it.",
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Security groups are the primary way to control network access to resources in a VPC. Network ACLs add a stateless, subnet-level layer of defense.',
    domain: 'D3',
    taskStatement: '3.5',
    difficulty: 'medium',
    tags: ['Amazon VPC', 'Security groups', 'Network ACLs'],
    references: [
      {
        title: 'Amazon VPC: Compare security groups and network ACLs',
        url: 'https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html#VPC_Security_Comparison',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d3-0011',
    revision: 1,
    type: 'single',
    stem: 'Which AWS service provides DNS, domain name registration, and health checking?',
    options: [
      {
        id: 'a',
        text: 'Amazon Route 53',
        explanation:
          'Correct. Route 53 is a DNS web service that can register domain names, route internet traffic to resources, and check their health.',
      },
      {
        id: 'b',
        text: 'Amazon CloudFront',
        explanation:
          "CloudFront delivers content from edge locations. It doesn't register domains.",
      },
      {
        id: 'c',
        text: 'Elastic Load Balancing',
        explanation:
          "Load balancers check the health of their targets but don't provide DNS hosting or domain registration.",
      },
      {
        id: 'd',
        text: 'AWS Direct Connect',
        explanation: 'Direct Connect provides private network connections to AWS.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Amazon Route 53 combines domain registration, DNS routing, and health checks in one service.',
    domain: 'D3',
    taskStatement: '3.5',
    difficulty: 'easy',
    tags: ['Amazon Route 53', 'DNS'],
    references: [
      {
        title: 'What is Amazon Route 53?',
        url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d3-0012',
    revision: 1,
    type: 'single',
    stem: 'A company must keep compliance records for 10 years. The records are accessed less than once a year, and a retrieval time of several hours is acceptable. Which Amazon S3 storage class is designed for this at the lowest storage cost?',
    options: [
      {
        id: 'a',
        text: 'S3 Glacier Deep Archive',
        explanation:
          'Correct. S3 Glacier Deep Archive is for archive data accessed less than once a year and is the lowest-cost storage option in AWS. Standard retrievals typically complete within 12 hours.',
      },
      {
        id: 'b',
        text: 'S3 Standard',
        explanation:
          'S3 Standard is designed for frequently accessed data and costs more to store than archive classes.',
      },
      {
        id: 'c',
        text: 'S3 Standard-IA',
        explanation:
          'Standard-IA is for infrequently accessed data that still needs millisecond access. It costs more to store than archive classes.',
      },
      {
        id: 'd',
        text: 'S3 Glacier Instant Retrieval',
        explanation:
          'Glacier Instant Retrieval offers millisecond access for data accessed about once a quarter. Its storage price is higher than Deep Archive.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'When data is rarely accessed and hours-long retrieval is acceptable, S3 Glacier Deep Archive minimizes storage cost. Lifecycle rules can move objects there automatically.',
    domain: 'D3',
    taskStatement: '3.6',
    difficulty: 'medium',
    tags: ['Amazon S3', 'Storage classes', 'S3 Glacier'],
    references: [
      {
        title: 'Understanding S3 Glacier storage classes for long-term data storage',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/glacier-storage-classes.html',
      },
      {
        title: 'Understanding and managing Amazon S3 storage classes',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d3-0013',
    revision: 1,
    type: 'multiple',
    stem: 'Which statements about storage for Amazon EC2 instances are correct?',
    options: [
      {
        id: 'a',
        text: 'An Amazon EBS volume provides block storage that can be attached to an EC2 instance.',
        explanation: 'Correct. Amazon EBS provides block-level storage volumes for EC2 instances.',
      },
      {
        id: 'b',
        text: 'Data on an Amazon EBS volume can persist independently of the life of the instance.',
        explanation:
          'Correct. EBS volumes are network-attached storage that can persist after the instance stops or is terminated, depending on settings.',
      },
      {
        id: 'c',
        text: 'Amazon EBS is object storage accessed over HTTPS.',
        explanation: 'That describes Amazon S3. EBS is block storage.',
      },
      {
        id: 'd',
        text: 'Instance store volumes keep their data after the instance is stopped or terminated.',
        explanation:
          'Instance store provides temporary storage. Its data persists through a reboot but not when the instance is stopped, hibernated, or terminated.',
      },
      {
        id: 'e',
        text: 'One Amazon EBS volume can be mounted by thousands of instances as a shared file system.',
        explanation:
          'Shared file storage for many instances is what Amazon EFS provides. EBS volumes are attached to an instance (Multi-Attach supports only a small number of instances).',
      },
    ],
    correctOptionIds: ['a', 'b'],
    explanation:
      'Use EBS for persistent block storage, instance store for temporary data, S3 for objects, and EFS for shared file systems.',
    domain: 'D3',
    taskStatement: '3.6',
    difficulty: 'medium',
    tags: ['Amazon EBS', 'Instance store'],
    references: [
      {
        title: 'What is Amazon EBS?',
        url: 'https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html',
      },
      {
        title: 'Data persistence for Amazon EC2 instance store volumes',
        url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-store-lifetime.html',
      },
    ],
    review: {
      ...REVIEW,
      notes:
        'Option b paraphrases EBS persistence (volumes can outlive an instance when not deleted on termination); the current what-is page does not state it in one sentence.',
    },
  },
  {
    id: 'clf-d3-0014',
    revision: 1,
    type: 'single',
    stem: 'Analysts want to run standard SQL queries directly against log files stored in Amazon S3, without loading the data into a database or managing servers. Which service should they use?',
    options: [
      {
        id: 'a',
        text: 'Amazon Athena',
        explanation:
          'Correct. Athena is a serverless, interactive query service that analyzes data directly in Amazon S3 using standard SQL.',
      },
      {
        id: 'b',
        text: 'Amazon Kinesis',
        explanation: 'Kinesis collects and processes streaming data in real time.',
      },
      {
        id: 'c',
        text: 'AWS Glue',
        explanation:
          "AWS Glue discovers, prepares, and transforms data (ETL) and maintains a data catalog. It isn't the interactive SQL query tool.",
      },
      {
        id: 'd',
        text: 'Amazon SageMaker AI',
        explanation:
          'SageMaker AI is for building, training, and deploying machine learning models.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'With Athena you point at data in S3, define a schema, and query it with SQL, paying for the queries you run.',
    domain: 'D3',
    taskStatement: '3.7',
    difficulty: 'easy',
    tags: ['Amazon Athena', 'Analytics'],
    references: [
      {
        title: 'What is Amazon Athena?',
        url: 'https://docs.aws.amazon.com/athena/latest/ug/what-is.html',
      },
    ],
    review: REVIEW,
  },
  {
    id: 'clf-d3-0015',
    revision: 1,
    type: 'single',
    stem: 'An online store wants to decouple its web front end from its order-processing service, so that orders are stored durably until a worker is ready to process them. Which service fits best?',
    options: [
      {
        id: 'a',
        text: 'Amazon Simple Queue Service (Amazon SQS)',
        explanation:
          'Correct. SQS is a managed message queue. Producers send messages that are stored until consumers retrieve and process them.',
      },
      {
        id: 'b',
        text: 'Amazon Simple Notification Service (Amazon SNS)',
        explanation:
          "SNS pushes messages to subscribers (publish/subscribe). It doesn't hold messages for workers to pull later.",
      },
      {
        id: 'c',
        text: 'Amazon Simple Email Service (Amazon SES)',
        explanation: 'SES sends and receives email.',
      },
      {
        id: 'd',
        text: 'Amazon Connect',
        explanation: 'Amazon Connect is a cloud contact center service.',
      },
    ],
    correctOptionIds: ['a'],
    explanation:
      'A queue lets each part of a system work at its own pace. If the processing service is busy or down, orders wait safely in SQS.',
    domain: 'D3',
    taskStatement: '3.8',
    difficulty: 'medium',
    tags: ['Amazon SQS', 'Application integration'],
    references: [
      {
        title: 'What is Amazon Simple Queue Service?',
        url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html',
      },
    ],
    review: REVIEW,
  },
];
