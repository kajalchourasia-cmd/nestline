"""Freeze hashes for Stage 9 UI surfaces excluded from this improvement pass."""
from __future__ import annotations
from hashlib import sha256
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data/stage9_ui_immutability_manifest.json"
PREFIXES=("streamlit_app.py",".streamlit","app/pages_and_components","assets","docs/stage9-ui-evidence")
def paths():
 result=[]
 for item in PREFIXES:
  path=ROOT/item
  if path.is_file(): result.append(path)
  elif path.is_dir(): result.extend(p for p in path.rglob("*") if p.is_file())
 return sorted(set(result))
def main():
 rows=[{"path":p.relative_to(ROOT).as_posix(),"sha256":sha256(p.read_bytes()).hexdigest()} for p in paths()]
 payload={"schema_version":"stage9-ui-immutability-v1","base_commit":"796c05cd29a055188e86685990078709fca0bfbc","files":rows}
 OUT.write_text(json.dumps(payload,indent=2,sort_keys=True)+"\n",encoding="utf-8")
 print(f"stage9 excluded files frozen: {len(rows)}/{len(rows)}")
 return 0
if __name__=="__main__": raise SystemExit(main())