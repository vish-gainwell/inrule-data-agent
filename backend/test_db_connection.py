"""
SQL Server connection test.
Reads connection details from ../.env or .env in this folder.
Run with:  uv run python test_db_connection.py
"""

import os
import sys
from pathlib import Path


def load_env(path: Path) -> dict[str, str]:
    """Minimal .env parser — no external deps needed."""
    result = {}
    if not path.exists():
        return result
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, _, val = line.partition("=")
            result[key.strip()] = val.strip().strip('"').strip("'")
    return result


def find_env() -> dict[str, str]:
    """Try .env in this folder, then parent folder."""
    here = Path(__file__).parent
    for candidate in [here / ".env", here.parent / ".env"]:
        env = load_env(candidate)
        if env:
            print(f"Loaded env from: {candidate}")
            return env
    return {}


def try_connect(env: dict[str, str]):
    try:
        import pyodbc
    except ImportError:
        print("ERROR: pyodbc not installed. Run: uv add pyodbc")
        sys.exit(1)

    # Support common .env key names
    server   = env.get("hostname")    or env.get("DB_SERVER")   or env.get("SQL_SERVER")   or env.get("MSSQL_HOST")
    database = env.get("database")    or env.get("DB_DATABASE") or env.get("SQL_DATABASE") or env.get("DB_NAME")
    username = env.get("username")    or env.get("DB_USER")     or env.get("SQL_USER")     or env.get("DB_USERNAME")
    password = env.get("password")    or env.get("DB_PASSWORD") or env.get("SQL_PASSWORD") or env.get("DB_PASS")
    driver   = env.get("DB_DRIVER")   or "ODBC Driver 18 for SQL Server"
    port     = env.get("port")        or env.get("DB_PORT")     or env.get("SQL_PORT")     or "1433"
    trust_cert = env.get("DB_TRUST_SERVER_CERTIFICATE") or env.get("TRUST_SERVER_CERTIFICATE") or "no"

    print("\n--- Connection parameters (values masked) ---")
    print(f"  Server  : {server}")
    print(f"  Database: {database}")
    print(f"  User    : {username}")
    print(f"  Password: {'*' * len(password) if password else 'NOT SET'}")
    print(f"  Driver  : {driver}")
    print(f"  Port    : {port}")
    print(f"  TrustServerCertificate: {trust_cert}")

    missing = [k for k, v in [("server", server), ("database", database), ("username", username), ("password", password)] if not v]
    if missing:
        print(f"\nERROR: Missing env vars for: {missing}")
        print("Expected keys (any of these work):")
        print("  DB_SERVER / SQL_SERVER / MSSQL_HOST")
        print("  DB_DATABASE / SQL_DATABASE / DB_NAME / MSSQL_DB")
        print("  DB_USER / SQL_USER / DB_USERNAME / MSSQL_USER")
        print("  DB_PASSWORD / SQL_PASSWORD / DB_PASS / MSSQL_PASS")
        sys.exit(1)

    conn_str = (
        f"DRIVER={{{driver}}};"
        f"SERVER={server},{port};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
        f"TrustServerCertificate={trust_cert};"
    )

    print("\n--- Attempting connection ---")
    try:
        conn = pyodbc.connect(conn_str, timeout=10)
        cursor = conn.cursor()
        cursor.execute("SELECT @@VERSION")
        version = cursor.fetchone()[0].split("\n")[0].strip()
        cursor.execute("SELECT DB_NAME()")
        db_name = cursor.fetchone()[0]
        conn.close()
        print(f"  SUCCESS")
        print(f"  Connected to database : {db_name}")
        print(f"  SQL Server version    : {version}")
        return True
    except pyodbc.Error as e:
        print(f"  FAILED: {e}")
        # Give a useful hint for common errors
        msg = str(e).lower()
        if "login failed" in msg:
            print("  HINT: Username or password is wrong.")
        elif "cannot open" in msg or "network" in msg or "timeout" in msg:
            print("  HINT: Server not reachable. Check server name, port, firewall, or VPN.")
        elif "ssl" in msg or "certificate" in msg:
            print("  HINT: Try adding DB_TRUST_SERVER_CERTIFICATE=yes to your .env")
        return False


if __name__ == "__main__":
    env = find_env()
    if not env:
        print("ERROR: No .env file found in this folder or parent folder.")
        sys.exit(1)

    success = try_connect(env)
    sys.exit(0 if success else 1)
