\set ON_ERROR_STOP on

begin;

set local search_path = pg_catalog, extensions;

select plan(9);

select ok(
  (
    select
      not rolcanlogin
      and not rolsuper
      and not rolcreatedb
      and not rolcreaterole
      and not rolinherit
      and not rolreplication
      and not rolbypassrls
      and not pg_has_role('postgres', '__s0_oq002_owner', 'SET')
      and not pg_has_role('postgres', '__s0_oq002_owner', 'USAGE')
    from pg_catalog.pg_roles
    where rolname = '__s0_oq002_owner'
  ),
  'POC owner has no login, bypass or administration capability'
);

select ok(
  (
    select nspowner = '__s0_oq002_owner'::regrole
    from pg_catalog.pg_namespace
    where nspname = 'api'
  )
  and (
    select nspowner = '__s0_oq002_owner'::regrole
    from pg_catalog.pg_namespace
    where nspname = 'private'
  )
  and (
    select relowner = '__s0_oq002_owner'::regrole
    from pg_catalog.pg_class
    where oid = 'private.__s0_oq002_scope'::regclass
  )
  and (
    select proowner = '__s0_oq002_owner'::regrole
    from pg_catalog.pg_proc
    where oid = 'api.__s0_oq002_identity_scope()'::regprocedure
  )
  and not has_schema_privilege('postgres', 'api', 'USAGE')
  and not has_schema_privilege('postgres', 'api', 'CREATE')
  and not has_schema_privilege('postgres', 'private', 'USAGE')
  and not has_schema_privilege('postgres', 'private', 'CREATE'),
  'POC schemas, table and function use the hardened owner'
);

select ok(
  (
    select relrowsecurity and relforcerowsecurity
    from pg_catalog.pg_class
    where oid = 'private.__s0_oq002_scope'::regclass
  ),
  'RLS is enabled and forced'
);

select ok(
  (
    select
      not prosecdef
      and provolatile = 's'
      and 'search_path=""' = any(coalesce(proconfig, '{}'::text[]))
    from pg_catalog.pg_proc
    where oid = 'api.__s0_oq002_identity_scope()'::regprocedure
  ),
  'RPC is stable, security invoker and has an empty search_path'
);

select ok(
  not has_schema_privilege('anon', 'api', 'USAGE')
  and not has_schema_privilege('anon', 'private', 'USAGE')
  and not has_function_privilege(
    'anon',
    'api.__s0_oq002_identity_scope()',
    'EXECUTE'
  )
  and not has_function_privilege(
    'service_role',
    'api.__s0_oq002_identity_scope()',
    'EXECUTE'
  ),
  'anonymous and service roles have no POC RPC grant'
);

select ok(
  has_schema_privilege('authenticated', 'api', 'USAGE')
  and has_schema_privilege('authenticated', 'private', 'USAGE')
  and has_function_privilege(
    'authenticated',
    'api.__s0_oq002_identity_scope()',
    'EXECUTE'
  )
  and has_column_privilege(
    'authenticated',
    'private.__s0_oq002_scope',
    'resource_id',
    'SELECT'
  )
  and has_column_privilege(
    'authenticated',
    'private.__s0_oq002_scope',
    'agency_id',
    'SELECT'
  )
  and not has_column_privilege(
    'authenticated',
    'private.__s0_oq002_scope',
    'subject_id',
    'SELECT'
  )
  and not has_table_privilege(
    'authenticated',
    'private.__s0_oq002_scope',
    'INSERT'
  )
  and not has_table_privilege(
    'authenticated',
    'private.__s0_oq002_scope',
    'UPDATE'
  )
  and not has_table_privilege(
    'authenticated',
    'private.__s0_oq002_scope',
    'DELETE'
  ),
  'authenticated has only the grants needed by the invoker RPC'
);

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-00000000000a',
  true
);

select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","sub":"00000000-0000-4000-8000-00000000000a"}',
  true
);

set local role authenticated;

select set_config(
  'loya.oq002_authenticated_resource_ids',
  (select resource_ids::text from api.__s0_oq002_identity_scope()),
  true
);

reset role;

select is(
  current_setting('loya.oq002_authenticated_resource_ids')::uuid[],
  array['10000000-0000-4000-8000-000000000001'::uuid],
  'user A sees only its resource through auth.uid() and RLS'
);

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{}', true);

grant __s0_oq002_owner to postgres
  with set true, inherit false, admin false
  granted by postgres;

set local role __s0_oq002_owner;

select set_config(
  'loya.oq002_owner_count',
  (select count(*)::text from private.__s0_oq002_scope),
  true
);

reset role;

select is(
  current_setting('loya.oq002_owner_count')::bigint,
  0::bigint,
  'FORCE RLS applies to the table owner without a JWT'
);

revoke __s0_oq002_owner from postgres
  granted by postgres;

select ok(
  not pg_has_role('postgres', '__s0_oq002_owner', 'SET')
  and not pg_has_role('postgres', '__s0_oq002_owner', 'USAGE'),
  'verification leaves no effective owner capability on postgres'
);

select * from finish();

rollback;
