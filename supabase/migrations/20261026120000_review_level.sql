-- Review schedule level per question (docs/DECISIONS.md D-052).
--
-- Nullable on purpose: rows saved before this column, and rows written by an app version
-- still open in a browser from before it, have no level. The app estimates one for them
-- (legacyReviewLevel) and corrects a stale level when the latest answer is wrong, so no
-- cross-column check is added here.

alter table public.question_progress
  add column review_level smallint
    check (review_level is null or review_level between 0 and 4);
