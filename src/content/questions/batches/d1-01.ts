import { defineQuestions } from '../author';

/** Domain 1, task 1.1: benefits of the AWS Cloud. */
export default defineQuestions(
  { domain: 'D1', written: '2026-10-21', status: 'checked', checked: '2026-10-25' },
  [
    {
      n: 11,
      t: '1.1',
      lv: 'e',
      q: 'A startup does not want to spend money on servers before it knows whether its product will succeed. Which benefit of the AWS Cloud addresses this concern?',
      o: [
        [
          'Trade fixed expense for variable expense',
          'Correct. Instead of investing in hardware up front, the startup pays only for the resources it consumes.',
        ],
        [
          'Go global in minutes',
          'This benefit is about deploying in many Regions quickly, not about avoiding up-front investment.',
        ],
        [
          'Increase speed and agility',
          'Agility is about getting resources quickly. The concern here is up-front cost.',
        ],
        [
          'Stop spending money running and maintaining data centers',
          'This is about operational effort for facilities. The question is about avoiding capital investment before demand is known.',
        ],
      ],
      a: 'a',
      x: 'Trading fixed expense (capital expense) for variable expense means paying only for what is used, which suits a business whose demand is still unknown.',
      r: ['sixAdvantages'],
      tags: ['Cloud benefits'],
    },
    {
      n: 12,
      t: '1.1',
      lv: 'e',
      q: 'A company used to wait weeks for new servers to be delivered and installed. On AWS, developers can launch servers in minutes. Which benefit of the cloud is this?',
      o: [
        [
          'Increase speed and agility',
          'Correct. New IT resources are only a click away, so the time to make resources available to developers drops from weeks to minutes.',
        ],
        [
          'Benefit from massive economies of scale',
          'Economies of scale lower prices. They do not describe how quickly resources can be provisioned.',
        ],
        [
          'Trade fixed expense for variable expense',
          'This is about the payment model, not how fast resources become available.',
        ],
        [
          'High durability',
          'Durability is about protecting stored data from loss, not about provisioning speed.',
        ],
      ],
      a: 'a',
      x: 'Speed and agility means resources are available in minutes, letting teams experiment and innovate faster.',
      r: ['sixAdvantages'],
      tags: ['Cloud benefits'],
    },
    {
      n: 13,
      t: '1.1',
      lv: 'e',
      q: 'Why can AWS often offer lower variable costs than a company could achieve running its own data center?',
      o: [
        [
          'AWS aggregates usage from hundreds of thousands of customers, achieving economies of scale',
          'Correct. Because usage is aggregated across many customers, AWS achieves higher economies of scale, which translates into lower pay-as-you-go prices.',
        ],
        [
          'AWS requires customers to sign long-term contracts for every service',
          'Most AWS services are available on demand without long-term contracts.',
        ],
        [
          'AWS does not charge for data stored in the cloud',
          'Storage is charged; the lower price comes from scale, not from free storage.',
        ],
        [
          'AWS customers share the same virtual servers with each other',
          'Customers are isolated from one another. Lower prices come from economies of scale, not from sharing servers.',
        ],
      ],
      a: 'a',
      x: 'Massive economies of scale: aggregated usage across many customers lets AWS lower its costs and pass the savings on.',
      r: ['sixAdvantages'],
      tags: ['Cloud benefits', 'Cloud economics'],
    },
    {
      n: 14,
      t: '1.1',
      lv: 'm',
      q: 'Before moving to AWS, a company bought enough servers for its busiest week of the year, and most of them sat idle the rest of the time. Which cloud benefit helps avoid this?',
      o: [
        [
          'Stop guessing capacity',
          'Correct. With the cloud you can scale up and down as demand changes instead of buying for peak capacity in advance.',
        ],
        [
          'Go global in minutes',
          'Global reach does not address idle capacity bought for peak demand.',
        ],
        [
          'Benefit from massive economies of scale',
          'Economies of scale lower unit prices, but the problem here is buying too much capacity.',
        ],
        [
          'Increase security through physical isolation',
          'This is not one of the cloud benefits, and it does not address idle capacity.',
        ],
      ],
      a: 'a',
      x: 'Stop guessing capacity: you access as much or as little capacity as you need and scale with demand.',
      r: ['sixAdvantages'],
      tags: ['Cloud benefits', 'Elasticity'],
    },
    {
      n: 15,
      t: '1.1',
      lv: 'e',
      q: 'Which benefit of the AWS Cloud lets a company focus its staff on projects that differentiate its business instead of racking, stacking and powering servers?',
      o: [
        [
          'Stop spending money running and maintaining data centers',
          'Correct. AWS takes on the heavy lifting of data center operations, so the company can focus on its customers and products.',
        ],
        [
          'Trade fixed expense for variable expense',
          'This is about how infrastructure is paid for, not about freeing staff from data center work.',
        ],
        [
          'Go global in minutes',
          'This is about deploying in more locations, not about removing data center work.',
        ],
        [
          'Stop guessing capacity',
          'This is about matching capacity to demand, not about who operates the facilities.',
        ],
      ],
      a: 'a',
      x: 'By not running data centers, companies can spend their time and money on projects that differentiate their business.',
      r: ['sixAdvantages'],
      tags: ['Cloud benefits'],
    },
    {
      n: 16,
      t: '1.1',
      lv: 'm',
      q: 'Which are benefits of moving workloads from an on-premises data center to the AWS Cloud? (Select TWO.)',
      o: [
        [
          'Capacity can be scaled up or down to match demand',
          'Correct. Elastic capacity is a core benefit of the cloud.',
        ],
        [
          'Applications can be deployed in multiple geographic Regions in minutes',
          'Correct. AWS global infrastructure lets you reach users around the world quickly.',
        ],
        [
          'The company no longer needs to secure its applications or data',
          'Under the shared responsibility model, customers remain responsible for security in the cloud.',
        ],
        [
          'All software licenses become free',
          'Moving to AWS does not make third-party software licenses free.',
        ],
        [
          'Costs are fixed and paid once at the start of each year',
          'Pay-as-you-go pricing makes costs variable, based on usage.',
        ],
      ],
      a: ['a', 'b'],
      x: 'Elastic capacity and global reach are benefits of the cloud. Security of customer data and applications remains a customer responsibility.',
      r: ['sixAdvantages', 'whatIsCloud'],
      tags: ['Cloud benefits'],
    },
    {
      n: 17,
      t: '1.1',
      lv: 'e',
      q: "What is the AWS Cloud's pricing model for most services?",
      o: [
        [
          'Pay as you go, for the resources you actually use',
          'Correct. Most AWS services are priced on a pay-as-you-go basis with no long-term commitment required.',
        ],
        [
          'A fixed annual fee regardless of usage',
          'AWS pricing is based on usage, not a fixed annual fee.',
        ],
        [
          'A one-time purchase price for each server',
          'With the cloud you do not buy servers; you pay for usage.',
        ],
        [
          'Free for the first ten years for every customer',
          'AWS offers a Free Tier for some services, but it is not free for ten years.',
        ],
      ],
      a: 'a',
      x: 'Pay-as-you-go pricing means you pay only for the services you consume, for as long as you use them.',
      r: ['whatIsCloud', 'pricing'],
      tags: ['Cloud economics'],
    },
    {
      n: 18,
      t: '1.1',
      lv: 'm',
      q: 'A game studio launches a new game. Traffic is high for the first two weeks and then drops sharply. Which characteristic of the AWS Cloud helps the studio pay only for the capacity it needs during each period?',
      o: [
        [
          'Elasticity',
          'Correct. Elasticity lets the studio add resources during the launch peak and release them when traffic falls.',
        ],
        ['Durability', 'Durability is about protecting data from loss, not adjusting capacity.'],
        [
          'Data sovereignty',
          'Data sovereignty is about where data is stored, not about matching capacity to demand.',
        ],
        [
          'Fault isolation',
          'Fault isolation limits the impact of failures. It does not change capacity with demand.',
        ],
      ],
      a: 'a',
      x: 'Elasticity means scaling resources out and in as demand changes, so you pay only for what you use at each point.',
      r: ['sixAdvantages', 'autoScaling'],
      tags: ['Elasticity'],
    },
    {
      n: 19,
      t: '1.1',
      lv: 'm',
      q: 'What is the difference between scalability and elasticity in the AWS Cloud?',
      o: [
        [
          'Scalability is the ability to handle growth by adding resources; elasticity is the ability to add and remove resources automatically as demand changes',
          'Correct. A scalable system can grow; an elastic system grows and shrinks automatically with demand.',
        ],
        [
          'Scalability applies only to storage; elasticity applies only to compute',
          'Both concepts apply to many kinds of resources.',
        ],
        [
          'They mean exactly the same thing and are never distinguished',
          'They are related but distinct. Elasticity emphasizes automatic scaling in both directions.',
        ],
        [
          'Elasticity means data is copied across Regions; scalability means data is encrypted',
          'These describe replication and encryption, not scalability or elasticity.',
        ],
      ],
      a: 'a',
      x: 'Elasticity is scalability that happens automatically in both directions, closely following demand.',
      r: ['whatIsCloud', 'awsAutoScaling'],
      tags: ['Elasticity', 'Scalability'],
      // Review 2026-10-25: no cited AWS page defines scalability vs elasticity.
      st: 'unverified',
    },
    {
      n: 20,
      t: '1.1',
      lv: 'e',
      q: 'Which AWS infrastructure feature allows a company to serve users on several continents with low latency?',
      o: [
        [
          'AWS Regions located around the world',
          'Correct. Deploying in Regions close to users reduces latency and is part of "go global in minutes".',
        ],
        [
          'A single large data center',
          'One data center cannot provide low latency to users on several continents.',
        ],
        [
          'Amazon EBS snapshots',
          'Snapshots are backups of volumes. They do not reduce latency for users.',
        ],
        ['IAM user groups', 'IAM groups manage permissions. They have nothing to do with latency.'],
      ],
      a: 'a',
      x: 'AWS operates Regions around the world, so you can deploy applications close to your users.',
      r: ['globalInfra', 'sixAdvantages'],
      tags: ['Global infrastructure'],
    },
    {
      n: 21,
      t: '1.1',
      lv: 'm',
      q: 'A company wants its application to keep running even if one data center fails. Which AWS Cloud benefit makes this easier to achieve than on premises?',
      o: [
        [
          'Resources can be deployed across multiple Availability Zones within a Region',
          'Correct. Availability Zones are physically separate, so deploying across them keeps the application running if one fails.',
        ],
        [
          'All AWS services are guaranteed to never fail',
          'No infrastructure is guaranteed never to fail. AWS recommends designing for failure.',
        ],
        [
          'AWS automatically rewrites applications to be fault tolerant',
          'AWS provides the building blocks; customers design their applications to use them.',
        ],
        [
          'Customers must build their own secondary data center',
          'On AWS, customers can use multiple Availability Zones instead of building another data center.',
        ],
      ],
      a: 'a',
      x: 'Multiple isolated Availability Zones in each Region make high availability achievable without building extra facilities.',
      r: ['regionsAzs', 'ha'],
      tags: ['High availability', 'Global infrastructure'],
    },
    {
      n: 22,
      t: '1.1',
      lv: 'e',
      q: 'Which term describes a system that remains operational with minimal downtime, typically by running across multiple Availability Zones?',
      o: [
        [
          'High availability',
          'Correct. A highly available system keeps working with minimal downtime when components fail.',
        ],
        [
          'Elasticity',
          'Elasticity is about adjusting capacity to demand, not about staying available during failures.',
        ],
        ['Economies of scale', 'Economies of scale relate to cost, not availability.'],
        ['Agility', 'Agility is about speed of experimentation and delivery.'],
      ],
      a: 'a',
      x: 'High availability means designing systems to keep running, usually by removing single points of failure across Availability Zones.',
      r: ['ha', 'regionsAzs'],
      tags: ['High availability'],
    },
    {
      n: 23,
      t: '1.1',
      lv: 'm',
      q: 'A development team wants to try out a new idea using a database, a few servers and a machine learning service. If the idea fails, they want to delete everything with no ongoing cost. Which cloud benefit does this illustrate?',
      o: [
        [
          'Increased speed and agility, because experiments are low cost and resources can be removed at any time',
          'Correct. Low cost of experimentation is a key part of cloud agility.',
        ],
        [
          'Data residency, because the data stays in one country',
          'Data residency is not what the scenario is about.',
        ],
        [
          'Reserved capacity, because resources are committed for one year',
          'Committing for a year is the opposite of a disposable experiment.',
        ],
        [
          'Physical security, because AWS guards its data centers',
          'Physical security is real but is not the benefit illustrated by cheap, disposable experiments.',
        ],
      ],
      a: 'a',
      x: 'Because resources can be created and deleted in minutes and billed by usage, experiments are cheap, which speeds up innovation.',
      r: ['sixAdvantages'],
      tags: ['Cloud benefits', 'Agility'],
    },
    {
      n: 24,
      t: '1.1',
      lv: 'm',
      q: 'Which statement about AWS Regions and data location is correct?',
      o: [
        [
          'Customers choose the Regions where their data is stored, which helps meet data residency requirements',
          'Correct. Data stays in the Region you choose unless you move or replicate it.',
        ],
        [
          'AWS automatically copies all customer data to every Region',
          'AWS does not replicate customer data between Regions unless the customer configures it.',
        ],
        [
          'All AWS data is stored in a single global Region',
          'AWS has many Regions; customers choose where their resources run.',
        ],
        [
          'Customers cannot know which country their data is stored in',
          'Each Region is in a known geographic location, so customers know where their data resides.',
        ],
      ],
      a: 'a',
      x: 'Customers control which Region their content is stored in, which supports compliance with data residency and sovereignty rules.',
      r: ['dataPrivacyFaq', 'regionsAzs'],
      tags: ['Global infrastructure', 'Data residency'],
    },
    {
      n: 25,
      t: '1.1',
      lv: 'h',
      q: 'A company compares the total cost of ownership (TCO) of its data center with AWS. Which costs of running its own data center are often overlooked in such a comparison? (Select TWO.)',
      o: [
        [
          'Power, cooling and physical space for servers',
          'Correct. Facility costs are part of data center TCO and are easy to overlook when comparing only server prices.',
        ],
        [
          'Staff time spent maintaining hardware and facilities',
          'Correct. Labor for racking, patching hardware and managing facilities is a real cost of on-premises infrastructure.',
        ],
        [
          'Per-request charges for AWS Lambda',
          'Lambda charges are an AWS cost, not a hidden data center cost.',
        ],
        [
          'Data transfer into Amazon S3 from the internet',
          'This is an AWS-side item, not a cost of running your own data center.',
        ],
        [
          'AWS Support plan fees',
          'Support fees are an AWS cost, not a cost of running your own data center.',
        ],
      ],
      a: ['a', 'b'],
      x: 'On-premises TCO includes facilities (power, cooling, space) and people, not just hardware purchase prices.',
      r: ['cloudEconomics'],
      tags: ['Cloud economics', 'TCO'],
    },
    {
      n: 26,
      t: '1.1',
      lv: 'e',
      q: 'Which deployment model runs all parts of an application in the cloud?',
      o: [
        [
          'Cloud (cloud-based) deployment',
          'Correct. A cloud-based application is fully deployed in the cloud.',
        ],
        [
          'On-premises (private cloud) deployment',
          'On-premises deployments run in your own data center.',
        ],
        [
          'Hybrid deployment',
          'A hybrid deployment connects cloud resources with on-premises infrastructure.',
        ],
        ['Edge-only deployment', 'This is not one of the standard cloud deployment models.'],
      ],
      a: 'a',
      x: 'The three deployment models are cloud, hybrid and on-premises. In a cloud deployment, every part of the application runs in the cloud.',
      r: ['cloudTypes'],
      tags: ['Deployment models'],
    },
    {
      n: 27,
      t: '1.1',
      lv: 'e',
      q: 'A company keeps some legacy systems in its own data center and connects them to new applications running on AWS. Which deployment model is this?',
      o: [
        [
          'Hybrid',
          'Correct. A hybrid deployment connects infrastructure and applications between cloud and on-premises resources.',
        ],
        ['Cloud', 'A cloud deployment runs everything in the cloud.'],
        [
          'On-premises',
          'An on-premises deployment does not use the public cloud for the applications.',
        ],
        [
          'Multi-Region',
          'Multi-Region describes how cloud resources are spread, not a mix of cloud and on-premises.',
        ],
      ],
      a: 'a',
      x: "A hybrid deployment connects cloud-based resources with existing resources that are not in the cloud, most commonly an organization's on-premises infrastructure.",
      r: ['cloudTypes'],
      tags: ['Deployment models'],
    },
    {
      n: 28,
      t: '1.1',
      lv: 'e',
      q: 'Which cloud computing model provides access to networking, computers and storage, giving the customer the most control over IT resources?',
      o: [
        [
          'Infrastructure as a Service (IaaS)',
          'Correct. IaaS provides the basic building blocks and the highest level of flexibility and management control.',
        ],
        [
          'Platform as a Service (PaaS)',
          'PaaS removes the need to manage the underlying infrastructure, so it offers less control than IaaS.',
        ],
        [
          'Software as a Service (SaaS)',
          'SaaS delivers a complete product run by the provider, with the least customer control.',
        ],
        [
          'Function as a Service only',
          'Function-based compute abstracts servers away; it offers less control than IaaS.',
        ],
      ],
      a: 'a',
      x: 'IaaS (for example Amazon EC2) gives the most control: you manage the operating system, applications and data.',
      r: ['whatIsIaas', 'sharedResponsibility'],
      tags: ['Cloud computing models', 'IaaS'],
    },
    {
      n: 29,
      t: '1.1',
      lv: 'm',
      q: 'A team wants to deploy a web application by uploading its code, without managing servers, operating systems or capacity provisioning. Which cloud computing model fits best?',
      o: [
        [
          'Platform as a Service (PaaS)',
          'Correct. With PaaS (for example AWS Elastic Beanstalk) you focus on deploying and managing your application, not the underlying infrastructure.',
        ],
        [
          'Infrastructure as a Service (IaaS)',
          'IaaS requires you to manage the operating system and software on your servers.',
        ],
        ['On-premises deployment', 'On premises you manage everything yourself.'],
        [
          'Colocation',
          'Colocation means renting space for your own hardware, which you still manage.',
        ],
      ],
      a: 'a',
      x: 'PaaS removes the need to manage infrastructure so teams can focus on their application code.',
      r: ['whatIsIaas', 'beanstalk'],
      tags: ['Cloud computing models', 'PaaS'],
    },
    {
      n: 30,
      t: '1.1',
      lv: 'e',
      q: 'A company uses a web-based email service. The provider manages the application, servers and storage. Which cloud computing model is this?',
      o: [
        [
          'Software as a Service (SaaS)',
          'Correct. SaaS is a complete product that is run and managed by the service provider.',
        ],
        [
          'Infrastructure as a Service (IaaS)',
          'With IaaS the customer manages operating systems and applications.',
        ],
        [
          'Platform as a Service (PaaS)',
          'With PaaS the customer still builds and deploys the application.',
        ],
        [
          'Hybrid cloud',
          'Hybrid is a deployment model, not a service model, and does not describe this scenario.',
        ],
      ],
      a: 'a',
      x: 'With SaaS, you only think about how you will use the software; the provider runs everything else.',
      r: ['whatIsIaas'],
      tags: ['Cloud computing models', 'SaaS'],
    },
    {
      n: 31,
      t: '1.1',
      lv: 'm',
      q: 'Which statement describes how security works in the AWS Cloud compared with a typical small on-premises data center?',
      o: [
        [
          "Customers inherit AWS's physical and infrastructure security controls and remain responsible for securing their own data and configurations",
          'Correct. AWS secures the infrastructure; customers secure what they put in the cloud.',
        ],
        [
          'AWS is responsible for every aspect of security, including customer passwords',
          'Customers manage their own identities, credentials and configurations.',
        ],
        [
          'Security is weaker in the cloud because customers cannot use encryption',
          'Customers can encrypt data at rest and in transit using AWS services such as AWS KMS.',
        ],
        [
          'Customers must provide their own security guards at AWS data centers',
          'AWS is responsible for the physical security of its data centers.',
        ],
      ],
      a: 'a',
      x: 'Under the shared responsibility model, customers benefit from AWS infrastructure security and focus on securing their own workloads.',
      r: ['sharedResponsibility', 'cloudSecurity'],
      tags: ['Security', 'Shared responsibility'],
    },
    {
      n: 32,
      t: '1.1',
      lv: 'e',
      q: 'What is cloud computing?',
      o: [
        [
          'On-demand delivery of IT resources over the internet with pay-as-you-go pricing',
          'Correct. This is how AWS defines cloud computing.',
        ],
        [
          'Buying servers and installing them in a colocation facility',
          'That is traditional hosting of your own hardware.',
        ],
        ['Storing files only on a USB drive', 'Local storage is not cloud computing.'],
        [
          'A long-term lease of a dedicated data center building',
          'Leasing a facility is not on-demand delivery of IT resources.',
        ],
      ],
      a: 'a',
      x: 'Cloud computing is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing.',
      r: ['whatIsCloud'],
      tags: ['Cloud concepts'],
    },
    {
      n: 33,
      t: '1.1',
      lv: 'm',
      q: 'A media company must process a large batch of videos once a month. On premises, the servers needed for this job sit idle for the rest of the month. How does AWS help?',
      o: [
        [
          'The company can launch many instances for the job and terminate them when it finishes, paying only for the time used',
          'Correct. Pay-as-you-go and elasticity remove the cost of idle hardware between jobs.',
        ],
        [
          'The company must buy dedicated servers from AWS for the batch job',
          'AWS does not sell servers; you rent capacity on demand.',
        ],
        [
          'AWS processes the videos for free once a month',
          'AWS does not provide free monthly processing.',
        ],
        [
          'The company must keep the instances running all month to save its data',
          'Data can be kept in storage such as Amazon S3 while instances are terminated.',
        ],
      ],
      a: 'a',
      x: 'Launching capacity only when needed and terminating it afterward turns a fixed cost into a variable one.',
      r: ['sixAdvantages', 'ec2'],
      tags: ['Elasticity', 'Cloud economics'],
    },
    {
      n: 34,
      t: '1.1',
      lv: 'h',
      q: "Which actions take advantage of the AWS Cloud's global infrastructure? (Select TWO.)",
      o: [
        [
          'Deploying an application in a Region close to a new group of customers',
          'Correct. Choosing Regions near users reduces latency.',
        ],
        [
          'Using Amazon CloudFront to cache content at edge locations near viewers',
          'Correct. CloudFront uses a global network of edge locations to deliver content with low latency.',
        ],
        [
          'Running all workloads in a single Availability Zone',
          'This uses only one location and does not take advantage of global infrastructure.',
        ],
        [
          'Turning off encryption to improve performance',
          'Encryption has nothing to do with global infrastructure and should not be turned off.',
        ],
        [
          'Buying a larger instance type in the same Region',
          'Scaling up in one Region does not use the global footprint.',
        ],
      ],
      a: ['a', 'b'],
      x: 'Regions and edge locations around the world let companies reach users globally with lower latency.',
      r: ['globalInfra', 'cloudFront'],
      tags: ['Global infrastructure'],
    },
    {
      n: 35,
      t: '1.1',
      lv: 'm',
      q: 'A company says: "With AWS, we no longer have to order hardware months in advance based on forecasts." Which benefit is the company describing?',
      o: [
        [
          'Stop guessing capacity',
          'Correct. Capacity can be added when it is needed rather than predicted and purchased in advance.',
        ],
        ['Benefit from massive economies of scale', 'This is about lower prices from AWS scale.'],
        ['Data durability', 'Durability is about not losing stored data.'],
        [
          'Compliance inheritance',
          'This relates to compliance controls, not to capacity planning.',
        ],
      ],
      a: 'a',
      x: 'Without guessing capacity, companies avoid both expensive idle resources and limited capacity.',
      r: ['sixAdvantages'],
      tags: ['Cloud benefits'],
    },
    {
      n: 36,
      t: '1.1',
      lv: 'e',
      q: 'Which of the following is an example of a capital expense (CapEx) that moving to AWS can reduce?',
      o: [
        [
          'Buying physical servers and networking equipment',
          'Correct. Purchasing hardware up front is a capital expense; on AWS you pay for usage as an operating expense.',
        ],
        [
          'Paying a monthly bill for AWS usage',
          'A monthly usage bill is an operating expense (OpEx).',
        ],
        [
          'Paying for electricity used by AWS data centers',
          'AWS customers do not pay AWS electricity bills directly.',
        ],
        [
          'Paying per gigabyte stored in Amazon S3',
          'Usage-based storage charges are operating expenses.',
        ],
      ],
      a: 'a',
      x: 'The cloud trades capital expense (buying hardware) for variable operating expense (paying for usage).',
      r: ['sixAdvantages'],
      tags: ['Cloud economics', 'CapEx vs OpEx'],
    },
    {
      n: 37,
      t: '1.1',
      lv: 'm',
      q: 'A company wants to expand to a new country but is unsure how successful it will be. How does the AWS Cloud reduce the risk of this expansion?',
      o: [
        [
          'It can deploy in a nearby Region quickly and pay only for what it uses, then scale or remove resources based on results',
          'Correct. Speed, global reach and pay-as-you-go pricing reduce the cost of trying a new market.',
        ],
        [
          'AWS guarantees that the new market will succeed',
          'AWS does not guarantee business outcomes.',
        ],
        [
          'It must sign a five-year contract for the new Region',
          'No long-term contract is required to use a Region.',
        ],
        [
          'It must build a local data center before using AWS there',
          'AWS Regions remove the need to build facilities.',
        ],
      ],
      a: 'a',
      x: 'Going global in minutes with pay-as-you-go pricing makes it cheap to test new markets.',
      r: ['sixAdvantages', 'globalInfra'],
      tags: ['Cloud benefits', 'Global infrastructure'],
    },
    {
      n: 38,
      t: '1.1',
      lv: 'm',
      q: 'Which statements correctly describe Availability Zones? (Select TWO.)',
      o: [
        [
          'Each Availability Zone consists of one or more discrete data centers with redundant power and networking',
          'Correct. Availability Zones are made up of one or more data centers with redundant power, networking and connectivity.',
        ],
        [
          'Availability Zones in a Region are connected with high-bandwidth, low-latency networking',
          'Correct. This allows applications to be replicated synchronously across Availability Zones.',
        ],
        [
          'An Availability Zone is the same as an edge location',
          'Edge locations are used by services such as CloudFront; they are not Availability Zones.',
        ],
        [
          'All Availability Zones in the world are in a single building',
          'Availability Zones are physically separated from one another.',
        ],
        [
          'Each AWS Region contains exactly one Availability Zone',
          'Regions contain multiple, isolated Availability Zones.',
        ],
      ],
      a: ['a', 'b'],
      x: 'Availability Zones are isolated groups of data centers within a Region, connected by low-latency links.',
      r: ['regionsAzs'],
      tags: ['Global infrastructure', 'Availability Zones'],
    },
    {
      n: 39,
      t: '1.1',
      lv: 'e',
      q: 'Which benefit allows a small company to use the same secure, reliable infrastructure that large enterprises use on AWS?',
      o: [
        [
          'Access to AWS global infrastructure without upfront investment',
          'Correct. Companies of every size can use the same infrastructure and pay only for what they use.',
        ],
        [
          'Exclusive physical servers for every customer',
          'Most services run on shared infrastructure with strong isolation; dedicated hardware is optional and costs more.',
        ],
        [
          'Free unlimited usage for small companies',
          'Usage is billed; AWS offers a Free Tier but not unlimited free usage.',
        ],
        [
          'Automatic approval of all compliance audits',
          'Compliance still depends on how the customer uses AWS.',
        ],
      ],
      a: 'a',
      x: 'The cloud gives small companies access to world-class infrastructure on a pay-as-you-go basis.',
      r: ['sixAdvantages', 'globalInfra'],
      tags: ['Cloud benefits'],
    },
    {
      n: 40,
      t: '1.1',
      lv: 'h',
      q: 'A company runs a website on one on-premises server. Which problems does moving to AWS with an Auto Scaling group across multiple Availability Zones help solve? (Select TWO.)',
      o: [
        [
          'The website goes down when the single server fails',
          'Correct. Running across multiple Availability Zones removes the single point of failure.',
        ],
        [
          'The website slows down during unexpected traffic spikes',
          'Correct. Auto Scaling adds instances when demand rises.',
        ],
        [
          'The website code contains a bug in its checkout logic',
          'Infrastructure changes do not fix application bugs.',
        ],
        [
          'The company forgot to renew its domain name',
          'Domain renewal is unrelated to Auto Scaling or Availability Zones.',
        ],
        [
          'Users enter weak passwords',
          'Password strength is an application or identity concern, not solved by scaling.',
        ],
      ],
      a: ['a', 'b'],
      x: 'Multiple Availability Zones improve availability, and Auto Scaling handles changing demand.',
      r: ['autoScaling', 'regionsAzs'],
      tags: ['High availability', 'Elasticity'],
    },
  ],
);
