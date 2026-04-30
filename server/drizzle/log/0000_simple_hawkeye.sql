CREATE TABLE `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer DEFAULT (strftime('%ms', 'now')) NOT NULL,
	`level` text NOT NULL,
	`category` text,
	`message` text NOT NULL,
	`data` text
);
