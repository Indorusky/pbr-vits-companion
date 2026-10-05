import os
import sys
import re

with open('main.py', 'r', encoding='utf-8') as f:
    code = f.read()

print("File length lines:", len(code.splitlines()))

# Find all route decorators
routes = re.findall(r'@app\.(get|post|put|delete|patch)\([\'"]([^\'"]+)[\'"]', code)
print(f"Total routes found: {len(routes)}")
for method, path in routes:
    print(f"{method.upper():6} {path}")

# Check auth mechanism
print("\n--- AUTH INSPECTION ---")
for kw in ['bcrypt', 'passlib', 'hashlib', 'jwt', 'OAuth2', 'security', 'get_current_user', 'Header', 'Depends']:
    matches = len(re.findall(r'\b' + kw + r'\b', code, re.IGNORECASE))
    print(f"Keyword '{kw}': {matches} occurrences")
