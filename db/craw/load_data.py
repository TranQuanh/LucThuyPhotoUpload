import json
import psycopg2
from psycopg2.extras import execute_batch

# Kết nối tới PostgreSQL
conn = psycopg2.connect(
    dbname="uploadphoto",
    user="jeremie",
    password="20112001",
    host="localhost",
    port=5432
)
cur = conn.cursor()
# ---- Đẩy dữ liệu vào bảng products
with open('product_selected.json', 'r', encoding = 'utf-8') as f:
    products = json.load(f)

product_rows= []
for item in products:
    product_id = item.get("Mã vật tư")
    name = item.get("Tên vật tư")
    group_name = item.get("Nhóm")
    product_type = item.get("Phân loại vật tư")
    if not product_id:
        continue
    product_rows.append((product_id, name, group_name, product_type))

sql_product = """
INSERT INTO products (id, name, group_name, product_type)
VALUES (%s, %s, %s, %s)
ON CONFLICT (id) DO NOTHING;
"""
execute_batch(cur, sql_product, product_rows)
conn.commit()
print(f"Đã import {len(product_rows)} bản ghi vào orders.")
# --- Đẩy dữ liệu vào bảng orders ---
with open('order_selected.json', 'r', encoding='utf-8') as f:
    orders = json.load(f)

order_rows = []
for item in orders:
    order_id = item.get("Mã HĐ")
    phonenumber = item.get("SDT Khách")
    if not order_id:
        continue
    order_rows.append((order_id, phonenumber))

sql_order = """
INSERT INTO orders (id, phonenumber)
VALUES (%s, %s)
ON CONFLICT (id) DO NOTHING;
"""
execute_batch(cur, sql_order, order_rows)
conn.commit()
print(f"Đã import {len(order_rows)} bản ghi vào orders.")

# --- Đẩy dữ liệu vào bảng order_details ---
with open('order_detail_selected.json', 'r', encoding='utf-8') as f:
    order_details = json.load(f)
    
order_detail_rows = []
for item in order_details:
    id_detail = item.get("ID_Detail")
    order_id = item.get("Mã HĐ (text)")
    product_id = item.get("Mã vật tư (text)")
    if not id_detail or not order_id or not product_id:
        continue
    # Kiểm tra order_id đã có trong orders chưa
    cur.execute("SELECT 1 FROM orders WHERE id = %s", (order_id,))
    exists = cur.fetchone()
    if not exists:
        phonenumber = order_id.split('_')[0] if '_' in order_id else order_id
        cur.execute(
            "INSERT INTO orders (id, phonenumber) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING;",
            (order_id, phonenumber)
        )
        conn.commit()
    order_detail_rows.append((id_detail, order_id, product_id))

sql_order_detail = """
INSERT INTO order_details (id, order_id, product_id)
VALUES (%s, %s, %s)
ON CONFLICT (id) DO NOTHING;
"""
execute_batch(cur, sql_order_detail, order_detail_rows)
conn.commit()
print(f"Đã import {len(order_detail_rows)} bản ghi vào order_details.")

cur.close()
conn.close()