# Database Connections Explained

## Two Ways to Connect to PostgreSQL

There are **two different methods** to connect to your PostgreSQL database, each used for different purposes:

---

## Method 1: Direct psql Command (For Migrations)

### How It Works:
```bash
sudo -u postgres psql globapp_db -f migrations/003.sql
```

### Connection Details:
- **User**: `postgres` (PostgreSQL superuser)
- **Method**: Unix Socket (local file-based connection)
- **Path**: `/var/run/postgresql/.s.PGSQL.5432`
- **Authentication**: Peer authentication (no password needed)
- **Database**: Specified directly (`globapp_db`)

### Why No DATABASE_URL Needed:
1. **Local Connection**: You're connecting from the same machine where PostgreSQL runs
2. **Unix Socket**: Uses a special file (`/var/run/postgresql/.s.PGSQL.5432`) instead of network
3. **Peer Auth**: PostgreSQL recognizes you're the `postgres` user and allows connection
4. **Superuser Access**: `postgres` user has full privileges, can run any SQL

### When to Use:
- ✅ Running database migrations
- ✅ Manual SQL queries
- ✅ Database administration tasks
- ✅ Creating/dropping databases

### Example:
```bash
# Connect to database
sudo -u postgres psql globapp_db

# Run migration file
sudo -u postgres psql globapp_db -f migrations/001.sql

# Execute SQL directly
sudo -u postgres psql globapp_db -c "SELECT * FROM rides LIMIT 5;"
```

---

## Method 2: Application Connection String (For Python App)

### How It Works:
```python
# In app.py
DB_URL = os.getenv("DATABASE_URL")
conn = psycopg.connect(DB_URL)
```

### Connection Details:
- **User**: `globapp_user` (application user, not superuser)
- **Method**: TCP/IP network connection
- **Host**: `localhost` or IP address
- **Port**: `5432` (default PostgreSQL port)
- **Authentication**: Password-based
- **Format**: `postgresql://user:password@host:port/database`

### Why DATABASE_URL is Required:
1. **Network Connection**: App connects via TCP/IP (even if localhost)
2. **Credentials Needed**: Application user needs username/password
3. **Security**: Uses password authentication, not peer auth
4. **Portability**: Can connect to remote databases, not just local

### Example DATABASE_URL:
```
postgresql://globapp_user:2024@localhost:5432/globapp_db
```
Breaking it down:
- `postgresql://` - Protocol
- `globapp_user` - Username
- `2024` - Password
- `localhost` - Host (or IP address)
- `5432` - Port
- `globapp_db` - Database name

### When to Use:
- ✅ Your Python/FastAPI application
- ✅ Any application code that needs database access
- ✅ Remote connections (different server)
- ✅ Production deployments

---

## Visual Comparison

### Migration Connection (psql):
```
Your Terminal
    ↓
sudo -u postgres
    ↓
Unix Socket (/var/run/postgresql/.s.PGSQL.5432)
    ↓
PostgreSQL Server
    ↓
Database: globapp_db
```
**No password needed!** Uses file-based connection.

### Application Connection (Python):
```
Your Python App
    ↓
psycopg.connect(DATABASE_URL)
    ↓
TCP/IP Network (localhost:5432)
    ↓
PostgreSQL Server (with password auth)
    ↓
Database: globapp_db
```
**Password required!** Uses network connection.

---

## Key Differences Summary

| Feature | psql Command | Application (DATABASE_URL) |
|---------|-------------|---------------------------|
| **User** | `postgres` (superuser) | `globapp_user` (app user) |
| **Connection** | Unix Socket | TCP/IP Network |
| **Auth Method** | Peer (no password) | Password required |
| **Needs DATABASE_URL?** | ❌ No | ✅ Yes |
| **Use Case** | Migrations, Admin | Application code |
| **Can Connect Remotely?** | ❌ No (local only) | ✅ Yes |

---

## Why This Matters

### Security:
- **Migrations**: Run as superuser, but only locally (secure)
- **Application**: Uses limited user with password (more secure for production)

### Flexibility:
- **Migrations**: Simple, no config needed
- **Application**: Can connect to remote databases, use connection pooling, etc.

### Best Practice:
1. **Migrations**: Use `sudo -u postgres psql` (simple, local)
2. **Application**: Use `DATABASE_URL` environment variable (flexible, secure)

---

## Common Questions

### Q: Can I use DATABASE_URL for migrations?
**A**: Yes! You can:
```bash
psql $DATABASE_URL -f migrations/001.sql
```
But `sudo -u postgres psql` is simpler for local migrations.

### Q: Can I use psql command in my Python app?
**A**: Not recommended. Use `psycopg.connect()` with DATABASE_URL for better:
- Connection pooling
- Error handling
- Transaction management
- Security

### Q: Why does `sudo -u postgres` work without password?
**A**: PostgreSQL uses "peer authentication" for local connections:
- Checks your Linux username matches PostgreSQL username
- `sudo -u postgres` makes you the `postgres` user
- PostgreSQL trusts local `postgres` user connections
- No password needed for security (local only)

---

## Quick Reference

### Run Migration:
```bash
sudo -u postgres psql globapp_db -f migrations/003.sql
```

### Check Database Structure:
```bash
sudo -u postgres psql globapp_db -c "\d payments"
```

### Set DATABASE_URL (for app):
```bash
export DATABASE_URL="postgresql://globapp_user:2024@localhost:5432/globapp_db"
```

### Test Application Connection:
```python
import psycopg
conn = psycopg.connect(os.getenv("DATABASE_URL"))
```

---

## Summary

**Two tools, same database:**
- **psql**: Direct local connection, no password, for admin tasks
- **Application**: Network connection with password, for app code

Both connect to the same `globapp_db` database, just using different methods! 🎯

