-- extensions
create extension if not exists "uuid-ossp";

-- users
create table if not exists users (
                                     id uuid primary key default uuid_generate_v4(),
    email text not null unique,
    password_hash text not null,
    display_name text,
    currency text default 'USD', -- ISO code
    distance_unit text default 'km', -- km|mi (view only)
    volume_unit text default 'L', -- L|gal (view only)
    time_zone text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

-- vehicles
create table if not exists vehicles (
                                        id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references users(id) on delete cascade,
    name text not null,
    make text,
    model text,
    year int,
    fuel_type text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

create index if not exists idx_vehicles_user on vehicles(user_id);

-- fuel_entries
create table if not exists fuel_entries (
                                            id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references users(id) on delete cascade,
    vehicle_id uuid not null references vehicles(id) on delete cascade,
    date date not null,
    odometer_km integer not null check (odometer_km >= 0),
    station_name text not null,
    fuel_brand text not null,
    fuel_grade text not null,
    liters numeric(10,2) not null check (liters > 0),
    total_amount numeric(12,2) not null check (total_amount > 0),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

create index if not exists idx_entries_vehicle_date on fuel_entries(vehicle_id, date desc);
create index if not exists idx_entries_user on fuel_entries(user_id);

-- simple data integrity helper: prevent future dates
create or replace function check_not_future() returns trigger as $$
begin
  if NEW.date > current_date then
    raise exception 'date cannot be in the future';
end if;
return NEW;
end; $$ language plpgsql;

drop trigger if exists trg_not_future on fuel_entries;
create trigger trg_not_future before insert or update on fuel_entries
                                                   for each row execute function check_not_future();

-- NOTE: rule "odometer monotonically increasing per vehicle" will be
-- validated in backend on insert/update according to MVP.  [oai_citation:1‡Code Jam 2 - final 2.docx](file-service://file-RQwfXcdKJ3K5i3Am3AqPkQ)