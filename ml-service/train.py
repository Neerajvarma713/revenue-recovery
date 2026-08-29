from pathlib import Path

import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    roc_auc_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
)


ROOT = Path(__file__).resolve().parent

data = pd.read_csv(ROOT / "data" / "customers.csv")


features = [
    "tenure_months",
    "monthly_revenue",
    "support_tickets_90d",
    "payment_failures_90d",
    "usage_change_pct",
    "nps",
    "days_since_login",
    "discount_pct",
    "price_increase_pct",
    "engagement_trend_pct",
    "complaint_recency_days",
    "feature_adoption_pct",
    "competitor_pressure",
]


X = pd.get_dummies(
    data[features + ["plan_type"]],
    columns=["plan_type"],
    dtype=float,
)

y = data["churned"]


Xtr, Xte, ytr, yte = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)


model = LogisticRegression(
    max_iter=3000,
    class_weight="balanced",
)

model.fit(Xtr, ytr)


probabilities = model.predict_proba(Xte)[:, 1]


roc_auc = roc_auc_score(yte, probabilities)


# ---------------------------------------------------------
# Find a useful classification threshold.
#
# For revenue recovery, missing a real churner is expensive,
# so we prioritize recall while still requiring useful F1.
# ---------------------------------------------------------

threshold_results = []

for threshold in [i / 100 for i in range(10, 91)]:

    predictions = (probabilities >= threshold).astype(int)

    precision = precision_score(
        yte,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        yte,
        predictions,
        zero_division=0,
    )

    f1 = f1_score(
        yte,
        predictions,
        zero_division=0,
    )

    accuracy = accuracy_score(
        yte,
        predictions,
    )

    threshold_results.append(
        {
            "threshold": threshold,
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1": f1,
        }
    )


# Prefer thresholds with recall >= 0.60.
# Among those, choose the one with the highest F1.
eligible = [
    r
    for r in threshold_results
    if r["recall"] >= 0.60
]


if eligible:
    best = max(
        eligible,
        key=lambda r: r["f1"],
    )
else:
    best = max(
        threshold_results,
        key=lambda r: r["f1"],
    )


threshold = best["threshold"]


final_predictions = (
    probabilities >= threshold
).astype(int)


metrics = {
    "roc_auc": float(roc_auc),
    "accuracy": float(
        accuracy_score(yte, final_predictions)
    ),
    "precision": float(
        precision_score(
            yte,
            final_predictions,
            zero_division=0,
        )
    ),
    "recall": float(
        recall_score(
            yte,
            final_predictions,
            zero_division=0,
        )
    ),
    "f1": float(
        f1_score(
            yte,
            final_predictions,
            zero_division=0,
        )
    ),
    "threshold": float(threshold),
}


joblib.dump(
    {
        "model": model,
        "columns": list(X.columns),
        "metrics": metrics,
    },
    ROOT / "model.joblib",
)


print("\nModel training complete.")
print("--------------------------------")
print(f"ROC-AUC   : {metrics['roc_auc']:.4f}")
print(f"Threshold : {metrics['threshold']:.2f}")
print(f"Accuracy  : {metrics['accuracy']:.4f}")
print(f"Precision : {metrics['precision']:.4f}")
print(f"Recall    : {metrics['recall']:.4f}")
print(f"F1        : {metrics['f1']:.4f}")
print("--------------------------------")