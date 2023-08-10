import { connect } from "npm:@planetscale/database@1.10.0"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

import "./env.ts"

const migrate = Deno.args.includes("migrate")

declare global {
  interface Window {
    __db_conn: ReturnType<typeof connect>
  }
}

const sql = String.raw

export const conn = connect({
  host: Deno.env.get("DATABASE_HOST"),
  username: Deno.env.get("DATABASE_USERNAME"),
  password: Deno.env.get("DATABASE_PASSWORD"),
})

if (migrate) {
  console.log("Migrating database...")

  await conn.execute(
    sql`
      CREATE TABLE IF NOT EXISTS users (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        email varchar(255) NOT NULL,
        hashedPassword varchar(255) NOT NULL,
        verified tinyint(1) NOT NULL DEFAULT '0',
        PRIMARY KEY (id),
        UNIQUE KEY email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  )
}

export async function login({ email, password }: {
  email: string
  password: string
}) {
  const result = await conn.execute(
    sql`
      SELECT id, hashedPassword FROM users WHERE email = ?
    `,
    [email],
    { as: "object" },
  )

  if (result.rows.length !== 1) {
    return null
  }

  const user = result.rows[0] as { id: string; hashedPassword: string }

  const valid = await bcrypt.compare(password, user.hashedPassword)
  if (!valid) {
    return null
  }

  return {
    id: user.id,
  }
}

export async function signup({ email, password }: {
  email: string
  password: string
}) {
  const hashedPassword = await bcrypt.hash(password)

  const result = await conn.execute(
    sql`
      INSERT INTO users (email, hashedPassword) VALUES (?, ?)
    `,
    [email, hashedPassword],
  )

  if (result.rowsAffected !== 1) {
    return null
  }

  return {
    id: result.insertId,
  }
}
