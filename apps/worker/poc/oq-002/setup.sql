\set ON_ERROR_STOP on

begin;

do $block$
begin
  if to_regnamespace('api') is not null
    or to_regnamespace('private') is not null
    or exists (
      select 1
      from pg_catalog.pg_roles
      where rolname = '__s0_oq002_owner'
    )
  then
    raise exception 'OQ-002 POC requires a fresh disposable database';
  end if;
end
$block$;

create role __s0_oq002_owner
  nologin
  nosuperuser
  nocreatedb
  nocreaterole
  noinherit
  noreplication
  nobypassrls;

grant __s0_oq002_owner to postgres
  with set true, inherit false, admin false
  granted by postgres;

create schema private authorization __s0_oq002_owner;
create schema api authorization __s0_oq002_owner;

grant usage on schema auth to __s0_oq002_owner;
grant references (id) on table auth.users to __s0_oq002_owner;

set role __s0_oq002_owner;

create table private.__s0_oq002_scope (
  resource_id uuid primary key,
  subject_id uuid not null references auth.users (id) on delete cascade,
  agency_id uuid not null
);

create index __s0_oq002_scope_subject_agency_idx
  on private.__s0_oq002_scope (subject_id, agency_id);

insert into private.__s0_oq002_scope (resource_id, subject_id, agency_id)
values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000a', 'a0000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000b', 'b0000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000b', 'a0000000-0000-4000-8000-000000000001');

alter table private.__s0_oq002_scope enable row level security;
alter table private.__s0_oq002_scope force row level security;

create policy __s0_oq002_subject_scope
  on private.__s0_oq002_scope
  for select
  to authenticated
  using (
    (select auth.uid()) is not null
    and subject_id = (select auth.uid())
  );

create function api.__s0_oq002_identity_scope()
returns table (
  subject_id uuid,
  agency_ids uuid[],
  resource_ids uuid[]
)
language sql
stable
security invoker
set search_path = ''
as $function$
  select
    auth.uid(),
    array(
      select distinct scope.agency_id
      from private.__s0_oq002_scope as scope
      order by scope.agency_id
    ),
    array(
      select scope.resource_id
      from private.__s0_oq002_scope as scope
      order by scope.resource_id
    );
$function$;

revoke all on schema private from public, anon, authenticated, service_role;
revoke all on schema api from public, anon, authenticated, service_role;
grant usage on schema private to authenticated;
grant usage on schema api to authenticated;

revoke all on table private.__s0_oq002_scope
  from public, anon, authenticated, service_role;
grant select (resource_id, agency_id)
  on table private.__s0_oq002_scope
  to authenticated;

revoke all on function api.__s0_oq002_identity_scope()
  from public, anon, authenticated, service_role;
grant execute on function api.__s0_oq002_identity_scope()
  to authenticated;

reset role;

revoke references (id) on table auth.users from __s0_oq002_owner;
revoke usage on schema auth from __s0_oq002_owner;

revoke __s0_oq002_owner from postgres
  granted by postgres;

notify pgrst, 'reload schema';

commit;
