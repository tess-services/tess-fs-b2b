delete from customer;
ALTER TABLE `customer` ADD `updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL;