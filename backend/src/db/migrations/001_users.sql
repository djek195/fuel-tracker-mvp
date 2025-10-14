create extension if not exists pgcrypto;

create table if not exists users (
                                     id            uuid primary key default gen_random_uuid(),
    email         text not null,
    password_hash text not null,
    display_name  text,
    currency      text,
    distance_unit text,
    volume_unit   text,
    time_zone     text,
    created_at    timestamptz not null default now()
    );

create unique index if not exists users_email_uq on users (lower(email));