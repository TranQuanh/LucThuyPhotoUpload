from datetime import datetime, timedelta
from urllib.parse import quote
import requests
import os
import json


from crawl_order_detail.preprocessing_order import extract_order_data, save_records_to_json
from config.lark_config.api_params import *
# from config.mongo_config import MONGO_URI, MONGO_DB, MONGO_COLLECTIONS


def crawl_order_details_from_lark():
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


    while has_more:
        url = f"https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id_3}/records?view={view_id_3}?page_token={next_page_token}"

        headers = {
            "Authorization": f"Bearer {tenant_access_token}",
            "Content-Type": "application/json"
        }


        params = {
            # "page_size": 1,
            "page_token": next_page_token
        }

        response = requests.get(url, headers=headers, params=params)
        print(response)
        if response.status_code != 200:
            print(f"Error {response.status_code}: {response.text}")
            break

        data = response.json()
        # print(data)

        # extracted_record, extra_extract_sale_data = extract_customer_data(data)
        extracted_record = extract_order_data(data)
        # Lưu toàn bộ dữ liệu đã extract vào file json
        # print(extracted_record)
        save_records_to_json(extracted_record, 'order_detail_selected.json')
        num_record += len(extracted_record)
        print(num_record)
        if extracted_record:
            # print(extracted_record)
            # Save the first record to a JSON file
            # load_record_to_json(extracted_record[0], "/path/to/output.json")
            # collection.insert_many(extracted_record)
            print(f"Inserted {len(extracted_record)} ")
        has_more = data['data'].get('has_more', False)
        # has_more = False
        next_page_token = data['data'].get('page_token')



