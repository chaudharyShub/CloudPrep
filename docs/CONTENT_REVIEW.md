# Question bank: review checklist

> Bank version `2026-10-25.1` · 2,000 questions · 190 `checked`, 1,810 `unverified`, none `approved` yet.
>
> Unverified questions live in `src/content/questions/batches/` and are written with `defineQuestions` (`author.ts`) using reference keys from `refs.ts`. To promote one, check it against its cited pages and set its status to `checked`.

## Reviewing the unverified batches

Batches in `src/content/questions/batches/` are reviewed one file (about 30 questions) at a time: each question is read against the AWS pages it cites, facts that the pages don't support are fixed or re-sourced, and the file is marked `status: 'checked'` with the `checked` date. A question that can't be confirmed from an AWS page keeps `st: 'unverified'` (with a comment saying why) while the rest of its file is checked. A question whose meaning changes gets a new revision.

| Batch | Checked | Result |
|---|---|---|
| `d1-01` (1.1 benefits of the cloud) | 2026-10-25 | 29 checked, 1 left unverified. `clf-d1-0019` (scalability vs elasticity): no AWS page defines the difference. Fixes: `clf-d1-0027` explanation misquoted the hybrid page ("most common" refers to cloud + on-premises hybrids); `clf-d1-0028`–`0030` re-sourced, because "Types of cloud computing" no longer covers IaaS/PaaS/SaaS (now "What is IaaS?" and the shared responsibility model, which states EC2 is IaaS and the customer manages the guest OS; the IaaS page's own table marks the OS as provider-managed, which contradicts it); `clf-d1-0024` now cites the Data Privacy FAQ for customer choice of Region; `clf-d1-0025` dropped an unconfirmed aside about inbound data transfer and cites Cloud Economics (the pricing whitepaper doesn't render); wording aligned with the pages in `clf-d1-0029` and `clf-d1-0038`. |
| `d1-02` (1.2 Well-Architected design principles) | 2026-10-25 | 38 checked, 2 left unverified: `clf-d1-0067` ("disposable resources") and `clf-d1-0069` ("design for failure") come from an older AWS whitepaper and aren't principles in the current Well-Architected Framework. Fixes: renamed principles updated to the current framework: "perform operations as code" is now "safely automate where possible" (`clf-d1-0053`, revision 2; distractor in `0059`) and "learn from all operational failures" is now "learn from all operational events and metrics" (`0054`, revision 2; distractor in `0075`); `0071` merged two separate security principles (now "automate security best practices", revision 2) and said "manage change in automation" (now "through automation"); `0042` and `0045` reworded to the current pillar definitions; `0050` and `0076` explanations aligned with the pages. New sources: the framework's design-principles and definitions pages, REL04-BP02 (loose coupling) for `0065`, `0066` and `0077`, and the Well-Architected Tool pricing page for `0062` ("no additional charge"). |
| `d1-03` (1.3 migration strategies and AWS CAF) | 2026-10-25 | 39 checked, 1 left unverified: `clf-d1-0082` (which AWS CAF perspectives are "business"): the current CAF pages don't group perspectives as business vs technical. Fixes: `0098` renamed to AWS Transform MGN (formerly AWS Application Migration Service), revision 2; `0094` and `0117` reworded around the current definition of relocate ("a cloud version of the platform"), because the 7 Rs page no longer mentions VMware Cloud on AWS, revision 2; `0107` stem wrongly had the Storage Gateway cache serving applications on AWS (it serves on-premises applications), revision 2; `0089` now cites AWS's Oracle migration strategies page, which classifies Oracle to Aurora PostgreSQL as re-architect (refactor); `0102` notes Migration Hub is closed to new customers; `0099`, `0114`, `0119` note the end of Snowball support on 31 December 2026; `0111` distractor no longer claims DMS can't convert code (it now offers AI-assisted code conversion); CAF questions cite the per-perspective whitepaper pages; `0113` cites the Data Privacy FAQ. |
| `d1-04` (1.4 cloud economics) | 2026-10-25 | All 40 checked. Six questions cited the "How AWS Pricing Works" whitepaper, which doesn't render, so they now cite pages that state the facts (Six advantages, Cloud Economics, the AWS pricing page). Fixes: `clf-d1-0128` no longer says Compute Optimizer uses machine learning or covers Lambda (the page names EC2, Auto Scaling groups, EBS and RDS); `0146` reworded to Trusted Advisor's own description ("unused resources" rather than "idle resources and low-utilization instances"); `0145` explanation now uses a documented example (EBS storage is billed until released); `0152` explanation states the documented principle ("the more you use, the less you pay per GB"; the S3 tier table doesn't render); `0126` cites the License Manager docs (Microsoft, SAP, Oracle, IBM; on-premises via Systems Manager); `0138` explanation uses the framework's 40-of-168-hours example; `0150` cites "up to 72%" for Savings Plans; cost-principle questions also cite the framework's cost design principles. |

Each question was written for CloudPrep from the AWS pages it cites, and every cited URL was confirmed to load (HTTP 200) on 2026-10-21. Key facts were checked against the live pages (six advantages, Well-Architected pillars, CAF perspectives, 7 Rs, root-user tasks, shared responsibility, AZ definition, security groups vs network ACLs, S3 storage classes and Glacier, instance store persistence, Spot, Savings Plans, consolidated billing, Budgets, Artifact, Shield Standard, Trusted Advisor, Support plans).

To approve a question, change its `review.status` from `'checked'` to `'approved'`.

## Please look closely at these

| Question | Why |
|---|---|
| `clf-d1-0099`, `0114`, `0119` (AWS Snowball) | AWS discontinues support for Snowball devices in all commercial Regions on 31 December 2026. The explanations say so; revisit, retire or rewrite them at the start of 2027 (and check whether the exam guide still lists Snowball). |
| `clf-d1-0102` (AWS Migration Hub) | Migration Hub has been closed to new customers since 7 November 2025 (AWS Transform offers similar capabilities). The explanation says so; consider replacing the question if the exam guide drops the service. |
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
