import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
import json

# Load dataset
df = pd.read_csv('kidney_disease.csv')

# Drop id column
df.drop('id', axis=1, inplace=True)

# Handle white space in object columns
for col in df.select_dtypes(include='object').columns:
    df[col] = df[col].astype(str).str.strip()

# Target encoding
df['classification'] = df['classification'].replace({'ckd': 1, 'notckd': 0, 'ckd\t': 1, 'no': 0})
df['classification'] = pd.to_numeric(df['classification'], errors='coerce').fillna(0).astype(int)
print("Unique values in classification after replacement and cast:", df['classification'].unique())

# Feature mapping
# Categorical mapping
cat_maps = {
    'sg': [1.005, 1.010, 1.015, 1.020, 1.025],
    'al': [0, 1, 2, 3, 4, 5],
    'su': [0, 1, 2, 3, 4, 5],
    'rbc': {'normal': 0, 'abnormal': 1},
    'pc': {'normal': 0, 'abnormal': 1},
    'pcc': {'notpresent': 0, 'present': 1},
    'ba': {'notpresent': 0, 'present': 1},
    'htn': {'no': 0, 'yes': 1},
    'dm': {'no': 0, 'yes': 1},
    'cad': {'no': 0, 'yes': 1},
    'appet': {'good': 0, 'poor': 1},
    'pe': {'no': 0, 'yes': 1},
    'ane': {'no': 0, 'yes': 1}
}

# Preprocessing
numerical_cols = ['age', 'bp', 'bgr', 'bu', 'sc', 'sod', 'pot', 'hemo', 'pcv', 'wc', 'rc']
categorical_cols = ['sg', 'al', 'su', 'rbc', 'pc', 'pcc', 'ba', 'htn', 'dm', 'cad', 'appet', 'pe', 'ane']

# Fill missing values with median for numerical and mode for categorical
for col in numerical_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')
    df[col] = df[col].fillna(df[col].median())

for col in categorical_cols:
    if col in ['sg', 'al', 'su']:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        df[col] = df[col].fillna(df[col].mode()[0])
    else:
        df[col] = df[col].replace(cat_maps[col])
        df[col] = pd.to_numeric(df[col], errors='coerce')
        df[col] = df[col].fillna(df[col].mode()[0])

# Prepare X and y
X = df.drop('classification', axis=1)
y = df['classification']

# Train Logistic Regression
model = LogisticRegression(max_iter=1000)
model.fit(X, y)

# Export weights and intercept
weights = model.coef_[0].tolist()
intercept = model.intercept_[0]
feature_names = X.columns.tolist()

model_params = {
    "feature_names": feature_names,
    "weights": weights,
    "intercept": intercept,
    "categorical_mappings": cat_maps
}

with open('model_params.json', 'w') as f:
    json.dump(model_params, f, indent=4)

print("Model trained and params exported to model_params.json")
