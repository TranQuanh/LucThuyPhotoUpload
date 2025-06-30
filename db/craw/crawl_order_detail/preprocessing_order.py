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

def extract_order_data(json_input):
    extracted_data = []
    for item in json_input["data"]["items"]:
        fields = item["fields"]
        record = dict(fields)
        extracted_fields = extract_selected_fields(record)
        # save_records_to_json(extracted_fields, 'some_file.json')
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
    result['Mã HĐ (text)'] = record.get('Mã HĐ (text)')
    # Mã vật tư (text): lấy text đầu tiên nếu là list
    ma_vattu_text = record.get('Mã vật tư (text)')
    if isinstance(ma_vattu_text, list) and len(ma_vattu_text) > 0:
        result['Mã vật tư (text)'] = ma_vattu_text[0].get('text')
    else:
        result['Mã vật tư (text)'] = ma_vattu_text
    # ID_Detail: lấy text đầu tiên nếu là list
    id_detail = record.get('ID_Detail')
    if isinstance(id_detail, list) and len(id_detail) > 0:
        result['ID_Detail'] = id_detail[0].get('text')
    else:
        result['ID_Detail'] = id_detail
    return result

# Example usage:
# with open('/path/to/input.json', 'r', encoding='utf-8') as f:
#     json_input = json.load(f)
# records = extract_order_data(json_input)
# selected = [extract_selected_fields(r) for r in records]
# save_records_to_json(selected, '/path/to/output_selected.json')


