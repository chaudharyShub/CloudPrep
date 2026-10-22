# Question bank: review checklist

> Bank version `2026-10-22.1` · 2,000 questions · 44 `checked`, 1,956 `unverified`, none `approved` yet.
>
> Unverified questions live in `src/content/questions/batches/` and are written with `defineQuestions` (`author.ts`) using reference keys from `refs.ts`. To promote one, check it against its cited pages and set its status to `checked`.

Each question was written for CloudPrep from the AWS pages it cites, and every cited URL was confirmed to load (HTTP 200) on 2026-10-21. Key facts were checked against the live pages (six advantages, Well-Architected pillars, CAF perspectives, 7 Rs, root-user tasks, shared responsibility, AZ definition, security groups vs network ACLs, S3 storage classes and Glacier, instance store persistence, Spot, Savings Plans, consolidated billing, Budgets, Artifact, Shield Standard, Trusted Advisor, Support plans).

To approve a question, change its `review.status` from `'checked'` to `'approved'`.

## Please look closely at these

| Question | Why |
|---|---|
| `clf-d4-0007` (Basic Support) | AWS Support plans are changing: Developer, Business and Enterprise On-Ramp end on 1 January 2027, and the current plans are Basic, Business Support+, Enterprise and Unified Operations. The question only uses facts confirmed on the current pages, but re-check before sharing widely. |
| `clf-d3-0013` (EC2 storage) | Option B ("EBS data can persist independently of the instance") is a paraphrase. The current "What is EBS" page doesn't state it in one sentence. Multi-Attach is described only as "a small number of instances". |
| `clf-d1-0004` (Reliability pillar) | The stem adds "including recovering from failures". The pillar definition says "perform its intended function correctly and consistently"; recovery comes from its design principles. |
| `clf-d1-0006` (Well-Architected Tool) | Its user-guide page didn't render in my checker, so the description is from general knowledge (review against pillars, risk list, improvement plan). The URL loads. |
| `clf-d1-0010` (Rightsizing) | The old rightsizing whitepaper URL now redirects to AWS Compute Optimizer, so the question cites Compute Optimizer instead. |
| `clf-d4-0002` (Reserved Instances) | Savings Plans would also suit this scenario, so they are deliberately left out of the options. Check you agree the question is unambiguous. |

## Coverage

All 19 exam-guide task statements have at least one question. Run `npm run validate:questions` for the full breakdown.

| Domain | Questions | Single / multiple |
|---|---|---|
| D1 Cloud Concepts | 10 | 9 / 1 |
| D2 Security and Compliance | 12 | 10 / 2 |
| D3 Cloud Technology and Services | 15 | 13 / 2 |
| D4 Billing, Pricing, and Support | 7 | 5 / 2 |

Gaps to cover in the next batch: more **hard** questions (only 2 so far); task statements with a single question (3.1, 3.7, 3.8, 4.3); and topics from the exam guide not yet covered, including AWS Organizations SCPs, IAM Identity Center, AWS Secrets Manager, Amazon Inspector, AWS Security Hub, AWS Backup, Amazon EFS/FSx, AWS Storage Gateway, AWS DMS and SCT, Direct Connect and VPN, ECS/EKS/Fargate, EC2 instance types, SageMaker AI and Lex, Kinesis and Glue, SNS and EventBridge, Amazon Connect and SES, AWS Pricing Calculator, cost allocation tags and Cost and Usage Report, data transfer costs, AWS Marketplace and Partners, re:Post and Knowledge Center, the AWS Health Dashboard, and AWS Trust & Safety.
