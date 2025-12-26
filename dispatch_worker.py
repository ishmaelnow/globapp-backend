import os
import psycopg2

def main():
    dsn = os.environ["DATABASE_URL"]
    conn = psycopg2.connect(dsn)
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, status
                FROM rides
                WHERE status IN ('requested','accepted','enroute')
                ORDER BY created_at_utc ASC
                LIMIT 1
            """)
            row = cur.fetchone()
            if not row:
                return
            ride_id, status = row

            next_status = {
                "requested": "accepted",
                "accepted": "enroute",
                "enroute": "completed",
            }[status]

            cur.execute("UPDATE rides SET status=%s WHERE id=%s", (next_status, ride_id))
    conn.close()

if __name__ == "__main__":
    main()
