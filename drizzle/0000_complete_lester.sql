CREATE TABLE `admin_credentials` (
	`username` text PRIMARY KEY NOT NULL,
	`password_salt` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_iterations` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `progress_updates` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`energy` integer NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`breakthrough` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
