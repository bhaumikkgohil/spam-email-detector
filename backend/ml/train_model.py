import sys
import json
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score


def train_model(training_data_path, model_save_path):
    """
    Train a spam classification model using Naive Bayes and TF-IDF
    """
    # Load training data
    with open(training_data_path, 'r') as f:
        data = json.load(f)

    # Extract texts and labels
    texts = [item['content'] for item in data]
    labels = [1 if item['is_spam'] else 0 for item in data]

    # Split into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42
    )

    # Create and train pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            max_features=10000,
            ngram_range=(1, 2),
            stop_words='english'
        )),
        ('classifier', MultinomialNB(alpha=0.1))
    ])

    pipeline.fit(X_train, y_train)

    # Evaluate model
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)

    # Save the model
    with open(model_save_path, 'wb') as f:
        pickle.dump(pipeline, f)

    # Return metrics
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'samples': len(data)
    }


def predict(model_path, text):
    """
    Make a prediction using the trained model
    """
    # Load the model
    with open(model_path, 'rb') as f:
        model = pickle.load(f)

    # Make prediction
    probability = model.predict_proba([text])[0][1]
    is_spam = probability > 0.5

    return {
        'is_spam': bool(is_spam),
        'spam_score': float(probability * 100),
        'confidence': float(abs(probability - 0.5) * 2)
    }


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else None

    if command == "train":
        training_data_path = sys.argv[2]
        model_save_path = sys.argv[3]
        metrics = train_model(training_data_path, model_save_path)
        print(json.dumps(metrics))

    elif command == "predict":
        model_path = sys.argv[2]
        text = sys.argv[3]
        result = predict(model_path, text)
        print(json.dumps(result))

    else:
        print(json.dumps({
            "error": "Invalid command. Use 'train' or 'predict'."
        }))
        sys.exit(1)
