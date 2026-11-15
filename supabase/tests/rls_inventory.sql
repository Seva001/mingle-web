-- Run in the target Supabase SQL editor after all migrations have been applied.
-- Inventory only: this query does not prove policy correctness or substitute for role-based tests.
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  coalesce(array_agg(distinct p.policyname) filter (where p.policyname is not null), '{}') as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname
where n.nspname = 'public'
  and c.relkind = 'r'
group by n.nspname, c.relname, c.relrowsecurity, c.relforcerowsecurity
order by c.relname;

-- Expected review: every member/private table has RLS enabled and narrowly scoped policies.
-- Any table with RLS disabled, no policy, or an unexpectedly broad policy is a release blocker.
