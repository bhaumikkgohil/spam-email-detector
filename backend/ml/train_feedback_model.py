import json
import sys
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import pickle


def train_model(training_data_path, model_save_path):
    # Load data
    with open(training_data_path, 'r') as f:
        data = json.load(f)

    # Extract content and labels from feedback data
    texts = [item['content'] for item in data if 'content' in item]

    # Get is_spam from user_feedback instead of top level
    labels = [1 if item.get('user_feedback', {}).get('is_spam') else 0 for item in data
              if 'user_feedback' in item and 'is_spam' in item['user_feedback']]

    # Ensure we have valid data
    if len(texts) == 0 or len(labels) == 0 or len(texts) != len(labels):
        raise ValueError(
            f"Invalid data format: {len(texts)} texts, {len(labels)} labels")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42)

    # Create and train vectorizer
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Create and train classifier
    clf = MultinomialNB()
    clf.fit(X_train_vec, y_train)

    # Evaluate
    y_pred = clf.predict(X_test_vec)

    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred),
        'f1': f1_score(y_test, y_pred)
    }

    # Save model
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    with open(model_save_path, 'wb') as f:
        pickle.dump((vectorizer, clf), f)

    return metrics


if __name__ == "__main__":
    if len(sys.argv) < 4 or sys.argv[1] != "train":
        print("Usage: python train_feedback_model.py train <training_data_path> <model_save_path>")
        sys.exit(1)

    training_data_path = sys.argv[2]
    model_save_path = sys.argv[3]

    try:
        metrics = train_model(training_data_path, model_save_path)
        print("Model trained successfully!")
        print(f"Accuracy: {metrics['accuracy']:.4f}")
        print(f"Precision: {metrics['precision']:.4f}")
        print(f"Recall: {metrics['recall']:.4f}")
        print(f"F1 Score: {metrics['f1']:.4f}")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
