SELECT relname AS table_name
FROM pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE pg_namespace.nspname = 'public' 
  AND relkind = 'r' 
  AND NOT relrowsecurity;
