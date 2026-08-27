begin;

select plan(6);

select has_extension('pgtap', 'pgTAP is available in the Supabase database');
select has_schema('auth', 'Supabase Auth schema is available');
select has_table('auth', 'users', 'Supabase Auth owns auth.users');
select has_column('auth', 'users', 'id', 'auth.users exposes its canonical id');
select col_type_is('auth', 'users', 'id', 'uuid', 'auth.users.id is a UUID');
select col_is_pk('auth', 'users', 'id', 'auth.users.id is the primary key');

select * from finish();

rollback;
