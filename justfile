prod_db := "/workspace/daily-reader/daily-reader.db"

# Seed the production database
prod-seed:
    DB_PATH={{prod_db}} npx tsx src/server/seed.ts
