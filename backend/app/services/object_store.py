"""Private S3-compatible storage boundary for soil cards and evidence images."""
import os
from pathlib import Path

BUCKET=os.getenv("OBJECT_STORAGE_BUCKET","");ENDPOINT=os.getenv("OBJECT_STORAGE_ENDPOINT","");ACCESS=os.getenv("OBJECT_STORAGE_ACCESS_KEY","");SECRET=os.getenv("OBJECT_STORAGE_SECRET_KEY","")
def configured():return bool(BUCKET and ACCESS and SECRET)
def store_bytes(key:str,data:bytes,content_type:str,local_fallback:Path)->str:
    if configured():
        import boto3
        client=boto3.client("s3",endpoint_url=ENDPOINT or None,aws_access_key_id=ACCESS,aws_secret_access_key=SECRET,region_name=os.getenv("OBJECT_STORAGE_REGION","auto"));client.put_object(Bucket=BUCKET,Key=key,Body=data,ContentType=content_type,ServerSideEncryption="AES256");return f"s3://{BUCKET}/{key}"
    local_fallback.parent.mkdir(parents=True,exist_ok=True);local_fallback.write_bytes(data);return str(local_fallback)
