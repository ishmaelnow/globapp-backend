# Run Payment Migration - Correct Connection

## Option 1: Use DATABASE_URL from Environment

```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# If it's set, use it directly:
psql "$DATABASE_URL" -f migrations/004_add_payments_table.sql
```

## Option 2: Get DATABASE_URL from Backend Config

```bash
# Check backend environment file
sudo cat /etc/globapp-api.env | grep DATABASE_URL

# Then use it:
psql "postgresql://user:password@host:port/database" -f migrations/004_add_payments_table.sql
```

## Option 3: Connect Directly (If you know credentials)

```bash
# Replace with your actual database credentials
psql -h localhost -U globapp_user -d globapp_db -f migrations/004_add_payments_table.sql
```

## Option 4: Use Python to Run Migration (Safest)

```bash
cd ~/globapp-backend
source .venv/bin/activate

# Create a simple script to run migration
python3 << 'EOF'
import os
import psycopg

# Get DATABASE_URL from environment (same way backend does)
db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not found. Check /etc/globapp-api.env")
    exit(1)

# Read migration SQL
with open("migrations/004_add_payments_table.sql", "r") as f:
    migration_sql = f.read()

# Execute migration
try:
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute(migration_sql)
            conn.commit()
    print("✅ Migration successful!")
except Exception as e:
    print(f"❌ Migration failed: {e}")
EOF
```

## Quick Test After Migration

```bash
# Check if table exists
python3 << 'EOF'
import os
import psycopg

db_url = os.getenv("DATABASE_URL")
if db_url:
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM payments")
            count = cur.fetchone()[0]
            print(f"✅ Payments table exists! Current records: {count}")
else:
    print("DATABASE_URL not found")
EOF
```



