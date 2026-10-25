import type { SourceReference } from '@/domain/questions/types';

/**
 * AWS documentation pages cited by questions. Every URL was fetched and returned HTTP 200 on
 * 2026-10-21 (scripts/check-references.mjs re-checks them). Cite pages by key.
 */
export const REFS = {
  abuse: {
    title: 'Report Amazon AWS abuse',
    url: 'https://repost.aws/knowledge-center/report-aws-abuse',
  },
  accessAnalyzer: {
    title: 'Using AWS Identity and Access Management Access Analyzer',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html',
  },
  acm: { title: 'AWS Certificate Manager', url: 'https://aws.amazon.com/certificate-manager/' },
  acmPricing: {
    title: 'AWS Certificate Manager pricing',
    url: 'https://aws.amazon.com/certificate-manager/pricing/',
  },
  amazonQ: { title: 'Amazon Q', url: 'https://aws.amazon.com/q/' },
  amis: {
    title: 'Amazon Machine Images (AMIs)',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html',
  },
  amplify: { title: 'AWS Amplify', url: 'https://aws.amazon.com/amplify/' },
  apiGateway: { title: 'Amazon API Gateway', url: 'https://aws.amazon.com/api-gateway/' },
  appDiscoveryDocs: {
    title: 'What is AWS Application Discovery Service?',
    url: 'https://docs.aws.amazon.com/application-discovery/latest/userguide/what-is-appdiscovery.html',
  },
  appRunner: { title: 'AWS App Runner', url: 'https://aws.amazon.com/apprunner/' },
  appStream: { title: 'Amazon AppStream 2.0', url: 'https://aws.amazon.com/appstream2/' },
  appSync: { title: 'AWS AppSync', url: 'https://aws.amazon.com/appsync/' },
  artifact: { title: 'AWS Artifact', url: 'https://aws.amazon.com/artifact/' },
  artifactDocs: {
    title: 'What is AWS Artifact?',
    url: 'https://docs.aws.amazon.com/artifact/latest/ug/what-is-aws-artifact.html',
  },
  artifactDownload: {
    title: 'Downloading reports in AWS Artifact',
    url: 'https://docs.aws.amazon.com/artifact/latest/ug/downloading-documents.html',
  },
  athena: { title: 'Amazon Athena', url: 'https://aws.amazon.com/athena/' },
  athenaDocs: {
    title: 'What is Amazon Athena?',
    url: 'https://docs.aws.amazon.com/athena/latest/ug/what-is.html',
  },
  auditManager: { title: 'AWS Audit Manager', url: 'https://aws.amazon.com/audit-manager/' },
  aurora: { title: 'Amazon Aurora', url: 'https://aws.amazon.com/rds/aurora/' },
  autoScaling: { title: 'Amazon EC2 Auto Scaling', url: 'https://aws.amazon.com/ec2/autoscaling/' },
  awsAutoScaling: { title: 'AWS Auto Scaling', url: 'https://aws.amazon.com/autoscaling/' },
  backup: { title: 'AWS Backup', url: 'https://aws.amazon.com/backup/' },
  batch: { title: 'AWS Batch', url: 'https://aws.amazon.com/batch/' },
  beanstalk: { title: 'AWS Elastic Beanstalk', url: 'https://aws.amazon.com/elasticbeanstalk/' },
  bedrock: { title: 'Amazon Bedrock', url: 'https://aws.amazon.com/bedrock/' },
  bedrockDocs: {
    title: 'What is Amazon Bedrock?',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html',
  },
  billingConsole: {
    title: 'What is AWS Billing and Cost Management?',
    url: 'https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-what-is.html',
  },
  blogs: { title: 'AWS Blogs', url: 'https://aws.amazon.com/blogs/' },
  budgets: { title: 'AWS Budgets', url: 'https://aws.amazon.com/aws-cost-management/aws-budgets/' },
  budgetsDocs: {
    title: 'Managing your costs with AWS Budgets',
    url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html',
  },
  businessSupport: {
    title: 'AWS Business Support',
    url: 'https://aws.amazon.com/premiumsupport/plans/business/',
  },
  caf: {
    title: 'AWS Cloud Adoption Framework',
    url: 'https://aws.amazon.com/cloud-adoption-framework/',
  },
  cafBusiness: {
    title: 'AWS CAF: Business perspective',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/business-perspective.html',
  },
  cafFoundational: {
    title: 'AWS CAF: Foundational capabilities',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/foundational-capabilities.html',
  },
  cafGovernance: {
    title: 'AWS CAF: Governance perspective',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/governance-perspective.html',
  },
  cafOperations: {
    title: 'AWS CAF: Operations perspective',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/operations-perspective.html',
  },
  cafPeople: {
    title: 'AWS CAF: People perspective',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/people-perspective.html',
  },
  cafPlatform: {
    title: 'AWS CAF: Platform perspective',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/platform-perspective.html',
  },
  cafSecurity: {
    title: 'AWS CAF: Security perspective',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/security-perspective.html',
  },
  cafWhitepaper: {
    title: 'An Overview of the AWS Cloud Adoption Framework',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/welcome.html',
  },
  cdk: { title: 'AWS Cloud Development Kit', url: 'https://aws.amazon.com/cdk/' },
  ceRightsizing: {
    title: 'Optimizing your cost with rightsizing recommendations',
    url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/ce-rightsizing.html',
  },
  cli: { title: 'AWS Command Line Interface', url: 'https://aws.amazon.com/cli/' },
  clientVpn: { title: 'AWS Client VPN', url: 'https://aws.amazon.com/vpn/client-vpn/' },
  cloudEconomics: { title: 'AWS Cloud Economics', url: 'https://aws.amazon.com/economics/' },
  cloudFormation: { title: 'AWS CloudFormation', url: 'https://aws.amazon.com/cloudformation/' },
  cloudFormationDocs: {
    title: 'What is AWS CloudFormation?',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html',
  },
  cloudFront: { title: 'Amazon CloudFront', url: 'https://aws.amazon.com/cloudfront/' },
  cloudFrontDocs: {
    title: 'What is Amazon CloudFront?',
    url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html',
  },
  cloudHsm: { title: 'AWS CloudHSM', url: 'https://aws.amazon.com/cloudhsm/' },
  cloudSecurity: { title: 'AWS Cloud Security', url: 'https://aws.amazon.com/security/' },
  cloudShell: { title: 'AWS CloudShell', url: 'https://aws.amazon.com/cloudshell/' },
  cloudTrail: { title: 'AWS CloudTrail', url: 'https://aws.amazon.com/cloudtrail/' },
  cloudTrailDocs: {
    title: 'What is AWS CloudTrail?',
    url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html',
  },
  cloudTrailEventHistory: {
    title: 'Working with CloudTrail event history',
    url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/view-cloudtrail-events.html',
  },
  cloudTrailLake: {
    title: 'Working with AWS CloudTrail Lake',
    url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-lake.html',
  },
  cloudTrailOrgTrail: {
    title: 'Creating a trail for an organization',
    url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/creating-trail-organization.html',
  },
  cloudTrailValidation: {
    title: 'Validating CloudTrail log file integrity',
    url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-intro.html',
  },
  cloudTypes: {
    title: 'Overview of AWS: Types of cloud computing',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-overview/types-of-cloud-computing.html',
  },
  cloudVsOnPrem: {
    title: 'What is the difference between cloud and on premises?',
    url: 'https://aws.amazon.com/what-is/cloud-vs-on-premises/',
  },
  cloudWatch: { title: 'Amazon CloudWatch', url: 'https://aws.amazon.com/cloudwatch/' },
  cloudWatchDocs: {
    title: 'What is Amazon CloudWatch?',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html',
  },
  codeArtifact: { title: 'AWS CodeArtifact', url: 'https://aws.amazon.com/codeartifact/' },
  codeBuild: { title: 'AWS CodeBuild', url: 'https://aws.amazon.com/codebuild/' },
  codeDeploy: { title: 'AWS CodeDeploy', url: 'https://aws.amazon.com/codedeploy/' },
  codePipeline: { title: 'AWS CodePipeline', url: 'https://aws.amazon.com/codepipeline/' },
  cognito: { title: 'Amazon Cognito', url: 'https://aws.amazon.com/cognito/' },
  cognitoDocs: {
    title: 'What is Amazon Cognito?',
    url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html',
  },
  compliance: {
    title: 'AWS Compliance Programs',
    url: 'https://aws.amazon.com/compliance/programs/',
  },
  comprehend: { title: 'Amazon Comprehend', url: 'https://aws.amazon.com/comprehend/' },
  computeOptimizer: {
    title: 'AWS Compute Optimizer',
    url: 'https://aws.amazon.com/compute-optimizer/',
  },
  config: { title: 'AWS Config', url: 'https://aws.amazon.com/config/' },
  configDocs: {
    title: 'What is AWS Config?',
    url: 'https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html',
  },
  connect: { title: 'Amazon Connect', url: 'https://aws.amazon.com/connect/' },
  console: { title: 'AWS Management Console', url: 'https://aws.amazon.com/console/' },
  consolidatedBilling: {
    title: 'Consolidated billing for AWS Organizations',
    url: 'https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html',
  },
  controlTower: { title: 'AWS Control Tower', url: 'https://aws.amazon.com/controltower/' },
  controlTowerAccountFactory: {
    title: 'Provision and manage accounts with Account Factory',
    url: 'https://docs.aws.amazon.com/controltower/latest/userguide/account-factory.html',
  },
  controlTowerControls: {
    title: 'About controls in AWS Control Tower',
    url: 'https://docs.aws.amazon.com/controltower/latest/controlreference/controls.html',
  },
  controlTowerRegionDeny: {
    title: 'Configure the Region deny control',
    url: 'https://docs.aws.amazon.com/controltower/latest/userguide/region-deny.html',
  },
  costAllocationTags: {
    title: 'Organizing and tracking costs using AWS cost allocation tags',
    url: 'https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html',
  },
  costAnomaly: {
    title: 'AWS Cost Anomaly Detection',
    url: 'https://aws.amazon.com/aws-cost-management/aws-cost-anomaly-detection/',
  },
  costExplorer: {
    title: 'AWS Cost Explorer',
    url: 'https://aws.amazon.com/aws-cost-management/aws-cost-explorer/',
  },
  costExplorerDocs: {
    title: 'Analyzing your costs with AWS Cost Explorer',
    url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html',
  },
  costManagement: {
    title: 'AWS Cloud Financial Management',
    url: 'https://aws.amazon.com/aws-cost-management/',
  },
  countdown: {
    title: 'AWS Countdown',
    url: 'https://aws.amazon.com/premiumsupport/aws-countdown/',
  },
  cur: {
    title: 'AWS Cost and Usage Reports',
    url: 'https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html',
  },
  dataCenterControls: {
    title: 'AWS data center controls',
    url: 'https://aws.amazon.com/compliance/data-center/controls/',
  },
  dataExchange: { title: 'AWS Data Exchange', url: 'https://aws.amazon.com/data-exchange/' },
  dataFirehose: { title: 'Amazon Data Firehose', url: 'https://aws.amazon.com/firehose/' },
  dataPrivacyFaq: {
    title: 'AWS Data Privacy FAQ',
    url: 'https://aws.amazon.com/compliance/data-privacy-faq/',
  },
  dataSync: { title: 'AWS DataSync', url: 'https://aws.amazon.com/datasync/' },
  dataSyncDocs: {
    title: 'What is AWS DataSync?',
    url: 'https://docs.aws.amazon.com/datasync/latest/userguide/what-is-datasync.html',
  },
  dataTransferPricing: {
    title: 'Amazon EC2 On-Demand pricing (data transfer)',
    url: 'https://aws.amazon.com/ec2/pricing/on-demand/',
  },
  dedicatedHosts: {
    title: 'Amazon EC2 Dedicated Hosts',
    url: 'https://aws.amazon.com/ec2/dedicated-hosts/',
  },
  detective: { title: 'Amazon Detective', url: 'https://aws.amazon.com/detective/' },
  deviceFarm: { title: 'AWS Device Farm', url: 'https://aws.amazon.com/device-farm/' },
  directConnect: { title: 'AWS Direct Connect', url: 'https://aws.amazon.com/directconnect/' },
  directoryService: {
    title: 'AWS Directory Service',
    url: 'https://aws.amazon.com/directoryservice/',
  },
  disasterRecovery: {
    title: 'Disaster recovery options in the cloud',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html',
  },
  dms: { title: 'AWS Database Migration Service', url: 'https://aws.amazon.com/dms/' },
  documentation: { title: 'AWS Documentation', url: 'https://docs.aws.amazon.com/' },
  documentdb: { title: 'Amazon DocumentDB', url: 'https://aws.amazon.com/documentdb/' },
  dynamodb: { title: 'Amazon DynamoDB', url: 'https://aws.amazon.com/dynamodb/' },
  dynamodbDocs: {
    title: 'What is Amazon DynamoDB?',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html',
  },
  ebs: { title: 'Amazon EBS', url: 'https://aws.amazon.com/ebs/' },
  ebsDocs: {
    title: 'Amazon EBS volumes',
    url: 'https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes.html',
  },
  ebsPricing: {
    title: 'Amazon EBS pricing',
    url: 'https://aws.amazon.com/ebs/pricing/',
  },
  ebsSnapshotBpa: {
    title: 'Block public access for Amazon EBS snapshots',
    url: 'https://docs.aws.amazon.com/ebs/latest/userguide/block-public-access-snapshots.html',
  },
  ec2: { title: 'Amazon EC2', url: 'https://aws.amazon.com/ec2/' },
  ec2DataProtection: {
    title: 'Data protection in Amazon EC2',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/data-protection.html',
  },
  ec2InfraSecurity: {
    title: 'Infrastructure security in Amazon EC2',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/infrastructure-security.html',
  },
  ec2InstanceTypes: {
    title: 'Amazon EC2 Instance types',
    url: 'https://aws.amazon.com/ec2/instance-types/',
  },
  ec2OptimizeCpu: {
    title: 'CPU options for Amazon EC2 instances',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-optimize-cpu.html',
  },
  ec2Pricing: { title: 'Amazon EC2 pricing', url: 'https://aws.amazon.com/ec2/pricing/' },
  ec2PurchaseOptions: {
    title: 'Amazon EC2 billing and purchasing options',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html',
  },
  ec2Tenancy: {
    title: 'Amazon EC2 Dedicated Instances',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/dedicated-instance.html',
  },
  ec2UserGuide: {
    title: 'What is Amazon EC2?',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html',
  },
  ecr: { title: 'Amazon Elastic Container Registry', url: 'https://aws.amazon.com/ecr/' },
  ecrEnhancedScanning: {
    title: 'Scan images for OS and programming language package vulnerabilities in Amazon ECR',
    url: 'https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning-enhanced.html',
  },
  ecs: { title: 'Amazon Elastic Container Service', url: 'https://aws.amazon.com/ecs/' },
  edgeLocations: {
    title: 'Amazon CloudFront key features (edge locations)',
    url: 'https://aws.amazon.com/cloudfront/features/',
  },
  efs: { title: 'Amazon EFS', url: 'https://aws.amazon.com/efs/' },
  efsDocs: {
    title: 'What is Amazon EFS?',
    url: 'https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html',
  },
  eks: { title: 'Amazon Elastic Kubernetes Service', url: 'https://aws.amazon.com/eks/' },
  eksDocs: {
    title: 'What is Amazon EKS?',
    url: 'https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html',
  },
  elasticDr: {
    title: 'AWS Elastic Disaster Recovery',
    url: 'https://aws.amazon.com/disaster-recovery/',
  },
  elasticache: { title: 'Amazon ElastiCache', url: 'https://aws.amazon.com/elasticache/' },
  elb: { title: 'Elastic Load Balancing', url: 'https://aws.amazon.com/elasticloadbalancing/' },
  elbDocs: {
    title: 'What is Elastic Load Balancing?',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html',
  },
  emr: { title: 'Amazon EMR', url: 'https://aws.amazon.com/emr/' },
  encryption: {
    title: 'Data protection: encryption',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/introduction-aws-security/data-encryption.html',
  },
  enterpriseSupport: {
    title: 'AWS Enterprise Support',
    url: 'https://aws.amazon.com/premiumsupport/plans/enterprise/',
  },
  eventBridge: { title: 'Amazon EventBridge', url: 'https://aws.amazon.com/eventbridge/' },
  examGuide: {
    title: 'AWS Certified Cloud Practitioner (CLF-C02) exam guide',
    url: 'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html',
  },
  fargate: { title: 'AWS Fargate', url: 'https://aws.amazon.com/fargate/' },
  faultTolerance: {
    title: 'Fault tolerance and fault isolation',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/availability-and-beyond-improving-resilience/fault-tolerance-and-fault-isolation.html',
  },
  firewallManager: {
    title: 'AWS Firewall Manager',
    url: 'https://aws.amazon.com/firewall-manager/',
  },
  flowLogs: {
    title: 'Logging IP traffic using VPC Flow Logs',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html',
  },
  forecast: { title: 'Amazon Forecast', url: 'https://aws.amazon.com/forecast/' },
  fraudDetector: { title: 'Amazon Fraud Detector', url: 'https://aws.amazon.com/fraud-detector/' },
  freeTier: { title: 'AWS Free Tier', url: 'https://aws.amazon.com/free/' },
  fsx: { title: 'Amazon FSx', url: 'https://aws.amazon.com/fsx/' },
  glacierDocs: {
    title: 'Amazon S3 Glacier storage classes',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/glacier-storage-classes.html',
  },
  globalAccelerator: {
    title: 'AWS Global Accelerator',
    url: 'https://aws.amazon.com/global-accelerator/',
  },
  globalInfra: {
    title: 'AWS Global Infrastructure',
    url: 'https://aws.amazon.com/about-aws/global-infrastructure/',
  },
  glue: { title: 'AWS Glue', url: 'https://aws.amazon.com/glue/' },
  glueDocs: {
    title: 'What is AWS Glue?',
    url: 'https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html',
  },
  guardDuty: { title: 'Amazon GuardDuty', url: 'https://aws.amazon.com/guardduty/' },
  guardDutyDocs: {
    title: 'What is Amazon GuardDuty?',
    url: 'https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html',
  },
  guardDutyMalware: {
    title: 'GuardDuty Malware Protection for EC2',
    url: 'https://docs.aws.amazon.com/guardduty/latest/ug/malware-protection.html',
  },
  ha: {
    title: 'Reliability pillar: Design your workload to withstand component failures',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-your-workload-to-withstand-component-failures.html',
  },
  healthDashboard: {
    title: 'AWS Health',
    url: 'https://aws.amazon.com/premiumsupport/technology/aws-health/',
  },
  healthDocs: {
    title: 'What is AWS Health?',
    url: 'https://docs.aws.amazon.com/health/latest/ug/what-is-aws-health.html',
  },
  howPricingWorks: {
    title: 'How AWS Pricing Works',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/how-aws-pricing-works/',
  },
  iamAbac: {
    title: 'Define permissions based on attributes with ABAC authorization',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction_attribute-based-access-control.html',
  },
  iamBestPractices: {
    title: 'Security best practices in IAM',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html',
  },
  iamCredentialReport: {
    title: 'Generate credential reports for your AWS account',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_getting-report.html',
  },
  iamGroups: {
    title: 'IAM user groups',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_groups.html',
  },
  iamLastAccessed: {
    title: 'Refine permissions in AWS using last accessed information',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_last-accessed.html',
  },
  iamPolicies: {
    title: 'Policies and permissions in IAM',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html',
  },
  iamPolicyElements: {
    title: 'IAM JSON policy element reference',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html',
  },
  iamPolicyEval: {
    title: 'Policy evaluation logic',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html',
  },
  iamRoles: {
    title: 'IAM roles',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html',
  },
  iamTempCredentials: {
    title: 'Temporary security credentials in IAM',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html',
  },
  iamWhatIs: {
    title: 'What is IAM?',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html',
  },
  identityCenter: {
    title: 'AWS IAM Identity Center',
    url: 'https://aws.amazon.com/iam/identity-center/',
  },
  inspector: { title: 'Amazon Inspector', url: 'https://aws.amazon.com/inspector/' },
  inspectorDocs: {
    title: 'What is Amazon Inspector?',
    url: 'https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html',
  },
  instanceStore: {
    title: 'Amazon EC2 instance store',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html',
  },
  internetGateway: {
    title: 'Enable internet access using an internet gateway',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html',
  },
  introSecurity: {
    title: 'Introduction to AWS Security',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/introduction-aws-security/welcome.html',
  },
  iotCore: { title: 'AWS IoT Core', url: 'https://aws.amazon.com/iot-core/' },
  iotGreengrass: { title: 'AWS IoT Greengrass', url: 'https://aws.amazon.com/greengrass/' },
  kendra: { title: 'Amazon Kendra', url: 'https://aws.amazon.com/kendra/' },
  keyspaces: { title: 'Amazon Keyspaces', url: 'https://aws.amazon.com/keyspaces/' },
  kinesis: { title: 'Amazon Kinesis', url: 'https://aws.amazon.com/kinesis/' },
  kms: { title: 'AWS Key Management Service', url: 'https://aws.amazon.com/kms/' },
  kmsDocs: {
    title: 'AWS Key Management Service concepts',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html',
  },
  kmsOverview: {
    title: 'AWS Key Management Service overview',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/overview.html',
  },
  kmsRotation: {
    title: 'Rotate AWS KMS keys',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html',
  },
  knowledgeCenter: { title: 'AWS Knowledge Center', url: 'https://repost.aws/knowledge-center' },
  lakeFormation: { title: 'AWS Lake Formation', url: 'https://aws.amazon.com/lake-formation/' },
  lambda: { title: 'AWS Lambda', url: 'https://aws.amazon.com/lambda/' },
  lambdaDocs: {
    title: 'What is AWS Lambda?',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html',
  },
  lambdaPricing: { title: 'AWS Lambda pricing', url: 'https://aws.amazon.com/lambda/pricing/' },
  lambdaRuntimeUpdates: {
    title: 'Understanding how Lambda manages runtime version updates',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/runtimes-update.html',
  },
  largeMigrationPhases: {
    title: 'Phases of a large migration',
    url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/phases.html',
  },
  lex: { title: 'Amazon Lex', url: 'https://aws.amazon.com/lex/' },
  licenseManager: { title: 'AWS License Manager', url: 'https://aws.amazon.com/license-manager/' },
  licenseManagerDocs: {
    title: 'What is AWS License Manager?',
    url: 'https://docs.aws.amazon.com/license-manager/latest/userguide/license-manager.html',
  },
  licensing: {
    title: 'Licensing options (BYOL) on Amazon EC2 Dedicated Hosts',
    url: 'https://aws.amazon.com/ec2/dedicated-hosts/faqs/',
  },
  lightsail: { title: 'Amazon Lightsail', url: 'https://aws.amazon.com/lightsail/' },
  localZones: {
    title: 'AWS Local Zones',
    url: 'https://aws.amazon.com/about-aws/global-infrastructure/localzones/',
  },
  macie: { title: 'Amazon Macie', url: 'https://aws.amazon.com/macie/' },
  macieDocs: {
    title: 'What is Amazon Macie?',
    url: 'https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html',
  },
  marketplace: { title: 'AWS Marketplace', url: 'https://aws.amazon.com/marketplace/' },
  memorydb: { title: 'Amazon MemoryDB', url: 'https://aws.amazon.com/memorydb/' },
  mfa: {
    title: 'AWS Multi-factor authentication in IAM',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa.html',
  },
  mgn: {
    title: 'AWS Application Migration Service',
    url: 'https://aws.amazon.com/application-migration-service/',
  },
  migrationEvaluator: {
    title: 'Migration Evaluator',
    url: 'https://aws.amazon.com/migration-evaluator/',
  },
  migrationHubDocs: {
    title: 'What is AWS Migration Hub?',
    url: 'https://docs.aws.amazon.com/migrationhub/latest/ug/whatishub.html',
  },
  migrationStrategies: {
    title: 'Migration strategies (the 7 Rs)',
    url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html',
  },
  msk: { title: 'Amazon Managed Streaming for Apache Kafka', url: 'https://aws.amazon.com/msk/' },
  multiAz: {
    title: 'Multi-AZ deployments for Amazon RDS',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html',
  },
  nacls: {
    title: 'Control subnet traffic with network access control lists',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html',
  },
  natGateway: {
    title: 'NAT gateways',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html',
  },
  neptune: { title: 'Amazon Neptune', url: 'https://aws.amazon.com/neptune/' },
  networkFirewall: {
    title: 'AWS Network Firewall',
    url: 'https://aws.amazon.com/network-firewall/',
  },
  onPremComparison: {
    title: 'Five things you should do to create an accurate on-premises vs cloud comparison model',
    url: 'https://aws.amazon.com/blogs/aws-cloud-financial-management/five-things-you-should-do-to-create-an-accurate-on-premises-vs-cloud-comparison-model/',
  },
  opensearch: {
    title: 'Amazon OpenSearch Service',
    url: 'https://aws.amazon.com/opensearch-service/',
  },
  oracleMigrationStrategies: {
    title: 'Oracle database migration strategies',
    url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/migration-oracle-database/strategies.html',
  },
  organizations: { title: 'AWS Organizations', url: 'https://aws.amazon.com/organizations/' },
  organizationsDocs: {
    title: 'What is AWS Organizations?',
    url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html',
  },
  orgPolicies: {
    title: 'Managing organization policies with AWS Organizations',
    url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies.html',
  },
  outposts: { title: 'AWS Outposts', url: 'https://aws.amazon.com/outposts/' },
  outpostsDocs: {
    title: 'What is AWS Outposts?',
    url: 'https://docs.aws.amazon.com/outposts/latest/userguide/what-is-outposts.html',
  },
  outpostsRackFaq: {
    title: 'AWS Outposts racks FAQs',
    url: 'https://aws.amazon.com/outposts/rack/faqs/',
  },
  parameterStore: {
    title: 'AWS Systems Manager Parameter Store',
    url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html',
  },
  partnerNetwork: { title: 'AWS Partner Network', url: 'https://aws.amazon.com/partners/' },
  pciFaq: {
    title: 'PCI DSS Level 1 FAQs',
    url: 'https://aws.amazon.com/compliance/pci-dss-level-1-faqs/',
  },
  penTesting: {
    title: 'Penetration Testing',
    url: 'https://aws.amazon.com/security/penetration-testing/',
  },
  permissionsBoundaries: {
    title: 'Permissions boundaries for IAM entities',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html',
  },
  permissionSets: {
    title: 'Manage AWS accounts with permission sets',
    url: 'https://docs.aws.amazon.com/singlesignon/latest/userguide/permissionsetsconcept.html',
  },
  personalize: { title: 'Amazon Personalize', url: 'https://aws.amazon.com/personalize/' },
  pinpoint: { title: 'Amazon Pinpoint', url: 'https://aws.amazon.com/pinpoint/' },
  polly: { title: 'Amazon Polly', url: 'https://aws.amazon.com/polly/' },
  prescriptiveGuidance: {
    title: 'AWS Prescriptive Guidance',
    url: 'https://aws.amazon.com/prescriptive-guidance/',
  },
  pricing: { title: 'AWS Pricing', url: 'https://aws.amazon.com/pricing/' },
  pricingCalculator: { title: 'AWS Pricing Calculator', url: 'https://calculator.aws/' },
  pricingCalculatorDocs: {
    title: 'What is AWS Pricing Calculator?',
    url: 'https://docs.aws.amazon.com/pricing-calculator/latest/userguide/what-is-pricing-calculator.html',
  },
  privateLink: { title: 'AWS PrivateLink', url: 'https://aws.amazon.com/privatelink/' },
  proServe: {
    title: 'AWS Professional Services',
    url: 'https://aws.amazon.com/professional-services/',
  },
  qDeveloper: { title: 'Amazon Q Developer', url: 'https://aws.amazon.com/q/developer/' },
  quickSight: { title: 'Amazon Quick Sight', url: 'https://aws.amazon.com/quicksight/' },
  ram: { title: 'AWS Resource Access Manager', url: 'https://aws.amazon.com/ram/' },
  ramDocs: {
    title: 'What is AWS Resource Access Manager?',
    url: 'https://docs.aws.amazon.com/ram/latest/userguide/what-is.html',
  },
  rds: { title: 'Amazon RDS', url: 'https://aws.amazon.com/rds/' },
  rdsEncryption: {
    title: 'Encrypting Amazon RDS resources',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html',
  },
  rdsOracleLicensing: {
    title: 'RDS for Oracle licensing options',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Oracle.Concepts.Licensing.html',
  },
  rdsSecurity: {
    title: 'Security in Amazon RDS',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html',
  },
  rdsUserGuide: {
    title: 'What is Amazon RDS?',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html',
  },
  readReplicas: {
    title: 'Working with DB instance read replicas',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html',
  },
  redshift: { title: 'Amazon Redshift', url: 'https://aws.amazon.com/redshift/' },
  redshiftDocs: {
    title: 'What is Amazon Redshift?',
    url: 'https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html',
  },
  regionsAzs: {
    title: 'Regions and Availability Zones',
    url: 'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/',
  },
  rekognition: { title: 'Amazon Rekognition', url: 'https://aws.amazon.com/rekognition/' },
  repost: { title: 'AWS re:Post', url: 'https://repost.aws/' },
  reservedInstances: {
    title: 'Amazon EC2 Reserved Instances',
    url: 'https://aws.amazon.com/ec2/pricing/reserved-instances/',
  },
  rootMfa: {
    title: 'Multi-factor authentication for AWS account root user',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/enable-mfa-for-root.html',
  },
  rootUser: {
    title: 'AWS account root user',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html',
  },
  route53: { title: 'Amazon Route 53', url: 'https://aws.amazon.com/route53/' },
  route53Docs: {
    title: 'What is Amazon Route 53?',
    url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html',
  },
  s3: { title: 'Amazon S3', url: 'https://aws.amazon.com/s3/' },
  s3BlockPublic: {
    title: 'Blocking public access to your Amazon S3 storage',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html',
  },
  s3BlockPublicDocs: {
    title: 'Blocking public access to your Amazon S3 storage',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html',
  },
  s3DefaultEncryption: {
    title: 'Amazon S3 default encryption FAQ',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html',
  },
  s3Glacier: {
    title: 'Amazon S3 Glacier storage classes',
    url: 'https://aws.amazon.com/s3/storage-classes/glacier/',
  },
  s3Lifecycle: {
    title: 'Managing the lifecycle of objects',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html',
  },
  s3ObjectLock: {
    title: 'Locking objects with Object Lock',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html',
  },
  s3Pricing: { title: 'Amazon S3 pricing', url: 'https://aws.amazon.com/s3/pricing/' },
  s3StorageClasses: {
    title: 'Amazon S3 storage classes',
    url: 'https://aws.amazon.com/s3/storage-classes/',
  },
  s3UserGuide: {
    title: 'What is Amazon S3?',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html',
  },
  s3Versioning: {
    title: 'Retaining multiple versions of objects with S3 Versioning',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html',
  },
  sagemaker: { title: 'Amazon SageMaker AI', url: 'https://aws.amazon.com/sagemaker/ai/' },
  sagemakerDocs: {
    title: 'What is Amazon SageMaker AI?',
    url: 'https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html',
  },
  savingsPlans: { title: 'Savings Plans', url: 'https://aws.amazon.com/savingsplans/' },
  scp: {
    title: 'Service control policies (SCPs)',
    url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html',
  },
  sct: {
    title: 'AWS Schema Conversion Tool',
    url: 'https://docs.aws.amazon.com/SchemaConversionTool/latest/userguide/CHAP_Welcome.html',
  },
  sdks: { title: 'Tools to Build on AWS (SDKs)', url: 'https://aws.amazon.com/developer/tools/' },
  secretsManager: { title: 'AWS Secrets Manager', url: 'https://aws.amazon.com/secrets-manager/' },
  secureBrowser: {
    title: 'Amazon WorkSpaces Secure Browser',
    url: 'https://aws.amazon.com/workspaces/secure-browser/',
  },
  securityBulletins: {
    title: 'AWS Security Bulletins',
    url: 'https://aws.amazon.com/security/security-bulletins/',
  },
  securityGroups: {
    title: 'Control traffic to your AWS resources using security groups',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html',
  },
  securityHub: { title: 'AWS Security Hub', url: 'https://aws.amazon.com/security-hub/' },
  securityHubCentralConfig: {
    title: 'Understanding central configuration in Security Hub CSPM',
    url: 'https://docs.aws.amazon.com/securityhub/latest/userguide/central-configuration-intro.html',
  },
  securityHubDocs: {
    title: 'What is AWS Security Hub?',
    url: 'https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html',
  },
  serviceCatalog: { title: 'AWS Service Catalog', url: 'https://aws.amazon.com/servicecatalog/' },
  serviceQuotas: {
    title: 'What is Service Quotas?',
    url: 'https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html',
  },
  ses: { title: 'Amazon Simple Email Service', url: 'https://aws.amazon.com/ses/' },
  sharedResponsibility: {
    title: 'Shared Responsibility Model',
    url: 'https://aws.amazon.com/compliance/shared-responsibility-model/',
  },
  shield: { title: 'AWS Shield', url: 'https://aws.amazon.com/shield/' },
  shieldDocs: {
    title: 'AWS Shield',
    url: 'https://docs.aws.amazon.com/waf/latest/developerguide/shield-chapter.html',
  },
  shieldFeatures: {
    title: 'AWS Shield features',
    url: 'https://aws.amazon.com/shield/features/',
  },
  shieldPricing: {
    title: 'AWS Shield pricing',
    url: 'https://aws.amazon.com/shield/pricing/',
  },
  shieldSrt: {
    title: 'Shield Response Team (SRT) support',
    url: 'https://docs.aws.amazon.com/waf/latest/developerguide/ddos-srt-support.html',
  },
  siteToSiteVpn: {
    title: 'AWS Site-to-Site VPN',
    url: 'https://aws.amazon.com/vpn/site-to-site-vpn/',
  },
  sixAdvantages: {
    title: 'Overview of AWS: Six advantages of cloud computing',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-overview/six-advantages-of-cloud-computing.html',
  },
  skillBuilder: { title: 'AWS Skill Builder', url: 'https://skillbuilder.aws/' },
  snowFamily: { title: 'AWS Snow Family', url: 'https://aws.amazon.com/snow/' },
  snowball: { title: 'AWS Snowball', url: 'https://aws.amazon.com/snowball/' },
  sns: { title: 'Amazon SNS', url: 'https://aws.amazon.com/sns/' },
  solutionsLibrary: { title: 'AWS Solutions Library', url: 'https://aws.amazon.com/solutions/' },
  spot: { title: 'Amazon EC2 Spot Instances', url: 'https://aws.amazon.com/ec2/spot/' },
  spRecommendations: {
    title: 'Understanding Savings Plans recommendations',
    url: 'https://docs.aws.amazon.com/savingsplans/latest/userguide/sp-recommendations.html',
  },
  sqs: { title: 'Amazon SQS', url: 'https://aws.amazon.com/sqs/' },
  stepFunctions: { title: 'AWS Step Functions', url: 'https://aws.amazon.com/step-functions/' },
  storageGateway: { title: 'AWS Storage Gateway', url: 'https://aws.amazon.com/storagegateway/' },
  subnets: {
    title: 'Subnets for your VPC',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html',
  },
  supportCenter: { title: 'AWS Support', url: 'https://aws.amazon.com/premiumsupport/' },
  supportPlans: {
    title: 'Compare AWS Support Plans',
    url: 'https://aws.amazon.com/premiumsupport/plans/',
  },
  supportPricing: {
    title: 'AWS Support pricing',
    url: 'https://aws.amazon.com/premiumsupport/pricing/',
  },
  supportUserGuide: {
    title: 'Getting started with AWS Support',
    url: 'https://docs.aws.amazon.com/awssupport/latest/user/getting-started.html',
  },
  systemsManager: { title: 'AWS Systems Manager', url: 'https://aws.amazon.com/systems-manager/' },
  systemsManagerDocs: {
    title: 'What is AWS Systems Manager?',
    url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html',
  },
  tam: {
    title: 'AWS Enterprise Support (Technical Account Manager)',
    url: 'https://aws.amazon.com/premiumsupport/plans/enterprise/',
  },
  textract: { title: 'Amazon Textract', url: 'https://aws.amazon.com/textract/' },
  timestream: { title: 'Amazon Timestream', url: 'https://aws.amazon.com/timestream/' },
  training: { title: 'AWS Training and Certification', url: 'https://aws.amazon.com/training/' },
  transcribe: { title: 'Amazon Transcribe', url: 'https://aws.amazon.com/transcribe/' },
  transferFamily: {
    title: 'AWS Transfer Family',
    url: 'https://aws.amazon.com/aws-transfer-family/',
  },
  transferFamilyDocs: {
    title: 'What is AWS Transfer Family?',
    url: 'https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html',
  },
  transitGateway: { title: 'AWS Transit Gateway', url: 'https://aws.amazon.com/transit-gateway/' },
  translate: { title: 'Amazon Translate', url: 'https://aws.amazon.com/translate/' },
  trustedAdvisor: {
    title: 'AWS Trusted Advisor',
    url: 'https://aws.amazon.com/premiumsupport/technology/trusted-advisor/',
  },
  trustedAdvisorChecks: {
    title: 'AWS Trusted Advisor check reference',
    url: 'https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor-check-reference.html',
  },
  trustedAdvisorDocs: {
    title: 'AWS Trusted Advisor check reference',
    url: 'https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor-check-reference.html',
  },
  vpc: { title: 'Amazon VPC', url: 'https://aws.amazon.com/vpc/' },
  vpcWhatIs: {
    title: 'What is Amazon VPC?',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html',
  },
  vpn: { title: 'AWS VPN', url: 'https://aws.amazon.com/vpn/' },
  vulnerabilityReporting: {
    title: 'AWS vulnerability reporting',
    url: 'https://aws.amazon.com/security/vulnerability-reporting/',
  },
  waAbuse: {
    title: 'AWS response to abuse and compromise',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/abuse-and-compromise.html',
  },
  waAvailability: {
    title: 'Reliability pillar: Availability',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/availability.html',
  },
  waCost: {
    title: 'Cost Optimization Pillar',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html',
  },
  waCostAware: {
    title: 'Well-Architected Framework: Expenditure and usage awareness',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-aware.html',
  },
  waCostBestPractices: {
    title: 'Well-Architected Framework: Cost optimization best practices',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-bp.html',
  },
  waCostDesign: {
    title: 'Well-Architected Framework: Cost optimization design principles',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-dp.html',
  },
  waCostOptimizeOverTime: {
    title: 'Well-Architected Framework: Optimize over time',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-opti.html',
  },
  waDefinitions: {
    title: 'Well-Architected Framework: Definitions',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html',
  },
  waFramework: {
    title: 'AWS Well-Architected Framework',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html',
  },
  wafRateBased: {
    title: 'Using rate-based rule statements in AWS WAF',
    url: 'https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html',
  },
  waGameDays: {
    title: 'REL12-BP05 Conduct game days regularly',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_testing_resiliency_game_days_resiliency.html',
  },
  waGeneralDesign: {
    title: 'AWS Well-Architected Framework: General design principles',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/general-design-principles.html',
  },
  waImmutable: {
    title: 'Reliability pillar: REL08-BP04 Deploy using immutable infrastructure',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_tracking_change_management_immutable_infrastructure.html',
  },
  waLensCatalog: {
    title: 'AWS Well-Architected Tool: Lens Catalog',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/userguide/lens-catalog.html',
  },
  waLenses: {
    title: 'AWS Well-Architected Tool: Using lenses',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/userguide/lenses.html',
  },
  waLooseCoupling: {
    title: 'Reliability pillar: REL04-BP02 Implement loosely coupled dependencies',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_loosely_coupled_system.html',
  },
  waOpex: {
    title: 'Operational Excellence Pillar',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/welcome.html',
  },
  waOpexDesign: {
    title: 'Well-Architected Framework: Operational excellence design principles',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/oe-design-principles.html',
  },
  waPerformance: {
    title: 'Performance Efficiency Pillar',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html',
  },
  waPerformanceDesign: {
    title: 'Well-Architected Framework: Performance efficiency design principles',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/perf-dp.html',
  },
  waPillars: {
    title: 'Well-Architected Framework: The pillars of the framework',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html',
  },
  waPurposeBuiltDb: {
    title: 'PERF03-BP01 Use a purpose-built data store',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/perf_data_use_purpose_built_data_store.html',
  },
  waRelBackupTest: {
    title:
      'REL09-BP04 Perform periodic recovery of the data to verify backup integrity and processes',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_backing_up_data_periodic_recovery_testing_data.html',
  },
  waRelChange: {
    title: 'Well-Architected Framework: Reliability change management',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/rel-chg-mgmt.html',
  },
  waReliability: {
    title: 'Reliability Pillar',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html',
  },
  waReliabilityDesign: {
    title: 'Well-Architected Framework: Reliability design principles',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/rel-dp.html',
  },
  waRelQuotas: {
    title: 'REL01-BP04 Monitor and manage quotas',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_manage_service_limits_monitor_manage_limits.html',
  },
  waResiliency: {
    title: 'Reliability pillar: Resiliency, and the components of reliability',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/resiliency-and-the-components-of-reliability.html',
  },
  waSecDataProtection: {
    title: 'Well-Architected Framework: Security data protection',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-dataprot.html',
  },
  waSecurity: {
    title: 'Security Pillar',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html',
  },
  waSecurityDesign: {
    title: 'Well-Architected Framework: Security design principles',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-design.html',
  },
  waStateless: {
    title: 'REL05-BP06 Make systems stateless where possible',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_mitigate_interaction_failure_stateless.html',
  },
  waSusRegion: {
    title: 'SUS01-BP01 Choose Region based on both business requirements and sustainability goals',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/sus_sus_region_a2.html',
  },
  waSusScale: {
    title: 'SUS02-BP01 Scale workload infrastructure dynamically',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/sus_sus_user_a2.html',
  },
  waSustainability: {
    title: 'Sustainability Pillar',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/sustainability-pillar.html',
  },
  waSustainabilityDesign: {
    title: 'Well-Architected Framework: Sustainability design principles',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/sus-design-principles.html',
  },
  waSustainabilityRevisions: {
    title: 'Sustainability Pillar: Document revisions',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/document-revisions.html',
  },
  waTool: {
    title: 'AWS Well-Architected Tool',
    url: 'https://aws.amazon.com/well-architected-tool/',
  },
  waf: { title: 'AWS WAF', url: 'https://aws.amazon.com/waf/' },
  wafDocs: {
    title: 'AWS WAF',
    url: 'https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html',
  },
  waToolPricing: {
    title: 'AWS Well-Architected Tool pricing',
    url: 'https://aws.amazon.com/well-architected-tool/pricing/',
  },
  wavelength: { title: 'AWS Wavelength', url: 'https://aws.amazon.com/wavelength/' },
  whatIsCloud: {
    title: 'What is cloud computing?',
    url: 'https://aws.amazon.com/what-is-cloud-computing/',
  },
  whatIsIaas: {
    title: 'What is IaaS (Infrastructure as a Service)?',
    url: 'https://aws.amazon.com/what-is/iaas/',
  },

  whitepapers: { title: 'AWS Whitepapers & Guides', url: 'https://aws.amazon.com/whitepapers/' },
  workspaces: { title: 'Amazon WorkSpaces', url: 'https://aws.amazon.com/workspaces/' },
  workspacesFaq: {
    title: 'Amazon WorkSpaces FAQs',
    url: 'https://aws.amazon.com/workspaces/faqs/',
  },
  xray: { title: 'AWS X-Ray', url: 'https://aws.amazon.com/xray/' },
  xrayDocs: {
    title: 'What is AWS X-Ray?',
    url: 'https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html',
  },
} as const satisfies Record<string, SourceReference>;

export type RefKey = keyof typeof REFS;
