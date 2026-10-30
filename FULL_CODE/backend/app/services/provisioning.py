import os
import csv
import json
import zipfile
import secrets
import string
from pathlib import Path
from app.database import SessionLocal
from app.models import UserAccount, CustomerProfileRecord
from app.services.auth_service import hash_password

EXCEL_OUTPUT_DIR = Path(__file__).resolve().parent.parent / "admin_artifacts"
EXCEL_OUTPUT_PATH = EXCEL_OUTPUT_DIR / "demo_customer_credentials.xlsx"

def generate_secure_password(length: int = 12) -> str:
    """Generates an unambiguous, strong temporary password."""
    alphabet = string.ascii_letters + string.digits + "@#$*"
    while True:
        pw = "".join(secrets.choice(alphabet) for _ in range(length))
        if (any(c.islower() for c in pw) and
            any(c.isupper() for c in pw) and
            any(c.isdigit() for c in pw) and
            any(c in "@#$*" for c in pw)):
            return pw

def create_excel_workbook(filepath: Path, headers: list, rows: list):
    """Generates a valid OOXML .xlsx workbook using standard library zipfile and XML."""
    sheet_data = []
    # Row 1: Headers
    sheet_data.append('<row r="1">')
    for col_idx, h in enumerate(headers, 1):
        col_letter = chr(64 + col_idx)
        sheet_data.append(f'<c r="{col_letter}1" t="inlineStr"><is><t>{h}</t></is></c>')
    sheet_data.append('</row>')

    # Rows 2..N
    for row_idx, r in enumerate(rows, 2):
        sheet_data.append(f'<row r="{row_idx}">')
        for col_idx, val in enumerate(r, 1):
            col_letter = chr(64 + col_idx)
            val_str = str(val).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            sheet_data.append(f'<c r="{col_letter}{row_idx}" t="inlineStr"><is><t>{val_str}</t></is></c>')
        sheet_data.append('</row>')

    sheet_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
    <sheetData>{''.join(sheet_data)}</sheetData>
</worksheet>'''

    content_types_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
    <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>'''

    rels_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>'''

    wb_rels_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>'''

    wb_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <sheets>
        <sheet name="Demo Customer Credentials" sheetId="1" r:id="rId1"/>
    </sheets>
</workbook>'''

    filepath.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(filepath, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('[Content_Types].xml', content_types_xml)
        zf.writestr('_rels/.rels', rels_xml)
        zf.writestr('xl/_rels/workbook.xml.rels', wb_rels_xml)
        zf.writestr('xl/workbook.xml', wb_xml)
        zf.writestr('xl/worksheets/sheet1.xml', sheet_xml)

def provision_demo_customers():
    """
    Provisions the 200 synthetic demo customer accounts idempotently.
    Reads customer_profiles.csv, hashes passwords into user_accounts,
    and writes the administrator-only credential workbook without silently overwriting.
    """
    csv_path = Path(__file__).resolve().parent.parent.parent / "data" / "customer_profiles.csv"
    if not csv_path.exists():
        csv_path = Path(__file__).resolve().parent.parent.parent.parent / "FULL_CODE" / "data" / "customer_profiles.csv"
    if not csv_path.exists():
        csv_path = Path("E:/TalentAP/FULL_CODE/data/customer_profiles.csv")
    if not csv_path.exists():
        csv_path = Path("E:/TalentAP/Datasets/B2_Life_Insurance_Needs_Finder/data/customer_profiles.csv")

    if not csv_path.exists():
        raise FileNotFoundError(f"Source customer_profiles.csv not found at {csv_path}")

    # Read profiles from CSV
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        profiles = list(reader)

    if len(profiles) != 200:
        raise ValueError(f"Expected exactly 200 customer profiles, found {len(profiles)}")

    db = SessionLocal()
    workbook_rows = []
    headers = [
        "Customer ID",
        "Full Name",
        "Login ID (Username)",
        "Temporary Password",
        "First-Login Password-Change Required",
        "Role",
        "Account Status"
    ]

    try:
        for p in profiles:
            pid = p["profile_id"]
            name = p.get("full_name", pid)
            login_id = pid  # Customer profile_id is the unique login ID

            # Check if UserAccount exists
            existing = db.query(UserAccount).filter_by(user_id=login_id).first()
            if not existing:
                temp_pw = generate_secure_password()
                pw_hash, salt = hash_password(temp_pw)
                user_account = UserAccount(
                    user_id=login_id,
                    role="customer",
                    password_hash=pw_hash,
                    salt=salt,
                    full_name=name,
                    email=f"{pid.lower()}@lifewise.demo",
                    must_change_password=True,
                    is_active=True,
                    linked_profile_id=pid,
                )
                db.add(user_account)
                workbook_rows.append([pid, name, login_id, temp_pw, "YES (must_change_password=True)", "customer", "Active"])
            else:
                # Account already provisioned
                workbook_rows.append([pid, name, login_id, "[PREVIOUSLY PROVISIONED]", str(existing.must_change_password), existing.role, "Active" if existing.is_active else "Suspended"])

        db.commit()

        # Generate or preserve administrator Excel artifact
        if not EXCEL_OUTPUT_PATH.exists():
            create_excel_workbook(EXCEL_OUTPUT_PATH, headers, workbook_rows)
            print(f"Created administrator credential workbook: {EXCEL_OUTPUT_PATH}")
        else:
            print(f"Administrator credential workbook already exists at {EXCEL_OUTPUT_PATH} (never overwritten silently).")

    finally:
        db.close()

if __name__ == "__main__":
    provision_demo_customers()
