from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
import re

app = FastAPI(title="MediCare AI Chatbot")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Starter training examples for the chatbot
training_data = [
    ("hello", "greeting"),
    ("hi there", "greeting"),
    ("good morning", "greeting"),
    ("how are you", "greeting"),

    ("I want to book an appointment", "appointment"),
    ("book a doctor", "appointment"),
    ("how can I schedule a consultation", "appointment"),
    ("I need to see a doctor", "appointment"),

    ("what are your hospital timings", "timings"),
    ("when does the hospital open", "timings"),
    ("what time do you close", "timings"),

    ("I have a headache", "symptoms"),
    ("I have a fever", "symptoms"),
    ("I am feeling sick", "symptoms"),
    ("my stomach hurts", "symptoms"),

    ("can you tell me about medicines", "medicine"),
    ("what medicine should I take", "medicine"),

    ("thank you", "thanks"),
    ("thanks a lot", "thanks"),
]

responses = {
    "greeting": "Hello! Welcome to MediCare. How can I help you today?",
    "appointment": "You can book an appointment through the MediCare appointment section. Select a doctor and an available time slot.",
    "timings": "Hospital timings vary by location. Please contact your selected hospital to confirm its timings.",
    "symptoms": "I'm sorry you're feeling unwell. I can provide general information, but I cannot diagnose symptoms. Please consult a qualified doctor.",
    "medicine": "Please consult a qualified doctor or pharmacist before taking any medicine. I cannot prescribe medication.",
    "thanks": "You're welcome! I'm happy to help.",
    "unknown": "I'm not sure I understood. You can ask me about appointments, hospital timings, or general healthcare information."
}


# Lightweight text classifier (does not require SciPy)
def tokenize(text):
    return set(re.findall(r"\b\w+\b", text.lower()))


def predict_intent(message):
    message_words = tokenize(message)
    scores = {}

    for example, intent in training_data:
        example_words = tokenize(example)

        if not example_words:
            continue

        overlap = len(message_words & example_words)
        score = overlap / len(example_words)

        scores[intent] = max(scores.get(intent, 0), score)

    if not scores:
        return "unknown", 0.0

    prediction = max(scores, key=scores.get)
    confidence = scores[prediction]

    if confidence < 0.30:
        return "unknown", confidence

    return prediction, confidence


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def home():
    return {
        "success": True,
        "message": "MediCare AI chatbot service is running"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/chat")
def chat(request: ChatRequest):
    message = request.message.strip()

    if not message:
        return {
            "success": False,
            "message": "Please enter a message."
        }

    if len(message) > 2000:
        return {
            "success": False,
            "message": "Message is too long."
        }

    # Basic emergency keyword detection
    emergency_pattern = (
        r"\b(chest pain|can't breathe|cannot breathe|"
        r"not breathing|unconscious|severe bleeding)\b"
    )

    if re.search(emergency_pattern, message.lower()):
        return {
            "success": True,
            "intent": "emergency",
            "response": (
                "This may be an emergency. Please seek immediate medical "
                "help. In India, call 112 or go to the nearest emergency "
                "department. Do not wait for an online response."
            ),
            "confidence": 1.0
        }

    # Predict the user's intent
    prediction, confidence = predict_intent(message)

    return {
        "success": True,
        "intent": prediction,
        "response": responses[prediction],
        "confidence": round(confidence, 3)
    }
