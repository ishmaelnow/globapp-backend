import os
import psycopg
from psycopg.rows import dict_row

def get_conn():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL is missing. Set it in /etc/globapp-api.env")
    return psycopg.connect(db_url, row_factory=dict_row)
