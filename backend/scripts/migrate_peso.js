const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const sql = `
ALTER TABLE preguntas
ADD COLUMN IF NOT EXISTS peso INTEGER;

UPDATE preguntas
SET peso = CASE nivel
  WHEN 'FACIL' THEN 1
  WHEN 'MEDIO' THEN 2
  ELSE 3
END
WHERE peso IS NULL;

ALTER TABLE preguntas
ALTER COLUMN peso SET NOT NULL;

ALTER TABLE preguntas
ALTER COLUMN peso SET DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'preguntas_peso_check'
  ) THEN
    ALTER TABLE preguntas
    ADD CONSTRAINT preguntas_peso_check CHECK (peso BETWEEN 1 AND 5);
  END IF;
END $$;
`;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no configurado");
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

client
  .connect()
  .then(async () => {
    await client.query(sql);
    console.log("Migracion aplicada");
    await client.end();
  })
  .catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
