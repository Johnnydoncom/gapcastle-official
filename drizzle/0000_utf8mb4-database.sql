-- Tables created by drizzle-kit inherit the database default character set.
-- Shared hosts often default to latin1; switch to utf8mb4 before any table exists
-- so names, addresses and the naira sign (₦) are stored correctly.
ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
