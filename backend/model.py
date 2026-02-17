# -----------------------------
# model.py
# -----------------------------
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# -----------------------------
# 1️⃣ Training dataset
# -----------------------------
data = {
    "interest": [
        "python", "java", "c programming", "software development",
        "html", "css", "javascript", "react", "frontend",
        "node js", "express", "spring boot", "backend",
        "sql", "data analysis", "data science",
        "machine learning", "deep learning", "ai", "artificial intelligence",
        "cloud computing", "aws", "devops"
    ],
    "category": [
        "Beginner", "Beginner", "Beginner", "Beginner",
        "Beginner", "Beginner", "Beginner", "Intermediate", "Intermediate",
        "Intermediate", "Intermediate", "Intermediate", "Advanced",
        "Intermediate", "Intermediate", "Advanced",
        "Advanced", "Advanced", "Expert", "Expert",
        "Advanced", "Intermediate", "Advanced"
    ]
}

# -----------------------------
# 2️⃣ Train vectorizer and model
# -----------------------------
vectorizer = TfidfVectorizer(lowercase=True, strip_accents="unicode")
X = vectorizer.fit_transform([x.lower() for x in data["interest"]])
y = data["category"]

model = LogisticRegression()
model.fit(X, y)

# -----------------------------
# 3️⃣ Save model and vectorizer
# -----------------------------
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("✅ Model and vectorizer saved successfully!")

# -----------------------------
# 4️⃣ Load model & vectorizer once for prediction
# -----------------------------
MODEL_PATH = "model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"

if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(VECTORIZER_PATH, "rb") as f:
        vectorizer = pickle.load(f)
else:
    model = None
    vectorizer = None

# -----------------------------
# 5️⃣ Predict learning stage
# -----------------------------
def predict_stage(topic: str) -> str:
    """
    Predict the learning stage (Beginner, Intermediate, Advanced, Expert)
    based on a topic.
    """
    if not model or not vectorizer:
        return "Beginner"

    X_test = vectorizer.transform([topic.lower()])
    predicted_stage = model.predict(X_test)[0]
    return predicted_stage

# -----------------------------
# 6️⃣ Optional: Test
# -----------------------------
if __name__ == "__main__":
    test_topics = ["Python", "React", "AWS", "Machine Learning", "C Programming"]
    for topic in test_topics:
        print(f"{topic} → Predicted Stage: {predict_stage(topic)}")
