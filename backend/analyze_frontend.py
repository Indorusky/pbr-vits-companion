import os
import glob
import re

frontend_pages_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/src/pages"))
files = glob.glob(os.path.join(frontend_pages_dir, "*.tsx"))

print(f"Analyzing {len(files)} frontend page components in {frontend_pages_dir}...")

report = {}

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        code = f.read()
    
    # Find fetch / API calls
    fetch_calls = re.findall(r'fetch\([`\'"]([^`\'"]+)[`\'"]', code)
    fetch_template_calls = re.findall(r'fetch\(`\${API_BASE_URL}([^`]+)`', code)
    
    # Find localStorage usage
    local_storage = re.findall(r'localStorage\.(getItem|setItem|removeItem)\([\'"]([^\'"]+)[\'"]\)', code)
    
    # Find static/mock arrays
    mock_arrays = re.findall(r'const\s+([A-Z0-9_]+)\s*=\s*\[', code)
    
    # Look for TODO / dead handlers
    dead_handlers = re.findall(r'onClick=\{\(\)\s*=>\s*\{\s*\}\}', code)
    alert_handlers = re.findall(r'alert\([^\)]+\)', code)
    
    report[fname] = {
        "fetch_endpoints": list(set(fetch_template_calls + fetch_calls)),
        "localStorage_keys": list(set([k for op, k in local_storage])),
        "mock_constants": mock_arrays[:5],
        "dead_handlers_count": len(dead_handlers),
        "alert_handlers_count": len(alert_handlers),
        "has_api_base_url": "API_BASE_URL" in code
    }

print("=== FRONTEND API & MOCK INVENTORY ===")
for fname, info in sorted(report.items()):
    print(f"\n[{fname}] (Uses API_BASE_URL: {info['has_api_base_url']})")
    print(f"  Fetch Endpoints ({len(info['fetch_endpoints'])}): {info['fetch_endpoints']}")
    print(f"  LocalStorage Keys: {info['localStorage_keys']}")
    print(f"  Mock/Static Constants: {info['mock_constants']}")
    if info['dead_handlers_count']:
        print(f"  Dead onClick handlers: {info['dead_handlers_count']}")
    if info['alert_handlers_count']:
        print(f"  Alert() popups: {info['alert_handlers_count']}")
