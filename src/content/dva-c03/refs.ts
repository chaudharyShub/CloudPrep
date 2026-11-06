import type { SourceReference } from '@/domain/questions/types';

/**
 * AWS pages cited by DVA-C03 questions (D-066). Keys are short and stable; a question cites
 * them in `r`. Add a page here before citing it.
 */
export const REFS = {
  dvaGuide: {
    title: 'AWS Certified Developer – Associate (DVA-C03) exam guide',
    url: 'https://docs.aws.amazon.com/aws-certification/latest/developer-associate-03/developer-associate-03.html',
  },
  // Development: integration, APIs, SDKs, AI (1.1)
  sqs: {
    title: 'What is Amazon Simple Queue Service?',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html',
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
  sqsFifo: {
    title: 'Amazon SQS FIFO queues',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fifo-queues.html',
  },
  sqsQuotas: {
    title: 'Amazon SQS message quotas',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/quotas-messages.html',
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
  eventBridge: {
    title: 'What is Amazon EventBridge?',
    url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html',
  },
  eventBridgePipes: {
    title: 'Amazon EventBridge Pipes',
    url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-pipes.html',
  },
  stepFunctions: {
    title: 'What is Step Functions?',
    url: 'https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html',
  },
  stepFunctionsErrors: {
    title: 'Handling errors in Step Functions workflows',
    url: 'https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html',
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
  apiGatewayHttpVsRest: {
    title: 'Choose between REST APIs and HTTP APIs',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html',
  },
  kinesisStreams: {
    title: 'What is Amazon Kinesis Data Streams?',
    url: 'https://docs.aws.amazon.com/streams/latest/dev/introduction.html',
  },
  kinesisShards: {
    title: 'Amazon Kinesis Data Streams terminology and concepts',
    url: 'https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html',
  },
  firehose: {
    title: 'What is Amazon Data Firehose?',
    url: 'https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html',
  },
  s3EventNotifications: {
    title: 'Amazon S3 Event Notifications',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html',
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
  lambda: {
    title: 'What is AWS Lambda?',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html',
  },
  eventBridgeArchive: {
    title: 'Archiving and replaying events in Amazon EventBridge',
    url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-archive.html',
  },
  apiGatewayMapping: {
    title: 'Data transformations for REST APIs in API Gateway',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-data-transformations.html',
  },
  apiGatewayValidation: {
    title: 'Request validation for REST APIs in API Gateway',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-request-validation.html',
  },
  sdkRetries: {
    title: 'Retry behavior (AWS SDKs and Tools)',
    url: 'https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html',
  },
  sdkPagination: {
    title: 'Paginators (Boto3)',
    url: 'https://docs.aws.amazon.com/boto3/latest/guide/paginators.html',
  },
  sdkCredentialChain: {
    title: 'Credential providers in the AWS SDKs and Tools',
    url: 'https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html',
  },
  kiro: {
    title: 'Kiro documentation',
    url: 'https://kiro.dev/docs/',
  },
  kiroSpecs: {
    title: 'Specs (Kiro)',
    url: 'https://kiro.dev/docs/specs/',
  },
  kiroSteering: {
    title: 'Steering (Kiro)',
    url: 'https://kiro.dev/docs/steering/',
  },
  kiroHooks: {
    title: 'Hooks (Kiro)',
    url: 'https://kiro.dev/docs/hooks/',
  },
  bedrock: {
    title: 'What is Amazon Bedrock?',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html',
  },
  bedrockConverse: {
    title: 'Carry out a conversation with the Converse API operations',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html',
  },
  bedrockStreaming: {
    title: 'InvokeModelWithResponseStream',
    url: 'https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModelWithResponseStream.html',
  },
  agentCore: {
    title: 'What is Amazon Bedrock AgentCore?',
    url: 'https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html',
  },
  kinesisKcl: {
    title: 'Use the Kinesis Client Library',
    url: 'https://docs.aws.amazon.com/streams/latest/dev/kcl.html',
  },
  kinesisPutRecords: {
    title: 'PutRecords',
    url: 'https://docs.aws.amazon.com/kinesis/latest/APIReference/API_PutRecords.html',
  },
  sqsBatch: {
    title: 'Amazon SQS batch actions',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-batch-api-actions.html',
  },
  eventBridgePatterns: {
    title: 'Creating Amazon EventBridge event patterns',
    url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-patterns.html',
  },
  apiGatewayMock: {
    title: 'Mock integrations for REST APIs in API Gateway',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-mock-integration.html',
  },
  dynamodbJson: {
    title: 'Supported data types and naming rules in Amazon DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html',
  },
  // Lambda (1.2)
  lambdaMemory: {
    title: 'Configure Lambda function memory',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-memory.html',
  },
  lambdaConcurrency: {
    title: 'Understanding Lambda function scaling',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html',
  },
  lambdaProvisionedConcurrency: {
    title: 'Configuring provisioned concurrency for a function',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html',
  },
  lambdaDestinations: {
    title: 'Capturing records of Lambda asynchronous invocations',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html',
  },
  lambdaSqs: {
    title: 'Using Lambda with Amazon SQS',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html',
  },
  lambdaSqsErrors: {
    title: 'Handling errors for an SQS event source in Lambda',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html',
  },
  lambdaLimits: {
    title: 'Lambda quotas',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html',
  },
  lambdaHa: {
    title: 'Resilience in AWS Lambda',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/security-resilience.html',
  },
  lambdaExecutionRole: {
    title: 'Defining Lambda function permissions with an execution role',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html',
  },
  lambdaResourcePolicy: {
    title: 'Viewing resource-based IAM policies in Lambda',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html',
  },
  lambdaArm: {
    title: 'Selecting and configuring an instruction set architecture for your Lambda function',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/foundation-arch.html',
  },
  lambdaVpc: {
    title: 'Giving Lambda functions access to resources in an Amazon VPC',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html',
  },
  lambdaEnvVars: {
    title: 'Working with Lambda environment variables',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html',
  },
  lambdaLayers: {
    title: 'Managing Lambda dependencies with layers',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html',
  },
  lambdaExtensions: {
    title: 'Augment Lambda functions using Lambda extensions',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-extensions.html',
  },
  lambdaTimeout: {
    title: 'Configure Lambda function timeout',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html',
  },
  lambdaHandler: {
    title: 'Lambda function handler',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/foundation-progmodel.html',
  },
  lambdaAsync: {
    title: 'Invoking a Lambda function asynchronously',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/invocation-async.html',
  },
  lambdaRetries: {
    title: 'Understanding retry behavior in Lambda',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/invocation-retries.html',
  },
  lambdaEsm: {
    title: 'How Lambda processes records from stream and queue-based event sources',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventsourcemapping.html',
  },
  lambdaKinesisErrors: {
    title: 'Configuring error handling for Kinesis event sources',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/kinesis-on-failure-destination.html',
  },
  lambdaDynamodb: {
    title: 'Using AWS Lambda with Amazon DynamoDB',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html',
  },
  lambdaApiGateway: {
    title: 'Invoking a Lambda function using an Amazon API Gateway endpoint',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway.html',
  },
  lambdaEphemeral: {
    title: 'Configure ephemeral storage for Lambda functions',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-ephemeral-storage.html',
  },
  lambdaVersions: {
    title: 'Manage Lambda function versions',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html',
  },
  lambdaAliases: {
    title: 'Create an alias for a Lambda function',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html',
  },
  lambdaEnvironment: {
    title: 'Understanding the Lambda execution environment lifecycle',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html',
  },
  lambdaFunctionUrls: {
    title: 'Creating and managing Lambda function URLs',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/urls-configuration.html',
  },
  lambdaEventFiltering: {
    title: 'Control which events Lambda sends to your function',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html',
  },
  lambdaRuntimes: {
    title: 'Lambda runtimes',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html',
  },
  lambdaEfs: {
    title: 'Configuring Amazon EFS file system access for Lambda functions',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-filesystem.html',
  },
  lambdaBestPractices: {
    title: 'Best practices for working with AWS Lambda functions',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html',
  },
  lambdaSyncInvoke: {
    title: 'Invoke a Lambda function synchronously',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/invocation-sync.html',
  },
  lambdaQuotas: {
    title: 'Lambda quotas',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html',
  },
  // Networking
  gatewayEndpoints: {
    title: 'Gateway endpoints',
    url: 'https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html',
  },
  // Lambda errors
  lambdaApigErrors: {
    title: 'Handling Lambda errors with an API Gateway API',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway-errors.html',
  },
  // Data stores (1.3)
  dynamodb: {
    title: 'What is Amazon DynamoDB?',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html',
  },
  dynamodbPartitionKey: {
    title: 'Best practices for designing and using partition keys effectively in DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html',
  },
  dynamodbGsi: {
    title: 'Using Global Secondary Indexes in DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html',
  },
  dynamodbCapacity: {
    title: 'DynamoDB throughput capacity',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html',
  },
  dynamodbOnDemand: {
    title: 'DynamoDB on-demand capacity mode',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html',
  },
  dynamodbTtl: {
    title: 'Using time to live (TTL) in DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html',
  },
  dynamodbStreams: {
    title: 'Change data capture for DynamoDB Streams',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html',
  },
  dynamodbTableClasses: {
    title: 'Table classes',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.TableClasses.html',
  },
  dax: {
    title: 'In-memory acceleration with DynamoDB Accelerator (DAX)',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html',
  },
  elastiCache: {
    title: 'What is Amazon ElastiCache?',
    url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html',
  },
  elastiCacheStrategies: {
    title: 'Caching strategies for Amazon ElastiCache',
    url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html',
  },
  elastiCacheEngines: {
    title: 'Comparing Valkey, Memcached, and Redis OSS self-designed caches',
    url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/SelectEngine.html',
  },
  s3Lifecycle: {
    title: 'Managing the lifecycle of objects',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html',
  },
  s3StorageClasses: {
    title: 'Understanding and managing Amazon S3 storage classes',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html',
  },
  s3Versioning: {
    title: 'Retaining multiple versions of objects with S3 Versioning',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html',
  },
  rdsReadReplicas: {
    title: 'Working with DB instance read replicas',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html',
  },
  rdsProxy: {
    title: 'Amazon RDS Proxy',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html',
  },
  rdsEngines: {
    title: 'What is Amazon Relational Database Service (Amazon RDS)?',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html',
  },
  cloudWatchLogsRetention: {
    title: 'Change log data retention in CloudWatch Logs',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html',
  },
  memoryDb: {
    title: 'What is Amazon MemoryDB?',
    url: 'https://docs.aws.amazon.com/memorydb/latest/devguide/what-is-memorydb.html',
  },
  opensearch: {
    title: 'What is Amazon OpenSearch Service?',
    url: 'https://docs.aws.amazon.com/opensearch-service/latest/developerguide/what-is.html',
  },
  auroraOverview: {
    title: 'What is Amazon Aurora?',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html',
  },
  dynamodbLsi: {
    title: 'Local secondary indexes',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/LSI.html',
  },
  dynamodbReadConsistency: {
    title: 'DynamoDB read consistency',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html',
  },
  dynamodbQuery: {
    title: 'Querying tables in DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html',
  },
  dynamodbScan: {
    title: 'Scanning tables in DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html',
  },
  dynamodbConditions: {
    title: 'Condition expressions in DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html',
  },
  dynamodbTransactions: {
    title: 'Amazon DynamoDB Transactions: How it works',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html',
  },
  dynamodbProvisioned: {
    title: 'DynamoDB provisioned capacity mode',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/provisioned-capacity-mode.html',
  },
  dynamodbBatch: {
    title: 'Batch operations (BatchGetItem and BatchWriteItem)',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithItems.html',
  },
  dynamodbProjection: {
    title: 'Projection expressions in DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ProjectionExpressions.html',
  },
  dynamodbParallelScan: {
    title: 'Parallel scan',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html#Scan.ParallelScan',
  },
  dynamodbCoreComponents: {
    title: 'Core components of Amazon DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html',
  },
  dynamodbAtomicCounter: {
    title: 'Update expressions in DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html',
  },
  s3Expiration: {
    title: 'Expiring objects',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-expire-general-considerations.html',
  },
  // Development, mixed (D1)
  apiGatewayWebSocket: {
    title: 'API Gateway WebSocket APIs',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html',
  },
  stepFunctionsWorkflowTypes: {
    title: 'Choosing workflow type in Step Functions',
    url: 'https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html',
  },
  stepFunctionsMap: {
    title: 'Map state',
    url: 'https://docs.aws.amazon.com/step-functions/latest/dg/state-map.html',
  },
  eventBridgeScheduler: {
    title: 'What is Amazon EventBridge Scheduler?',
    url: 'https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html',
  },
  snsFifo: {
    title: 'Message ordering details for FIFO topics in Amazon SNS',
    url: 'https://docs.aws.amazon.com/sns/latest/dg/fifo-message-delivery.html',
  },
  albLambda: {
    title: 'Lambda functions as targets for an Application Load Balancer',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/lambda-functions.html',
  },
  dynamodbGlobalTables: {
    title: 'Global tables - multi-active, multi-Region replication',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html',
  },
  apiGatewayCors: {
    title: 'CORS for REST APIs in API Gateway',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html',
  },
  lambdaSnapStart: {
    title: 'Improving startup performance with Lambda SnapStart',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html',
  },
  lambdaStreaming: {
    title: 'Response streaming for Lambda functions',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html',
  },
  firehoseTransform: {
    title: 'Transform source data in Amazon Data Firehose',
    url: 'https://docs.aws.amazon.com/firehose/latest/dev/data-transformation.html',
  },
  kinesisEfo: {
    title: 'Develop enhanced fan-out consumers with dedicated throughput',
    url: 'https://docs.aws.amazon.com/streams/latest/dev/enhanced-consumers.html',
  },
  bedrockToolUse: {
    title: 'Use a tool to complete an Amazon Bedrock model response',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/tool-use.html',
  },
  bedrockKnowledgeBases: {
    title: 'Retrieve data and generate AI responses with Amazon Bedrock Knowledge Bases',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html',
  },
  bedrockInferenceParams: {
    title: 'Influence response generation with inference parameters',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/inference-parameters.html',
  },
  sqsDedup: {
    title: 'Exactly-once processing in Amazon SQS',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues-exactly-once-processing.html',
  },
  sqsExtendedClient: {
    title: 'Managing large Amazon SQS messages using Amazon S3',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-s3-messages.html',
  },
  // SDK and DynamoDB extras
  sdkWaiters: {
    title: 'Low-level clients: waiters (Boto3)',
    url: 'https://docs.aws.amazon.com/boto3/latest/guide/clients.html',
  },
  dynamodbLargeItems: {
    title: 'Best practices for storing large items and attributes in DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-use-s3-too.html',
  },
  // Authentication and authorization (2.1)
  iamRoles: {
    title: 'IAM roles',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html',
  },
  iamBestPractices: {
    title: 'Security best practices in IAM',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html',
  },
  stsAssumeRole: {
    title: 'AssumeRole (AWS STS API Reference)',
    url: 'https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html',
  },
  iamTempCreds: {
    title: 'Temporary security credentials in IAM',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html',
  },
  iamMfa: {
    title: 'AWS Multi-factor authentication in IAM',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa.html',
  },
  iamSaml: {
    title: 'SAML 2.0 federation',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_saml.html',
  },
  cognito: {
    title: 'What is Amazon Cognito?',
    url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html',
  },
  cognitoUserPools: {
    title: 'Amazon Cognito user pools',
    url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html',
  },
  cognitoIdentityPools: {
    title: 'Amazon Cognito identity pools',
    url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html',
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
  iamPolicySimulator: {
    title: 'Test IAM policies with the IAM policy simulator',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html',
  },
  iamConditionKeys: {
    title: 'AWS global condition context keys',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html',
  },
  iamAbac: {
    title: 'Define permissions based on attributes with ABAC authorization',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction_attribute-based-access-control.html',
  },
  identityCenter: {
    title: 'What is IAM Identity Center?',
    url: 'https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html',
  },
  s3BucketPolicies: {
    title: 'Bucket policies for Amazon S3',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html',
  },
  kmsKeyPolicies: {
    title: 'Key policies in AWS KMS',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html',
  },
  iamEc2Role: {
    title: 'Use an IAM role to grant permissions to applications running on Amazon EC2 instances',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html',
  },
  ecsTaskRole: {
    title: 'Amazon ECS task IAM role',
    url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html',
  },
  albAuthenticate: {
    title: 'Authenticate users using an Application Load Balancer',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html',
  },
  iamMfaPolicyExample: {
    title: 'AWS: Allows MFA-authenticated IAM users to manage their own credentials',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_aws_my-sec-creds-self-manage.html',
  },
  s3Presigned: {
    title: 'Sharing objects with presigned URLs',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html',
  },
  s3PresignedUpload: {
    title: 'Uploading objects with presigned URLs',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html',
  },
  cloudFrontSigned: {
    title: 'Serve private content with signed URLs and signed cookies',
    url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PrivateContent.html',
  },
  sigV4: {
    title: 'AWS Signature Version 4 for API requests',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html',
  },
  apiGatewayLambdaAuth: {
    title: 'Use API Gateway Lambda authorizers',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html',
  },
  apiGatewayCognitoAuth: {
    title: 'Control access to REST APIs using Amazon Cognito user pools as an authorizer',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html',
  },
  apiGatewayIamAuth: {
    title: 'Control access to a REST API with IAM permissions',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/permissions.html',
  },
  apiGatewayJwt: {
    title: 'Control access to HTTP APIs with JWT authorizers',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html',
  },
  cliSso: {
    title: 'Configuring IAM Identity Center authentication with the AWS CLI',
    url: 'https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html',
  },
  iamAccessKeys: {
    title: 'Manage access keys for IAM users',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
  },
  stsWebIdentity: {
    title: 'AssumeRoleWithWebIdentity',
    url: 'https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithWebIdentity.html',
  },
  stsGetSessionToken: {
    title: 'GetSessionToken',
    url: 'https://docs.aws.amazon.com/STS/latest/APIReference/API_GetSessionToken.html',
  },
  iamPassRole: {
    title: 'Grant a user permissions to pass a role to an AWS service',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_passrole.html',
  },
  cognitoTokens: {
    title: 'Understanding user pool JSON web tokens (JWTs)',
    url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html',
  },
  iamPolicyVariables: {
    title: 'IAM policy elements: Variables and tags',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_variables.html',
  },
  s3AccessPoints: {
    title: 'Managing access to shared datasets with access points',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-points.html',
  },
  stsErrors: {
    title: 'Decode an authorization failure message',
    url: 'https://docs.aws.amazon.com/STS/latest/APIReference/API_DecodeAuthorizationMessage.html',
  },
  // Auth extras
  dynamodbFineGrained: {
    title: 'Using IAM policy conditions for fine-grained access control',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/specifying-conditions.html',
  },
  ecsTaskExecRole: {
    title: 'Amazon ECS task execution IAM role',
    url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html',
  },
  // Auth troubleshooting
  sigV4Troubleshooting: {
    title: 'Troubleshoot Signature Version 4 signing for AWS API requests',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/signature-v4-troubleshooting.html',
  },
  cloudFrontSignedChoice: {
    title: 'Decide to use signed URLs or signed cookies',
    url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-choosing-signed-urls-cookies.html',
  },
  // Encryption and sensitive data (2.2)
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
  acm: {
    title: 'What is AWS Certificate Manager?',
    url: 'https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html',
  },
  acmRenewal: {
    title: 'Managed certificate renewal in AWS Certificate Manager',
    url: 'https://docs.aws.amazon.com/acm/latest/userguide/managed-renewal.html',
  },
  privateCa: {
    title: 'What is AWS Private CA?',
    url: 'https://docs.aws.amazon.com/privateca/latest/userguide/PcaWelcome.html',
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
  macie: {
    title: 'What is Amazon Macie?',
    url: 'https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html',
  },
  dynamodbEncryption: {
    title: 'DynamoDB encryption at rest',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/EncryptionAtRest.html',
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
  cloudHsm: {
    title: 'What is AWS CloudHSM?',
    url: 'https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html',
  },
  kmsDataKeys: {
    title: 'Data keys (AWS KMS)',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/data-keys.html',
  },
  kmsEncrypt: {
    title: 'Encrypt (AWS KMS API)',
    url: 'https://docs.aws.amazon.com/kms/latest/APIReference/API_Encrypt.html',
  },
  kmsEncryptionContext: {
    title: 'Encryption context',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/encrypt_context.html',
  },
  kmsQuotas: {
    title: 'AWS KMS request quotas',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/requests-per-second.html',
  },
  lambdaEnvEncryption: {
    title: 'Securing Lambda environment variables',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars-encryption.html',
  },
  secretsLambdaExtension: {
    title: 'Use AWS Secrets Manager secrets in AWS Lambda functions',
    url: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_lambda.html',
  },
  parameterSecureString: {
    title: 'SecureString parameters in Parameter Store',
    url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/secure-string-parameter-kms-encryption.html',
  },
  ec2KeyPairs: {
    title: 'Amazon EC2 key pairs and Amazon EC2 instances',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html',
  },
  acmImport: {
    title: 'Import certificates into AWS Certificate Manager',
    url: 'https://docs.aws.amazon.com/acm/latest/userguide/import-certificate.html',
  },
  logsMasking: {
    title: 'Help protect sensitive log data with masking',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/mask-sensitive-log-data.html',
  },
  s3SecureTransport: {
    title: 'Enforcing encryption in transit with aws:SecureTransport',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html',
  },
  comprehendPii: {
    title: 'Detecting PII entities with Amazon Comprehend',
    url: 'https://docs.aws.amazon.com/comprehend/latest/dg/how-pii.html',
  },
  acmExportable: {
    title: 'Exportable public certificates in AWS Certificate Manager',
    url: 'https://docs.aws.amazon.com/acm/latest/userguide/acm-exportable-certificates.html',
  },
  // Encryption extras
  kmsDeleting: {
    title: 'Delete an AWS KMS key',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/deleting-keys.html',
  },
  ebsEncryptionByDefault: {
    title: 'Enable Amazon EBS encryption by default',
    url: 'https://docs.aws.amazon.com/ebs/latest/userguide/encryption-by-default.html',
  },
  // AI security (2.3)
  bedrockGuardrails: {
    title: 'Detect and filter harmful content by using Amazon Bedrock Guardrails',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html',
  },
  bedrockModelAccess: {
    title: 'Request access to models',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html',
  },
  bedrockDataProtection: {
    title: 'Data protection (Amazon Bedrock)',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html',
  },
  bedrockPrivateLink: {
    title: 'Protect your data using Amazon VPC and AWS PrivateLink',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/usingVPC.html',
  },
  bedrockInvocationLogging: {
    title: 'Monitor model invocation using CloudWatch Logs and Amazon S3',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html',
  },
  bedrockGuardrailTags: {
    title: 'Apply tags to user input to filter content',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-tagging.html',
  },
  bedrockGuardrailSensitive: {
    title: 'Remove PII from conversations by using sensitive information filters',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-sensitive-filters.html',
  },
  bedrockGuardrailContent: {
    title: 'Block harmful words and conversations with content filters',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-content-filters.html',
  },
  bedrockGuardrailTopics: {
    title: 'Block denied topics to help remove harmful content',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-denied-topics.html',
  },
  bedrockIamExamples: {
    title: 'Identity-based policy examples for Amazon Bedrock',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/security_iam_id-based-policy-examples.html',
  },
  agentCoreIdentity: {
    title:
      'Provide identity and credential management for agent applications with AgentCore Identity',
    url: 'https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html',
  },
  agentCorePolicy: {
    title: 'Policy in Amazon Bedrock AgentCore',
    url: 'https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy.html',
  },
  agentCoreRuntime: {
    title: 'Host agent or tools with Amazon Bedrock AgentCore Runtime',
    url: 'https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html',
  },
  bedrockAgentsConfirm: {
    title: 'Get user confirmation before invoking action group function',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/agents-userconfirmation.html',
  },
  // AI security extras
  bedrockSecurity: {
    title: 'Amazon Bedrock security and privacy',
    url: 'https://aws.amazon.com/bedrock/security-compliance/',
  },
  bedrockFaqs: {
    title: 'Amazon Bedrock FAQs',
    url: 'https://aws.amazon.com/bedrock/faqs/',
  },
  bedrockVpcEndpoints: {
    title: 'Use interface VPC endpoints (AWS PrivateLink) with Amazon Bedrock',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/vpc-interface-endpoints.html',
  },
  logsEncryption: {
    title: 'Encrypt log data in CloudWatch Logs using AWS KMS',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/encrypt-log-data-kms.html',
  },
  // Security, mixed (D2)
  iamConfusedDeputy: {
    title: 'The confused deputy problem',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html',
  },
  accessAnalyzer: {
    title: 'Using AWS Identity and Access Management Access Analyzer',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html',
  },
  iamCredentialReport: {
    title: 'Generate credential reports for your AWS account',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_getting-report.html',
  },
  waf: {
    title: 'AWS WAF',
    url: 'https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html',
  },
  apiGatewayPrivate: {
    title: 'Private REST APIs in API Gateway',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-private-apis.html',
  },
  secretsVersions: {
    title: 'Secrets Manager secret versions and staging labels',
    url: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/whats-in-a-secret.html',
  },
  secretsCrossAccount: {
    title: 'Access AWS Secrets Manager secrets from a different account',
    url: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_examples_cross.html',
  },
  kmsGrants: {
    title: 'Grants in AWS KMS',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/grants.html',
  },
  kmsAliases: {
    title: 'Aliases in AWS KMS',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/kms-alias.html',
  },
  kmsDefaultPolicy: {
    title: 'Default key policy',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-default.html',
  },
  imdsv2: {
    title: 'Use the Instance Metadata Service to access instance metadata',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html',
  },
  apiGatewayResourcePolicy: {
    title: 'Control access to a REST API with API Gateway resource policies',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-resource-policies.html',
  },
  apiGatewayApiKeys: {
    title: 'Usage plans and API keys for REST APIs in API Gateway',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html',
  },
  s3Cors: {
    title: 'Using cross-origin resource sharing (CORS) with Amazon S3',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html',
  },
  s3ObjectOwnership: {
    title: 'Controlling ownership of objects and disabling ACLs for your bucket',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html',
  },
  parameterHierarchies: {
    title: 'Working with parameter hierarchies in Parameter Store',
    url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-paramstore-hierarchies.html',
  },
  cognitoMfa: {
    title: 'Adding MFA to a user pool',
    url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa.html',
  },
  cognitoGroups: {
    title: 'Adding groups to a user pool',
    url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html',
  },
  stsRoleSession: {
    title: 'Assume a role (session duration)',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use.html',
  },
  // Deployment (D3)
  ecr: {
    title: 'What is Amazon Elastic Container Registry?',
    url: 'https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html',
  },
  ecs: {
    title: 'What is Amazon Elastic Container Service?',
    url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html',
  },
  elasticBeanstalk: {
    title: 'What is AWS Elastic Beanstalk?',
    url: 'https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html',
  },
  ebDeployments: {
    title: 'Deployment policies and settings',
    url: 'https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.rolling-version-deploy.html',
  },
  ecsCircuitBreaker: {
    title: 'How the Amazon ECS deployment circuit breaker detects failures',
    url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-circuit-breaker.html',
  },
  xray: {
    title: 'What is AWS X-Ray?',
    url: 'https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html',
  },
  cloudWatchAlarms: {
    title: 'Using Amazon CloudWatch alarms',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html',
  },
  ecrLifecycle: {
    title: 'Automate the cleanup of images by using lifecycle policies in Amazon ECR',
    url: 'https://docs.aws.amazon.com/AmazonECR/latest/userguide/LifecyclePolicies.html',
  },
  ecrScanning: {
    title: 'Scan images for software vulnerabilities in Amazon ECR',
    url: 'https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html',
  },
  ecrImmutable: {
    title: 'Preventing image tags from being overwritten in Amazon ECR',
    url: 'https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-tag-mutability.html',
  },
  lambdaContainerImages: {
    title: 'Create a Lambda function using a container image',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/images-create.html',
  },
  lambdaZip: {
    title: 'Deploying Lambda functions as .zip file archives',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-function-zip.html',
  },
  appConfig: {
    title: 'What is AWS AppConfig?',
    url: 'https://docs.aws.amazon.com/appconfig/latest/userguide/what-is-appconfig.html',
  },
  appConfigFlags: {
    title: 'Creating a feature flag configuration profile in AWS AppConfig',
    url: 'https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-creating-configuration-and-profile-feature-flags.html',
  },
  appConfigDeploy: {
    title: 'Deploying feature flags and configuration data in AWS AppConfig',
    url: 'https://docs.aws.amazon.com/appconfig/latest/userguide/deploying-feature-flags.html',
  },
  appConfigStrategies: {
    title: 'Working with deployment strategies in AWS AppConfig',
    url: 'https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-creating-deployment-strategy.html',
  },
  appConfigExtension: {
    title: 'Using AWS AppConfig Agent with AWS Lambda',
    url: 'https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-integration-lambda-extensions.html',
  },
  apiGatewayStages: {
    title: 'Set up a stage for a REST API in API Gateway',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-stages.html',
  },
  apiGatewayStageVariables: {
    title: 'Use stage variables for a REST API in API Gateway',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/stage-variables.html',
  },
  apiGatewayCanary: {
    title: 'Set up an API Gateway canary release deployment',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html',
  },
  sam: {
    title: 'What is the AWS Serverless Application Model (AWS SAM)?',
    url: 'https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html',
  },
  samLocalInvoke: {
    title: 'Introduction to testing with sam local invoke',
    url: 'https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-invoke.html',
  },
  samLocalApi: {
    title: 'Introduction to testing with sam local start-api',
    url: 'https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-start-api.html',
  },
  samSync: {
    title: 'Introduction to using sam sync to sync to AWS Cloud',
    url: 'https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-sync.html',
  },
  samGradual: {
    title: 'Deploying serverless applications gradually with AWS SAM',
    url: 'https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html',
  },
  samBuild: {
    title: 'Introduction to building with AWS SAM',
    url: 'https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-build.html',
  },
  samRemoteInvoke: {
    title: 'Introduction to testing in the cloud with sam remote invoke',
    url: 'https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-remote-invoke.html',
  },
  cdk: {
    title: 'What is the AWS CDK?',
    url: 'https://docs.aws.amazon.com/cdk/v2/guide/home.html',
  },
  cdkTesting: {
    title: 'Test AWS CDK applications',
    url: 'https://docs.aws.amazon.com/cdk/v2/guide/testing.html',
  },
  cdkBootstrap: {
    title: 'AWS CDK bootstrapping',
    url: 'https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html',
  },
  cloudFormation: {
    title: 'What is AWS CloudFormation?',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html',
  },
  cfnChangeSets: {
    title: 'Update CloudFormation stacks using change sets',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html',
  },
  cfnRollback: {
    title: 'Choose how to handle failures when provisioning resources',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stack-failure-options.html',
  },
  cfnParameters: {
    title: 'CloudFormation template Parameters syntax',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html',
  },
  cfnDynamicRefs: {
    title: 'Get values stored in other services using dynamic references',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/dynamic-references.html',
  },
  cfnOutputs: {
    title: 'CloudFormation template Outputs syntax',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html',
  },
  cfnDrift: {
    title: 'Detect unmanaged configuration changes with drift detection',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-stack-drift.html',
  },
  codeBuild: {
    title: 'What is AWS CodeBuild?',
    url: 'https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html',
  },
  buildspec: {
    title: 'Build specification reference for CodeBuild',
    url: 'https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html',
  },
  codeBuildCache: {
    title: 'Cache builds to improve performance',
    url: 'https://docs.aws.amazon.com/codebuild/latest/userguide/build-caching.html',
  },
  codeBuildReports: {
    title: 'Test reports in CodeBuild',
    url: 'https://docs.aws.amazon.com/codebuild/latest/userguide/test-reporting.html',
  },
  codeDeploy: {
    title: 'What is CodeDeploy?',
    url: 'https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html',
  },
  codeDeployConfigs: {
    title: 'Working with deployment configurations in CodeDeploy',
    url: 'https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html',
  },
  appspec: {
    title: 'CodeDeploy AppSpec file reference',
    url: 'https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file.html',
  },
  appspecHooks: {
    title: 'AppSpec hooks section',
    url: 'https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html',
  },
  codeDeployRollback: {
    title: 'Redeploy and roll back a deployment with CodeDeploy',
    url: 'https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments-rollback-and-redeploy.html',
  },
  codeDeployAgent: {
    title: 'Working with the CodeDeploy agent',
    url: 'https://docs.aws.amazon.com/codedeploy/latest/userguide/codedeploy-agent.html',
  },
  codePipeline: {
    title: 'What is AWS CodePipeline?',
    url: 'https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html',
  },
  codePipelineApproval: {
    title: 'Add a manual approval action to a stage',
    url: 'https://docs.aws.amazon.com/codepipeline/latest/userguide/approvals-action-add.html',
  },
  codePipelineTriggers: {
    title: 'Filter triggers on code push or pull requests',
    url: 'https://docs.aws.amazon.com/codepipeline/latest/userguide/pipelines-filter.html',
  },
  codePipelineCrossAccount: {
    title: 'Create a pipeline that uses resources from another AWS account',
    url: 'https://docs.aws.amazon.com/codepipeline/latest/userguide/pipelines-create-cross-account.html',
  },
  codePipelineRollback: {
    title: 'Configure stage rollback',
    url: 'https://docs.aws.amazon.com/codepipeline/latest/userguide/stage-rollback.html',
  },
  codeArtifact: {
    title: 'What is AWS CodeArtifact?',
    url: 'https://docs.aws.amazon.com/codeartifact/latest/ug/welcome.html',
  },
  codeConnections: {
    title: 'What are connections?',
    url: 'https://docs.aws.amazon.com/dtconsole/latest/userguide/welcome-connections.html',
  },
  ecsBlueGreen: {
    title: 'Amazon ECS blue/green deployments',
    url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-blue-green.html',
  },
  ecsRolling: {
    title: 'Amazon ECS rolling update deployments',
    url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-ecs.html',
  },
  amplifyHosting: {
    title: 'Welcome to AWS Amplify Hosting',
    url: 'https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html',
  },
  amplifyPreviews: {
    title: 'Web previews for pull requests',
    url: 'https://docs.aws.amazon.com/amplify/latest/userguide/pr-previews.html',
  },
  lambdaTesting: {
    title: 'Testing serverless functions and applications',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/testing-guide.html',
  },
  lambdaConsoleTest: {
    title: 'Testing Lambda functions in the console',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/testing-functions.html',
  },
  lambdaAliasRouting: {
    title: 'Implement Lambda canary deployments using a weighted alias',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuring-alias-routing.html',
  },
  ebEnvSwap: {
    title: 'Blue/Green deployments with Elastic Beanstalk',
    url: 'https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.CNAMESwap.html',
  },
  ebExtensions: {
    title: 'Advanced environment customization with configuration files',
    url: 'https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/ebextensions.html',
  },
  dynamodbLocal: {
    title: 'Setting up DynamoDB local (downloadable version)',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html',
  },
  // Testing (D3)
  stepFunctionsTestState: {
    title: 'Testing state machines with TestState API',
    url: 'https://docs.aws.amazon.com/step-functions/latest/dg/test-state-isolation.html',
  },
  // Troubleshooting and optimization (D4)
  logsInsights: {
    title: 'Analyzing log data with CloudWatch Logs Insights',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html',
  },
  logsInsightsSyntax: {
    title: 'CloudWatch Logs Insights query syntax',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html',
  },
  logsSubscription: {
    title: 'Real-time processing of log data with subscriptions',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Subscriptions.html',
  },
  logsMetricFilters: {
    title: 'Creating metrics from log events using filters',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringLogData.html',
  },
  logsLiveTail: {
    title: 'Use Live Tail to view logs in near real time',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogs_LiveTail.html',
  },
  emf: {
    title: 'Embedding metrics within logs (embedded metric format)',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format.html',
  },
  cwMetrics: {
    title: 'Metrics concepts in Amazon CloudWatch',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html',
  },
  cwHighResolution: {
    title: 'Publish custom metrics (high-resolution metrics)',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html',
  },
  cwAlarms: {
    title: 'Using Amazon CloudWatch alarms',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html',
  },
  cwCompositeAlarms: {
    title: 'Create a composite alarm',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Create_Composite_Alarm.html',
  },
  cwAnomalyDetection: {
    title: 'Using CloudWatch anomaly detection',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Anomaly_Detection.html',
  },
  cwDashboards: {
    title: 'Using Amazon CloudWatch dashboards',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html',
  },
  cwSynthetics: {
    title: 'Synthetic monitoring (canaries)',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html',
  },
  cwAppSignals: {
    title: 'Application Signals',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Application-Monitoring-Sections.html',
  },
  cwContributorInsights: {
    title: 'Use Contributor Insights to analyze high-cardinality data',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContributorInsights.html',
  },
  cwAgent: {
    title: 'Collect metrics, logs, and traces using the CloudWatch agent',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html',
  },
  lambdaInsights: {
    title: 'Lambda Insights',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights.html',
  },
  containerInsights: {
    title: 'Container Insights',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContainerInsights.html',
  },
  xrayConcepts: {
    title: 'AWS X-Ray concepts',
    url: 'https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html',
  },
  xraySampling: {
    title: 'Configuring sampling rules',
    url: 'https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html',
  },
  xrayAnnotations: {
    title: 'Add annotations and metadata to segments',
    url: 'https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-segment.html',
  },
  xrayServiceMap: {
    title: 'Use the X-Ray trace map',
    url: 'https://docs.aws.amazon.com/xray/latest/devguide/xray-console-servicemap.html',
  },
  xrayOtel: {
    title: 'Migrating from X-Ray instrumentation to OpenTelemetry instrumentation',
    url: 'https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html',
  },
  lambdaXray: {
    title: 'Visualize Lambda function invocations using AWS X-Ray',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html',
  },
  lambdaLogging: {
    title: 'Monitoring Lambda logs in CloudWatch',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/monitoring-cloudwatchlogs.html',
  },
  lambdaLogFormat: {
    title: 'Configuring advanced logging controls for Lambda functions',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/monitoring-cloudwatchlogs-advanced.html',
  },
  lambdaMetrics: {
    title: 'Using CloudWatch metrics with Lambda',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/monitoring-metrics.html',
  },
  lambdaMetricTypes: {
    title: 'Types of metrics for Lambda functions',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/monitoring-metrics-types.html',
  },
  lambdaTroubleshootInvoke: {
    title: 'Troubleshoot invocation issues in Lambda',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/troubleshooting-invocation.html',
  },
  lambdaTroubleshootExec: {
    title: 'Troubleshoot execution issues in Lambda',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/troubleshooting-execution.html',
  },
  lambdaPowertools: {
    title: 'Powertools for AWS Lambda',
    url: 'https://docs.aws.amazon.com/powertools/',
  },
  lambdaPowerTuning: {
    title: 'Profiling functions with AWS Lambda Power Tuning',
    url: 'https://docs.aws.amazon.com/lambda/latest/operatorguide/profile-functions.html',
  },
  apiGatewayMetrics: {
    title: 'Amazon API Gateway dimensions and metrics',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html',
  },
  apiGatewayLogging: {
    title: 'Set up CloudWatch logging for REST APIs in API Gateway',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html',
  },
  apiGatewayXray: {
    title: 'Trace user requests to REST APIs using X-Ray in API Gateway',
    url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-xray.html',
  },
  dynamodbMetrics: {
    title: 'DynamoDB metrics and dimensions',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/metrics-dimensions.html',
  },
  dynamodbThrottling: {
    title: 'Troubleshooting throttling in Amazon DynamoDB',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TroubleshootingThrottling.html',
  },
  sqsMetrics: {
    title: 'Available CloudWatch metrics for Amazon SQS',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-available-cloudwatch-metrics.html',
  },
  cloudTrail: {
    title: 'What is AWS CloudTrail?',
    url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html',
  },
  cloudTrailLake: {
    title: 'Working with AWS CloudTrail Lake',
    url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-lake.html',
  },
  codeDeployLogs: {
    title: 'View log data for CodeDeploy EC2/On-Premises deployments',
    url: 'https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments-view-logs.html',
  },
  codeBuildLogs: {
    title: 'View build details in CodeBuild',
    url: 'https://docs.aws.amazon.com/codebuild/latest/userguide/view-build-details.html',
  },
  cfnTroubleshoot: {
    title: 'Troubleshooting CloudFormation',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/troubleshooting.html',
  },
  cwInvestigations: {
    title: 'CloudWatch investigations',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Investigations.html',
  },
  computeOptimizer: {
    title: 'What is AWS Compute Optimizer?',
    url: 'https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html',
  },
  cloudFrontCaching: {
    title: 'Optimize caching and availability with CloudFront',
    url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/ConfiguringCaching.html',
  },
  cloudFrontCachePolicy: {
    title: 'Control the cache key with a policy',
    url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html',
  },
  s3TransferAcceleration: {
    title: 'Configuring fast, secure file transfers using Amazon S3 Transfer Acceleration',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/transfer-acceleration.html',
  },
  s3Multipart: {
    title: 'Uploading and copying objects using multipart upload',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html',
  },
  s3Performance: {
    title: 'Best practices design patterns: optimizing Amazon S3 performance',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html',
  },
  lambdaReservedConcurrency: {
    title: 'Configuring reserved concurrency for a function',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html',
  },
  lambdaBatching: {
    title: 'Batching behavior for event source mappings',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventsourcemapping.html',
  },
  snsMessageFiltering: {
    title: 'Amazon SNS message filtering',
    url: 'https://docs.aws.amazon.com/sns/latest/dg/sns-message-filtering.html',
  },
  // Monitoring (D4)
  cwCrossAccount: {
    title: 'CloudWatch cross-account observability',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Unified-Cross-Account.html',
  },
  stepFunctionsMetrics: {
    title: 'Monitoring Step Functions metrics using Amazon CloudWatch',
    url: 'https://docs.aws.amazon.com/step-functions/latest/dg/procedure-cw-metrics.html',
  },
  // Optimization (D4)
  bedrockPromptCaching: {
    title: 'Prompt caching for faster model inference',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html',
  },
  // General
  sharedResponsibility: {
    title: 'Shared Responsibility Model',
    url: 'https://aws.amazon.com/compliance/shared-responsibility-model/',
  },
} as const satisfies Record<string, SourceReference>;

export type RefKey = keyof typeof REFS;
