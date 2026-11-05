import { defineQuestions } from '../author';

/** SAA-C03 Domain 1, task 1.1: design secure access to AWS resources. */
export default defineQuestions(
  { domain: 'D1', written: '2026-11-05', status: 'checked', checked: '2026-11-05' },
  [
    {
      n: 1,
      t: '1.1',
      lv: 'm',
      q: 'Developers work in a development AWS account. They occasionally need read access to an Amazon S3 bucket in the production account. The security team does not want any IAM users created in the production account. What should a solutions architect do?',
      o: [
        [
          'Create an IAM role in the production account that trusts the development account and allows read access to the bucket. Allow the developers to call sts:AssumeRole on that role.',
          'Correct. Cross-account roles give temporary credentials to principals from the trusted account, so no IAM users or long-term keys are needed in production.',
        ],
        [
          'Create one IAM user in the production account and share its access keys with the developers.',
          'Shared long-term access keys are hard to rotate and audit, and the requirement rules out IAM users in production.',
        ],
        [
          'Make the bucket public and restrict it with a bucket policy that checks the developer names.',
          'A public bucket exposes the data to everyone. Names in a request are not a security control.',
        ],
        [
          'Create IAM users in the production account with the same user names and passwords as in the development account.',
          'This creates the IAM users the security team wants to avoid and doubles the credentials to manage.',
        ],
      ],
      a: 'a',
      x: 'Delegating access across accounts with an IAM role is the recommended pattern: the role in the production account trusts the development account, and developers assume it to get temporary credentials.',
      r: ['iamCrossAccountTutorial', 'iamRoles'],
      tags: ['IAM roles', 'Cross-account access'],
    },
    {
      n: 2,
      t: '1.1',
      lv: 'm',
      q: 'A company uses AWS Organizations. The security team must make sure that no one in any member account can stop or delete AWS CloudTrail trails, including account administrators. Which solution meets this requirement?',
      o: [
        [
          'Attach a service control policy (SCP) to the organization root that denies cloudtrail:StopLogging and cloudtrail:DeleteTrail.',
          'Correct. An SCP sets the maximum permissions for every IAM user and role in member accounts, so even administrators cannot perform the denied actions.',
        ],
        [
          'Attach an IAM policy that denies these actions to a role in the management account.',
          'A policy in the management account does not apply to principals in member accounts.',
        ],
        [
          'Add an AWS Config rule that detects stopped trails.',
          'AWS Config rules detect and report configuration changes after they happen. They do not prevent the action.',
        ],
        [
          'Attach a permissions boundary to every administrator in each member account.',
          'Administrators in member accounts could remove or change the boundary, and new principals would not have it.',
        ],
      ],
      a: 'a',
      x: 'SCPs are preventive guardrails for whole accounts or OUs. A Deny statement in an SCP applies to every principal in the affected member accounts, including the account root user.',
      r: ['orgsScps', 'orgsScpExamples'],
      tags: ['AWS Organizations', 'SCP', 'CloudTrail'],
    },
    {
      n: 3,
      t: '1.1',
      lv: 'e',
      q: 'A company has just created a new AWS account. Which action follows AWS best practices for the account root user?',
      o: [
        [
          'Turn on multi-factor authentication (MFA) for the root user and use the root user only for the tasks that require it.',
          'Correct. AWS recommends protecting the root user with MFA and using it only for tasks that only the root user can perform.',
        ],
        [
          'Create access keys for the root user so that scripts can manage the account.',
          'AWS recommends not creating root user access keys. Scripts should use IAM roles or other temporary credentials.',
        ],
        [
          'Share the root user password with every administrator so that someone can always sign in.',
          'Root user credentials should not be shared. Administrators should have their own identities with only the permissions they need.',
        ],
        [
          'Use the root user for daily administration, because it cannot be restricted.',
          'Daily work should use identities with least privilege. The root user has unrestricted access, which is why it should be used rarely.',
        ],
      ],
      a: 'a',
      x: 'The root user has complete access to the account. Protect it with MFA, do not create access keys for it, and use it only for root-only tasks.',
      r: ['iamRootUser', 'iamBestPractices'],
      tags: ['Root user', 'MFA'],
    },
    {
      n: 4,
      t: '1.1',
      lv: 'm',
      q: 'An IAM role in a member account has the AdministratorAccess managed policy attached. The member account is in an OU whose only service control policy (SCP) allows Amazon EC2 and Amazon S3 actions. Which actions can the role perform?',
      o: [
        [
          'Only Amazon EC2 and Amazon S3 actions',
          'Correct. An action must be allowed by both the SCPs and the identity-based policy. The SCP limits the role to EC2 and S3.',
        ],
        [
          'All actions, because AdministratorAccess allows everything',
          'SCPs set the maximum available permissions. The identity-based policy cannot exceed them.',
        ],
        [
          'No actions, because SCPs never grant permissions',
          'SCPs do not grant permissions on their own, but here the IAM policy grants them and the SCP allows EC2 and S3, so those actions are permitted.',
        ],
        [
          'All EC2 and S3 actions, even if the IAM policy is later removed',
          'Without an identity-based policy that allows the actions, the role has no permissions. SCPs only filter permissions.',
        ],
      ],
      a: 'a',
      x: 'Effective permissions are the intersection: the identity-based policy grants permissions, and SCPs limit the maximum. Here, only EC2 and S3 actions are both granted and allowed.',
      r: ['orgsScpEvaluation', 'iamEvaluation'],
      tags: ['SCP', 'Policy evaluation'],
    },
    {
      n: 5,
      t: '1.1',
      lv: 'h',
      q: 'A company attaches a service control policy (SCP) to the organization root that denies all actions outside two AWS Regions. An administrator in the organization’s management account can still launch Amazon EC2 instances in a third Region. Why?',
      o: [
        [
          'SCPs do not affect users or roles in the management account.',
          'Correct. SCPs apply only to member accounts. Principals in the management account are not restricted by them.',
        ],
        [
          'SCPs take up to 24 hours to apply.',
          'SCP changes are not delayed by a day. The behaviour comes from the management account being out of scope.',
        ],
        [
          'EC2 is a global service, so Region conditions do not apply to it.',
          'EC2 is a Regional service, and Region conditions apply to it in member accounts.',
        ],
        [
          'The administrator has AdministratorAccess, which overrides any SCP.',
          'In a member account, an SCP deny would win over AdministratorAccess. The reason here is that SCPs do not apply to the management account.',
        ],
      ],
      a: 'a',
      x: 'SCPs do not affect the management account. This is one reason AWS recommends keeping workloads out of the management account.',
      r: ['orgsScps'],
      tags: ['SCP', 'Management account'],
    },
    {
      n: 6,
      t: '1.1',
      lv: 'm',
      q: 'A company has 40 AWS accounts in AWS Organizations and an on-premises Microsoft Active Directory. Employees must sign in to the AWS Management Console with their existing corporate credentials and get different permissions in different accounts. Which solution requires the least ongoing management?',
      o: [
        [
          'Use AWS IAM Identity Center with the corporate directory as its identity source, and assign groups to accounts with permission sets.',
          'Correct. IAM Identity Center provides workforce sign-in across all accounts in the organization and maps directory groups to permission sets in each account.',
        ],
        [
          'Create IAM users for every employee in every account.',
          'This creates hundreds of separate credentials to manage and does not use the corporate directory.',
        ],
        [
          'Use an Amazon Cognito user pool for employee sign-in.',
          'Cognito is designed for customer identities in web and mobile apps, not workforce access to the AWS console across accounts.',
        ],
        [
          'Create one shared IAM user per department and share its password.',
          'Shared credentials remove individual accountability and break the principle of least privilege.',
        ],
      ],
      a: 'a',
      x: 'IAM Identity Center is the recommended way to give a workforce single sign-on to multiple AWS accounts. It can use Active Directory as an identity source, and permission sets define what each group can do in each account.',
      r: ['identityCenter', 'identityCenterPermissionSets'],
      tags: ['IAM Identity Center', 'Federation'],
    },
    {
      n: 7,
      t: '1.1',
      lv: 'e',
      q: 'An application running on Amazon EC2 instances must write items to an Amazon DynamoDB table. What is the most secure way to give the application credentials?',
      o: [
        [
          'Attach an IAM role to the instances through an instance profile, with a policy that allows writes to the table.',
          'Correct. The application gets temporary credentials from the instance metadata, and they are rotated automatically.',
        ],
        [
          'Store an IAM user’s access keys in the application’s source code.',
          'Keys in source code can leak through version control and must be rotated by hand.',
        ],
        [
          'Put an IAM user’s access keys in the instance user data.',
          'User data is readable from the instance and is not a secure place for long-term credentials.',
        ],
        [
          'Use the account root user’s access keys, stored in an environment variable.',
          'Root user access keys should never be created for applications, and they would give the application full control of the account.',
        ],
      ],
      a: 'a',
      x: 'IAM roles for EC2 deliver temporary credentials to applications on the instance. AWS rotates them automatically, so there are no long-term keys to store or leak.',
      r: ['iamEc2Role', 'iamBestPractices'],
      tags: ['IAM roles', 'EC2'],
    },
    {
      n: 8,
      t: '1.1',
      lv: 'h',
      q: 'A company wants to let a third-party monitoring service read Amazon CloudWatch metrics in its AWS account. The service uses one AWS account to serve many customers. How should a solutions architect grant access while preventing the confused deputy problem?',
      o: [
        [
          'Create an IAM role that trusts the vendor’s AWS account and require a unique external ID with the sts:ExternalId condition in the trust policy.',
          'Correct. The external ID, unique to this customer, makes sure the vendor assumes the role only on this company’s behalf.',
        ],
        [
          'Create an IAM user with read-only access and send its access keys to the vendor.',
          'Long-term keys sent to a third party are hard to rotate and revoke, and they are not the recommended pattern for third-party access.',
        ],
        [
          'Create a role that trusts every AWS account (“*”) and restrict it with a read-only permissions policy.',
          'Trusting every account lets anyone who knows the role ARN assume it.',
        ],
        [
          'Share the account’s root user credentials with the vendor for initial setup only.',
          'Root user credentials must never be shared.',
        ],
      ],
      a: 'a',
      x: 'For third-party access, AWS recommends a role that trusts the third party’s account with an external ID condition. This mitigates the confused deputy problem, where another customer could trick the vendor into acting on your resources.',
      r: ['iamConfusedDeputy'],
      tags: ['External ID', 'Third-party access'],
    },
    {
      n: 9,
      t: '1.1',
      lv: 'h',
      q: 'Developers must be able to create IAM roles for their own AWS Lambda functions. The security team must make sure that a developer cannot create a role with more permissions than the developer team is allowed to use. Which approach meets this requirement?',
      o: [
        [
          'Allow iam:CreateRole only when the request attaches a specific permissions boundary, using the iam:PermissionsBoundary condition key.',
          'Correct. Every role the developers create is limited by the boundary, so they cannot escalate privileges through new roles.',
        ],
        [
          'Give the developers the IAMFullAccess managed policy.',
          'Full IAM access lets developers create roles with any permissions, including administrator access.',
        ],
        [
          'Attach an SCP that denies all IAM actions in the account.',
          'This would stop developers from creating any roles, which they need to do.',
        ],
        [
          'Ask developers to review each other’s roles before deploying them.',
          'Peer review is not an enforced control and does not prevent escalation.',
        ],
      ],
      a: 'a',
      x: 'Permissions boundaries set the maximum permissions an identity-based policy can grant to a user or role. Requiring a boundary on every role developers create is the documented way to delegate role creation safely.',
      r: ['iamBoundaries'],
      tags: ['Permissions boundary', 'Delegation'],
    },
    {
      n: 10,
      t: '1.1',
      lv: 'm',
      q: 'An application role in account A must read objects from an Amazon S3 bucket in account B. Which TWO conditions must be true for the request to succeed? (Select TWO.)',
      o: [
        [
          'The bucket policy in account B allows s3:GetObject for the role from account A.',
          'Correct. For cross-account access, the resource owner must allow the request in a resource-based policy.',
        ],
        [
          'An identity-based policy attached to the role in account A allows s3:GetObject on the bucket.',
          'Correct. The calling account must also allow the request in the principal’s identity-based policy.',
        ],
        [
          'The bucket allows public read access.',
          'Public access is not required and would expose the data to everyone.',
        ],
        [
          'A service control policy in account B allows s3:GetObject.',
          'SCPs never grant permissions, and SCPs in account B do not apply to a principal from account A.',
        ],
        [
          'Account A and account B are in the same AWS Region.',
          'Cross-account access to S3 does not depend on the accounts’ Regions.',
        ],
      ],
      a: ['a', 'b'],
      x: 'Cross-account requests must be allowed on both sides: by the principal’s identity-based policy in the trusted account and by the resource-based policy in the account that owns the resource.',
      r: ['iamCrossAccountEval', 's3BucketPolicies'],
      tags: ['Cross-account access', 'Bucket policy'],
    },
    {
      n: 11,
      t: '1.1',
      lv: 'm',
      q: 'A security team wants to replace broad IAM policies on several roles with least-privilege policies based on the actions the roles actually used over the last 90 days. Which AWS feature helps most?',
      o: [
        [
          'IAM Access Analyzer policy generation, which builds a policy from AWS CloudTrail activity',
          'Correct. Policy generation reviews the role’s CloudTrail events and drafts a policy with the services and actions it used.',
        ],
        [
          'Amazon GuardDuty',
          'GuardDuty detects threats such as unusual API calls. It does not write least-privilege policies.',
        ],
        [
          'Amazon Inspector',
          'Inspector scans workloads for software vulnerabilities and network exposure.',
        ],
        [
          'AWS Trusted Advisor cost optimization checks',
          'Cost optimization checks look for unused or idle resources, not for unused permissions.',
        ],
      ],
      a: 'a',
      x: 'IAM Access Analyzer can generate a policy based on access activity recorded in CloudTrail, which helps refine permissions toward least privilege.',
      r: ['accessAnalyzerPolicyGen', 'iamBestPractices'],
      tags: ['IAM Access Analyzer', 'Least privilege'],
    },
    {
      n: 12,
      t: '1.1',
      lv: 'm',
      q: 'A company wants to find any S3 buckets, IAM roles and AWS KMS keys in its organization that are shared with principals outside the organization. Which service should it use?',
      o: [
        [
          'IAM Access Analyzer with the organization as its zone of trust',
          'Correct. Access Analyzer’s external access findings identify resources shared with principals outside the zone of trust.',
        ],
        [
          'Amazon Macie',
          'Macie discovers sensitive data in S3. It does not analyse IAM roles or KMS key policies for external access.',
        ],
        ['AWS Shield Advanced', 'Shield Advanced protects against DDoS attacks.'],
        [
          'Amazon Detective',
          'Detective helps investigate security findings. It does not analyse resource policies for external sharing.',
        ],
      ],
      a: 'a',
      x: 'IAM Access Analyzer uses logic-based reasoning on resource policies to find resources that grant access to principals outside the account or organization chosen as the zone of trust.',
      r: ['accessAnalyzer'],
      tags: ['IAM Access Analyzer'],
    },
    {
      n: 13,
      t: '1.1',
      lv: 'e',
      q: 'Why does AWS recommend that workloads use temporary credentials from AWS Security Token Service (AWS STS) instead of long-term access keys?',
      o: [
        [
          'Temporary credentials expire automatically, so they do not need to be rotated or revoked by hand if they leak.',
          'Correct. Temporary credentials last from minutes to hours and are requested when needed, which limits the impact of exposure.',
        ],
        [
          'Temporary credentials have no permission limits.',
          'Temporary credentials are limited by the policies of the role or user that requested them.',
        ],
        [
          'Temporary credentials can only be used from Amazon EC2.',
          'Many services and identities can use temporary credentials, not only EC2.',
        ],
        [
          'Temporary credentials remove the need for IAM policies.',
          'Permissions still come from IAM policies attached to the role.',
        ],
      ],
      a: 'a',
      x: 'Temporary security credentials are short-term and generated on request. They expire automatically, so they don’t have to be embedded, stored or rotated like long-term access keys.',
      r: ['iamTempCreds', 'iamBestPractices'],
      tags: ['AWS STS', 'Temporary credentials'],
    },
    {
      n: 14,
      t: '1.1',
      lv: 'e',
      q: 'A small company uses IAM users in a single account. Thirty developers need the same permissions, and new developers join every month. Which approach is easiest to manage?',
      o: [
        [
          'Create an IAM user group for developers, attach the policies to the group, and add each developer to it.',
          'Correct. Users in a group get the group’s permissions, so a change to the group applies to every developer.',
        ],
        [
          'Attach an inline policy to each developer’s IAM user.',
          'Inline policies on each user must be changed one by one and easily drift apart.',
        ],
        [
          'Give all developers the credentials of one shared IAM user.',
          'Shared credentials remove individual accountability and are hard to rotate.',
        ],
        [
          'Attach the policies to the account root user.',
          'Policies cannot limit the root user this way, and the root user should not be used for daily work.',
        ],
      ],
      a: 'a',
      x: 'IAM user groups let you set permissions for many users at once. Attach managed policies to the group and add or remove users as the team changes.',
      r: ['iamGroups'],
      tags: ['IAM groups'],
    },
    {
      n: 15,
      t: '1.1',
      lv: 'm',
      q: 'An IAM user has an identity-based policy that allows s3:* on a bucket. The bucket policy contains an explicit Deny for s3:DeleteObject for that user. What happens when the user tries to delete an object?',
      o: [
        [
          'The request is denied, because an explicit deny in any applicable policy overrides an allow.',
          'Correct. During policy evaluation, an explicit deny always wins.',
        ],
        [
          'The request is allowed, because the identity-based policy is evaluated first.',
          'The order of policies does not matter. Any explicit deny ends the evaluation with a deny.',
        ],
        [
          'The request is allowed, because s3:* is more specific than the deny.',
          'Policies are not ranked by how specific they are. An explicit deny overrides any allow.',
        ],
        [
          'The result depends on which policy was changed most recently.',
          'IAM policy evaluation does not consider when policies changed.',
        ],
      ],
      a: 'a',
      x: 'IAM evaluates all applicable policies. If any statement explicitly denies the request, the final decision is deny, regardless of allows elsewhere.',
      r: ['iamEvaluation'],
      tags: ['Policy evaluation', 'Explicit deny'],
    },
    {
      n: 16,
      t: '1.1',
      lv: 'h',
      q: 'In account A, an IAM user has no identity-based policies. The bucket policy of an S3 bucket in the same account allows s3:GetObject for that user’s ARN. Can the user read objects from the bucket?',
      o: [
        [
          'Yes. Within one account, an allow in a resource-based policy that names the user is enough when nothing denies the request.',
          'Correct. In the same account, either an identity-based policy or a resource-based policy can grant access.',
        ],
        [
          'No. An identity-based policy must always allow the action as well.',
          'That is required for cross-account access, not for requests within the same account.',
        ],
        [
          'No. Bucket policies only apply to principals from other accounts.',
          'Bucket policies can grant access to principals in the same account too.',
        ],
        [
          'Only if the bucket also has an ACL granting the user read access.',
          'An ACL is not required. The bucket policy allow is sufficient here.',
        ],
      ],
      a: 'a',
      x: 'For requests within a single account, an allow in either the identity-based policy or the resource-based policy grants access, as long as no explicit deny, permissions boundary or SCP blocks it.',
      r: ['iamEvaluation', 'iamIdentityVsResource'],
      tags: ['Policy evaluation', 'Resource-based policy'],
    },
    {
      n: 17,
      t: '1.1',
      lv: 'm',
      q: 'A company is starting on AWS. It wants a multi-account environment set up quickly with a landing zone, centralized logging, preventive and detective controls, and a standard way to provision new accounts. Which service should it use?',
      o: [
        [
          'AWS Control Tower',
          'Correct. Control Tower sets up a landing zone based on best practices, applies controls (guardrails), and provisions accounts with Account Factory.',
        ],
        [
          'AWS Config',
          'Config records resource configurations and evaluates rules. It does not create accounts or a landing zone.',
        ],
        [
          'AWS Trusted Advisor',
          'Trusted Advisor gives best-practice recommendations. It does not build a multi-account environment.',
        ],
        [
          'AWS Systems Manager',
          'Systems Manager manages instances and operations, not account structure.',
        ],
      ],
      a: 'a',
      x: 'AWS Control Tower orchestrates AWS Organizations and other services to set up and govern a secure multi-account environment, with controls and automated account provisioning.',
      r: ['controlTower'],
      tags: ['AWS Control Tower', 'Multi-account'],
    },
    {
      n: 18,
      t: '1.1',
      lv: 'm',
      q: 'For data residency reasons, a company must make sure that no workloads are created outside the eu-central-1 Region in any of its member accounts, including accounts created in the future. Which solution meets this requirement with the least effort?',
      o: [
        [
          'Attach an SCP to the organization root that denies actions when aws:RequestedRegion is not eu-central-1, with exceptions for global services.',
          'Correct. The SCP applies to all current and future member accounts and cannot be changed by account administrators.',
        ],
        [
          'Attach an IAM policy with the Region restriction to every role in every account.',
          'Each account’s administrators could change these policies, and new roles would need them added.',
        ],
        [
          'Create an AWS Config rule that reports resources created in other Regions.',
          'A Config rule detects resources after they exist. It does not prevent their creation.',
        ],
        [
          'Disable the other Regions in the AWS Management Console for each user.',
          'Hiding Regions in the console does not stop API calls to them.',
        ],
      ],
      a: 'a',
      x: 'An SCP that denies requests based on the aws:RequestedRegion condition key is the documented way to restrict Regions across an organization. Global services such as IAM are excluded because their requests are made to a fixed Region.',
      r: ['orgsScpExamples', 'iamConditionKeys'],
      tags: ['SCP', 'Data residency'],
    },
    {
      n: 19,
      t: '1.1',
      lv: 'e',
      q: 'Under the AWS shared responsibility model, which task is the customer’s responsibility?',
      o: [
        [
          'Managing IAM users, roles and their permissions',
          'Correct. Identity and access management is part of security in the cloud, which customers own.',
        ],
        [
          'Physical security of AWS data centers',
          'AWS is responsible for security of the cloud, including its facilities.',
        ],
        [
          'Patching the hypervisor that runs Amazon EC2 instances',
          'The virtualization layer is part of the infrastructure that AWS manages.',
        ],
        [
          'Replacing failed disks in AWS storage hardware',
          'Hardware maintenance is AWS’s responsibility.',
        ],
      ],
      a: 'a',
      x: 'AWS is responsible for security of the cloud (infrastructure). Customers are responsible for security in the cloud, which includes identity and access management.',
      r: ['sharedResponsibility'],
      tags: ['Shared responsibility'],
    },
    {
      n: 20,
      t: '1.1',
      lv: 'm',
      q: 'A company runs production and development workloads in one AWS account. A solutions architect recommends moving them into separate accounts. Which TWO benefits support this recommendation? (Select TWO.)',
      o: [
        [
          'A security issue in the development account is isolated from production resources.',
          'Correct. An AWS account is a strong isolation boundary, which limits the blast radius of mistakes and incidents.',
        ],
        [
          'Costs and service quotas are tracked separately for each environment.',
          'Correct. Each account has its own bill details and its own service quotas.',
        ],
        [
          'Data in separate accounts is encrypted automatically.',
          'Encryption depends on how each service is configured, not on the number of accounts.',
        ],
        [
          'IAM users are shared automatically between the two accounts.',
          'IAM identities belong to one account. Access across accounts must be granted explicitly.',
        ],
        [
          'IAM policies are no longer needed in either account.',
          'Each account still needs IAM policies to control access.',
        ],
      ],
      a: ['a', 'b'],
      x: 'Separate accounts isolate workloads, which reduces the impact of security issues, and give each environment its own billing, quotas and permissions.',
      r: ['controlTower', 'orgsScps'],
      tags: ['Multi-account'],
    },
    {
      n: 21,
      t: '1.1',
      lv: 'm',
      q: 'Administrators switch to a privileged role in the AWS Management Console. The security team requires that the role can be assumed only by users who signed in with multi-factor authentication. What should a solutions architect add?',
      o: [
        [
          'A condition in the role’s trust policy that requires aws:MultiFactorAuthPresent to be true',
          'Correct. The trust policy controls who can assume the role, and the MFA condition key checks that the caller authenticated with MFA.',
        ],
        [
          'An SCP that requires MFA for all IAM users in the organization',
          'This is broader than the requirement and is not how role assumption is limited to MFA sessions.',
        ],
        [
          'A permissions boundary on the role',
          'A boundary limits what the role can do after it is assumed, not who can assume it.',
        ],
        [
          'A password policy that requires longer passwords',
          'A password policy does not require a second factor.',
        ],
      ],
      a: 'a',
      x: 'Adding an aws:MultiFactorAuthPresent condition to the role trust policy makes sts:AssumeRole succeed only for callers who authenticated with MFA.',
      r: ['iamMfa', 'iamConditionKeys'],
      tags: ['MFA', 'IAM roles'],
    },
    {
      n: 22,
      t: '1.1',
      lv: 'h',
      q: 'An IAM user in account A gets an AccessDenied error when calling sts:AssumeRole for a role in account B. Which TWO settings must both be in place for the call to succeed? (Select TWO.)',
      o: [
        [
          'The role’s trust policy in account B allows account A or the specific user as a principal.',
          'Correct. The trust policy defines which principals can assume the role.',
        ],
        [
          'An identity-based policy in account A allows the user to call sts:AssumeRole on the role ARN.',
          'Correct. For cross-account role assumption, the caller’s account must also allow the request.',
        ],
        [
          'The user has an MFA device, even if the trust policy does not require it.',
          'MFA is needed only if a policy requires it.',
        ],
        [
          'The role in account B has the AdministratorAccess policy.',
          'The role’s permissions policy controls what it can do after assumption, not whether it can be assumed.',
        ],
        [
          'Both accounts belong to the same AWS Organizations organization.',
          'Cross-account roles work between any accounts, in or outside an organization.',
        ],
      ],
      a: ['a', 'b'],
      x: 'Assuming a role in another account needs two allows: the role’s trust policy in the owning account and an identity-based policy in the caller’s account that permits sts:AssumeRole on that role.',
      r: ['iamCrossAccountTutorial', 'iamCrossAccountEval'],
      tags: ['Cross-account access', 'Trust policy'],
    },
    {
      n: 23,
      t: '1.1',
      lv: 'm',
      q: 'A mobile app lets users sign in with a social identity provider. Each signed-in user must upload photos directly to an Amazon S3 prefix that only that user can access. Which solution meets these requirements?',
      o: [
        [
          'Use Amazon Cognito to authenticate users and an identity pool to give each user temporary AWS credentials, with a policy that limits access to the user’s own prefix.',
          'Correct. Cognito identity pools exchange a user’s sign-in for temporary, limited AWS credentials, and policy variables can scope access to that user.',
        ],
        [
          'Create an IAM user for each app user and send the access keys to the device.',
          'Long-term keys on devices are insecure, and IAM users don’t scale to millions of app users.',
        ],
        [
          'Use IAM Identity Center for the app’s users.',
          'IAM Identity Center is for workforce access to AWS accounts and applications, not consumer mobile apps.',
        ],
        [
          'Embed one IAM user’s access keys in the app and check the user name in the app code.',
          'Embedded keys can be extracted, and app-side checks don’t limit what the keys can do.',
        ],
      ],
      a: 'a',
      x: 'Amazon Cognito identity pools provide temporary AWS credentials to app users, including users who sign in with social or other external identity providers. IAM roles with policy variables can limit each user to their own data.',
      r: ['cognitoIdentityPools', 'cognito'],
      tags: ['Amazon Cognito', 'Federation'],
    },
    {
      n: 24,
      t: '1.1',
      lv: 'm',
      q: 'A company wants AWS services such as IAM Identity Center to authenticate users against its existing on-premises Active Directory. It does not want to copy or cache directory data in the cloud or run domain controllers on AWS. Which option meets these requirements?',
      o: [
        [
          'AD Connector',
          'Correct. AD Connector is a directory gateway that redirects requests to the on-premises Active Directory without caching information in the cloud.',
        ],
        [
          'AWS Managed Microsoft AD',
          'This runs actual Microsoft Active Directory domain controllers on AWS, which the company wants to avoid.',
        ],
        [
          'Simple AD',
          'Simple AD is a standalone directory on AWS. It does not use the on-premises directory.',
        ],
        [
          'Amazon Cognito user pools',
          'Cognito user pools are a user directory for applications, not a proxy to Active Directory.',
        ],
      ],
      a: 'a',
      x: 'AD Connector proxies authentication requests to an on-premises Active Directory, so existing users and groups can be used with AWS without synchronizing or storing directory data on AWS.',
      r: ['adConnector', 'directoryService'],
      tags: ['AWS Directory Service', 'AD Connector'],
    },
    {
      n: 25,
      t: '1.1',
      lv: 'm',
      q: 'A company with a single AWS account already has a SAML 2.0 identity provider. Employees should use their corporate credentials to reach the AWS Management Console with different roles. What should a solutions architect configure in IAM?',
      o: [
        [
          'A SAML identity provider in IAM and IAM roles whose trust policies trust that provider',
          'Correct. Users authenticate with the IdP, which returns a SAML assertion used to assume an IAM role.',
        ],
        [
          'An IAM user for each employee with the same password as in the corporate directory',
          'Duplicating users and passwords is exactly what federation avoids.',
        ],
        [
          'An Amazon Cognito user pool with a password policy',
          'Cognito user pools serve application users, not workforce console access.',
        ],
        [
          'A permissions boundary for every employee',
          'Permissions boundaries limit permissions; they don’t connect an identity provider.',
        ],
      ],
      a: 'a',
      x: 'With SAML 2.0 federation, you create a SAML provider in IAM and roles that trust it. The IdP authenticates the user and the user receives temporary credentials for the mapped role.',
      r: ['iamSaml'],
      tags: ['SAML federation'],
    },
    {
      n: 26,
      t: '1.1',
      lv: 'e',
      q: 'An auditor asks for a list of all IAM users in an account with the status of their passwords, MFA devices and access keys, including when each key was last used. Which IAM feature provides this?',
      o: [
        [
          'The IAM credential report',
          'Correct. The credential report lists all users and the status of their credentials, including access key last-used information.',
        ],
        [
          'The IAM policy simulator',
          'The simulator tests what policies allow. It does not report on credentials.',
        ],
        [
          'AWS Artifact',
          'Artifact provides AWS compliance reports and agreements, not reports about your IAM users.',
        ],
        [
          'Amazon CloudWatch Logs Insights',
          'Logs Insights queries log data. It does not produce a ready-made credential inventory.',
        ],
      ],
      a: 'a',
      x: 'The credential report is a CSV file that lists every IAM user and the status of their credentials, such as password, MFA and access keys, which helps audits and rotation.',
      r: ['iamCredentialReport'],
      tags: ['Credential report', 'Audit'],
    },
    {
      n: 27,
      t: '1.1',
      lv: 'h',
      q: 'A company creates new projects every week. Each project’s engineers should access only the resources tagged with their project name. The security team does not want to update IAM policies every time a project is created. Which approach should a solutions architect use?',
      o: [
        [
          'Attribute-based access control (ABAC), with policies that compare the principal’s project tag to the resource’s project tag',
          'Correct. ABAC policies use tags as attributes, so new projects work without new policies.',
        ],
        [
          'A separate IAM policy for each project that lists its resource ARNs',
          'This is role-based access control with a policy per project, which must be updated for every new project or resource.',
        ],
        [
          'One IAM user group per project with inline policies',
          'This still needs new groups and policies for every project.',
        ],
        [
          'An SCP for each project',
          'SCPs apply to accounts and OUs and don’t grant permissions to individual engineers.',
        ],
      ],
      a: 'a',
      x: 'ABAC grants permissions based on matching tags on principals and resources. It scales as projects grow because policies don’t need to change when new tagged resources and principals appear.',
      r: ['iamAbac'],
      tags: ['ABAC', 'Tags'],
    },
    {
      n: 28,
      t: '1.1',
      lv: 'm',
      q: 'A company stores shared reference data in an S3 bucket. Every account in its AWS Organizations organization, including accounts created later, must be able to read the data, and no one else. How should the bucket policy be written?',
      o: [
        [
          'Allow s3:GetObject for all principals with a condition that aws:PrincipalOrgID equals the organization ID.',
          'Correct. The condition limits access to principals from accounts in the organization, and it covers new accounts automatically.',
        ],
        [
          'List every account ID in the policy and update it when accounts are added.',
          'This works but needs a policy change for every new account.',
        ],
        [
          'Make the bucket public and rely on the organization’s SCPs to block others.',
          'SCPs don’t restrict principals outside the organization, so the data would be public.',
        ],
        [
          'Allow the management account only, because member accounts inherit its permissions.',
          'Member accounts don’t inherit access granted to the management account.',
        ],
      ],
      a: 'a',
      x: 'The aws:PrincipalOrgID global condition key compares the requesting principal’s organization ID with the value in the policy, so a single statement grants access to every account in the organization.',
      r: ['iamConditionKeys', 's3BucketPolicies'],
      tags: ['Bucket policy', 'AWS Organizations'],
    },
    {
      n: 29,
      t: '1.1',
      lv: 'm',
      q: 'A networking team owns a transit gateway in a central account. Other accounts in the organization must attach their VPCs to it without the networking team giving them access to the central account. Which service should be used?',
      o: [
        [
          'AWS Resource Access Manager (AWS RAM)',
          'Correct. AWS RAM shares supported resources, such as transit gateways and subnets, with other accounts or the whole organization.',
        ],
        [
          'AWS Directory Service',
          'Directory Service provides Active Directory. It does not share network resources.',
        ],
        [
          'IAM Identity Center',
          'Identity Center grants people access to accounts. It doesn’t share resources between accounts.',
        ],
        ['AWS Artifact', 'Artifact provides compliance reports.'],
      ],
      a: 'a',
      x: 'AWS RAM lets you create a resource once and share it with other accounts, OUs or the organization, which avoids duplicating resources or granting cross-account console access.',
      r: ['ram'],
      tags: ['AWS RAM', 'Resource sharing'],
    },
    {
      n: 30,
      t: '1.1',
      lv: 'e',
      q: 'Which type of policy is attached directly to an AWS resource, such as an Amazon S3 bucket, and specifies which principals can access it?',
      o: [
        [
          'A resource-based policy',
          'Correct. Resource-based policies, such as bucket policies, are attached to the resource and include a Principal element.',
        ],
        [
          'An identity-based policy',
          'Identity-based policies are attached to users, groups or roles.',
        ],
        [
          'A permissions boundary',
          'A permissions boundary sets the maximum permissions for a user or role.',
        ],
        [
          'A session policy',
          'Session policies are passed when assuming a role or federating to limit that session.',
        ],
      ],
      a: 'a',
      x: 'Resource-based policies are attached to resources and name the principals that can act on them. Identity-based policies are attached to IAM identities.',
      r: ['iamIdentityVsResource'],
      tags: ['Resource-based policy'],
    },
    {
      n: 31,
      t: '1.1',
      lv: 'm',
      q: 'An Amazon SNS topic must invoke an AWS Lambda function in the same account. What must be configured so that SNS is allowed to invoke the function?',
      o: [
        [
          'A statement in the function’s resource-based policy that allows the SNS service principal to call lambda:InvokeFunction, scoped to the topic ARN',
          'Correct. Services that invoke a function directly need permission in the function’s resource-based policy.',
        ],
        [
          'A statement in the function’s execution role that allows sns:Publish',
          'The execution role controls what the function can do, not who can invoke it.',
        ],
        [
          'An IAM user for SNS with Lambda permissions',
          'AWS services are not given IAM users. They are allowed through resource-based policies or roles.',
        ],
        ['An SCP that allows lambda:InvokeFunction', 'SCPs don’t grant permissions.'],
      ],
      a: 'a',
      x: 'Lambda resource-based policies grant other AWS services and accounts permission to invoke a function. The execution role is a separate permission for the function’s own calls.',
      r: ['lambdaResourcePolicy', 'lambdaExecutionRole'],
      tags: ['AWS Lambda', 'Resource-based policy'],
    },
    {
      n: 32,
      t: '1.1',
      lv: 'e',
      q: 'A company creates an IAM role in the AWS Management Console while the console shows the us-east-1 Region. Can an Amazon EC2 instance in eu-west-1 use this role?',
      o: [
        [
          'Yes. IAM is a global service, so users and roles can be used in every Region.',
          'Correct. IAM identities are global within the account.',
        ],
        [
          'No. The role must be copied to eu-west-1 first.',
          'IAM roles are not Regional resources and don’t need to be copied.',
        ],
        [
          'Only if cross-Region replication is enabled for IAM.',
          'There is no IAM replication setting. IAM is global.',
        ],
        [
          'Only if both Regions are in the same partition and the role is tagged with the Region.',
          'Tags are not needed. Commercial Regions share the same IAM identities.',
        ],
      ],
      a: 'a',
      x: 'IAM is a global service. Identities and policies created in an account are available in all commercial Regions of that account.',
      r: ['iamRoles', 'regionsAzs'],
      tags: ['IAM', 'Global infrastructure'],
    },
    {
      n: 33,
      t: '1.1',
      lv: 'h',
      q: 'A script assumes role A and then uses those credentials to assume role B. Role B’s maximum session duration is set to 12 hours, but the script cannot get credentials for role B that last longer than 1 hour. Why?',
      o: [
        [
          'Role chaining limits the role session to a maximum of one hour.',
          'Correct. When credentials from one role are used to assume another, the session can last at most one hour.',
        ],
        [
          'The maximum session duration only applies to the root user.',
          'The setting applies to roles, but role chaining has its own one-hour limit.',
        ],
        [
          'Role B’s trust policy has an MFA condition.',
          'An MFA condition affects whether the role can be assumed, not the one-hour chaining limit.',
        ],
        [
          'AWS STS credentials always expire after one hour.',
          'Many STS sessions can last longer, up to the role’s maximum session duration, except when roles are chained.',
        ],
      ],
      a: 'a',
      x: 'Role chaining is using a role’s temporary credentials to assume another role. AWS limits a chained role session to one hour, whatever the role’s maximum session duration.',
      r: ['iamRoleTerms', 'stsAssumeRole'],
      tags: ['Role chaining', 'AWS STS'],
    },
    {
      n: 34,
      t: '1.1',
      lv: 'm',
      q: 'A company uses IAM Identity Center. The database team needs read-only access in three of the organization’s accounts. How should a solutions architect grant this?',
      o: [
        [
          'Create a permission set with read-only permissions and assign the database team’s group to the three accounts with that permission set.',
          'Correct. Identity Center provisions the permission set as roles in each assigned account.',
        ],
        [
          'Create IAM users for each team member in each account.',
          'This duplicates identities and ignores the existing single sign-on.',
        ],
        [
          'Attach a read-only SCP to the three accounts.',
          'SCPs limit everyone in the accounts and don’t grant the team access.',
        ],
        [
          'Share the management account’s credentials with the team.',
          'Sharing credentials breaks least privilege and accountability.',
        ],
      ],
      a: 'a',
      x: 'Permission sets define permissions once. Assigning a group and a permission set to accounts makes IAM Identity Center create matching IAM roles in those accounts.',
      r: ['identityCenterPermissionSets'],
      tags: ['IAM Identity Center', 'Permission sets'],
    },
    {
      n: 35,
      t: '1.1',
      lv: 'm',
      q: 'A security engineer has written a new IAM policy for an application role. Before attaching it, the engineer wants to check whether the role would be allowed to call specific actions on specific resources. Which tool should the engineer use?',
      o: [
        [
          'The IAM policy simulator',
          'Correct. The simulator tests identity-based policies, permissions boundaries and other policies against chosen actions and resources.',
        ],
        [
          'AWS CloudTrail event history',
          'CloudTrail shows past API activity. It doesn’t test a new policy before it’s used.',
        ],
        ['Amazon Inspector', 'Inspector scans for software vulnerabilities.'],
        [
          'AWS Config conformance packs',
          'Conformance packs evaluate resource configurations, not what an IAM policy would allow.',
        ],
      ],
      a: 'a',
      x: 'The IAM policy simulator evaluates policies and shows whether specific actions on specific resources would be allowed or denied, which helps troubleshoot and test permissions before deployment.',
      r: ['iamPolicySimulator'],
      tags: ['Policy simulator'],
    },
    {
      n: 36,
      t: '1.1',
      lv: 'h',
      q: 'In a standalone AWS account, an administrator accidentally saves a bucket policy that denies all actions to all principals, and no IAM user or role can now change it. Which TWO statements about this situation are correct? (Select TWO.)',
      o: [
        [
          'The account root user can delete the bucket policy.',
          'Correct. Editing or deleting a bucket policy that denies all principals is one of the tasks that require the root user.',
        ],
        [
          'Only the root user can recover from this, so the root user’s credentials must be protected with MFA and kept available.',
          'Correct. Because some recovery tasks need the root user, its credentials should be secured, not discarded.',
        ],
        [
          'Any IAM user with AdministratorAccess can override an explicit deny in a bucket policy.',
          'An explicit deny applies to IAM principals regardless of their identity-based policies.',
        ],
        [
          'AWS Support deletes the bucket policy when the administrator signs in as an IAM user.',
          'AWS Support does not override customer bucket policies for IAM users.',
        ],
        [
          'The bucket must be deleted and recreated.',
          'The root user can remove the policy, so the bucket can be kept.',
        ],
      ],
      a: ['a', 'b'],
      x: 'Some tasks require the root user, including editing or deleting an S3 bucket policy that denies all principals. This is one reason to keep root user credentials secure and available rather than unused and forgotten.',
      r: ['iamRootUser', 's3BucketPolicies'],
      tags: ['Root user', 'Bucket policy'],
    },
    {
      n: 37,
      t: '1.1',
      lv: 'm',
      q: 'A security team wants IAM users to be able to manage their own passwords and MFA devices, but not to do anything else in the account until they have signed in with MFA. Which policy design meets this requirement?',
      o: [
        [
          'Allow self-service credential actions, and deny all other actions when aws:MultiFactorAuthPresent is false or missing.',
          'Correct. This is the documented pattern for letting users set up MFA while requiring it for everything else.',
        ],
        [
          'Require MFA in the account password policy.',
          'The password policy controls password rules. It cannot require MFA for API actions.',
        ],
        [
          'Attach AdministratorAccess and ask users to turn on MFA.',
          'This grants full access without enforcing MFA.',
        ],
        [
          'Use an SCP to require MFA for the root user only.',
          'This doesn’t affect the IAM users in question.',
        ],
      ],
      a: 'a',
      x: 'An identity-based policy can allow users to manage their own credentials and deny other actions unless the request was authenticated with MFA, using the aws:MultiFactorAuthPresent condition key.',
      r: ['iamMfaPolicyExample', 'iamMfa'],
      tags: ['MFA', 'IAM policy'],
    },
    {
      n: 38,
      t: '1.1',
      lv: 'm',
      q: 'A company wants the finance group to be able to use the AWS API only from the corporate network range 203.0.113.0/24. How can a solutions architect enforce this for the group’s IAM users?',
      o: [
        [
          'Attach a policy to the group that denies all actions when aws:SourceIp is not in 203.0.113.0/24.',
          'Correct. A deny with the aws:SourceIp condition blocks requests from other networks.',
        ],
        ['Add the IP range to the group’s name.', 'Names are not evaluated in policy decisions.'],
        [
          'Create a security group that allows only the corporate range.',
          'Security groups filter network traffic to resources such as EC2 instances, not calls to AWS APIs.',
        ],
        [
          'Use a network ACL on the default VPC.',
          'Network ACLs filter traffic in VPC subnets, not API requests to AWS service endpoints.',
        ],
      ],
      a: 'a',
      x: 'The aws:SourceIp condition key holds the requester’s public IP address. A Deny statement with NotIpAddress on that key limits API access to the listed range. (Requests that AWS services make on your behalf need care with this pattern.)',
      r: ['iamConditionKeys'],
      tags: ['Condition keys', 'IAM policy'],
    },
    {
      n: 39,
      t: '1.1',
      lv: 'm',
      q: 'A company enables an AWS CloudTrail trail for its whole AWS Organizations organization from the management account. Which statement is true about member accounts?',
      o: [
        [
          'Member accounts can see the organization trail but cannot modify or delete it.',
          'Correct. An organization trail is created in the management account and applies to all member accounts, which can’t change it.',
        ],
        [
          'Each member account must enable the trail before it logs anything.',
          'The organization trail logs member accounts automatically.',
        ],
        [
          'Member account administrators can stop logging for their own account.',
          'Members cannot modify the organization trail.',
        ],
        [
          'The trail logs only the management account.',
          'An organization trail logs events for all accounts in the organization.',
        ],
      ],
      a: 'a',
      x: 'An organization trail logs events for the management account and all member accounts. Users in member accounts can see the trail but cannot modify or delete it, which supports central, tamper-resistant auditing.',
      r: ['cloudTrailOrgTrail'],
      tags: ['CloudTrail', 'Multi-account'],
    },
    {
      n: 40,
      t: '1.1',
      lv: 'h',
      q: 'A company’s Amazon S3 bucket must accept requests only from IAM roles in its own organization, and a security engineer also wants to guarantee that nobody can make the bucket public by mistake. Which TWO controls together meet these requirements? (Select TWO.)',
      o: [
        [
          'A bucket policy that denies requests when aws:PrincipalOrgID does not match the organization ID',
          'Correct. This rejects principals from outside the organization.',
        ],
        [
          'S3 Block Public Access turned on for the account',
          'Correct. Block Public Access overrides bucket policies and ACLs that would grant public access.',
        ],
        [
          'Amazon Macie automated sensitive data discovery',
          'Macie finds sensitive data and reports public buckets, but it doesn’t prevent public access.',
        ],
        [
          'An S3 Lifecycle rule',
          'Lifecycle rules transition or expire objects. They don’t control access.',
        ],
        [
          'S3 Transfer Acceleration',
          'Transfer Acceleration speeds up transfers. It doesn’t affect access.',
        ],
      ],
      a: ['a', 'b'],
      x: 'An organization ID condition in the bucket policy limits access to the organization’s principals, and S3 Block Public Access prevents any policy or ACL from granting public access.',
      r: ['s3BlockPublicAccess', 'iamConditionKeys'],
      tags: ['S3 Block Public Access', 'Bucket policy'],
    },
  ],
);
