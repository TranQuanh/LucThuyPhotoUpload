import json
from datetime import datetime, timezone, timedelta
import hashlib
import os

def mapping_employee_id(emp):
    pass

def convert_datetime(timestamp_ms):
    timestamp_ms = int(timestamp_ms)
    dt_local = datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc).astimezone().isoformat()
    return dt_local

def convert_excel_datetime(timestamp_ms):
    base_date = datetime(1899, 12, 30)  # Excel's base date (due to leap year bug)
    real_date = base_date + timedelta(days=timestamp_ms)
    return real_date.strftime("%Y-%m-%d")

def extract_first_nv_sale(fields):
    nv_sale = fields.get("NV SALE", [])
    first_nv_sale = nv_sale[0] if nv_sale else {"id": None, "name": None}

    return first_nv_sale

def extract_products(fields):
    product_values = fields.get("Sản phẩm dịch vụ quan tâm", [])
    return product_values

def extract_text_field(field):
    """Extracts text from a list if present, otherwise returns None."""
    if isinstance(field, list) and len(field) > 0:
        return field[0].get("text", None)
    return None  # If field is None or not a list

def parse_float(value):
    float_value = float(value) if value is not None else 0.0
    return float_value

def generate_hashkey(*args):
    concat_str = "|".join(str(arg) for arg in args if arg is not None)
    return hashlib.sha256(concat_str.encode()).hexdigest()

def extract_product_data(json_input):
    extracted_data = []
    for item in json_input["data"]["items"]:
        fields = item["fields"]
        record = dict(fields)
        extracted_fields = extract_selected_fields(record)
        save_records_to_json(extracted_fields, 'some_file.json')
        # print(record)
        extracted_data.append(extracted_fields)
    
    
    return extracted_data

def save_records_to_json(records, file_path):
    # Đảm bảo records là list
    if isinstance(records, dict):
        records = [records]
    # Đọc dữ liệu cũ nếu có
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                old_data = json.load(f)
                if isinstance(old_data, dict):
                    old_data = [old_data]
            except Exception:
                old_data = []
    else:
        old_data = []
    # Nối dữ liệu mới vào
    all_data = old_data + records
    with open(file_path, 'w', encoding='utf-8') as json_file:
        json.dump(all_data, json_file, ensure_ascii=False, indent=4)

def extract_selected_fields(record):
    result = {}
    # Mã HĐ (text): lấy trực tiếp
    result['Mã vật tư'] = record.get('Mã vật tư')
    # SDT Khách: lấy text đầu tiên nếu là list
    # result['Tên vật tư'] = record.get('Tên vật tư')[0].get('text')
    result['Tên vật tư'] = record.get('Tên vật tư')
    result['Nhóm'] = record.get('Nhóm');
    result['Phân loại vật tư'] = record.get('Phân loại vật tư');
    return result



