import type { SourceReference } from '@/domain/questions/types';

/**
 * AWS pages cited by SAA-C03 questions (D-066). Keys are short and stable; a question cites
 * them in `r`. Add a page here before citing it.
 */
export const REFS = {
  saaGuide: {
    title: 'AWS Certified Solutions Architect – Associate (SAA-C03) exam guide',
    url: 'https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html',
  },
  // IAM and access
  iamBestPractices: {
    title: 'Security best practices in IAM',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html',
  },
  iamRoles: {
    title: 'IAM roles',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html',
  },
  iamRootUser: {
    title: 'AWS account root user',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html',
  },
  iamCrossAccountTutorial: {
    title: 'IAM tutorial: Delegate access across AWS accounts using IAM roles',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/tutorial_cross-account-with-roles.html',
  },
  iamConfusedDeputy: {
    title: 'The confused deputy problem',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html',
  },
  iamBoundaries: {
    title: 'Permissions boundaries for IAM entities',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html',
  },
  iamEvaluation: {
    title: 'Policy evaluation logic',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html',
  },
  iamIdentityVsResource: {
    title: 'Identity-based policies and resource-based policies',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html',
  },
  iamCrossAccountEval: {
    title: 'Cross-account policy evaluation logic',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html',
  },
  iamMfa: {
    title: 'AWS Multi-factor authentication in IAM',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa.html',
  },
  iamTempCreds: {
    title: 'Temporary security credentials in IAM',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html',
  },
  iamRoleTerms: {
    title: 'Roles terms and concepts (role chaining)',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_terms-and-concepts.html',
  },
  iamEc2Role: {
    title: 'Use an IAM role to grant permissions to applications running on Amazon EC2 instances',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html',
  },
  iamAbac: {
    title: 'Define permissions based on attributes with ABAC authorization',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction_attribute-based-access-control.html',
  },
  iamSaml: {
    title: 'SAML 2.0 federation',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_saml.html',
  },
  iamGroups: {
    title: 'IAM user groups',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_groups.html',
  },
  iamCredentialReport: {
    title: 'Generate credential reports for your AWS account',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_getting-report.html',
  },
  iamPolicySimulator: {
    title: 'Test IAM policies with the IAM policy simulator',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html',
  },
  iamConditionKeys: {
    title: 'AWS global condition context keys',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html',
  },
  iamMfaPolicyExample: {
    title: 'AWS: Allows MFA-authenticated IAM users to manage their own credentials',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_aws_my-sec-creds-self-manage.html',
  },
  accessAnalyzer: {
    title: 'Using AWS Identity and Access Management Access Analyzer',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html',
  },
  accessAnalyzerPolicyGen: {
    title: 'IAM Access Analyzer policy generation',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-policy-generation.html',
  },
  stsAssumeRole: {
    title: 'AssumeRole (AWS STS API Reference)',
    url: 'https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html',
  },
  // Multi-account
  orgsScps: {
    title: 'Service control policies (SCPs)',
    url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html',
  },
  orgsScpEvaluation: {
    title: 'SCP evaluation',
    url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps_evaluation.html',
  },
  orgsScpExamples: {
    title: 'Example service control policies',
    url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps_examples.html',
  },
  controlTower: {
    title: 'What is AWS Control Tower?',
    url: 'https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html',
  },
  identityCenter: {
    title: 'What is IAM Identity Center?',
    url: 'https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html',
  },
  identityCenterPermissionSets: {
    title: 'Permission sets (IAM Identity Center)',
    url: 'https://docs.aws.amazon.com/singlesignon/latest/userguide/permissionsetsconcept.html',
  },
  directoryService: {
    title: 'What is AWS Directory Service?',
    url: 'https://docs.aws.amazon.com/directoryservice/latest/admin-guide/what_is.html',
  },
  adConnector: {
    title: 'AD Connector',
    url: 'https://docs.aws.amazon.com/directoryservice/latest/admin-guide/directory_ad_connector.html',
  },
  ram: {
    title: 'What is AWS Resource Access Manager?',
    url: 'https://docs.aws.amazon.com/ram/latest/userguide/what-is.html',
  },
  cognito: {
    title: 'What is Amazon Cognito?',
    url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html',
  },
  cognitoIdentityPools: {
    title: 'Amazon Cognito identity pools',
    url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html',
  },
  // Resource policies
  s3BucketPolicies: {
    title: 'Bucket policies for Amazon S3',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html',
  },
  s3BlockPublicAccess: {
    title: 'Blocking public access to your Amazon S3 storage',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html',
  },
  lambdaResourcePolicy: {
    title: 'Viewing resource-based IAM policies in Lambda',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html',
  },
  lambdaExecutionRole: {
    title: 'Defining Lambda function permissions with an execution role',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html',
  },
  kmsKeyPolicies: {
    title: 'Key policies in AWS KMS',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html',
  },
  // Network and workload security (1.2)
  vpcSecurityGroups: {
    title: 'Control traffic to your AWS resources using security groups',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html',
  },
  vpcNacls: {
    title: 'Control subnet traffic with network access control lists',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html',
  },
  vpcInfraSecurity: {
    title: 'Infrastructure security in Amazon VPC',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html',
  },
  vpcSubnets: {
    title: 'Subnets for your VPC',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html',
  },
  natGateway: {
    title: 'NAT gateways',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html',
  },
  internetGateway: {
    title: 'Enable internet access for a VPC using an internet gateway',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html',
  },
  vpcFlowLogs: {
    title: 'Logging IP traffic using VPC Flow Logs',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html',
  },
  gatewayEndpoints: {
    title: 'Gateway endpoints',
    url: 'https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html',
  },
  privateLink: {
    title: 'What is AWS PrivateLink?',
    url: 'https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html',
  },
  endpointPolicies: {
    title: 'Control access to VPC endpoints using endpoint policies',
    url: 'https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-access.html',
  },
  waf: {
    title: 'AWS WAF',
    url: 'https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html',
  },
  wafRateBased: {
    title: 'Using rate-based rule statements in AWS WAF',
    url: 'https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html',
  },
  wafManagedRules: {
    title: 'AWS Managed Rules rule groups list',
    url: 'https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list.html',
  },
  shieldFeatures: {
    title: 'AWS Shield features',
    url: 'https://aws.amazon.com/shield/features/',
  },
  shield: {
    title: 'AWS Shield',
    url: 'https://docs.aws.amazon.com/waf/latest/developerguide/shield-chapter.html',
  },
  firewallManager: {
    title: 'AWS Firewall Manager',
    url: 'https://docs.aws.amazon.com/waf/latest/developerguide/fms-chapter.html',
  },
  networkFirewall: {
    title: 'What is AWS Network Firewall?',
    url: 'https://docs.aws.amazon.com/network-firewall/latest/developerguide/what-is-aws-network-firewall.html',
  },
  secretsManager: {
    title: 'What is AWS Secrets Manager?',
    url: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html',
  },
  secretsRotation: {
    title: 'Rotate AWS Secrets Manager secrets',
    url: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html',
  },
  parameterStore: {
    title: 'AWS Systems Manager Parameter Store',
    url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html',
  },
  sessionManager: {
    title: 'AWS Systems Manager Session Manager',
    url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html',
  },
  guardDuty: {
    title: 'What is Amazon GuardDuty?',
    url: 'https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html',
  },
  macie: {
    title: 'What is Amazon Macie?',
    url: 'https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html',
  },
  inspector: {
    title: 'What is Amazon Inspector?',
    url: 'https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html',
  },
  securityHub: {
    title: 'What is AWS Security Hub CSPM?',
    url: 'https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html',
  },
  siteToSiteVpn: {
    title: 'What is AWS Site-to-Site VPN?',
    url: 'https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html',
  },
  directConnect: {
    title: 'What is AWS Direct Connect?',
    url: 'https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html',
  },
  directConnectMacsec: {
    title: 'MAC Security (MACsec) in AWS Direct Connect',
    url: 'https://docs.aws.amazon.com/directconnect/latest/UserGuide/MACsec.html',
  },
  cloudFrontOac: {
    title: 'Restrict access to an Amazon S3 origin',
    url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html',
  },
  albAuthenticate: {
    title: 'Authenticate users using an Application Load Balancer',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html',
  },
  cognitoUserPools: {
    title: 'Amazon Cognito user pools',
    url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html',
  },
  // Data protection (1.3)
  kmsConcepts: {
    title: 'AWS KMS concepts',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html',
  },
  kmsRotation: {
    title: 'Rotate AWS KMS keys',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html',
  },
  kmsMultiRegion: {
    title: 'Multi-Region keys in AWS KMS',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-overview.html',
  },
  kmsDeleting: {
    title: 'Delete an AWS KMS key',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/deleting-keys.html',
  },
  cloudHsm: {
    title: 'What is AWS CloudHSM?',
    url: 'https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html',
  },
  encryptionSdk: {
    title: 'What is the AWS Encryption SDK?',
    url: 'https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/introduction.html',
  },
  s3Encryption: {
    title: 'Protecting data with encryption (Amazon S3)',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingEncryption.html',
  },
  s3DefaultEncryption: {
    title: 'Setting default server-side encryption behavior for Amazon S3 buckets',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-encryption.html',
  },
  s3SseKms: {
    title: 'Using server-side encryption with AWS KMS keys (SSE-KMS)',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html',
  },
  s3BucketKeys: {
    title: 'Reducing the cost of SSE-KMS with Amazon S3 Bucket Keys',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-key.html',
  },
  s3SseC: {
    title: 'Using server-side encryption with customer-provided keys (SSE-C)',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/ServerSideEncryptionCustomerKeys.html',
  },
  s3ObjectLock: {
    title: 'Locking objects with Object Lock',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html',
  },
  s3Versioning: {
    title: 'Retaining multiple versions of objects with S3 Versioning',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html',
  },
  s3MfaDelete: {
    title: 'Configuring MFA delete',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/MultiFactorAuthenticationDelete.html',
  },
  s3Replication: {
    title: 'Replicating objects within and across Regions',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html',
  },
  s3Lifecycle: {
    title: 'Managing the lifecycle of objects',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html',
  },
  s3SecurityBestPractices: {
    title: 'Security best practices for Amazon S3',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html',
  },
  rdsEncryption: {
    title: 'Encrypting Amazon RDS resources',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html',
  },
  rdsSsl: {
    title: 'Using SSL/TLS to encrypt a connection to a DB instance or cluster',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html',
  },
  ebsEncryption: {
    title: 'Amazon EBS encryption',
    url: 'https://docs.aws.amazon.com/ebs/latest/userguide/ebs-encryption.html',
  },
  ebsEncryptionByDefault: {
    title: 'Enable Amazon EBS encryption by default',
    url: 'https://docs.aws.amazon.com/ebs/latest/userguide/encryption-by-default.html',
  },
  dynamodbEncryption: {
    title: 'DynamoDB encryption at rest',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/EncryptionAtRest.html',
  },
  acm: {
    title: 'What is AWS Certificate Manager?',
    url: 'https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html',
  },
  acmRenewal: {
    title: 'Managed certificate renewal in AWS Certificate Manager',
    url: 'https://docs.aws.amazon.com/acm/latest/userguide/managed-renewal.html',
  },
  awsBackup: {
    title: 'What is AWS Backup?',
    url: 'https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html',
  },
  backupVaultLock: {
    title: 'AWS Backup Vault Lock',
    url: 'https://docs.aws.amazon.com/aws-backup/latest/devguide/vault-lock.html',
  },
  backupCrossRegion: {
    title: 'Creating backup copies across AWS Regions',
    url: 'https://docs.aws.amazon.com/aws-backup/latest/devguide/cross-region-backup.html',
  },
  artifact: {
    title: 'What is AWS Artifact?',
    url: 'https://docs.aws.amazon.com/artifact/latest/ug/what-is-aws-artifact.html',
  },
  configConformance: {
    title: 'Conformance packs (AWS Config)',
    url: 'https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html',
  },
  privateCa: {
    title: 'What is AWS Private CA?',
    url: 'https://docs.aws.amazon.com/privateca/latest/userguide/PcaWelcome.html',
  },
  cloudTrailDataEvents: {
    title: 'Logging data events',
    url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html',
  },
  s3StorageClasses: {
    title: 'Understanding and managing Amazon S3 storage classes',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html',
  },
  s3DsseKms: {
    title: 'Using dual-layer server-side encryption with AWS KMS keys (DSSE-KMS)',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingDSSEncryption.html',
  },
  cloudFrontHttpsReqs: {
    title: 'Requirements for using SSL/TLS certificates with CloudFront',
    url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html',
  },
  rdsPostgresSsl: {
    title: 'Using SSL with a PostgreSQL DB instance',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/PostgreSQL.Concepts.General.SSL.html',
  },
  cloudTrailValidation: {
    title: 'Validating CloudTrail log file integrity',
    url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-intro.html',
  },
  apiGatewayPrivate: {
    title: 'Private REST APIs in API Gateway',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-private-apis.html',
  },
  s3AccessPoints: {
    title: 'Managing access to shared datasets with access points',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-points.html',
  },
  eventBridge: {
    title: 'What is Amazon EventBridge?',
    url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html',
  },
  efsEncryption: {
    title: 'Data encryption in Amazon EFS',
    url: 'https://docs.aws.amazon.com/efs/latest/ug/encryption.html',
  },
  iamRolesAnywhere: {
    title: 'What is IAM Roles Anywhere?',
    url: 'https://docs.aws.amazon.com/rolesanywhere/latest/userguide/introduction.html',
  },
  orgsDelegatedAdmin: {
    title: 'Delegated administrator for AWS Organizations',
    url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_delegate_policies.html',
  },
  ecsTaskRole: {
    title: 'Amazon ECS task IAM role',
    url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html',
  },
  transitGateway: {
    title: 'What is AWS Transit Gateway?',
    url: 'https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html',
  },
  // Resilient and scalable designs (2.1)
  sqs: {
    title: 'What is Amazon Simple Queue Service?',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html',
  },
  sqsQueueTypes: {
    title: 'Amazon SQS queue types',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-queue-types.html',
  },
  sqsFifo: {
    title: 'Amazon SQS FIFO queues',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fifo-queues.html',
  },
  sqsVisibility: {
    title: 'Amazon SQS visibility timeout',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html',
  },
  sqsDlq: {
    title: 'Using dead-letter queues in Amazon SQS',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html',
  },
  sqsLongPolling: {
    title: 'Amazon SQS short and long polling',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-short-and-long-polling.html',
  },
  sns: {
    title: 'What is Amazon SNS?',
    url: 'https://docs.aws.amazon.com/sns/latest/dg/welcome.html',
  },
  snsFanout: {
    title: 'Fanout Amazon SNS notifications to Amazon SQS queues',
    url: 'https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html',
  },
  snsFiltering: {
    title: 'Amazon SNS message filtering',
    url: 'https://docs.aws.amazon.com/sns/latest/dg/sns-message-filtering.html',
  },
  lambda: {
    title: 'What is AWS Lambda?',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html',
  },
  lambdaSqs: {
    title: 'Using Lambda with Amazon SQS',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html',
  },
  lambdaLimits: {
    title: 'Lambda quotas',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html',
  },
  apiGateway: {
    title: 'What is Amazon API Gateway?',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html',
  },
  apiGatewayThrottling: {
    title: 'Throttle requests to your REST APIs',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html',
  },
  apiGatewayCaching: {
    title: 'Cache settings for REST APIs in API Gateway',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-caching.html',
  },
  stepFunctions: {
    title: 'What is Step Functions?',
    url: 'https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html',
  },
  ecs: {
    title: 'What is Amazon Elastic Container Service?',
    url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html',
  },
  eks: {
    title: 'What is Amazon EKS?',
    url: 'https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html',
  },
  fargate: {
    title: 'AWS Fargate for Amazon ECS',
    url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html',
  },
  ecr: {
    title: 'What is Amazon Elastic Container Registry?',
    url: 'https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html',
  },
  elb: {
    title: 'What is Elastic Load Balancing?',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html',
  },
  alb: {
    title: 'What is an Application Load Balancer?',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html',
  },
  albRules: {
    title: 'Listener rules for your Application Load Balancer',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-rules.html',
  },
  nlb: {
    title: 'What is a Network Load Balancer?',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html',
  },
  gwlb: {
    title: 'What is a Gateway Load Balancer?',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/gateway/introduction.html',
  },
  ec2AutoScaling: {
    title: 'What is Amazon EC2 Auto Scaling?',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html',
  },
  asgTargetTracking: {
    title: 'Target tracking scaling policies for Amazon EC2 Auto Scaling',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html',
  },
  asgScheduled: {
    title: 'Scheduled scaling for Amazon EC2 Auto Scaling',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-scheduled-scaling.html',
  },
  asgPredictive: {
    title: 'Predictive scaling for Amazon EC2 Auto Scaling',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-predictive-scaling.html',
  },
  elastiCache: {
    title: 'What is Amazon ElastiCache?',
    url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html',
  },
  cloudFront: {
    title: 'What is Amazon CloudFront?',
    url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html',
  },
  kinesisStreams: {
    title: 'What is Amazon Kinesis Data Streams?',
    url: 'https://docs.aws.amazon.com/streams/latest/dev/introduction.html',
  },
  firehose: {
    title: 'What is Amazon Data Firehose?',
    url: 'https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html',
  },
  rdsReadReplicas: {
    title: 'Working with DB instance read replicas',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html',
  },
  transferFamily: {
    title: 'What is AWS Transfer Family?',
    url: 'https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html',
  },
  dynamodb: {
    title: 'What is Amazon DynamoDB?',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html',
  },
  dynamodbStreams: {
    title: 'Change data capture for DynamoDB Streams',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html',
  },
  s3EventNotifications: {
    title: 'Amazon S3 Event Notifications',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html',
  },
  eventBridgeScheduler: {
    title: 'What is Amazon EventBridge Scheduler?',
    url: 'https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html',
  },
  mq: {
    title: 'What is Amazon MQ?',
    url: 'https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/welcome.html',
  },
  appSync: {
    title: 'What is AWS AppSync?',
    url: 'https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html',
  },
  wellArchitectedReliability: {
    title: 'Reliability pillar - AWS Well-Architected Framework',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html',
  },
  awsBatch: {
    title: 'What is AWS Batch?',
    url: 'https://docs.aws.amazon.com/batch/latest/userguide/what-is-batch.html',
  },
  // High availability and DR (2.2)
  rdsMultiAz: {
    title: 'Configuring and managing a Multi-AZ deployment for Amazon RDS',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html',
  },
  rdsMultiAzCluster: {
    title: 'Multi-AZ DB cluster deployments for Amazon RDS',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/multi-az-db-clusters-concepts.html',
  },
  auroraOverview: {
    title: 'What is Amazon Aurora?',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html',
  },
  auroraHa: {
    title: 'High availability for Amazon Aurora',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html',
  },
  auroraGlobal: {
    title: 'Using Amazon Aurora Global Database',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html',
  },
  dynamodbGlobalTables: {
    title: 'Global tables - multi-active, multi-Region replication',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html',
  },
  dynamodbPitr: {
    title: 'Point-in-time recovery for DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Point-in-time-recovery.html',
  },
  route53Failover: {
    title: 'Active-active and active-passive failover',
    url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover-types.html',
  },
  route53HealthChecks: {
    title: 'Creating Amazon Route 53 health checks',
    url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html',
  },
  route53Routing: {
    title: 'Choosing a routing policy',
    url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html',
  },
  elbHealthChecks: {
    title: 'Health checks for Application Load Balancer target groups',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html',
  },
  asgHealthChecks: {
    title: 'Health checks for instances in an Auto Scaling group',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-health-checks.html',
  },
  drStrategies: {
    title: 'Disaster recovery options in the cloud',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html',
  },
  drObjectives: {
    title: 'Disaster recovery objectives (RTO and RPO)',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-objectives.html',
  },
  elasticDr: {
    title: 'What is AWS Elastic Disaster Recovery?',
    url: 'https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html',
  },
  rdsProxy: {
    title: 'Amazon RDS Proxy',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html',
  },
  efs: {
    title: 'What is Amazon Elastic File System?',
    url: 'https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html',
  },
  s3Durability: {
    title: 'Data protection in Amazon S3',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/DataDurability.html',
  },
  xray: {
    title: 'What is AWS X-Ray?',
    url: 'https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html',
  },
  serviceQuotas: {
    title: 'What is Service Quotas?',
    url: 'https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html',
  },
  cloudWatchAlarms: {
    title: 'Using Amazon CloudWatch alarms',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html',
  },
  ec2AutoRecovery: {
    title: 'Automatic instance recovery',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-recover.html',
  },
  placementGroups: {
    title: 'Placement groups for your Amazon EC2 instances',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-groups.html',
  },
  globalAccelerator: {
    title: 'What is AWS Global Accelerator?',
    url: 'https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html',
  },
  reliabilityImmutable: {
    title: 'REL08-BP04 Deploy using immutable infrastructure',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_tracking_change_management_immutable_infrastructure.html',
  },
  ebsSnapshots: {
    title: 'Amazon EBS snapshots',
    url: 'https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html',
  },
  elastiCacheHa: {
    title: 'High availability using replication groups (ElastiCache)',
    url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Replication.html',
  },
  comprehend: {
    title: 'What is Amazon Comprehend?',
    url: 'https://docs.aws.amazon.com/comprehend/latest/dg/what-is.html',
  },
  polly: {
    title: 'What is Amazon Polly?',
    url: 'https://docs.aws.amazon.com/polly/latest/dg/what-is.html',
  },
  cloudFrontOriginFailover: {
    title: 'Optimize high availability with CloudFront origin failover',
    url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/high_availability_origin_failover.html',
  },
  s3Rtc: {
    title: 'Meeting compliance requirements with S3 Replication Time Control',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication-time-control.html',
  },
  mgn: {
    title: 'What is AWS Application Migration Service?',
    url: 'https://docs.aws.amazon.com/mgn/latest/ug/what-is-application-migration-service.html',
  },
  // Storage and compute performance (3.1, 3.2)
  ebsVolumeTypes: {
    title: 'Amazon EBS volume types',
    url: 'https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html',
  },
  ebsMultiAttach: {
    title: 'Attach a volume to multiple instances with Amazon EBS Multi-Attach',
    url: 'https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes-multi.html',
  },
  instanceStore: {
    title: 'Instance store temporary block storage for EC2 instances',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html',
  },
  efsPerformance: {
    title: 'Amazon EFS performance specifications',
    url: 'https://docs.aws.amazon.com/efs/latest/ug/performance.html',
  },
  fsxLustre: {
    title: 'What is Amazon FSx for Lustre?',
    url: 'https://docs.aws.amazon.com/fsx/latest/LustreGuide/what-is.html',
  },
  fsxWindows: {
    title: 'What is Amazon FSx for Windows File Server?',
    url: 'https://docs.aws.amazon.com/fsx/latest/WindowsGuide/what-is.html',
  },
  fsxOntap: {
    title: 'What is Amazon FSx for NetApp ONTAP?',
    url: 'https://docs.aws.amazon.com/fsx/latest/ONTAPGuide/what-is-fsx-ontap.html',
  },
  s3Performance: {
    title: 'Best practices design patterns: optimizing Amazon S3 performance',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html',
  },
  s3Multipart: {
    title: 'Uploading and copying objects using multipart upload in Amazon S3',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html',
  },
  s3TransferAcceleration: {
    title: 'Configuring fast, secure file transfers using Amazon S3 Transfer Acceleration',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/transfer-acceleration.html',
  },
  storageGateway: {
    title: 'What is AWS Storage Gateway?',
    url: 'https://docs.aws.amazon.com/storagegateway/latest/userguide/WhatIsStorageGateway.html',
  },
  ec2InstanceTypes: {
    title: 'Amazon EC2 instance types',
    url: 'https://docs.aws.amazon.com/ec2/latest/instancetypes/instance-types.html',
  },
  lambdaMemory: {
    title: 'Configure Lambda function memory',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-memory.html',
  },
  graviton: {
    title: 'AWS Graviton Processor',
    url: 'https://aws.amazon.com/ec2/graviton/',
  },
  efa: {
    title: 'Elastic Fabric Adapter for HPC and ML workloads on Amazon EC2',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/efa.html',
  },
  emr: {
    title: 'What is Amazon EMR?',
    url: 'https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-what-is-emr.html',
  },
  ebsOptimized: {
    title: 'Amazon EBS-optimized instance types',
    url: 'https://docs.aws.amazon.com/ec2/latest/instancetypes/ebs-optimized.html',
  },
  lambdaProvisionedConcurrency: {
    title: 'Configuring provisioned concurrency for a function',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html',
  },
  elasticBeanstalk: {
    title: 'What is AWS Elastic Beanstalk?',
    url: 'https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html',
  },
  s3ByteRange: {
    title: 'Performance guidelines for Amazon S3',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance-guidelines.html',
  },
  s3ExpressOneZone: {
    title: 'S3 Express One Zone',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/directory-bucket-high-performance.html',
  },
  asgWarmPools: {
    title: 'Warm pools for Amazon EC2 Auto Scaling',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-warm-pools.html',
  },
  computeOptimizer: {
    title: 'What is AWS Compute Optimizer?',
    url: 'https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html',
  },
  outposts: {
    title: 'What is AWS Outposts?',
    url: 'https://docs.aws.amazon.com/outposts/latest/userguide/what-is-outposts.html',
  },
  localZones: {
    title: 'What is AWS Local Zones?',
    url: 'https://docs.aws.amazon.com/local-zones/latest/ug/what-is-aws-local-zones.html',
  },
  wavelength: {
    title: 'What is AWS Wavelength?',
    url: 'https://docs.aws.amazon.com/wavelength/latest/developerguide/what-is-wavelength.html',
  },
  snowball: {
    title: 'What is AWS Snowball Edge?',
    url: 'https://docs.aws.amazon.com/snowball/latest/developer-guide/whatisedge.html',
  },
  dataSync: {
    title: 'What is AWS DataSync?',
    url: 'https://docs.aws.amazon.com/datasync/latest/userguide/what-is-datasync.html',
  },
  // Databases (3.3)
  dynamodbCapacity: {
    title: 'DynamoDB throughput capacity',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html',
  },
  dax: {
    title: 'In-memory acceleration with DynamoDB Accelerator (DAX)',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html',
  },
  dynamodbPartitionKey: {
    title: 'Best practices for designing and using partition keys effectively in DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html',
  },
  dynamodbGsi: {
    title: 'Using Global Secondary Indexes in DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html',
  },
  auroraServerless: {
    title: 'Using Aurora Serverless v2',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html',
  },
  auroraReplicas: {
    title: 'Replication with Amazon Aurora',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Replication.html',
  },
  auroraEndpoints: {
    title: 'Amazon Aurora endpoint connections',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.Endpoints.html',
  },
  auroraAutoScaling: {
    title: 'Amazon Aurora Auto Scaling with Aurora Replicas',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Integrating.AutoScaling.html',
  },
  rdsStorageAutoscaling: {
    title: 'Managing capacity automatically with Amazon RDS storage autoscaling',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIOPS.Autoscaling.html',
  },
  redshift: {
    title: 'What is Amazon Redshift?',
    url: 'https://docs.aws.amazon.com/redshift/latest/gsg/new-user-serverless.html',
  },
  documentDb: {
    title: 'What is Amazon DocumentDB (with MongoDB compatibility)?',
    url: 'https://docs.aws.amazon.com/documentdb/latest/developerguide/what-is.html',
  },
  neptune: {
    title: 'What is Amazon Neptune?',
    url: 'https://docs.aws.amazon.com/neptune/latest/userguide/intro.html',
  },
  keyspaces: {
    title: 'What is Amazon Keyspaces (for Apache Cassandra)?',
    url: 'https://docs.aws.amazon.com/keyspaces/latest/devguide/what-is-keyspaces.html',
  },
  memoryDb: {
    title: 'What is Amazon MemoryDB?',
    url: 'https://docs.aws.amazon.com/memorydb/latest/devguide/what-is-memorydb.html',
  },
  elastiCacheStrategies: {
    title: 'Caching strategies for Amazon ElastiCache',
    url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html',
  },
  opensearch: {
    title: 'What is Amazon OpenSearch Service?',
    url: 'https://docs.aws.amazon.com/opensearch-service/latest/developerguide/what-is.html',
  },
  rdsInstanceClasses: {
    title: 'DB instance classes',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.DBInstanceClass.html',
  },
  dynamodbOnDemand: {
    title: 'DynamoDB on-demand capacity mode',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html',
  },
  dms: {
    title: 'What is AWS Database Migration Service?',
    url: 'https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html',
  },
  sct: {
    title: 'What is the AWS Schema Conversion Tool?',
    url: 'https://docs.aws.amazon.com/SchemaConversionTool/latest/userguide/CHAP_Welcome.html',
  },
  performanceInsights: {
    title: 'Monitoring DB load with Performance Insights',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PerfInsights.html',
  },
  dynamodbTtl: {
    title: 'Using time to live (TTL) in DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html',
  },
  athena: {
    title: 'What is Amazon Athena?',
    url: 'https://docs.aws.amazon.com/athena/latest/ug/what-is.html',
  },
  rdsEngines: {
    title: 'What is Amazon Relational Database Service (Amazon RDS)?',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html',
  },
  // Networking and data (3.4, 3.5)
  vpcPeering: {
    title: 'What is VPC peering?',
    url: 'https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html',
  },
  cloudFrontCaching: {
    title: 'Optimize caching and availability',
    url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/ConfiguringCaching.html',
  },
  cloudFrontFunctions: {
    title: 'Customize at the edge with functions',
    url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions.html',
  },
  kinesisShards: {
    title: 'Amazon Kinesis Data Streams terminology and concepts',
    url: 'https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html',
  },
  glue: {
    title: 'What is AWS Glue?',
    url: 'https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html',
  },
  glueCrawlers: {
    title: 'Using crawlers to populate the Data Catalog',
    url: 'https://docs.aws.amazon.com/glue/latest/dg/add-crawler.html',
  },
  lakeFormation: {
    title: 'What is AWS Lake Formation?',
    url: 'https://docs.aws.amazon.com/lake-formation/latest/dg/what-is-lake-formation.html',
  },
  msk: {
    title: 'What is Amazon MSK?',
    url: 'https://docs.aws.amazon.com/msk/latest/developerguide/what-is-msk.html',
  },
  quickSight: {
    title: 'What is Amazon Quick Sight?',
    url: 'https://docs.aws.amazon.com/quicksight/latest/user/welcome.html',
  },
  athenaPartitions: {
    title: 'Partition your data',
    url: 'https://docs.aws.amazon.com/athena/latest/ug/partitions.html',
  },
  athenaColumnar: {
    title: 'Use columnar storage formats',
    url: 'https://docs.aws.amazon.com/athena/latest/ug/columnar-storage.html',
  },
  dxResiliency: {
    title: 'AWS Direct Connect Resiliency Toolkit',
    url: 'https://docs.aws.amazon.com/directconnect/latest/UserGuide/resilency_toolkit.html',
  },
  vpnAcceleration: {
    title: 'Accelerated Site-to-Site VPN connections',
    url: 'https://docs.aws.amazon.com/vpn/latest/s2svpn/accelerated-vpn.html',
  },
  elbCrossZone: {
    title: 'Cross-zone load balancing',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html',
  },
  appFlow: {
    title: 'What is Amazon AppFlow?',
    url: 'https://docs.aws.amazon.com/appflow/latest/userguide/what-is-appflow.html',
  },
  vpcIpam: {
    title: 'What is IPAM?',
    url: 'https://docs.aws.amazon.com/vpc/latest/ipam/what-it-is-ipam.html',
  },
  // Performance, mixed (D3)
  ecsServiceAutoScaling: {
    title: 'Automatically scale your Amazon ECS service',
    url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html',
  },
  elastiCacheEngines: {
    title: 'Comparing Valkey, Memcached, and Redis OSS self-designed caches',
    url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/SelectEngine.html',
  },
  lambdaConcurrency: {
    title: 'Understanding Lambda function scaling',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html',
  },
  cloudFrontOrigins: {
    title: 'Use various origins with CloudFront distributions',
    url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistS3AndCustomOrigins.html',
  },
  rdsStorage: {
    title: 'Amazon RDS DB instance storage',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_Storage.html',
  },
  ec2Hibernate: {
    title: 'Hibernate your Amazon EC2 instance',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Hibernate.html',
  },
  stepFunctionsMap: {
    title: 'Map state',
    url: 'https://docs.aws.amazon.com/step-functions/latest/dg/state-map.html',
  },
  redshiftSpectrum: {
    title: 'Amazon Redshift Spectrum',
    url: 'https://docs.aws.amazon.com/redshift/latest/dg/c-using-spectrum.html',
  },
  efsStorageClasses: {
    title: 'EFS storage classes',
    url: 'https://docs.aws.amazon.com/efs/latest/ug/storage-classes.html',
  },
  enhancedNetworking: {
    title: 'Enhanced networking on Amazon EC2 instances',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/enhanced-networking.html',
  },
  route53Alias: {
    title: 'Choosing between alias and non-alias records',
    url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html',
  },
  albSticky: {
    title: 'Sticky sessions for your Application Load Balancer',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html',
  },
  volumeGateway: {
    title: 'How Volume Gateway works',
    url: 'https://docs.aws.amazon.com/storagegateway/latest/vgw/StorageGatewayConcepts.html',
  },
  ecsCapacityProviders: {
    title: 'Amazon ECS capacity providers for EC2 workloads',
    url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/asg-capacity-providers.html',
  },
  // Resilience, more (2.1, 2.2)
  route53Arc: {
    title: 'What is Amazon Application Recovery Controller (ARC)?',
    url: 'https://docs.aws.amazon.com/r53recovery/latest/dg/what-is-route53-recovery.html',
  },
  stepFunctionsErrors: {
    title: 'Handling errors in Step Functions workflows',
    url: 'https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html',
  },
  eventBridgeArchive: {
    title: 'Archiving and replaying events in Amazon EventBridge',
    url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-archive.html',
  },
  lambdaDestinations: {
    title: 'Capturing records of Lambda asynchronous invocations',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html',
  },
  lambdaSqsErrors: {
    title: 'Handling errors for an SQS event source in Lambda',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html',
  },
  deregistrationDelay: {
    title: 'Edit target group attributes for your Application Load Balancer',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-target-group-attributes.html',
  },
  rdsBackups: {
    title: 'Introduction to backups',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html',
  },
  amiCopy: {
    title: 'Copy an Amazon EC2 AMI',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/CopyingAMIs.html',
  },
  efsReplication: {
    title: 'Replicating EFS file systems',
    url: 'https://docs.aws.amazon.com/efs/latest/ug/efs-replication.html',
  },
  fsxWindowsMultiAz: {
    title: 'Availability and durability: Single-AZ and Multi-AZ file systems',
    url: 'https://docs.aws.amazon.com/fsx/latest/WindowsGuide/high-availability-multiAZ.html',
  },
  retryBackoff: {
    title: 'REL05-BP03 Control and limit retry calls',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_limit_retries.html',
  },
  gracefulDegradation: {
    title:
      'REL05-BP01 Implement graceful degradation to transform applicable hard dependencies into soft dependencies',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_graceful_degradation.html',
  },
  stackSets: {
    title: 'Managing stacks across accounts and Regions with StackSets',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html',
  },
  ebDeployments: {
    title: 'Deployment policies and settings',
    url: 'https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.rolling-version-deploy.html',
  },
  sqsDelay: {
    title: 'Amazon SQS delay queues',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-delay-queues.html',
  },
  sqsQuotas: {
    title: 'Amazon SQS message quotas',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/quotas-messages.html',
  },
  route53CalculatedHc: {
    title: 'Monitoring other health checks (calculated health checks)',
    url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/health-checks-types.html',
  },
  lambdaHa: {
    title: 'Resilience in AWS Lambda',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/security-resilience.html',
  },
  blueGreen: {
    title: 'Blue/Green Deployments on AWS',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/blue-green-deployments/introduction.html',
  },
  dlm: {
    title: 'Automate backups with Amazon Data Lifecycle Manager',
    url: 'https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-lifecycle.html',
  },
  // Resilience, mixed (D2)
  stepFunctionsWorkflowTypes: {
    title: 'Choosing workflow type in Step Functions',
    url: 'https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html',
  },
  eventBridgePipes: {
    title: 'Amazon EventBridge Pipes',
    url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-pipes.html',
  },
  apiGatewayHttpVsRest: {
    title: 'Choose between REST APIs and HTTP APIs',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html',
  },
  apiGatewayWebSocket: {
    title: 'API Gateway WebSocket APIs',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html',
  },
  ecsCircuitBreaker: {
    title: 'How the Amazon ECS deployment circuit breaker detects failures',
    url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-circuit-breaker.html',
  },
  mqHa: {
    title: 'Amazon MQ for ActiveMQ deployment options',
    url: 'https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/amazon-mq-broker-architecture.html',
  },
  albLambda: {
    title: 'Lambda functions as targets for an Application Load Balancer',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/lambda-functions.html',
  },
  asgSqsScaling: {
    title: 'Scaling policy based on Amazon SQS',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-using-sqs-queue.html',
  },
  asgInstanceRefresh: {
    title: 'Use an instance refresh to update instances in an Auto Scaling group',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/asg-instance-refresh.html',
  },
  asgLifecycleHooks: {
    title: 'Amazon EC2 Auto Scaling lifecycle hooks',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/lifecycle-hooks.html',
  },
  capacityRebalancing: {
    title: 'Use Capacity Rebalancing to handle Amazon EC2 Spot interruptions',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-capacity-rebalancing.html',
  },
  mixedInstances: {
    title: 'Auto Scaling groups with multiple instance types and purchase options',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-mixed-instances-groups.html',
  },
  vpnTunnels: {
    title: 'Site-to-Site VPN tunnel options',
    url: 'https://docs.aws.amazon.com/vpn/latest/s2svpn/VPNTunnels.html',
  },
  dxVpnBackup: {
    title: 'AWS Direct Connect + AWS Site-to-Site VPN',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/aws-direct-connect-site-to-site-vpn.html',
  },
  elastiCacheGlobalDatastore: {
    title: 'Replication across AWS Regions using global datastores',
    url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Redis-Global-Datastore.html',
  },
  snsFifo: {
    title: 'Message ordering details for FIFO topics in Amazon SNS',
    url: 'https://docs.aws.amazon.com/sns/latest/dg/fifo-message-delivery.html',
  },
  s3Website: {
    title: 'Hosting a static website using Amazon S3',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html',
  },
  resilienceHub: {
    title: 'What is AWS Resilience Hub?',
    url: 'https://docs.aws.amazon.com/resilience-hub/latest/userguide/what-is.html',
  },
  eksAutoscaling: {
    title: 'Scale cluster compute with Karpenter and Cluster Autoscaler',
    url: 'https://docs.aws.amazon.com/eks/latest/userguide/autoscaling.html',
  },
  // Cost: storage and management (4.1)
  s3IntelligentTiering: {
    title: 'How S3 Intelligent-Tiering works',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering-overview.html',
  },
  s3LifecycleTransitions: {
    title: 'Transitioning objects using Amazon S3 Lifecycle',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-transition-general-considerations.html',
  },
  s3StorageLens: {
    title: 'Assessing your storage activity and usage with Amazon S3 Storage Lens',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage_lens.html',
  },
  s3StorageClassAnalysis: {
    title: 'Amazon S3 analytics – Storage Class Analysis',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/analytics-storage-class.html',
  },
  s3RequesterPays: {
    title: 'Using Requester Pays general purpose buckets for storage transfers and usage',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/RequesterPaysBuckets.html',
  },
  s3GlacierRetrieval: {
    title: 'Understanding archive retrieval options',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/restoring-objects-retrieval-options.html',
  },
  s3AbortMpu: {
    title: 'Configuring a bucket lifecycle configuration to delete incomplete multipart uploads',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html',
  },
  ebsGp2ToGp3: {
    title: 'Amazon EBS General Purpose SSD volumes',
    url: 'https://docs.aws.amazon.com/ebs/latest/userguide/general-purpose.html',
  },
  ebsSnapshotArchive: {
    title: 'Archive Amazon EBS snapshots',
    url: 'https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-archive.html',
  },
  ebsModify: {
    title: 'Modify an Amazon EBS volume using Elastic Volumes operations',
    url: 'https://docs.aws.amazon.com/ebs/latest/userguide/ebs-modify-volume.html',
  },
  backupLifecycle: {
    title: 'Backup plan lifecycle and cold storage',
    url: 'https://docs.aws.amazon.com/aws-backup/latest/devguide/plan-options-and-configuration.html',
  },
  fsxLustreDeployment: {
    title: 'Deployment and storage class options for Amazon FSx for Lustre file systems',
    url: 'https://docs.aws.amazon.com/fsx/latest/LustreGuide/using-fsx-lustre.html',
  },
  costExplorer: {
    title: 'Analyzing your costs and usage with AWS Cost Explorer',
    url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html',
  },
  budgets: {
    title: 'Managing your costs with AWS Budgets',
    url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html',
  },
  costAllocationTags: {
    title: 'Organizing and tracking costs using AWS cost allocation tags',
    url: 'https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html',
  },
  cur: {
    title: 'What are AWS Data Exports?',
    url: 'https://docs.aws.amazon.com/cur/latest/userguide/what-is-data-exports.html',
  },
  costAnomaly: {
    title: 'Detecting unusual spend with AWS Cost Anomaly Detection',
    url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/manage-ad.html',
  },
  wellArchitectedCost: {
    title: 'Cost Optimization Pillar - AWS Well-Architected Framework',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html',
  },
  consolidatedBilling: {
    title: 'Consolidated billing for AWS Organizations',
    url: 'https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html',
  },
  s3Pricing: {
    title: 'Amazon S3 pricing',
    url: 'https://aws.amazon.com/s3/pricing/',
  },
  // Cost: compute (4.2)
  savingsPlans: {
    title: 'What are Savings Plans?',
    url: 'https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html',
  },
  savingsPlansTypes: {
    title: 'Savings Plans types',
    url: 'https://docs.aws.amazon.com/savingsplans/latest/userguide/plan-types.html',
  },
  reservedInstances: {
    title: 'Reserved Instance overview',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html',
  },
  spotInstances: {
    title: 'Amazon EC2 Spot Instances',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html',
  },
  spotBestPractices: {
    title: 'Best practices for Amazon EC2 Spot',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-best-practices.html',
  },
  capacityReservations: {
    title: 'On-Demand Capacity Reservations',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-capacity-reservations.html',
  },
  dedicatedHosts: {
    title: 'Amazon EC2 Dedicated Hosts',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/dedicated-hosts-overview.html',
  },
  burstable: {
    title: 'Burstable performance instances',
    url: 'https://docs.aws.amazon.com/ec2/latest/instancetypes/burstable-performance-instances.html',
  },
  lambdaPricing: {
    title: 'AWS Lambda pricing',
    url: 'https://aws.amazon.com/lambda/pricing/',
  },
  fargateSpot: {
    title: 'Amazon ECS clusters for Fargate',
    url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-capacity-providers.html',
  },
  instanceScheduler: {
    title: 'Instance Scheduler on AWS',
    url: 'https://docs.aws.amazon.com/solutions/latest/instance-scheduler-on-aws/solution-overview.html',
  },
  trustedAdvisor: {
    title: 'AWS Trusted Advisor',
    url: 'https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html',
  },
  lambdaArm: {
    title: 'Selecting and configuring an instruction set architecture for your Lambda function',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/foundation-arch.html',
  },
  spotFleetAllocation: {
    title: 'Allocation strategies for multiple instance types',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/allocation-strategies.html',
  },
  costOptimizationHub: {
    title: 'What is Cost Optimization Hub?',
    url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/cost-optimization-hub.html',
  },
  optimizeCpus: {
    title: 'CPU options for Amazon EC2 instances',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-optimize-cpu.html',
  },
  // Cost: databases and network (4.3, 4.4)
  rdsReserved: {
    title: 'Reserved DB instances for Amazon RDS',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithReservedDBInstances.html',
  },
  rdsStopStart: {
    title: 'Temporarily stopping an Amazon RDS DB instance',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_StopInstance.html',
  },
  auroraIoOptimized: {
    title: 'Amazon Aurora storage configurations',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.StorageReliability.html',
  },
  auroraServerlessPause: {
    title: 'Scaling to Zero ACUs with automatic pause and resume for Aurora serverless',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2-auto-pause.html',
  },
  dynamodbTableClasses: {
    title: 'Table classes',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.TableClasses.html',
  },
  dynamodbReserved: {
    title: 'DynamoDB reserved capacity',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/reserved-capacity.html',
  },
  dataTransferCosts: {
    title: 'Overview of data transfer costs for common architectures',
    url: 'https://aws.amazon.com/blogs/architecture/overview-of-data-transfer-costs-for-common-architectures/',
  },
  natGatewayPricing: {
    title: 'Pricing for NAT gateways',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-pricing.html',
  },
  cloudFrontPricing: {
    title: 'Amazon CloudFront pricing',
    url: 'https://aws.amazon.com/cloudfront/pricing/',
  },
  vpcEndpointsPricing: {
    title: 'AWS PrivateLink pricing',
    url: 'https://aws.amazon.com/privatelink/pricing/',
  },
  dxPricing: {
    title: 'AWS Direct Connect pricing',
    url: 'https://aws.amazon.com/directconnect/pricing/',
  },
  ec2DataTransfer: {
    title: 'Amazon EC2 On-Demand pricing (data transfer)',
    url: 'https://aws.amazon.com/ec2/pricing/on-demand/',
  },
  elastiCacheReserved: {
    title: 'Reserved nodes for ElastiCache',
    url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/CacheNodes.Reserved.html',
  },
  redshiftServerless: {
    title: 'Amazon Redshift Serverless',
    url: 'https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-serverless.html',
  },
  cloudWatchLogsRetention: {
    title: 'Change log data retention in CloudWatch Logs',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html',
  },
  ipv4Pricing: {
    title: 'Public IPv4 address charges',
    url: 'https://aws.amazon.com/vpc/pricing/',
  },
  // General
  sharedResponsibility: {
    title: 'Shared Responsibility Model',
    url: 'https://aws.amazon.com/compliance/shared-responsibility-model/',
  },
  regionsAzs: {
    title: 'Regions and Availability Zones',
    url: 'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/',
  },
  cloudTrailOrgTrail: {
    title: 'Creating a trail for an organization',
    url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/creating-trail-organization.html',
  },
} as const satisfies Record<string, SourceReference>;

export type RefKey = keyof typeof REFS;
