begin;

alter table public.external_activities
drop constraint external_activities_provider_supported;

alter table public.external_activities
add constraint external_activities_provider_supported check (
  provider in ('mock', 'apple_health', 'health_connect', 'garmin', 'intervals', 'strava')
);

commit;
