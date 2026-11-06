import { defineQuestions } from '../author';

/** SAA-C03 Domain 1, task 1.2: design secure workloads and applications. */
export default defineQuestions(
  { domain: 'D1', written: '2026-11-05', status: 'checked', checked: '2026-11-05' },
  [
    {
      n: 41,
      t: '1.2',
      lv: 'm',
      q: 'A three-tier web application runs web servers behind an Application Load Balancer (ALB) and an Amazon RDS database. The database must not be reachable from the internet, and only the web servers should connect to it. Which design meets these requirements?',
      o: [
        [
          'Put the database in private subnets and allow inbound database traffic only from the web servers’ security group.',
          'Correct. Private subnets have no route to an internet gateway, and referencing the web tier’s security group limits access to those instances.',
        ],
        [
          'Put the database in a public subnet and allow inbound traffic from 0.0.0.0/0 on the database port.',
          'This exposes the database to the internet.',
        ],
        [
          'Put the database in private subnets and allow inbound traffic from the VPC’s whole CIDR range.',
          'This allows every resource in the VPC to connect, not only the web servers.',
        ],
        [
          'Put the database in the same public subnet as the ALB and rely on the database password.',
          'A password alone is not network isolation, and a public subnet allows internet routing.',
        ],
      ],
      a: 'a',
      x: 'Placing the database in private subnets and using a security group rule that references the web tier’s security group gives network isolation and least-privilege access between tiers.',
      r: ['vpcSubnets', 'vpcSecurityGroups'],
      tags: ['VPC', 'Security groups', 'Multi-tier'],
    },
    {
      n: 42,
      t: '1.2',
      lv: 'm',
      q: 'Which statement correctly compares security groups and network ACLs in Amazon VPC?',
      o: [
        [
          'Security groups are stateful and apply to resources such as instances; network ACLs are stateless and apply to subnets.',
          'Correct. Return traffic is allowed automatically by security groups, while network ACL rules must allow both directions.',
        ],
        [
          'Security groups are stateless and support deny rules; network ACLs are stateful and support only allow rules.',
          'This reverses the two. Security groups support only allow rules; network ACLs support allow and deny rules.',
        ],
        [
          'Both are stateful and both are evaluated in rule number order.',
          'Only network ACL rules are evaluated in number order; security groups evaluate all rules together.',
        ],
        [
          'Network ACLs apply to individual instances and override security groups.',
          'Network ACLs apply at the subnet level, and traffic must be allowed by both controls.',
        ],
      ],
      a: 'a',
      x: 'Security groups act as stateful firewalls for resources, with allow rules only. Network ACLs are stateless subnet-level filters with numbered allow and deny rules evaluated in order.',
      r: ['vpcInfraSecurity', 'vpcNacls'],
      tags: ['Security groups', 'Network ACLs'],
    },
    {
      n: 43,
      t: '1.2',
      lv: 'm',
      q: 'A company detects malicious traffic from a single IP address that targets many instances in one subnet. The team wants to block this address quickly at the subnet level. What should they use?',
      o: [
        [
          'A network ACL deny rule for the IP address, numbered before the rules that allow traffic',
          'Correct. Network ACLs support deny rules and evaluate rules in number order, so a low-numbered deny blocks the address for the whole subnet.',
        ],
        [
          'A security group deny rule for the IP address',
          'Security groups support only allow rules, so they can’t deny a specific address.',
        ],
        [
          'An IAM policy that denies the IP address',
          'IAM policies control access to AWS APIs, not network traffic to instances.',
        ],
        [
          'A route table entry that sends the IP address to a NAT gateway',
          'Route tables send outbound traffic to targets; they don’t block inbound traffic from an address.',
        ],
      ],
      a: 'a',
      x: 'Network ACLs can explicitly deny traffic from specific CIDR ranges. Because rules are processed in order, the deny must have a lower number than any rule that would allow the traffic.',
      r: ['vpcNacls'],
      tags: ['Network ACLs'],
    },
    {
      n: 44,
      t: '1.2',
      lv: 'm',
      q: 'Amazon EC2 instances in private subnets must download operating system updates from the internet, but must never accept connections that start from the internet. What should a solutions architect add?',
      o: [
        [
          'A NAT gateway in a public subnet, with the private subnets’ route tables sending internet-bound traffic to it',
          'Correct. A NAT gateway lets instances in private subnets start outbound connections while blocking unsolicited inbound connections.',
        ],
        [
          'An internet gateway route in the private subnets’ route tables and public IP addresses on the instances',
          'This makes the subnets public and the instances reachable from the internet.',
        ],
        [
          'A gateway VPC endpoint for the internet',
          'Gateway endpoints exist only for Amazon S3 and DynamoDB, not for general internet access.',
        ],
        [
          'A virtual private gateway',
          'A virtual private gateway connects a VPC to an on-premises network through VPN, not to the internet.',
        ],
      ],
      a: 'a',
      x: 'Public NAT gateways sit in public subnets and translate private addresses for outbound internet traffic. Instances behind them can’t receive connections initiated from the internet.',
      r: ['natGateway'],
      tags: ['NAT gateway', 'Private subnets'],
    },
    {
      n: 45,
      t: '1.2',
      lv: 'm',
      q: 'An application on EC2 instances in a private subnet reads large files from Amazon S3 in the same Region. The security team wants this traffic to stay off the internet and also wants to avoid NAT gateway data processing charges. What should a solutions architect do?',
      o: [
        [
          'Create an S3 gateway endpoint and add it to the private subnets’ route tables.',
          'Correct. Gateway endpoints route S3 traffic privately within the AWS network and have no additional charge.',
        ],
        [
          'Route S3 traffic through the NAT gateway.',
          'This works but sends traffic through the NAT gateway, which has processing charges.',
        ],
        [
          'Give the instances public IP addresses.',
          'This would route the traffic over the internet gateway and expose the instances.',
        ],
        [
          'Use AWS Direct Connect to reach S3.',
          'Direct Connect links on-premises networks to AWS; it isn’t needed for traffic from a VPC to S3 in the same Region.',
        ],
      ],
      a: 'a',
      x: 'S3 and DynamoDB support gateway VPC endpoints. They add a route target to the route table, keep traffic on the AWS network, and are available at no additional cost.',
      r: ['gatewayEndpoints'],
      tags: ['VPC endpoints', 'Amazon S3'],
    },
    {
      n: 46,
      t: '1.2',
      lv: 'h',
      q: 'Instances in a VPC use an S3 gateway endpoint. The security team must make sure that the instances can use the endpoint to reach only the company’s own buckets, not any other bucket in S3. What should be configured?',
      o: [
        [
          'A VPC endpoint policy that allows S3 actions only on the company’s bucket ARNs',
          'Correct. An endpoint policy limits which resources can be reached through the endpoint, which helps prevent data exfiltration to other buckets.',
        ],
        [
          'A security group on the gateway endpoint',
          'Gateway endpoints do not use security groups.',
        ],
        [
          'A network ACL rule with the S3 prefix list',
          'A network ACL rule for the S3 prefix list allows or denies all of S3, not specific buckets.',
        ],
        [
          'S3 Block Public Access',
          'Block Public Access prevents public access to buckets; it doesn’t stop instances from reaching other buckets.',
        ],
      ],
      a: 'a',
      x: 'Endpoint policies are resource-based policies on the VPC endpoint. They control which principals, actions and resources can be used through the endpoint, so they can limit access to specific buckets.',
      r: ['endpointPolicies', 'gatewayEndpoints'],
      tags: ['VPC endpoints', 'Endpoint policy'],
    },
    {
      n: 47,
      t: '1.2',
      lv: 'm',
      q: 'An S3 bucket must accept requests only when they come through the company’s VPC endpoint. Which bucket policy condition key should be used?',
      o: [
        [
          'aws:SourceVpce',
          'Correct. This key contains the ID of the VPC endpoint the request came through, so a Deny when it doesn’t match blocks other paths.',
        ],
        [
          'aws:SourceIp',
          'Requests through a VPC endpoint use private addresses, so aws:SourceIp is not suitable for identifying them.',
        ],
        [
          'aws:RequestedRegion',
          'This key identifies the Region of the request, not the network path.',
        ],
        ['aws:MultiFactorAuthPresent', 'This key checks MFA, not the network path.'],
      ],
      a: 'a',
      x: 'Bucket policies can use the aws:SourceVpce condition key to allow or deny requests based on the VPC endpoint they arrive through.',
      r: ['iamConditionKeys', 's3BucketPolicies'],
      tags: ['Bucket policy', 'VPC endpoints'],
    },
    {
      n: 48,
      t: '1.2',
      lv: 'm',
      q: 'A company exposes an internal service to customers who run workloads in their own VPCs. Traffic must stay on the AWS network, and customers must not need VPC peering or overlapping-CIDR workarounds. Which solution should a solutions architect use?',
      o: [
        [
          'Put the service behind a Network Load Balancer and publish it as a VPC endpoint service with AWS PrivateLink.',
          'Correct. Consumers create interface endpoints to the service. Traffic stays private, and the VPCs don’t need to be peered or have non-overlapping CIDRs.',
        ],
        [
          'Peer each customer VPC with the service VPC.',
          'Peering exposes whole networks to each other and requires non-overlapping CIDR blocks.',
        ],
        [
          'Expose the service on public IP addresses and ask customers to use a NAT gateway.',
          'This sends the traffic over the internet.',
        ],
        [
          'Share the service VPC’s subnets with every customer by using AWS RAM.',
          'Subnet sharing is for accounts in the same organization and gives much broader network access than needed.',
        ],
      ],
      a: 'a',
      x: 'AWS PrivateLink lets a provider offer a service behind a Network Load Balancer as an endpoint service. Consumers connect through interface endpoints in their own VPCs, privately and without peering.',
      r: ['privateLink'],
      tags: ['AWS PrivateLink', 'Interface endpoints'],
    },
    {
      n: 49,
      t: '1.2',
      lv: 'm',
      q: 'A public web application behind an Application Load Balancer is being targeted by SQL injection and cross-site scripting attempts. Which service should a solutions architect use to block these requests?',
      o: [
        [
          'AWS WAF with managed rule groups, associated with the Application Load Balancer',
          'Correct. AWS WAF inspects HTTP(S) requests and can block common attacks such as SQL injection and XSS.',
        ],
        [
          'Network ACLs on the load balancer subnets',
          'Network ACLs filter by IP, port and protocol. They can’t inspect request content.',
        ],
        [
          'Amazon GuardDuty',
          'GuardDuty detects threats and reports findings. It does not block web requests.',
        ],
        [
          'AWS Shield Standard',
          'Shield Standard protects against common network and transport layer DDoS attacks, not SQL injection.',
        ],
      ],
      a: 'a',
      x: 'AWS WAF is a web application firewall for resources such as Application Load Balancers, CloudFront, API Gateway and AppSync. Managed rule groups provide protection against common exploits like SQL injection and XSS.',
      r: ['waf', 'wafManagedRules'],
      tags: ['AWS WAF', 'SQL injection'],
    },
    {
      n: 50,
      t: '1.2',
      lv: 'm',
      q: 'A login page receives bursts of thousands of requests per minute from a few IP addresses trying to guess passwords. The company wants to automatically block any IP address that sends too many requests in a short time. What should a solutions architect configure?',
      o: [
        [
          'An AWS WAF rate-based rule on the resource that serves the login page',
          'Correct. Rate-based rules count requests per IP address (or other key) and block those that exceed the limit.',
        ],
        [
          'A security group that allows only 100 connections',
          'Security groups don’t limit request rates.',
        ],
        [
          'AWS Shield Advanced without any AWS WAF rules',
          'Shield Advanced adds DDoS protection and response, but per-IP request rate limits are a WAF rule.',
        ],
        [
          'An Amazon CloudWatch alarm on CPU usage',
          'An alarm can notify the team but doesn’t block the requests.',
        ],
      ],
      a: 'a',
      x: 'AWS WAF rate-based rule statements track request rates by aggregation key, such as IP address, and act on keys that exceed the configured limit.',
      r: ['wafRateBased'],
      tags: ['AWS WAF', 'Rate limiting'],
    },
    {
      n: 51,
      t: '1.2',
      lv: 'm',
      q: 'A company runs a business-critical public application on CloudFront and Route 53. It wants protection against large DDoS attacks, access to the AWS Shield Response Team during attacks, and cost protection for scaling caused by attacks. Which service should it subscribe to?',
      o: [
        [
          'AWS Shield Advanced',
          'Correct. Shield Advanced adds enhanced detection and mitigation, access to the Shield Response Team, and DDoS cost protection.',
        ],
        [
          'AWS Shield Standard',
          'Shield Standard is automatic and free, but it doesn’t include the response team or cost protection.',
        ],
        ['Amazon Inspector', 'Inspector scans for software vulnerabilities.'],
        [
          'AWS Firewall Manager only',
          'Firewall Manager centrally manages protections such as WAF rules and Shield Advanced, but isn’t itself the DDoS protection service.',
        ],
      ],
      a: 'a',
      x: 'All AWS customers get Shield Standard automatically. Shield Advanced is a paid subscription with additional protections, the Shield Response Team (with a suitable Support plan) and cost protection for attack-related scaling.',
      r: ['shieldFeatures', 'shield'],
      tags: ['AWS Shield', 'DDoS'],
    },
    {
      n: 52,
      t: '1.2',
      lv: 'm',
      q: 'An application connects to an Amazon RDS database with a password that is currently stored in a configuration file. The company wants the password stored encrypted and rotated automatically every 30 days without code changes on each rotation. Which service should be used?',
      o: [
        [
          'AWS Secrets Manager, with automatic rotation configured for the secret',
          'Correct. Secrets Manager stores secrets encrypted and can rotate database credentials on a schedule; the application retrieves the current value at runtime.',
        ],
        [
          'An encrypted environment variable on the instances',
          'An environment variable doesn’t rotate automatically.',
        ],
        [
          'An S3 object with server-side encryption',
          'S3 can store an encrypted file but has no secret rotation.',
        ],
        [
          'An AWS KMS key that holds the password',
          'KMS manages encryption keys, not application secrets such as passwords.',
        ],
      ],
      a: 'a',
      x: 'AWS Secrets Manager stores, retrieves and rotates secrets such as database credentials. Applications call Secrets Manager at runtime instead of storing passwords in code or files.',
      r: ['secretsManager', 'secretsRotation'],
      tags: ['AWS Secrets Manager', 'Credential rotation'],
    },
    {
      n: 53,
      t: '1.2',
      lv: 'e',
      q: 'An application needs to read many configuration values, such as feature flags and URLs, and a few of them are sensitive. The team wants a simple, low-cost store with versioning, and does not need automatic rotation. Which service fits best?',
      o: [
        [
          'AWS Systems Manager Parameter Store, using SecureString parameters for the sensitive values',
          'Correct. Parameter Store holds configuration data and secrets, with SecureString parameters encrypted by AWS KMS.',
        ],
        [
          'Amazon DynamoDB with a public table',
          'A public table would expose the values, and DynamoDB isn’t a configuration store with SecureString support.',
        ],
        [
          'Amazon CloudWatch Logs',
          'CloudWatch Logs stores log data, not application configuration.',
        ],
        ['AWS Certificate Manager', 'ACM manages TLS certificates, not configuration values.'],
      ],
      a: 'a',
      x: 'Parameter Store provides hierarchical storage for configuration data and secrets. SecureString parameters are encrypted with AWS KMS. Secrets Manager is the choice when automatic rotation is needed.',
      r: ['parameterStore'],
      tags: ['Parameter Store'],
    },
    {
      n: 54,
      t: '1.2',
      lv: 'm',
      q: 'Administrators need shell access to EC2 instances in private subnets. The security team wants no inbound ports open, no bastion hosts, no SSH keys to manage, and a log of every session. Which solution meets these requirements?',
      o: [
        [
          'AWS Systems Manager Session Manager',
          'Correct. Session Manager opens sessions through the SSM Agent without inbound ports or SSH keys, and can log session activity.',
        ],
        [
          'A bastion host in a public subnet with port 22 open to the administrators’ IP addresses',
          'This adds a host to maintain, an open port and SSH keys.',
        ],
        [
          'Public IP addresses on the instances with port 22 open to 0.0.0.0/0',
          'This exposes SSH to the internet.',
        ],
        [
          'An AWS Site-to-Site VPN with SSH',
          'A VPN still requires SSH keys and doesn’t provide session logging by itself.',
        ],
      ],
      a: 'a',
      x: 'Session Manager provides secure, auditable instance management without opening inbound ports, maintaining bastion hosts or managing SSH keys. Access is controlled with IAM.',
      r: ['sessionManager'],
      tags: ['Session Manager', 'Bastion host'],
    },
    {
      n: 55,
      t: '1.2',
      lv: 'e',
      q: 'A company wants a managed service that continuously analyses AWS CloudTrail events, VPC Flow Logs and DNS logs to detect threats such as compromised instances or unusual API calls. Which service should it enable?',
      o: [
        [
          'Amazon GuardDuty',
          'Correct. GuardDuty is a threat detection service that analyses these data sources and produces security findings.',
        ],
        ['Amazon Macie', 'Macie discovers sensitive data in Amazon S3.'],
        ['AWS Config', 'Config tracks resource configurations and compliance with rules.'],
        [
          'AWS Trusted Advisor',
          'Trusted Advisor gives best-practice checks, not continuous threat detection from logs.',
        ],
      ],
      a: 'a',
      x: 'Amazon GuardDuty continuously monitors foundational data sources such as CloudTrail management events, VPC Flow Logs and DNS logs, and uses threat intelligence and machine learning to identify threats.',
      r: ['guardDuty'],
      tags: ['Amazon GuardDuty', 'Threat detection'],
    },
    {
      n: 56,
      t: '1.2',
      lv: 'e',
      q: 'A healthcare company must find out whether any of its Amazon S3 buckets contain personally identifiable information. Which service should it use?',
      o: [
        [
          'Amazon Macie',
          'Correct. Macie uses machine learning and pattern matching to discover sensitive data such as PII in S3.',
        ],
        ['Amazon Inspector', 'Inspector looks for software vulnerabilities in workloads.'],
        [
          'Amazon GuardDuty',
          'GuardDuty detects threats; it doesn’t classify the content of objects.',
        ],
        ['AWS Shield', 'Shield protects against DDoS attacks.'],
      ],
      a: 'a',
      x: 'Amazon Macie discovers and reports sensitive data in Amazon S3, and also evaluates bucket security and access controls.',
      r: ['macie'],
      tags: ['Amazon Macie', 'PII'],
    },
    {
      n: 57,
      t: '1.2',
      lv: 'e',
      q: 'A company wants automated scanning of its EC2 instances, container images in Amazon ECR and Lambda functions for known software vulnerabilities. Which service should it use?',
      o: [
        [
          'Amazon Inspector',
          'Correct. Inspector continuously scans these workloads for software vulnerabilities and unintended network exposure.',
        ],
        ['Amazon Macie', 'Macie finds sensitive data in S3.'],
        ['AWS WAF', 'WAF filters web requests; it doesn’t scan software.'],
        [
          'Amazon Detective',
          'Detective helps investigate findings; it doesn’t scan for vulnerabilities.',
        ],
      ],
      a: 'a',
      x: 'Amazon Inspector is a vulnerability management service that automatically discovers and scans EC2 instances, ECR container images and Lambda functions.',
      r: ['inspector'],
      tags: ['Amazon Inspector', 'Vulnerability management'],
    },
    {
      n: 58,
      t: '1.2',
      lv: 'm',
      q: 'A company needs an encrypted connection between its data center and a VPC within days, over the existing internet connection. Which option meets this requirement most quickly?',
      o: [
        [
          'AWS Site-to-Site VPN',
          'Correct. Site-to-Site VPN creates IPsec tunnels over the internet and can be set up quickly.',
        ],
        [
          'A new AWS Direct Connect dedicated connection',
          'A dedicated connection takes longer to provision, and the link from the data center isn’t encrypted unless MACsec or a VPN is added.',
        ],
        ['VPC peering', 'VPC peering connects two VPCs, not a data center to a VPC.'],
        [
          'An S3 gateway endpoint',
          'Gateway endpoints give private access to S3 from a VPC, not to a data center.',
        ],
      ],
      a: 'a',
      x: 'AWS Site-to-Site VPN connects on-premises networks to a VPC with encrypted IPsec tunnels over the internet, which makes it quick to set up compared with a physical Direct Connect link.',
      r: ['siteToSiteVpn'],
      tags: ['Site-to-Site VPN', 'Hybrid networking'],
    },
    {
      n: 59,
      t: '1.2',
      lv: 'h',
      q: 'A company uses an AWS Direct Connect connection for consistent network performance. A new compliance rule requires all traffic between the data center and the VPC to be encrypted in transit. Which TWO options can meet this requirement? (Select TWO.)',
      o: [
        [
          'Run an AWS Site-to-Site VPN over the Direct Connect connection.',
          'Correct. An IPsec VPN over Direct Connect combines the private link with encryption.',
        ],
        [
          'Use MAC Security (MACsec) on a supported Direct Connect connection.',
          'Correct. MACsec provides layer 2 encryption on supported dedicated connections.',
        ],
        [
          'Rely on Direct Connect alone, which encrypts traffic from the data center router by default.',
          'Without MACsec or a VPN, traffic on the link between the company’s router and the Direct Connect location is not encrypted.',
        ],
        [
          'Add a NAT gateway in the VPC.',
          'NAT gateways translate addresses; they don’t encrypt traffic.',
        ],
        ['Enable VPC Flow Logs.', 'Flow Logs record traffic metadata; they don’t encrypt it.'],
      ],
      a: ['a', 'b'],
      x: 'Direct Connect provides a private, dedicated path, but the link from the customer router isn’t encrypted unless you add encryption: an IPsec Site-to-Site VPN over the connection, or MACsec on supported dedicated connections.',
      r: ['directConnect', 'directConnectMacsec'],
      tags: ['AWS Direct Connect', 'Encryption in transit'],
    },
    {
      n: 60,
      t: '1.2',
      lv: 'm',
      q: 'A static website is stored in an S3 bucket and served through Amazon CloudFront. Users must not be able to bypass CloudFront by requesting objects directly from S3. What should a solutions architect configure?',
      o: [
        [
          'A CloudFront origin access control (OAC), and a bucket policy that allows reads only from that distribution, with public access blocked',
          'Correct. OAC lets CloudFront sign requests to S3, and the bucket policy allows only the distribution to read objects.',
        ],
        [
          'A public bucket policy and a long CloudFront cache time',
          'A public bucket can still be accessed directly.',
        ],
        [
          'S3 Transfer Acceleration',
          'Transfer Acceleration speeds up uploads and downloads; it doesn’t restrict access.',
        ],
        [
          'An S3 Lifecycle rule',
          'Lifecycle rules manage object storage classes and expiration, not access.',
        ],
      ],
      a: 'a',
      x: 'Origin access control restricts access to an S3 origin so that content can be reached only through CloudFront. The bucket stays private and its policy trusts the CloudFront distribution.',
      r: ['cloudFrontOac'],
      tags: ['Amazon CloudFront', 'Origin access control'],
    },
    {
      n: 61,
      t: '1.2',
      lv: 'm',
      q: 'A company wants users of its internal web application, which runs behind an Application Load Balancer, to sign in through the corporate OpenID Connect identity provider. The developers do not want to write authentication code. What should a solutions architect do?',
      o: [
        [
          'Configure an authenticate-oidc action on the ALB listener rule before forwarding to the targets.',
          'Correct. ALB can authenticate users with an OIDC-compliant identity provider or Amazon Cognito before routing requests.',
        ],
        [
          'Use security group rules to allow only employees.',
          'Security groups filter IP traffic; they don’t authenticate users.',
        ],
        [
          'Use AWS WAF to check user passwords.',
          'WAF inspects requests for attacks; it doesn’t perform OIDC sign-in.',
        ],
        [
          'Create IAM users for all employees and require MFA.',
          'IAM users give access to AWS, not to a web application behind an ALB.',
        ],
      ],
      a: 'a',
      x: 'Application Load Balancers can authenticate users through an OIDC identity provider or Amazon Cognito user pools, so applications receive already-authenticated requests.',
      r: ['albAuthenticate'],
      tags: ['Application Load Balancer', 'OIDC'],
    },
    {
      n: 62,
      t: '1.2',
      lv: 'e',
      q: 'A startup is building a consumer web application. It needs user sign-up, sign-in, password reset, MFA and social sign-in without building an identity system. Which service should it use?',
      o: [
        [
          'Amazon Cognito user pools',
          'Correct. A user pool is a user directory with sign-up, sign-in, MFA and federation with social identity providers.',
        ],
        ['IAM users', 'IAM users are for access to AWS, not for an application’s customers.'],
        [
          'AWS Directory Service for Microsoft Active Directory',
          'Managed AD is a corporate directory, not a customer identity service.',
        ],
        [
          'AWS IAM Identity Center',
          'Identity Center is for workforce access to AWS accounts and applications.',
        ],
      ],
      a: 'a',
      x: 'Amazon Cognito user pools provide a managed user directory and authentication for web and mobile apps, including MFA and sign-in through social and enterprise identity providers.',
      r: ['cognitoUserPools'],
      tags: ['Amazon Cognito', 'Customer identity'],
    },
    {
      n: 63,
      t: '1.2',
      lv: 'm',
      q: 'A company has dozens of AWS accounts. The security team must make sure that a standard set of AWS WAF rules is applied to every Application Load Balancer and CloudFront distribution, including new ones. Which service should it use?',
      o: [
        [
          'AWS Firewall Manager',
          'Correct. Firewall Manager centrally configures and enforces WAF rules and other protections across accounts and new resources in an organization.',
        ],
        [
          'AWS Config only',
          'Config can detect missing WAF associations but doesn’t apply the rules.',
        ],
        ['Amazon GuardDuty', 'GuardDuty detects threats; it doesn’t manage WAF rules.'],
        [
          'AWS Shield Standard',
          'Shield Standard is automatic DDoS protection and doesn’t manage WAF rules.',
        ],
      ],
      a: 'a',
      x: 'AWS Firewall Manager simplifies administration of AWS WAF, Shield Advanced, security groups and Network Firewall across accounts in AWS Organizations, and applies policies to new resources automatically.',
      r: ['firewallManager'],
      tags: ['AWS Firewall Manager', 'Multi-account'],
    },
    {
      n: 64,
      t: '1.2',
      lv: 'h',
      q: 'A company must inspect and filter all traffic that leaves its VPCs, including blocking traffic to specific domain names and using intrusion prevention rules. Which service is designed for this?',
      o: [
        [
          'AWS Network Firewall',
          'Correct. Network Firewall is a managed, stateful network firewall and intrusion prevention service for VPCs, with domain list filtering.',
        ],
        [
          'Security groups',
          'Security groups filter by IP, port and protocol and can’t filter by domain name or inspect payloads.',
        ],
        [
          'AWS WAF',
          'WAF protects HTTP(S) applications on supported resources; it doesn’t filter all outbound VPC traffic.',
        ],
        [
          'Amazon Route 53 public hosted zones',
          'Public hosted zones answer DNS queries for your domains; they don’t filter traffic.',
        ],
      ],
      a: 'a',
      x: 'AWS Network Firewall provides stateful inspection, intrusion prevention and web filtering, such as domain lists, for traffic entering and leaving VPCs.',
      r: ['networkFirewall'],
      tags: ['AWS Network Firewall', 'Egress filtering'],
    },
    {
      n: 65,
      t: '1.2',
      lv: 'm',
      q: 'A security team wants one place that aggregates findings from Amazon GuardDuty, Amazon Inspector and Amazon Macie across accounts, and checks resources against security best-practice standards. Which service should it use?',
      o: [
        [
          'AWS Security Hub',
          'Correct. Security Hub aggregates findings from AWS security services and runs automated checks against security standards.',
        ],
        ['AWS CloudTrail', 'CloudTrail records API activity; it doesn’t aggregate findings.'],
        [
          'Amazon CloudWatch dashboards',
          'Dashboards show metrics; they don’t collect and normalize security findings.',
        ],
        ['AWS Artifact', 'Artifact provides compliance reports.'],
      ],
      a: 'a',
      x: 'Security Hub collects findings from services such as GuardDuty, Inspector and Macie into a single view and evaluates resources against standards such as the AWS Foundational Security Best Practices. (AWS now documents the standards checks as Security Hub CSPM.)',
      r: ['securityHub'],
      tags: ['AWS Security Hub'],
    },
    {
      n: 66,
      t: '1.2',
      lv: 'm',
      q: 'A security team wants a record of the IP traffic that is accepted and rejected by the security groups and network ACLs in a VPC, to investigate suspicious connections. What should it enable?',
      o: [
        [
          'VPC Flow Logs',
          'Correct. Flow logs capture information about IP traffic to and from network interfaces, including whether it was accepted or rejected.',
        ],
        [
          'AWS CloudTrail data events',
          'CloudTrail records API calls, not network packets between resources.',
        ],
        ['Amazon S3 server access logs', 'These log requests to an S3 bucket only.'],
        ['AWS Config', 'Config records resource configurations, not traffic.'],
      ],
      a: 'a',
      x: 'VPC Flow Logs capture IP traffic metadata for a VPC, subnet or network interface and can publish to CloudWatch Logs, Amazon S3 or Amazon Data Firehose.',
      r: ['vpcFlowLogs'],
      tags: ['VPC Flow Logs'],
    },
    {
      n: 67,
      t: '1.2',
      lv: 'm',
      q: 'Which TWO statements about a VPC subnet that is called a public subnet are true? (Select TWO.)',
      o: [
        [
          'Its route table has a route to an internet gateway.',
          'Correct. A route to an internet gateway is what makes a subnet public.',
        ],
        [
          'Instances in it need a public IPv4 address or Elastic IP address to communicate with the internet over IPv4.',
          'Correct. Without a public address, an instance in a public subnet can’t be reached from or reach the internet directly.',
        ],
        [
          'Every instance in it is reachable from the internet on every port.',
          'Security groups and network ACLs still control which traffic is allowed.',
        ],
        [
          'It can only contain load balancers.',
          'Any resource can be placed in a public subnet, though best practice keeps back-end tiers private.',
        ],
        [
          'It is automatically encrypted at the network layer.',
          'Being public has nothing to do with encryption.',
        ],
      ],
      a: ['a', 'b'],
      x: 'A public subnet has a route to an internet gateway. Instances also need a public IP address, and their traffic is still filtered by security groups and network ACLs.',
      r: ['vpcSubnets', 'internetGateway'],
      tags: ['VPC', 'Public subnets'],
    },
    {
      n: 68,
      t: '1.2',
      lv: 'm',
      q: 'An application tier’s security group must allow traffic only from the web tier, even as web tier instances are added and removed by Auto Scaling. What is the simplest way to write the rule?',
      o: [
        [
          'Use the web tier’s security group ID as the source of the inbound rule.',
          'Correct. Security group references follow instances as they join or leave the group, so no IP addresses need to be updated.',
        ],
        [
          'List the private IP address of each web instance and update it after scaling events.',
          'This requires constant updates and breaks during scaling.',
        ],
        [
          'Allow the whole VPC CIDR block.',
          'This allows every resource in the VPC, not only the web tier.',
        ],
        [
          'Allow 0.0.0.0/0 and rely on the private subnet.',
          'This allows any source that can reach the subnet.',
        ],
      ],
      a: 'a',
      x: 'Security group rules can reference another security group as the source. Traffic from any network interface that uses the referenced group is allowed, which suits Auto Scaling groups.',
      r: ['vpcSecurityGroups'],
      tags: ['Security groups'],
    },
    {
      n: 69,
      t: '1.2',
      lv: 'h',
      q: 'Instances in a subnet can receive HTTPS requests, but responses never reach clients. The security group allows inbound 443. The subnet’s network ACL allows inbound 443 and denies all other inbound and outbound traffic. What is the most likely fix?',
      o: [
        [
          'Add an outbound network ACL rule that allows the ephemeral port range used by the clients.',
          'Correct. Network ACLs are stateless, so return traffic to the clients’ ephemeral ports must be allowed explicitly.',
        ],
        [
          'Add an outbound security group rule for port 443.',
          'Security groups are stateful, so responses to allowed inbound requests are already allowed.',
        ],
        [
          'Attach a second internet gateway to the VPC.',
          'A VPC can have only one internet gateway, and routing isn’t the problem.',
        ],
        [
          'Move the instances to a private subnet.',
          'This would make them unreachable from the internet.',
        ],
      ],
      a: 'a',
      x: 'Because network ACLs are stateless, rules are needed in both directions. Responses go to the client’s ephemeral port, so the outbound rules must allow that range.',
      r: ['vpcNacls'],
      tags: ['Network ACLs', 'Troubleshooting'],
    },
    {
      n: 70,
      t: '1.2',
      lv: 'm',
      q: 'A company wants Amazon EC2 instances in private subnets to call AWS Systems Manager, Amazon SQS and AWS KMS APIs without a NAT gateway or internet access. What should a solutions architect create?',
      o: [
        [
          'Interface VPC endpoints (AWS PrivateLink) for each of these services',
          'Correct. Interface endpoints give private IP addresses in the VPC for supported service APIs.',
        ],
        [
          'Gateway endpoints for each service',
          'Gateway endpoints are available only for Amazon S3 and DynamoDB.',
        ],
        [
          'An internet gateway with a route from the private subnets',
          'This would require public addresses and make the subnets public.',
        ],
        [
          'VPC peering with an AWS-owned VPC',
          'AWS service APIs aren’t reached through VPC peering.',
        ],
      ],
      a: 'a',
      x: 'Interface VPC endpoints, powered by PrivateLink, create elastic network interfaces in your subnets so that instances reach supported AWS services privately.',
      r: ['privateLink'],
      tags: ['Interface endpoints', 'AWS PrivateLink'],
    },
    {
      n: 71,
      t: '1.2',
      lv: 'm',
      q: 'Which threat is AWS Shield primarily designed to protect against?',
      o: [
        [
          'Distributed denial of service (DDoS) attacks',
          'Correct. Shield is a managed DDoS protection service.',
        ],
        [
          'Leaked IAM access keys',
          'Leaked keys are a credential issue; GuardDuty can detect misuse, and rotation fixes it.',
        ],
        ['Sensitive data stored in S3', 'This is what Macie discovers.'],
        [
          'Unpatched operating systems',
          'Patching is managed by the customer, for example with Systems Manager; Inspector finds vulnerabilities.',
        ],
      ],
      a: 'a',
      x: 'AWS Shield protects applications on AWS against DDoS attacks. Shield Standard is automatic; Shield Advanced adds more protection and support.',
      r: ['shield'],
      tags: ['AWS Shield', 'DDoS'],
    },
    {
      n: 72,
      t: '1.2',
      lv: 'h',
      q: 'A company is designing a VPC for a public web application. Which TWO measures reduce the attack surface? (Select TWO.)',
      o: [
        [
          'Place only the load balancer in public subnets and the application and database tiers in private subnets.',
          'Correct. Only the entry point is reachable from the internet; the other tiers are isolated.',
        ],
        [
          'Allow inbound traffic to the application tier only from the load balancer’s security group.',
          'Correct. Tier-to-tier security group references limit who can connect.',
        ],
        [
          'Give every instance a public IP address for easier troubleshooting.',
          'Public addresses expose instances unnecessarily.',
        ],
        [
          'Open all ports between all tiers to avoid connectivity problems.',
          'This removes segmentation between tiers.',
        ],
        [
          'Use the default VPC’s public subnets for all tiers.',
          'Default VPC subnets are public, which exposes every tier.',
        ],
      ],
      a: ['a', 'b'],
      x: 'Network segmentation with public and private subnets, and least-privilege security group rules between tiers, reduce what is exposed to the internet and limit lateral movement.',
      r: ['vpcSubnets', 'vpcSecurityGroups'],
      tags: ['Network segmentation'],
    },
    {
      n: 73,
      t: '1.2',
      lv: 'm',
      q: 'An application running on EC2 needs to call a third-party API with an API key. Which approach follows AWS security best practices?',
      o: [
        [
          'Store the key in AWS Secrets Manager and let the instance role read only that secret.',
          'Correct. The key is encrypted at rest, access is controlled with IAM, and use is auditable.',
        ],
        [
          'Commit the key to the application repository in an encrypted ZIP file.',
          'Keys in repositories are hard to rotate and the ZIP password must also be stored somewhere.',
        ],
        [
          'Put the key in the EC2 instance tags.',
          'Tags are not designed for secrets and can be read by anyone who can describe instances.',
        ],
        [
          'Print the key in the application logs for troubleshooting.',
          'Secrets must never be written to logs.',
        ],
      ],
      a: 'a',
      x: 'Secrets Manager centralizes secrets, encrypts them with AWS KMS and controls access with IAM, so applications get secrets at runtime instead of storing them in code or configuration.',
      r: ['secretsManager'],
      tags: ['AWS Secrets Manager', 'Application credentials'],
    },
    {
      n: 74,
      t: '1.2',
      lv: 'e',
      q: 'Under the shared responsibility model, who is responsible for configuring security groups for Amazon EC2 instances?',
      o: [
        [
          'The customer',
          'Correct. Network and firewall configuration is part of security in the cloud.',
        ],
        [
          'AWS',
          'AWS provides the security group feature; the rules are configured by the customer.',
        ],
        [
          'The Availability Zone operator',
          'There is no separate operator; AWS runs the infrastructure.',
        ],
        ['The internet service provider', 'ISPs have no role in VPC security groups.'],
      ],
      a: 'a',
      x: 'For services such as EC2, customers configure the guest operating system, applications and AWS-provided firewalls such as security groups.',
      r: ['sharedResponsibility'],
      tags: ['Shared responsibility'],
    },
    {
      n: 75,
      t: '1.2',
      lv: 'm',
      q: 'Web servers behind an Application Load Balancer should accept HTTP traffic only from the load balancer, not directly from the internet. How should the web servers’ security group be configured?',
      o: [
        [
          'Allow inbound HTTP only from the load balancer’s security group.',
          'Correct. Only traffic that passes through the ALB reaches the instances.',
        ],
        [
          'Allow inbound HTTP from 0.0.0.0/0.',
          'This lets anyone reach the instances directly if they have a route.',
        ],
        [
          'Allow no inbound traffic, because the ALB uses a private connection.',
          'The ALB connects to targets over the network, so the security group must allow it.',
        ],
        [
          'Allow inbound HTTP from the internet gateway’s ID.',
          'Security group rules can’t reference an internet gateway.',
        ],
      ],
      a: 'a',
      x: 'Referencing the load balancer’s security group in the targets’ inbound rule makes the ALB the only way in, which is a standard layered design.',
      r: ['vpcSecurityGroups'],
      tags: ['Security groups', 'Application Load Balancer'],
    },
    {
      n: 76,
      t: '1.2',
      lv: 'h',
      q: 'A company stores database credentials in AWS Secrets Manager and rotates them with a Lambda rotation function. The database is in private subnets with no internet access. What must be in place for rotation to work?',
      o: [
        [
          'The rotation Lambda function must be able to reach both the database and the Secrets Manager endpoint, for example by running in the VPC with a Secrets Manager interface endpoint.',
          'Correct. Rotation runs a Lambda function that calls Secrets Manager and updates the database password, so it needs network paths to both.',
        ],
        [
          'Nothing; Secrets Manager connects to the database over the internet.',
          'Secrets Manager rotation uses a Lambda function, which needs a network path to the private database.',
        ],
        [
          'The database must be moved to a public subnet.',
          'This is not needed and would weaken security.',
        ],
        ['An S3 gateway endpoint.', 'Rotation doesn’t require S3 access for this purpose.'],
      ],
      a: 'a',
      x: 'Secrets Manager rotates secrets by invoking a Lambda rotation function. When the database is private, the function runs in the VPC and needs a route to Secrets Manager, for example through an interface VPC endpoint or a NAT gateway.',
      r: ['secretsRotation', 'privateLink'],
      tags: ['AWS Secrets Manager', 'Rotation'],
    },
    {
      n: 77,
      t: '1.2',
      lv: 'm',
      q: 'An API on Amazon API Gateway is used by a mobile app. The company wants to block requests from specific countries and limit abusive request rates. Which service should be attached to the API?',
      o: [
        [
          'AWS WAF',
          'Correct. WAF web ACLs can be associated with API Gateway REST APIs and can use geographic match and rate-based rules.',
        ],
        [
          'AWS Shield Advanced only',
          'Shield Advanced adds DDoS protection; country and rate rules are WAF rules.',
        ],
        [
          'A network ACL',
          'API Gateway endpoints aren’t in your VPC subnets, and network ACLs can’t filter by country.',
        ],
        ['Amazon Inspector', 'Inspector scans for vulnerabilities.'],
      ],
      a: 'a',
      x: 'AWS WAF protects resources such as API Gateway REST APIs. Its rules can match the request’s country of origin and limit request rates.',
      r: ['waf', 'wafRateBased'],
      tags: ['AWS WAF', 'API Gateway'],
    },
    {
      n: 78,
      t: '1.2',
      lv: 'm',
      q: 'Which statement about security group rules is correct?',
      o: [
        [
          'Security groups support only allow rules; any traffic not allowed is denied.',
          'Correct. You can’t write deny rules in a security group.',
        ],
        [
          'Security group rules are evaluated in numbered order and stop at the first match.',
          'That describes network ACLs. Security groups evaluate all rules before deciding.',
        ],
        [
          'A security group can only be attached to one instance.',
          'A security group can be associated with many network interfaces.',
        ],
        [
          'Security groups must allow return traffic explicitly.',
          'Security groups are stateful, so return traffic is allowed automatically.',
        ],
      ],
      a: 'a',
      x: 'Security groups contain allow rules only, are stateful, and evaluate all rules together. Traffic that no rule allows is denied.',
      r: ['vpcSecurityGroups'],
      tags: ['Security groups'],
    },
    {
      n: 79,
      t: '1.2',
      lv: 'h',
      q: 'A company runs an internet-facing application and wants protection against bots and common exploits at the edge, close to users, before traffic reaches the Region. Which TWO steps should a solutions architect take? (Select TWO.)',
      o: [
        [
          'Serve the application through Amazon CloudFront.',
          'Correct. CloudFront handles requests at edge locations, which also benefit from AWS Shield Standard.',
        ],
        [
          'Associate an AWS WAF web ACL with the CloudFront distribution.',
          'Correct. WAF rules on the distribution filter malicious requests at the edge.',
        ],
        ['Add more NAT gateways.', 'NAT gateways handle outbound traffic from private subnets.'],
        ['Disable HTTPS to reduce processing load.', 'Disabling encryption weakens security.'],
        ['Move the database to a public subnet.', 'This increases exposure.'],
      ],
      a: ['a', 'b'],
      x: 'Putting CloudFront in front of the application and attaching a WAF web ACL filters requests at edge locations, reducing malicious traffic before it reaches the origin.',
      r: ['waf', 'shield'],
      tags: ['Amazon CloudFront', 'AWS WAF'],
    },
    {
      n: 80,
      t: '1.2',
      lv: 'm',
      q: 'A company wants to be alerted when an EC2 instance starts communicating with known command-and-control servers. Which service produces this kind of finding?',
      o: [
        [
          'Amazon GuardDuty',
          'Correct. GuardDuty uses threat intelligence on network activity to detect communication with known malicious hosts.',
        ],
        ['AWS Config', 'Config tracks configuration changes.'],
        ['AWS Budgets', 'Budgets tracks costs and usage.'],
        ['AWS Certificate Manager', 'ACM manages certificates.'],
      ],
      a: 'a',
      x: 'GuardDuty analyses VPC Flow Logs and DNS logs with threat intelligence to find, for example, instances communicating with known command-and-control or cryptocurrency-mining hosts.',
      r: ['guardDuty'],
      tags: ['Amazon GuardDuty'],
    },
  ],
);
