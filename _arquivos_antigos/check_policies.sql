SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('User', 'IntegrationConfig', 'Tenant', 'TrafficData');
