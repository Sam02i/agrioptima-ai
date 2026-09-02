"""Evaluate the deployed freshness model on a held-out labelled directory."""
import argparse, json, sys
from pathlib import Path
import numpy as np

ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
from app.api.freshness import load_and_predict, FIVE_CLASS_NAMES

def main():
    parser=argparse.ArgumentParser();parser.add_argument("dataset",type=Path,help="Folders 0..4 or class names containing held-out images");parser.add_argument("--output",type=Path,default=Path("freshness-evaluation.json"));args=parser.parse_args()
    aliases={str(i):i for i in range(5)}|{name.lower():i for i,name in FIVE_CLASS_NAMES.items()};truth=[];predicted=[];errors=[]
    for folder in args.dataset.iterdir():
        if not folder.is_dir() or folder.name.lower() not in aliases:continue
        expected=aliases[folder.name.lower()]
        for image in folder.iterdir():
            if image.suffix.lower() not in {".jpg",".jpeg",".png",".webp"}:continue
            try:prob=np.asarray(load_and_predict(image));truth.append(expected);predicted.append(int(np.argmax(prob)))
            except Exception as exc:errors.append({"file":str(image),"error":str(exc)})
    matrix=[[0]*5 for _ in range(5)]
    for actual,pred in zip(truth,predicted):matrix[actual][pred]+=1
    per_class={}
    for i,name in FIVE_CLASS_NAMES.items():
        tp=matrix[i][i];fp=sum(row[i] for row in matrix)-tp;fn=sum(matrix[i])-tp;precision=tp/(tp+fp) if tp+fp else 0;recall=tp/(tp+fn) if tp+fn else 0;per_class[name]={"precision":round(precision,4),"recall":round(recall,4),"f1":round(2*precision*recall/(precision+recall),4) if precision+recall else 0,"support":sum(matrix[i])}
    report={"samples":len(truth),"accuracy":round(sum(a==b for a,b in zip(truth,predicted))/len(truth),4) if truth else 0,"confusion_matrix":matrix,"per_class":per_class,"errors":errors,"dataset":str(args.dataset),"warning":"Use only held-out, consented, representative images."};args.output.write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
if __name__=="__main__":main()
