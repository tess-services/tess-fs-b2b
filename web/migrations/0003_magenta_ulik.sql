ALTER TABLE `invitation` ADD `inviterId` text NOT NULL REFERENCES user(id);