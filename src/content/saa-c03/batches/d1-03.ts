import { defineQuestions } from '../author';

/** SAA-C03 Domain 1, task 1.3: determine appropriate data security controls. */
export default defineQuestions(
  { domain: 'D1', written: '2026-11-05', status: 'checked', checked: '2026-11-05' },
  [
    {
      n: 81,
      t: '1.3',
      lv: 'm',
      q: 'A company must encrypt objects in an Amazon S3 bucket at rest, control who can use the encryption key, and see each use of the key in AWS CloudTrail. Which option meets these requirements?',
      o: [
        [
          'Server-side encryption with a customer managed AWS KMS key (SSE-KMS)',
          'Correct. The company controls the key policy, and every use of the KMS key is logged in CloudTrail.',
        ],
        [
          'Server-side encryption with Amazon S3 managed keys (SSE-S3)',
          'SSE-S3 encrypts data, but S3 manages the keys, so the company can’t control or audit key use separately.',
        ],
        [
          'No encryption setting, because S3 Block Public Access protects the data',
          'Block Public Access controls access, not encryption at rest.',
        ],
        [
          'S3 Transfer Acceleration',
          'Transfer Acceleration speeds up transfers and has nothing to do with encryption.',
        ],
      ],
      a: 'a',
      x: 'With SSE-KMS and a customer managed key, the key policy controls who can use the key, and AWS KMS records the API calls in CloudTrail, giving an audit trail of key usage.',
      r: ['s3SseKms', 'kmsConcepts'],
      tags: ['SSE-KMS', 'AWS KMS'],
    },
    {
      n: 82,
      t: '1.3',
      lv: 'e',
      q: 'What happens to new objects uploaded to an Amazon S3 bucket when no encryption setting has been configured?',
      o: [
        [
          'They are encrypted with server-side encryption using S3 managed keys (SSE-S3).',
          'Correct. S3 applies SSE-S3 as the base level of encryption for all new objects.',
        ],
        ['They are stored unencrypted.', 'S3 now encrypts all new object uploads by default.'],
        [
          'They are encrypted with the account’s default KMS customer managed key.',
          'A customer managed key is used only if the bucket or request specifies it.',
        ],
        [
          'They are rejected until encryption is configured.',
          'Uploads succeed and are encrypted with SSE-S3.',
        ],
      ],
      a: 'a',
      x: 'All Amazon S3 buckets have encryption configured by default, and new objects are encrypted with SSE-S3 unless another server-side encryption option is chosen.',
      r: ['s3DefaultEncryption'],
      tags: ['Amazon S3', 'Default encryption'],
    },
    {
      n: 83,
      t: '1.3',
      lv: 'm',
      q: 'A data lake bucket uses SSE-KMS and receives millions of requests per day. AWS KMS request costs have become significant. What should a solutions architect do to reduce them without changing the encryption type?',
      o: [
        [
          'Enable S3 Bucket Keys for the bucket.',
          'Correct. A bucket-level key reduces the number of requests from S3 to KMS, which lowers KMS costs.',
        ],
        [
          'Switch to client-side encryption.',
          'This changes the encryption model and moves key handling into the application.',
        ],
        ['Turn off KMS key rotation.', 'Rotation doesn’t drive per-request costs.'],
        [
          'Use S3 Intelligent-Tiering.',
          'Storage classes affect storage costs, not KMS request costs.',
        ],
      ],
      a: 'a',
      x: 'S3 Bucket Keys let S3 use a short-lived bucket-level key derived from the KMS key, which reduces traffic from S3 to KMS and can reduce KMS request costs significantly.',
      r: ['s3BucketKeys'],
      tags: ['S3 Bucket Keys', 'Cost'],
    },
    {
      n: 84,
      t: '1.3',
      lv: 'm',
      q: 'A company’s policy says that it must generate and hold its own encryption keys outside AWS. Objects in Amazon S3 must still be encrypted on the server side. Which option meets this requirement?',
      o: [
        [
          'Server-side encryption with customer-provided keys (SSE-C)',
          'Correct. The client supplies the key with each request; S3 uses it to encrypt or decrypt and does not store the key.',
        ],
        ['SSE-S3', 'With SSE-S3, S3 creates and manages the keys.'],
        [
          'SSE-KMS with an AWS managed key',
          'AWS managed keys are created and controlled by AWS on the customer’s behalf.',
        ],
        ['Amazon Macie', 'Macie discovers sensitive data and doesn’t encrypt it.'],
      ],
      a: 'a',
      x: 'With SSE-C, you manage the encryption keys and provide them in each request. Amazon S3 performs the encryption and decryption but does not keep a copy of the key.',
      r: ['s3SseC', 's3Encryption'],
      tags: ['SSE-C'],
    },
    {
      n: 85,
      t: '1.3',
      lv: 'h',
      q: 'Financial records stored in Amazon S3 must not be deleted or overwritten by anyone, including the root user, for seven years. Which configuration meets this requirement?',
      o: [
        [
          'S3 Object Lock in compliance mode with a seven-year retention period',
          'Correct. In compliance mode, no user, including the root user, can overwrite or delete a protected object version until its retention period ends.',
        ],
        [
          'S3 Object Lock in governance mode with a seven-year retention period',
          'In governance mode, users with special permissions can bypass the retention settings.',
        ],
        [
          'S3 Versioning with an S3 Lifecycle rule',
          'Versioning keeps old versions, but authorized users can still delete them.',
        ],
        [
          'A bucket policy that denies s3:DeleteObject',
          'An administrator or the root user can change the bucket policy.',
        ],
      ],
      a: 'a',
      x: 'S3 Object Lock provides write-once-read-many (WORM) protection. Compliance mode prevents anyone, including the root user, from deleting or overwriting locked object versions or shortening the retention period.',
      r: ['s3ObjectLock'],
      tags: ['S3 Object Lock', 'WORM'],
    },
    {
      n: 86,
      t: '1.3',
      lv: 'm',
      q: 'Which statement about S3 Object Lock is correct?',
      o: [
        [
          'Object Lock works only on buckets that have S3 Versioning enabled.',
          'Correct. Object Lock protects specific object versions, so versioning is required.',
        ],
        [
          'Object Lock encrypts objects with a separate key.',
          'Object Lock controls deletion and overwriting, not encryption.',
        ],
        [
          'Governance mode cannot be bypassed by anyone.',
          'That describes compliance mode. Governance mode can be bypassed with special permissions.',
        ],
        [
          'Object Lock is available only in the S3 Glacier storage classes.',
          'Object Lock works with objects in S3 buckets across storage classes.',
        ],
      ],
      a: 'a',
      x: 'S3 Object Lock applies to object versions and requires S3 Versioning on the bucket. It offers retention periods and legal holds, in governance or compliance mode.',
      r: ['s3ObjectLock', 's3Versioning'],
      tags: ['S3 Object Lock'],
    },
    {
      n: 87,
      t: '1.3',
      lv: 'm',
      q: 'A company wants to protect objects in an S3 bucket against accidental deletion and overwrites, while being able to restore earlier versions. Which feature should it enable first?',
      o: [
        [
          'S3 Versioning',
          'Correct. Versioning keeps every version of an object, so deleted or overwritten objects can be recovered.',
        ],
        ['S3 Transfer Acceleration', 'This speeds up transfers.'],
        ['S3 Requester Pays', 'This changes who pays for requests and data transfer.'],
        ['S3 Inventory', 'Inventory lists objects; it doesn’t keep old versions.'],
      ],
      a: 'a',
      x: 'With versioning enabled, a delete adds a delete marker and an overwrite creates a new version, so earlier versions remain available for restore.',
      r: ['s3Versioning'],
      tags: ['S3 Versioning', 'Data recovery'],
    },
    {
      n: 88,
      t: '1.3',
      lv: 'h',
      q: 'A security team wants deleting object versions or changing the versioning state of a critical bucket to require a second authentication factor. What should be configured?',
      o: [
        [
          'MFA delete on the bucket, configured by the bucket owner’s root user',
          'Correct. MFA delete requires an MFA code to permanently delete versions or change the versioning state, and only the root user can enable it.',
        ],
        [
          'An IAM policy that requires MFA to read objects',
          'This affects reads, not the specific delete and versioning actions.',
        ],
        [
          'S3 Object Lock in governance mode',
          'Governance mode retains objects but doesn’t require MFA for deletes.',
        ],
        [
          'Amazon GuardDuty S3 Protection',
          'GuardDuty detects suspicious activity; it doesn’t require MFA.',
        ],
      ],
      a: 'a',
      x: 'MFA delete adds a requirement for MFA to permanently delete an object version or suspend versioning. Enabling it is one of the tasks that require the root user.',
      r: ['s3MfaDelete', 'iamRootUser'],
      tags: ['MFA delete', 'Amazon S3'],
    },
    {
      n: 89,
      t: '1.3',
      lv: 'm',
      q: 'A company has an unencrypted Amazon RDS for MySQL DB instance. It must now be encrypted at rest. What should a solutions architect do?',
      o: [
        [
          'Create a snapshot, copy it with encryption enabled using a KMS key, and restore a new DB instance from the encrypted copy.',
          'Correct. Encryption can’t be turned on for an existing unencrypted instance, but an encrypted snapshot copy can be restored.',
        ],
        [
          'Modify the DB instance and select encryption.',
          'RDS doesn’t allow encrypting an existing unencrypted DB instance in place.',
        ],
        [
          'Enable EBS encryption by default in the Region.',
          'This applies to new EBS volumes, not to existing RDS storage.',
        ],
        [
          'Create an encrypted read replica of the unencrypted instance.',
          'You can’t create an encrypted read replica from an unencrypted DB instance.',
        ],
      ],
      a: 'a',
      x: 'RDS encryption is set at creation time. For an existing unencrypted instance, copy a snapshot with encryption turned on, restore from it, and move the application to the new instance.',
      r: ['rdsEncryption'],
      tags: ['Amazon RDS', 'Encryption at rest'],
    },
    {
      n: 90,
      t: '1.3',
      lv: 'm',
      q: 'An Amazon RDS DB instance is encrypted with an AWS KMS key. Which of its related resources are also encrypted?',
      o: [
        [
          'Its automated backups, snapshots and read replicas',
          'Correct. Encryption at rest covers the underlying storage, automated backups, read replicas and snapshots.',
        ],
        [
          'Only the primary DB instance storage; snapshots must be encrypted separately',
          'Snapshots of an encrypted instance are encrypted too.',
        ],
        [
          'Only data written after the next maintenance window',
          'Encryption applies to all data on the encrypted instance.',
        ],
        [
          'None, because RDS encryption applies only to network traffic',
          'RDS encryption at rest protects stored data; TLS protects traffic.',
        ],
      ],
      a: 'a',
      x: 'For an encrypted RDS DB instance, the data at rest in the underlying storage is encrypted, as are its automated backups, read replicas and snapshots.',
      r: ['rdsEncryption'],
      tags: ['Amazon RDS', 'Encryption at rest'],
    },
    {
      n: 91,
      t: '1.3',
      lv: 'm',
      q: 'A security policy requires that every new Amazon EBS volume in an AWS Region is encrypted, even if a user forgets to select encryption. What is the simplest way to meet this requirement?',
      o: [
        [
          'Enable EBS encryption by default for the account in that Region.',
          'Correct. With encryption by default, new volumes and snapshot copies are encrypted automatically.',
        ],
        [
          'Ask users to tick the encryption box when creating volumes.',
          'This relies on people remembering and isn’t enforced.',
        ],
        ['Use an S3 bucket policy.', 'Bucket policies apply to S3, not EBS.'],
        [
          'Encrypt volumes from inside the operating system only.',
          'OS-level encryption is possible but isn’t the simplest way to guarantee EBS encryption at rest.',
        ],
      ],
      a: 'a',
      x: 'EBS encryption by default is a Regional account setting. Once enabled, new EBS volumes and snapshot copies are always encrypted, with the default key or one you choose.',
      r: ['ebsEncryptionByDefault', 'ebsEncryption'],
      tags: ['Amazon EBS', 'Encryption by default'],
    },
    {
      n: 92,
      t: '1.3',
      lv: 'h',
      q: 'A company copies encrypted EBS snapshots from us-east-1 to eu-west-1 for disaster recovery. What is required for the copy to work?',
      o: [
        [
          'A KMS key in eu-west-1 that is used to encrypt the snapshot copy',
          'Correct. KMS keys are Regional, so the copy in the destination Region is encrypted with a key in that Region.',
        ],
        [
          'Nothing; the source Region’s KMS key works in every Region.',
          'Single-Region KMS keys can’t be used outside their Region.',
        ],
        [
          'The snapshot must be decrypted before copying.',
          'Encrypted snapshots can be copied directly with re-encryption.',
        ],
        [
          'An S3 bucket in eu-west-1 to hold the snapshot.',
          'EBS snapshots are managed by EBS; you don’t provide a bucket.',
        ],
      ],
      a: 'a',
      x: 'When copying an encrypted snapshot to another Region, you specify a KMS key in the destination Region to encrypt the copy, because KMS keys belong to a single Region unless they are multi-Region keys.',
      r: ['ebsEncryption', 'kmsConcepts'],
      tags: ['Amazon EBS', 'Cross-Region copy'],
    },
    {
      n: 93,
      t: '1.3',
      lv: 'm',
      q: 'An application encrypts data in us-east-1 and must decrypt it in eu-west-1 during a failover, without re-encrypting the data or calling across Regions. Which AWS KMS feature fits?',
      o: [
        [
          'Multi-Region keys',
          'Correct. Related multi-Region keys share the same key material and key ID, so data encrypted in one Region can be decrypted in another.',
        ],
        [
          'Automatic key rotation',
          'Rotation changes key material over time; it doesn’t make a key usable in another Region.',
        ],
        ['Key grants', 'Grants give permissions on a key; they don’t extend it to another Region.'],
        ['AWS managed keys', 'AWS managed keys are Regional and can’t be replicated.'],
      ],
      a: 'a',
      x: 'AWS KMS multi-Region keys are interoperable keys in different Regions with the same key material and key ID, which helps disaster recovery and global applications.',
      r: ['kmsMultiRegion'],
      tags: ['AWS KMS', 'Multi-Region keys'],
    },
    {
      n: 94,
      t: '1.3',
      lv: 'm',
      q: 'A company uses a customer managed AWS KMS key and must change its cryptographic material every year, without changing the key ID or re-encrypting existing data by hand. What should it do?',
      o: [
        [
          'Enable automatic key rotation for the customer managed key.',
          'Correct. AWS KMS generates new key material on schedule and keeps older material to decrypt existing data.',
        ],
        [
          'Create a new key every year and update all applications.',
          'This is manual rotation and requires changing references to the key.',
        ],
        [
          'Delete the key every year.',
          'Deleting a key makes data encrypted with it unrecoverable.',
        ],
        [
          'Disable the key every year.',
          'Disabling stops the key from being used; it doesn’t rotate it.',
        ],
      ],
      a: 'a',
      x: 'Automatic rotation for customer managed keys creates new key material on a schedule (yearly by default) while the key ID and ARN stay the same. Earlier material is kept so that existing ciphertext can still be decrypted.',
      r: ['kmsRotation'],
      tags: ['AWS KMS', 'Key rotation'],
    },
    {
      n: 95,
      t: '1.3',
      lv: 'h',
      q: 'An administrator plans to delete an AWS KMS key that might still protect old data. What should a solutions architect recommend first?',
      o: [
        [
          'Disable the key and monitor for failed use, because a deleted key can’t be recovered and its data can’t be decrypted.',
          'Correct. Disabling is reversible, and a deletion is scheduled with a waiting period, which gives time to find remaining uses.',
        ],
        [
          'Delete it immediately; KMS keeps a backup for 90 days.',
          'Once deleted, the key and its material are gone.',
        ],
        [
          'Rotate it, which deletes the old material.',
          'Rotation keeps old material so data stays decryptable.',
        ],
        [
          'Export the key material from KMS before deleting.',
          'Key material created in KMS can’t be exported.',
        ],
      ],
      a: 'a',
      x: 'Deleting a KMS key is destructive and irreversible: data encrypted under it becomes unrecoverable. KMS enforces a waiting period of 7 to 30 days, and AWS recommends disabling the key first to check whether it is still needed.',
      r: ['kmsDeleting'],
      tags: ['AWS KMS', 'Key deletion'],
    },
    {
      n: 96,
      t: '1.3',
      lv: 'm',
      q: 'A company needs single-tenant hardware security modules that it controls exclusively, for keys used by a custom application, to meet a regulatory requirement. Which service should it use?',
      o: [
        [
          'AWS CloudHSM',
          'Correct. CloudHSM provides dedicated HSMs in a cluster that the customer controls.',
        ],
        [
          'AWS KMS with AWS managed keys',
          'AWS managed keys are created and managed by AWS in multi-tenant HSMs.',
        ],
        ['AWS Secrets Manager', 'Secrets Manager stores secrets; it isn’t a dedicated HSM.'],
        ['AWS Certificate Manager', 'ACM manages TLS certificates.'],
      ],
      a: 'a',
      x: 'AWS CloudHSM offers single-tenant hardware security modules in your VPC. You manage the keys and users, and AWS manages the hardware.',
      r: ['cloudHsm'],
      tags: ['AWS CloudHSM'],
    },
    {
      n: 97,
      t: '1.3',
      lv: 'm',
      q: 'A public website on an Application Load Balancer needs a TLS certificate that renews automatically without manual work. What should a solutions architect use?',
      o: [
        [
          'A public certificate from AWS Certificate Manager with DNS validation, attached to the ALB listener',
          'Correct. ACM manages renewal for certificates it issues, and DNS validation lets renewal happen automatically.',
        ],
        [
          'A certificate bought from a third party and imported into ACM',
          'ACM doesn’t renew imported certificates.',
        ],
        [
          'A self-signed certificate on each instance',
          'Browsers don’t trust self-signed certificates, and they don’t renew automatically.',
        ],
        ['An AWS KMS key', 'KMS keys aren’t TLS certificates.'],
      ],
      a: 'a',
      x: 'ACM provides public TLS certificates for integrated services such as Elastic Load Balancing and CloudFront, and renews certificates it issued automatically when it can validate the domain, for example through a DNS record.',
      r: ['acm', 'acmRenewal'],
      tags: ['AWS Certificate Manager', 'TLS'],
    },
    {
      n: 98,
      t: '1.3',
      lv: 'h',
      q: 'A team requests an ACM certificate in eu-west-1 for a CloudFront distribution, but the certificate doesn’t appear when they configure the distribution. What is the cause?',
      o: [
        [
          'CloudFront uses ACM certificates only from the US East (N. Virginia) Region (us-east-1).',
          'Correct. To use an ACM certificate with CloudFront, request or import it in us-east-1.',
        ],
        [
          'CloudFront doesn’t support ACM certificates.',
          'CloudFront supports ACM certificates from us-east-1.',
        ],
        [
          'The certificate must be imported, not requested.',
          'Both requested and imported certificates work if they are in us-east-1.',
        ],
        [
          'The distribution must be in eu-west-1.',
          'CloudFront distributions are global, not Regional.',
        ],
      ],
      a: 'a',
      x: 'ACM certificates are Regional. CloudFront is a global service that uses certificates from the US East (N. Virginia) Region.',
      r: ['cloudFrontHttpsReqs'],
      tags: ['AWS Certificate Manager', 'Amazon CloudFront'],
    },
    {
      n: 99,
      t: '1.3',
      lv: 'm',
      q: 'An S3 bucket must reject any request that is not sent over HTTPS. What should be added to the bucket policy?',
      o: [
        [
          'A Deny statement for all S3 actions when aws:SecureTransport is false',
          'Correct. This condition key is false for requests over plain HTTP, so the deny blocks them.',
        ],
        [
          'An Allow statement for s3:GetObject from 0.0.0.0/0',
          'This would allow access; it doesn’t enforce HTTPS.',
        ],
        ['An S3 Lifecycle rule', 'Lifecycle rules manage object storage and expiration.'],
        ['A requirement for SSE-S3', 'SSE-S3 is encryption at rest, not in transit.'],
      ],
      a: 'a',
      x: 'Using a bucket policy that denies requests where aws:SecureTransport is false enforces encryption in transit for all access to the bucket.',
      r: ['s3SecurityBestPractices', 'iamConditionKeys'],
      tags: ['Encryption in transit', 'Bucket policy'],
    },
    {
      n: 100,
      t: '1.3',
      lv: 'm',
      q: 'A company wants centralized, policy-based backups of Amazon EBS, Amazon RDS, Amazon DynamoDB and Amazon EFS across accounts, with copies in a second Region. Which service should it use?',
      o: [
        [
          'AWS Backup',
          'Correct. AWS Backup centralizes backup plans across supported services and accounts and can copy backups to other Regions and accounts.',
        ],
        ['Amazon S3 Lifecycle rules', 'Lifecycle rules apply only to objects in S3.'],
        [
          'AWS DataSync',
          'DataSync transfers files; it doesn’t manage backup plans for these services.',
        ],
        [
          'Amazon Data Lifecycle Manager only',
          'Data Lifecycle Manager automates EBS snapshots and AMIs, not RDS, DynamoDB or EFS backups.',
        ],
      ],
      a: 'a',
      x: 'AWS Backup is a managed service to centralize and automate data protection across AWS services, with backup plans, cross-Region and cross-account copies, and AWS Organizations integration.',
      r: ['awsBackup', 'backupCrossRegion'],
      tags: ['AWS Backup'],
    },
    {
      n: 101,
      t: '1.3',
      lv: 'h',
      q: 'A company must make sure that backups in its AWS Backup vault can’t be deleted before their retention period ends, even by an administrator whose credentials are compromised. What should it configure?',
      o: [
        [
          'AWS Backup Vault Lock in compliance mode',
          'Correct. Once the grace period ends, a compliance-mode Vault Lock can’t be changed or removed, and recovery points can’t be deleted early.',
        ],
        [
          'An IAM policy that denies backup deletion',
          'An administrator could change the IAM policy.',
        ],
        ['Versioning on the backup vault', 'Backup vaults don’t have a versioning setting.'],
        ['A CloudWatch alarm on deletions', 'An alarm reports deletions after they happen.'],
      ],
      a: 'a',
      x: 'AWS Backup Vault Lock enforces write-once-read-many (WORM) settings on a vault. In compliance mode, after the grace time, nobody can alter the lock or delete backups before their retention ends.',
      r: ['backupVaultLock'],
      tags: ['AWS Backup', 'Vault Lock'],
    },
    {
      n: 102,
      t: '1.3',
      lv: 'm',
      q: 'A compliance team requires a copy of all objects in a bucket to be stored automatically in another AWS Region, in a bucket owned by a separate security account. Which feature meets this requirement?',
      o: [
        [
          'S3 Cross-Region Replication to a bucket in the security account',
          'Correct. Replication copies new objects automatically across Regions and accounts.',
        ],
        [
          'S3 Transfer Acceleration',
          'This speeds up transfers to a bucket; it doesn’t copy objects.',
        ],
        ['S3 Object Lock', 'Object Lock prevents deletion; it doesn’t create copies.'],
        ['S3 Inventory', 'Inventory reports on objects; it doesn’t copy them.'],
      ],
      a: 'a',
      x: 'S3 Replication copies objects asynchronously between buckets in the same or different Regions and accounts. Both buckets need versioning enabled.',
      r: ['s3Replication'],
      tags: ['S3 Replication'],
    },
    {
      n: 103,
      t: '1.3',
      lv: 'e',
      q: 'A company’s data retention policy says that application logs in Amazon S3 must be deleted after 400 days. How can this be done automatically?',
      o: [
        [
          'An S3 Lifecycle rule with an expiration action after 400 days',
          'Correct. Lifecycle expiration deletes objects automatically when they reach the configured age.',
        ],
        [
          'S3 Object Lock in compliance mode',
          'Object Lock prevents deletion; it doesn’t delete objects.',
        ],
        ['S3 Versioning', 'Versioning keeps objects; it doesn’t delete them.'],
        ['A manual monthly clean-up', 'This isn’t automatic and is easy to miss.'],
      ],
      a: 'a',
      x: 'S3 Lifecycle configurations can transition objects to other storage classes and expire them after a set time, which implements retention policies automatically.',
      r: ['s3Lifecycle'],
      tags: ['S3 Lifecycle', 'Data retention'],
    },
    {
      n: 104,
      t: '1.3',
      lv: 'e',
      q: 'How is data in Amazon DynamoDB tables protected at rest?',
      o: [
        [
          'All tables are encrypted at rest by default, with an AWS owned key unless another KMS key is chosen.',
          'Correct. DynamoDB encryption at rest is always on.',
        ],
        [
          'Tables are unencrypted unless the application encrypts each item.',
          'DynamoDB encrypts all data at rest by default.',
        ],
        ['Only global tables are encrypted.', 'All tables are encrypted at rest.'],
        [
          'Encryption must be enabled with CloudHSM.',
          'CloudHSM isn’t required for DynamoDB encryption.',
        ],
      ],
      a: 'a',
      x: 'DynamoDB encrypts all user data at rest. You can choose an AWS owned key (the default), an AWS managed key, or a customer managed key.',
      r: ['dynamodbEncryption'],
      tags: ['Amazon DynamoDB', 'Encryption at rest'],
    },
    {
      n: 105,
      t: '1.3',
      lv: 'm',
      q: 'Which statement about AWS KMS key policies is correct?',
      o: [
        [
          'Every KMS key has exactly one key policy, and IAM policies can grant access to a key only if its key policy allows that.',
          'Correct. The key policy is the primary access control for a KMS key.',
        ],
        [
          'KMS keys don’t use resource-based policies; only IAM policies control them.',
          'Key policies are resource-based policies that every key must have.',
        ],
        ['A key policy can be shared by many keys.', 'Each key has its own key policy.'],
        [
          'The root user can always use any key without a key policy.',
          'Access depends on the key policy; the default key policy allows the account, which enables IAM policies.',
        ],
      ],
      a: 'a',
      x: 'Key policies are the primary way to control access to KMS keys. Every key has exactly one key policy. IAM policies can be used only when the key policy allows the account, which the default key policy does.',
      r: ['kmsKeyPolicies'],
      tags: ['AWS KMS', 'Key policy'],
    },
    {
      n: 106,
      t: '1.3',
      lv: 'm',
      q: 'An auditor asks a company for AWS’s SOC 2 report and PCI DSS attestation of compliance. Where can the company get these documents?',
      o: [
        [
          'AWS Artifact',
          'Correct. Artifact provides on-demand access to AWS security and compliance reports.',
        ],
        ['AWS Config', 'Config evaluates the company’s own resources.'],
        ['AWS Trusted Advisor', 'Trusted Advisor gives best-practice checks.'],
        ['Amazon Inspector', 'Inspector scans for vulnerabilities.'],
      ],
      a: 'a',
      x: 'AWS Artifact is the self-service portal for AWS compliance reports, such as SOC and PCI reports, and for agreements.',
      r: ['artifact'],
      tags: ['AWS Artifact', 'Compliance'],
    },
    {
      n: 107,
      t: '1.3',
      lv: 'm',
      q: 'A company must show continuously that its resources meet a set of compliance rules, such as encrypted volumes and buckets with no public access, across many accounts. Which feature helps package and deploy these rules?',
      o: [
        [
          'AWS Config conformance packs',
          'Correct. A conformance pack is a collection of Config rules and remediation actions deployed as one unit across accounts.',
        ],
        [
          'AWS Artifact',
          'Artifact holds AWS’s own compliance reports, not checks of your resources.',
        ],
        ['AWS Budgets', 'Budgets tracks costs.'],
        [
          'Amazon Inspector',
          'Inspector scans software for vulnerabilities, not configuration compliance.',
        ],
      ],
      a: 'a',
      x: 'Conformance packs bundle AWS Config rules and remediation actions so they can be deployed and evaluated together in an account or across an organization.',
      r: ['configConformance'],
      tags: ['AWS Config', 'Compliance'],
    },
    {
      n: 108,
      t: '1.3',
      lv: 'h',
      q: 'An application must encrypt sensitive fields before sending them to any AWS service, so that data is protected even from administrators of the storage service. Which approach meets this requirement?',
      o: [
        [
          'Client-side encryption with the AWS Encryption SDK, using a KMS key',
          'Correct. Data is encrypted in the application before it is sent, so the storage service only stores ciphertext.',
        ],
        ['SSE-S3', 'Server-side encryption happens after the data reaches the service.'],
        ['TLS only', 'TLS protects data in transit, but the service receives plaintext.'],
        ['EBS encryption by default', 'This encrypts volumes at rest on the server side.'],
      ],
      a: 'a',
      x: 'Client-side encryption encrypts data before it leaves the application. The AWS Encryption SDK implements envelope encryption and can use AWS KMS keys to protect data keys.',
      r: ['encryptionSdk'],
      tags: ['Client-side encryption'],
    },
    {
      n: 109,
      t: '1.3',
      lv: 'm',
      q: 'Which TWO steps help protect database traffic between an application and an Amazon RDS for PostgreSQL DB instance? (Select TWO.)',
      o: [
        [
          'Connect with SSL/TLS and verify the server certificate in the client.',
          'Correct. TLS encrypts traffic in transit, and certificate verification protects against impersonation.',
        ],
        [
          'Require SSL connections with the rds.force_ssl parameter in the DB parameter group.',
          'Correct. The parameter makes the database reject unencrypted connections.',
        ],
        ['Enable encryption at rest.', 'Encryption at rest protects stored data, not traffic.'],
        ['Enable Multi-AZ.', 'Multi-AZ improves availability, not encryption.'],
        ['Increase the instance size.', 'Size has nothing to do with encryption.'],
      ],
      a: ['a', 'b'],
      x: 'RDS supports SSL/TLS for connections. For PostgreSQL, setting rds.force_ssl to 1 rejects unencrypted connections (it is on by default from version 15), and clients should verify the server certificate with sslmode=verify-full.',
      r: ['rdsSsl', 'rdsPostgresSsl'],
      tags: ['Amazon RDS', 'Encryption in transit'],
    },
    {
      n: 110,
      t: '1.3',
      lv: 'e',
      q: 'A company needs to know which of its S3 buckets hold credit card numbers, so it can apply stricter controls to them. Which service should it use?',
      o: [
        [
          'Amazon Macie',
          'Correct. Macie finds and classifies sensitive data such as financial information in S3.',
        ],
        ['AWS Backup', 'Backup protects data copies; it doesn’t classify data.'],
        ['AWS Shield', 'Shield protects against DDoS.'],
        ['AWS Certificate Manager', 'ACM manages TLS certificates.'],
      ],
      a: 'a',
      x: 'Data classification is the first step to choosing the right controls. Amazon Macie discovers sensitive data in S3 and reports where it is.',
      r: ['macie'],
      tags: ['Amazon Macie', 'Data classification'],
    },
    {
      n: 111,
      t: '1.3',
      lv: 'h',
      q: 'A company uses SSE-KMS with a customer managed key for an S3 bucket. A role in another account has s3:GetObject permission in the bucket policy but receives AccessDenied when downloading objects. What is the most likely missing permission?',
      o: [
        [
          'The KMS key policy (and the role’s IAM policy) must allow kms:Decrypt for the role.',
          'Correct. Reading an SSE-KMS object also requires permission to use the KMS key.',
        ],
        ['The role needs s3:PutObject.', 'PutObject is for uploads, not downloads.'],
        ['The bucket needs S3 Transfer Acceleration.', 'This affects speed, not access.'],
        [
          'The role must be in the same Region as the key.',
          'Cross-account access to a key isn’t limited by the caller’s Region in this way; the missing piece is the decrypt permission.',
        ],
      ],
      a: 'a',
      x: 'To download an object encrypted with SSE-KMS, a principal needs S3 permissions and permission to call kms:Decrypt on the key. For cross-account access, both the key policy and the caller’s IAM policy must allow it.',
      r: ['s3SseKms', 'kmsKeyPolicies'],
      tags: ['SSE-KMS', 'Cross-account access'],
    },
    {
      n: 112,
      t: '1.3',
      lv: 'm',
      q: 'Which AWS KMS key type should a company use if it wants to define the key policy, turn rotation on or off, and be able to disable or schedule deletion of the key?',
      o: [
        [
          'A customer managed key',
          'Correct. Customer managed keys are created, owned and managed by the customer.',
        ],
        [
          'An AWS managed key',
          'AWS managed keys are created by AWS services in your account; you can’t change their key policies or manage their lifecycle.',
        ],
        [
          'An AWS owned key',
          'AWS owned keys are owned and managed by AWS services and aren’t visible in your account.',
        ],
        ['An SSE-C key', 'SSE-C keys are customer-provided keys outside KMS.'],
      ],
      a: 'a',
      x: 'Customer managed keys give full control: key policies, IAM policies, grants, enabling and disabling, rotation and scheduled deletion. AWS managed and AWS owned keys don’t offer this control.',
      r: ['kmsConcepts'],
      tags: ['AWS KMS', 'Key types'],
    },
    {
      n: 113,
      t: '1.3',
      lv: 'm',
      q: 'A company’s legal team may need to keep specific S3 objects indefinitely during litigation, regardless of their normal retention period, until the hold is removed. Which feature supports this?',
      o: [
        [
          'An S3 Object Lock legal hold',
          'Correct. A legal hold prevents deletion of an object version until the hold is removed, and it has no fixed end date.',
        ],
        ['An S3 Lifecycle expiration rule', 'Expiration deletes objects; it doesn’t hold them.'],
        ['S3 Intelligent-Tiering', 'This moves objects between access tiers to save cost.'],
        ['S3 Requester Pays', 'This changes billing for requests.'],
      ],
      a: 'a',
      x: 'Object Lock offers two controls: retention periods and legal holds. A legal hold protects an object version until it is explicitly removed, independent of any retention period.',
      r: ['s3ObjectLock'],
      tags: ['S3 Object Lock', 'Legal hold'],
    },
    {
      n: 114,
      t: '1.3',
      lv: 'h',
      q: 'A company must be able to restore its production data even if its main AWS account is compromised and an attacker deletes backups there. Which TWO actions improve this resilience? (Select TWO.)',
      o: [
        [
          'Copy backups with AWS Backup to a vault in a separate backup account.',
          'Correct. A different account is a separate security boundary, so a compromise of the main account doesn’t reach the copies.',
        ],
        [
          'Apply AWS Backup Vault Lock to the destination vault.',
          'Correct. Vault Lock prevents deletion of the copies before their retention ends.',
        ],
        [
          'Keep all backups in the production account for faster restores.',
          'This leaves backups exposed to the same compromise.',
        ],
        [
          'Use the same IAM role to manage production and backups.',
          'Shared credentials let one compromise affect both.',
        ],
        [
          'Disable encryption on backups so they can be restored anywhere.',
          'Removing encryption weakens protection and isn’t needed for restores.',
        ],
      ],
      a: ['a', 'b'],
      x: 'Cross-account backup copies isolate recovery data from the production account, and Vault Lock makes those copies immutable, which protects against deletion by attackers or ransomware.',
      r: ['awsBackup', 'backupVaultLock'],
      tags: ['AWS Backup', 'Data recovery'],
    },
    {
      n: 115,
      t: '1.3',
      lv: 'm',
      q: 'An application stores files in S3 that must be encrypted at rest with keys that use two independent layers of encryption to meet a strict compliance standard. Which S3 option is designed for this?',
      o: [
        [
          'Dual-layer server-side encryption with AWS KMS keys (DSSE-KMS)',
          'Correct. DSSE-KMS applies two layers of encryption to objects.',
        ],
        ['SSE-S3', 'SSE-S3 applies one layer of encryption with S3 managed keys.'],
        ['S3 Bucket Keys', 'Bucket Keys reduce KMS request costs; they don’t add a second layer.'],
        ['S3 Versioning', 'Versioning keeps object versions.'],
      ],
      a: 'a',
      x: 'Amazon S3 offers dual-layer server-side encryption with AWS KMS keys (DSSE-KMS) for workloads that require two layers of encryption at rest.',
      r: ['s3DsseKms'],
      tags: ['DSSE-KMS', 'Amazon S3'],
    },
    {
      n: 116,
      t: '1.3',
      lv: 'm',
      q: 'A company deletes temporary data files after processing, but auditors want proof that every deletion of objects in a sensitive bucket is recorded with who did it. What should be enabled?',
      o: [
        [
          'AWS CloudTrail data events for the S3 bucket',
          'Correct. Data events record object-level API activity such as DeleteObject, including the caller.',
        ],
        ['S3 Transfer Acceleration', 'This doesn’t record activity.'],
        ['VPC Flow Logs', 'Flow Logs record IP traffic, not S3 API calls and callers.'],
        ['S3 Lifecycle rules', 'Lifecycle rules manage objects; they don’t log user activity.'],
      ],
      a: 'a',
      x: 'CloudTrail management events record control plane activity. Object-level operations such as GetObject and DeleteObject are data events, which must be enabled for the bucket to be logged.',
      r: ['cloudTrailDataEvents'],
      tags: ['AWS CloudTrail', 'Audit'],
    },
    {
      n: 117,
      t: '1.3',
      lv: 'e',
      q: 'Which statement about encryption of Amazon EBS volumes is correct?',
      o: [
        [
          'Data at rest on the volume, data moving between the volume and the instance, and snapshots of the volume are all encrypted.',
          'Correct. EBS encryption covers the volume, data in transit to the instance and the snapshots.',
        ],
        [
          'Only the snapshots are encrypted.',
          'The volume itself and data in transit to the instance are encrypted too.',
        ],
        [
          'Encryption must be done inside the guest operating system.',
          'EBS encryption is handled by the service without OS configuration.',
        ],
        [
          'Encrypted volumes can’t be attached to running instances.',
          'Encrypted volumes can be attached like any other volume on supported instance types.',
        ],
      ],
      a: 'a',
      x: 'When you encrypt an EBS volume, data at rest inside the volume, data moving between the volume and the instance, snapshots created from it, and volumes created from those snapshots are encrypted.',
      r: ['ebsEncryption'],
      tags: ['Amazon EBS', 'Encryption'],
    },
    {
      n: 118,
      t: '1.3',
      lv: 'h',
      q: 'A company uses SSE-KMS for an S3 bucket and wants to make sure that no object is uploaded with any other encryption setting, including SSE-S3. What should it configure?',
      o: [
        [
          'A bucket policy that denies s3:PutObject unless the request specifies SSE-KMS with the required key',
          'Correct. A deny on the x-amz-server-side-encryption and key ID condition keys rejects uploads that don’t use the required key.',
        ],
        [
          'Default encryption alone, set to SSE-KMS',
          'Default encryption applies when a request specifies no encryption; requests that specify another option may still succeed unless denied.',
        ],
        [
          'S3 Block Public Access',
          'Block Public Access controls public access, not encryption settings.',
        ],
        ['An S3 Lifecycle rule', 'Lifecycle rules don’t inspect uploads.'],
      ],
      a: 'a',
      x: 'Default bucket encryption sets the behavior for requests without encryption headers. To require a specific key for every upload, add a bucket policy that denies PutObject requests whose encryption headers don’t match.',
      r: ['s3DefaultEncryption', 's3SseKms'],
      tags: ['SSE-KMS', 'Bucket policy'],
    },
    {
      n: 119,
      t: '1.3',
      lv: 'm',
      q: 'A company’s security policy requires private TLS certificates for internal services, issued from the company’s own certificate authority hierarchy, with managed issuance and revocation on AWS. Which service should it use?',
      o: [
        [
          'AWS Private Certificate Authority',
          'Correct. AWS Private CA creates and manages private CA hierarchies and issues private certificates.',
        ],
        [
          'ACM public certificates',
          'Public certificates are trusted publicly; they aren’t issued from your own private CA.',
        ],
        ['AWS KMS', 'KMS manages keys, not certificates.'],
        ['Amazon Cognito', 'Cognito manages user identities.'],
      ],
      a: 'a',
      x: 'AWS Private CA lets organizations create private certificate authority hierarchies and issue private certificates for internal resources, and it integrates with ACM.',
      r: ['privateCa'],
      tags: ['AWS Private CA', 'TLS'],
    },
    {
      n: 120,
      t: '1.3',
      lv: 'm',
      q: 'A company stores backups of an on-premises database in Amazon S3. The backups must be kept for 10 years and are rarely read. The company also wants to keep storage cost low and protect the backups from deletion. Which TWO features should a solutions architect combine? (Select TWO.)',
      o: [
        [
          'An S3 Lifecycle rule that moves backups to S3 Glacier Deep Archive',
          'Correct. Deep Archive is the lowest-cost storage class for long-term, rarely accessed data.',
        ],
        [
          'S3 Object Lock with a 10-year retention period',
          'Correct. Object Lock prevents the backups from being deleted or overwritten during the retention period.',
        ],
        [
          'S3 Transfer Acceleration',
          'This speeds up uploads but doesn’t reduce storage cost or protect data.',
        ],
        [
          'S3 Standard storage class for all backups',
          'S3 Standard costs more than archival classes for rarely read data.',
        ],
        [
          'Amazon EFS for the backups',
          'EFS is file storage and costs more for long-term archives.',
        ],
      ],
      a: ['a', 'b'],
      x: 'Lifecycle transitions to S3 Glacier Deep Archive reduce long-term storage cost, and S3 Object Lock retention protects the backups from deletion for the required period.',
      r: ['s3Lifecycle', 's3StorageClasses', 's3ObjectLock'],
      tags: ['Data retention', 'S3 Glacier Deep Archive'],
    },
  ],
);
