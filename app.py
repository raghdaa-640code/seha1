import os
import re
import logging
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request, send_from_directory
import requests

load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="templates")
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

@app.get("/")
def home():
    return render_template("index.html")

# Keep the old public asset paths working for image references in the existing HTML/CSS.
@app.get("/views/<path:filename>")
def legacy_view_assets(filename):
    return send_from_directory(os.path.join(app.static_folder, "views"), filename)

@app.get("/js/<path:filename>")
def legacy_js_assets(filename):
    return send_from_directory(os.path.join(app.static_folder, "js"), filename)

@app.get("/api/seha/inquiries/sick-leave-details")
def sick_leave_details():
    patient_id = request.args.get("PatientId", "")
    service_code = request.args.get("NormalizedServiceCode", "")

    if not re.fullmatch(r"\d{10}", patient_id):
        return jsonify(ok=False, message="رقم الهوية يجب أن يتكون من 10 أرقام"), 422
    if not service_code or len(service_code) > 50:
        return jsonify(ok=False, message="رقم الإجازة مطلوب"), 422
    
    # Demo mode for local testing only.
    if os.getenv("DEMO_MODE", "false").lower() == "true":
        if patient_id == "1234567890" and service_code == "DEMO12345":
            return jsonify(ok=True, data={
                "service_code": "DEMO12345",
                "report_type": "إجازة مرضية تجريبية",
                "admission_date": "2026-10-20",
                "discharge_date": "2026-10-22",
                "leave_duration_days": 3,
                "issue_date": "2026-10-20",
                "report_time": "10:30:00",
                "national_id": "1234567890",
                "patient_name_ar": "مستخدم تجريبي",
                "patient_name_en": "Demo User",
                "nationality": "تجريبي",
                "employer": "جهة تجريبية",
                "practitioner_name_ar": "طبيب تجريبي",
                "practitioner_name_en": "Demo Doctor",
                "job_title_ar": "طبيب عام",
                "job_title_en": "General Practitioner",
                "hospital_name_ar": "مستشفى تجريبي",
                "hospital_name_en": "Demo Hospital",
                "hospital_type": "government",
                "logo_url": None,
            })

        return jsonify(ok=True, data=None)

    base_url = os.getenv("SEHA_WORKER_URL", "").rstrip("/")
    secret = os.getenv("SEHA_API_SECRET", "")
    if not base_url or not secret:
        logger.error("Seha Worker configuration is missing")
        return jsonify(ok=False, message="Service temporarily unavailable"), 503

    try:
        response = requests.get(
            f"{base_url}/api/inquiries/sick-leave-details",
            params={"PatientId": patient_id, "NormalizedServiceCode": service_code},
            headers={"Accept": "application/json", "Authorization": f"Bearer {secret}"},
            timeout=(5, 15),
        )
        if not response.ok:
            logger.warning("Seha Worker inquiry failed with status %s", response.status_code)
            return jsonify(ok=False, message="Service temporarily unavailable"), 503
        result = response.json()
        if not isinstance(result, dict) or "data" not in result:
            logger.error("Invalid response from Seha Worker")
            return jsonify(ok=False, message="Service temporarily unavailable"), 502
        if result["data"] is None:
            return jsonify(ok=True, data=None)

        row = result["data"]
        if not isinstance(row, dict):
            logger.error("Unexpected data format from Seha Worker")
            return jsonify(ok=False, message="Service temporarily unavailable"), 502
        data = {
            "service_code": row.get("service_code"),
            "report_type": row.get("report_type"),
            "admission_date": row.get("admission_date"),
            "discharge_date": row.get("discharge_date"),
            "leave_duration_days": int(row["leave_duration_days"]) if row.get("leave_duration_days") is not None else None,
            "issue_date": row.get("issue_date"),
            "report_time": row.get("report_time"),
            "national_id": row.get("national_id"),
            "patient_name_ar": row.get("patient_name_ar"),
            "patient_name_en": row.get("patient_name_en"),
            "nationality": row.get("nationality"),
            "employer": row.get("employer"),
            "practitioner_name_ar": row.get("practitioner_name_ar"),
            "practitioner_name_en": row.get("practitioner_name_en"),
            "job_title_ar": row.get("job_title_ar"),
            "job_title_en": row.get("job_title_en"),
            "hospital_name_ar": row.get("hospital_name_ar"),
            "hospital_name_en": row.get("hospital_name_en"),
            "hospital_type": row.get("hospital_type"),
            "hospital_logo_path": row.get("logo_url"),
        }
        return jsonify(ok=True, data=data)
    except (requests.RequestException, ValueError, TypeError) as exc:
        logger.warning("Seha Worker request failed: %s", type(exc).__name__)
        return jsonify(ok=False, message="Service temporarily unavailable"), 503

@app.get("/health")
def health():
    return jsonify(status="ok")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=False)
