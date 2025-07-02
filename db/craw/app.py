import requests
import json
import os
import time

# from crawl_customer.crawl_table_1 import crawl_customer_from_lark
# from crawl_employee.crawl_table_9 import crawl_employee_from_lark
from crawl_product.crawl_table_5 import crawl_product_from_lark
# from crawl_worker.crawl_table_6 import crawl_worker_from_lark
# from crawl_transport.crawl_table_7 import crawl_transport_from_lark
# from crawl_import.crawl_table_8 import crawl_import_from_lark
# from crawl_duyetchi.crawl_table_duyetchi import crawl_duyetchi_from_lark
# from crawl_banghoi.crawl_table_4 import crawl_banghoi_from_lark
from crawl_order.crawl_table_2 import crawl_order_from_lark
from crawl_order_detail.crawl_table_3 import crawl_order_details_from_lark
# from crawl_product_price.crawl_table_5_2 import crawl_product_price_from_lark

# from crawl_employee.preprocessing_employee_ggsheet import get_emp_data
from config.lark_config.api_params import *

from datetime import datetime, timedelta
from urllib.parse import quote
import requests
import os
import json

# from crawl_customer.preprocessing_customer import extract_customer_data
from config.lark_config.api_params import *


raw_output_file_path = 'output_1_record_raw/product_raw_full.jsonl'

ORDER_DETAIL_PATH = 'order_detail_selected.json'
ORDER_PATH = 'order_selected.json'
PRODUCT_PATH = 'product_selected.json'
def remove_old_jsons():
    for path in [ORDER_DETAIL_PATH, ORDER_PATH, PRODUCT_PATH]:
        if os.path.exists(path):
            os.remove(path)
            print(f"Đã xóa {path}")

def crawl_xyz_from_lark():
    url = "https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal/"

    headers = {
        "Content-Type": "application/json"
    }

    response = requests.post(url, headers=headers, json=lark_data)

    tenant_access_token = response.json()["tenant_access_token"]
    print(tenant_access_token)


    next_page_token = None
    has_more = True
    num_record = 0

    all_employee_extracted_records = set()
    # remove file before append
    if os.path.exists(raw_output_file_path):
        os.remove(raw_output_file_path)

    while has_more:
        url = f"https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id_5_2}/records?view={view_id_5_2}?page_token={next_page_token}"

        headers = {
            "Authorization": f"Bearer {tenant_access_token}",
            "Content-Type": "application/json"
        }


        params = {
            # "page_size": 2,
            "page_token": next_page_token
        }

        response = requests.get(url, headers=headers, params=params)
        print(response)
        if response.status_code != 200:
            print(f"Error {response.status_code}: {response.text}")
            break

        data = response.json()
                
        has_more = data['data'].get('has_more', False)
        # has_more = False
        next_page_token = data['data'].get('page_token')
    
        with open(raw_output_file_path, "a", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
            f.write("\n")

def get_image():
    url = "https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal/"

    headers = {
        "Content-Type": "application/json"
    }

    response = requests.post(url, headers=headers, json=lark_data)

    tenant_access_token = response.json()["tenant_access_token"]
    print(tenant_access_token)
    
    url = "https://open.larksuite.com/open-apis/drive/v1/medias/GaxQbdV4IosNR5xMAjGlcWxygTe/download?extra=%7B%22bitablePerm%22%3A%7B%22tableId%22%3A%22tbl9BifEvJpiMvwa%22%2C%22rev%22%3A2599%7D%7D"

    headers = {
        "Authorization": f"Bearer {tenant_access_token}",
        "Content-Type": "application/json"
    }


    response = requests.get(url, headers=headers)
    # data = response.raw()
    print(response)


def load_json(json_path):
    with open(json_path, "r", encoding="utf-8") as file:
        return json.load(file)


if __name__ == "__main__":
    remove_old_jsons()
    # crawl_xyz_from_lark() 
    # get_image()
    start_time = time.time()
    # # Bang 1
    # crawl_customer_from_lark()
    # # Bang 9
    # crawl_employee_from_lark()
    # # Bang 7
    # crawl_transport_from_lark()
    # # Bang 6
    # crawl_worker_from_lark()
    # # Bang 8
    # crawl_import_from_lark()
    # Bang 5
    crawl_product_from_lark()
    # # Bang 5_2
    # # crawl_product_price_from_lark()
    # # Bang duyet chi
    # crawl_duyetchi_from_lark()
    # # Bang 4 - Bang hoi
    # crawl_banghoi_from_lark()
    # # Bang 2 - Quan ly hop dong
    crawl_order_from_lark()
    # Bang 3 
    crawl_order_details_from_lark()
    # # pass
    
    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Execution time: {execution_time:.6f} seconds")

    print("Done")