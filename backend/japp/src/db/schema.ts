import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const posts2 = pgTable('posts2', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
});
