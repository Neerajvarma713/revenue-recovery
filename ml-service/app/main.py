from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field


ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "model.joblib"

# Load trained model bundle
bundle = joblib.load(MODEL_PATH)

model = bundle["model"]
columns = bundle["columns"]
metrics = bundle["metrics"]

# Classification threshold selected during training
THRESHOLD = metrics.get("threshold", 0.5)


app = FastAPI(
    title="Revenue Recovery ML Service",
    version="1.0.0"
)


class CustomerInput(BaseModel):
    tenure_months: float = Field(12, ge=0)
    monthly_revenue: float = Field(100, ge=0)
    support_tickets_90d: float = Field(1, ge=0)
    payment_failures_90d: float = Field(0, ge=0)
    usage_change_pct: float = 0
    nps: float = Field(50, ge=-100, le=100)
    plan_type: str = "standard"
    days_since_login: float = Field(7, ge=0)
    discount_pct: float = Field(0, ge=0, le=100)

    # New realistic features
    price_increase_pct: float = Field(0, ge=0, le=100)
    engagement_trend_pct: float = 0
    complaint_recency_days: float = Field(30, ge=0)
    feature_adoption_pct: float = Field(50, ge=0, le=100)
    competitor_pressure: float = Field(0, ge=0, le=3)

    opted_out: bool = False


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "logistic-regression",
        "version": "1.0.0"
    }


@app.get("/metrics")
def get_metrics():
    return {
        "model": "logistic-regression",
        "metrics": metrics
    }


@app.post("/predict")
def predict(customer: CustomerInput):

    data = {
        "tenure_months": customer.tenure_months,
        "monthly_revenue": customer.monthly_revenue,
        "support_tickets_90d": customer.support_tickets_90d,
        "payment_failures_90d": customer.payment_failures_90d,
        "usage_change_pct": customer.usage_change_pct,
        "nps": customer.nps,
        "days_since_login": customer.days_since_login,
        "discount_pct": customer.discount_pct,
        "price_increase_pct": customer.price_increase_pct,
        "engagement_trend_pct": customer.engagement_trend_pct,
        "complaint_recency_days": customer.complaint_recency_days,
        "feature_adoption_pct": customer.feature_adoption_pct,
        "competitor_pressure": customer.competitor_pressure,
        "plan_type": customer.plan_type,
    }

    df = pd.DataFrame([data])

    # Apply the same one-hot encoding used during training.
    df = pd.get_dummies(
        df,
        columns=["plan_type"],
        dtype=float
    )

    # Make sure prediction columns exactly match training columns.
    df = df.reindex(
        columns=columns,
        fill_value=0
    )

    # Actual trained Logistic Regression prediction
    probability = float(
        model.predict_proba(df)[0][1]
    )

    # Respect explicit opt-out
    if customer.opted_out:
        probability = min(probability, 0.05)

    # Business-selected threshold
    churn_prediction = int(
        probability >= THRESHOLD
    )

    # Risk category
    if probability >= 0.80:
        risk = "CRITICAL"
    elif probability >= THRESHOLD:
        risk = "HIGH"
    elif probability >= 0.35:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return {
        "churn_probability": round(probability, 4),
        "churn_prediction": churn_prediction,
        "risk_level": risk,
        "threshold": THRESHOLD,
        "model_version": "logistic-regression-1.0"
    }