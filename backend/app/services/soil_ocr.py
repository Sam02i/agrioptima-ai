"""Provider-ready Soil Health Card text extraction and normalized field parser."""
import re, shutil, subprocess
from pathlib import Path

ALIASES={"ph":[r"\bp\s*h\b"],"nitrogen":[r"available\s*n(?:itrogen)?",r"\bnitrogen\b"],"phosphorus":[r"available\s*p(?:hosphorus)?",r"\bphosphorus\b",r"p2o5"],"potassium":[r"available\s*k(?:potassium)?",r"\bpotassium\b",r"k2o"]}

def extract_text(path:Path)->tuple[str,str]:
    if shutil.which("tesseract") and path.suffix.lower()!=".pdf":
        result=subprocess.run(["tesseract",str(path),"stdout","-l","eng"],capture_output=True,text=True,timeout=30,check=False)
        if result.returncode==0:return result.stdout,"tesseract"
    return "","unavailable"
def parse_fields(text:str)->dict:
    values={}
    for field,patterns in ALIASES.items():
        for pattern in patterns:
            match=re.search(pattern+r"[^0-9]{0,24}([0-9]+(?:\.[0-9]+)?)",text,re.I)
            if match:values[field]=float(match.group(1));break
    if "ph" in values and not 3<=values["ph"]<=10:values.pop("ph")
    return values
def extract(path:Path)->dict:
    text,provider=extract_text(path);values=parse_fields(text);return {"provider":provider,"values":values,"confidence":.75 if len(values)==4 else .45 if values else 0,"raw_text_available":bool(text)}
