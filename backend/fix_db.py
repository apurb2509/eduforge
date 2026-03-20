import sqlite3

def run_fix():
    conn = sqlite3.connect('./eduforge.db')
    cursor = conn.cursor()
    
    # List of columns to check/add to the 'lectures' table
    columns_to_add = [
        ("thumbnail_url", "TEXT"),
        ("playlist_id", "INTEGER"),
        ("description", "TEXT")
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE lectures ADD COLUMN {col_name} {col_type};")
            print(f"✅ Added {col_name} to lectures.")
        except sqlite3.OperationalError:
            print(f"ℹ️ Column {col_name} already exists.")

    conn.commit()
    conn.close()
    print("Database sync complete.")

if __name__ == "__main__":
    run_fix()