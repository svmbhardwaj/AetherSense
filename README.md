# 🌍 AetherSense
### AI-Powered India-Wide Multi-Hazard Prediction & Early Warning System

**Predicting risks. Connecting intelligence. Protecting lives.**

AetherSense is an AI-powered, India-wide multi-hazard intelligence platform designed to predict, monitor and assess potential disasters using satellite observations, meteorological datasets, geographical information and machine learning.

The platform focuses on four interconnected areas of disaster intelligence:

- 🌪️ Cyclone Prediction
- 🌧️ Rainfall Prediction
- 🌊 Flood Prediction
- 🔥 Fire Risk Prediction

Its central innovation is an integrated prediction pipeline in which cyclone forecasts contribute to rainfall prediction, rainfall forecasts contribute to flood-risk assessment, and fire prediction operates independently through the team's existing trained model.

AetherSense aims to transform large-scale environmental data into meaningful, location-aware disaster intelligence through machine learning, contextual AI and an intelligent alert system.

---

## 🚨 The Problem

India faces multiple environmental and natural disaster risks. Cyclones, extreme rainfall, floods and fires can cause significant damage to lives, infrastructure, agriculture and ecosystems.

However, disaster monitoring faces several challenges:

- Environmental data is distributed across multiple scientific platforms.
- Large satellite datasets are difficult to process efficiently.
- Individual disaster prediction systems often operate independently.
- Predictive information is not always converted into understandable public warnings.
- Identifying geographical areas at risk requires combining temporal, meteorological and spatial information.

AetherSense aims to address these challenges through a unified, India-wide disaster prediction framework.

## 💡 Our Solution

AetherSense combines independent machine learning models into one integrated multi-hazard prediction system.

### 🌪️ 1. Cyclone Prediction

Uses historical cyclone tracks and atmospheric observations to predict cyclone movement and intensity.

**Predictions:**
- Future latitude and longitude.
- Wind speed and intensity.
- Cyclone movement and trajectory.

**Primary dataset:** NOAA IBTrACS.

**Candidate algorithms:** Random Forest, XGBoost, LightGBM, CatBoost, Extra Trees and LSTM.

### 🌧️ 2. Rainfall Prediction

Analyzes historical rainfall and meteorological conditions to estimate future rainfall.

**Features:**
- Previous and accumulated rainfall.
- Humidity and temperature.
- Wind speed and direction.
- Atmospheric pressure.
- Cyclone-related information.
- Geographical coordinates and seasonal patterns.

**Prediction horizons:** 6, 12 and 24 hours, where supported by training data.

**Candidate algorithms:** Random Forest Regressor, XGBoost, LightGBM, CatBoost, Extra Trees and Gradient Boosting.

### 🌊 3. Flood Prediction

Estimates flood probability by combining rainfall forecasts with geographical and environmental conditions.

**Features:**
- Predicted and historical rainfall.
- Soil moisture.
- Elevation and slope.
- Distance from rivers.
- River water levels.
- Land cover.
- Historical flood observations.
- Coastal storm surge information, where available.

**Outputs:**
- Flood probability.
- Low, Moderate, High and Extreme risk classifications.
- Geographical flood-risk visualization.
- State-wise and district-wise risk summaries where data permits.

**Candidate algorithms:** Random Forest, XGBoost, LightGBM, CatBoost, Extra Trees and Gradient Boosting.

### 🔥 4. Fire Risk Prediction

Integrates the team's existing trained fire prediction model without modifying its internal implementation.

The model supports independent fire-risk assessment and contributes to the overall multi-hazard intelligence system.

NASA FIRMS data can also be used for additional fire-observation validation.

---

## 🔗 Integrated Multi-Hazard Intelligence

One of AetherSense's major technical features is its connected prediction architecture.

```text
        CYCLONE DATA
             |
             v
       CYCLONE MODEL
             |
      Cyclone Forecast
             |
             v
      RAINFALL MODEL
             |
      Rainfall Forecast
             |
             v
        FLOOD MODEL
             |
             v
       FLOOD PROBABILITY
             |
             |
    ---------------------
             |
             v
       RISK ASSESSMENT
             ^
             |
       FIRE MODEL
    (Independent Model)
             |
             v
    MULTI-HAZARD ENGINE
             |
             v
       NODE.JS BACKEND
             |
             v
    MEKO + OPENAI INTELLIGENCE
             |
             v
       WHATSAPP ALERTS
```

The integration allows cyclone-related information to influence rainfall forecasting and rainfall forecasts to contribute to flood prediction.

The fire model remains an independent prediction pipeline.

## 📡 Datasets & Data Sources

AetherSense uses established scientific, satellite, meteorological and geographical datasets to support its prediction pipelines.

### Cyclone Datasets

| Dataset | Application |
|---|---|
| NOAA IBTrACS | Historical cyclone tracks and intensity |
| NASA TROPICS | Tropical cyclone observations |
| NASA MODIS | Satellite-based environmental observations |
| ERA5 | Historical atmospheric and meteorological variables |
| NASA GPM IMERG | Precipitation observations associated with weather systems |

### Rainfall Datasets

| Dataset | Application |
|---|---|
| NASA GPM IMERG V07 | Satellite-based rainfall observations |
| IMD Gridded Rainfall | Historical gridded rainfall data over India |
| ERA5 | Meteorological and atmospheric variables |
| ISRO MOSDAC | Satellite-based meteorological observations |

### Flood Datasets

| Dataset | Application |
|---|---|
| NASA Global Flood Database | Historical flood event observations |
| NASA SMAP | Soil moisture observations |
| NASA SRTM / NASADEM | Elevation and terrain information |
| NASA LP DAAC | Land and surface-related satellite datasets |
| India Flood Forecasting System | Flood forecasting and river-related information |

### Fire Datasets

| Dataset | Application |
|---|---|
| Existing trained fire model | Independent fire-risk prediction |
| NASA FIRMS | Satellite-based fire detection and validation |

### Geographical Data

- Official Indian administrative boundaries.
- State-wise and district-wise geographical information.
- Geospatial coordinates and geographical features.

**Geographical Coverage:** All 28 Indian states and 8 Union Territories.

Data is filtered and processed for India-wide coverage rather than being restricted to a single state or geographical region. Aggregation depends on the spatial resolution and availability of individual datasets.

---

## 🧠 Intelligent Disaster Guardian

AetherSense aims to go beyond conventional prediction systems by integrating contextual AI.

### MEKO + OpenAI Integration

The proposed intelligence layer combines MEKO Track A with OpenAI-powered natural-language generation.

Its intended workflow:

1. Receive predictions from the multi-hazard engine.
2. Retrieve relevant historical information and contextual knowledge through MEKO.
3. Combine current risk information with retrieved context.
4. Generate understandable disaster explanations using OpenAI.
5. Deliver relevant information through the WhatsApp alert system.

### 📱 Intelligent WhatsApp Alerts

The planned WhatsApp Disaster Guardian aims to provide:

- Location-aware disaster alerts.
- Hazard type and risk severity.
- Information about potentially affected regions.
- Understandable explanations of predicted threats.
- Relevant precautionary information.

The goal is to make disaster intelligence more accessible and actionable for people.

---

## ⚙️ System Architecture & Technology Stack

| Component | Technology |
|---|---|
| Programming Language | Python |
| Backend | Node.js |
| Machine Learning | Scikit-learn, XGBoost, LightGBM, CatBoost |
| Deep Learning | TensorFlow / Keras |
| Data Processing | Pandas, NumPy |
| Geospatial Processing | GeoPandas, H3 |
| Scientific Data Processing | Xarray, Rasterio |
| AI Integration | OpenAI API |
| Memory & Context | MEKO Track A |
| Communication | WhatsApp API |
| Visualization | Plotly, Folium |
| Development | VS Code, Google Colab |

Python handles data processing and machine learning, while Node.js serves as the backend integration layer.

---

## ⚡ Execution Modes

AetherSense is designed with two execution modes.

**FAST_MODE**

The default lightweight execution mode.

- Uses locally available datasets first.
- Downloads only essential data.
- Performs lightweight preprocessing.
- Trains baseline models using available real datasets.
- Avoids downloading unnecessarily large satellite archives.
- Targets approximately two minutes for initial execution, depending on hardware and data availability.

**FULL_TRAINING**

The comprehensive model development mode.

- Processes larger historical datasets.
- Trains and compares candidate algorithms.
- Performs hyperparameter optimization.
- Uses chronological and event-wise validation.
- Evaluates models on unseen events.
- Saves trained models and evaluation reports.

No synthetic data or fabricated performance metrics are used as substitutes for missing real datasets.

---

## 📊 Model Evaluation

Each prediction model is evaluated using metrics relevant to its task.

| Model | Evaluation Metrics |
|---|---|
| Cyclone | MAE, RMSE, Track Error (km) |
| Rainfall | MAE, RMSE, Heavy Rainfall Detection |
| Flood | Precision, Recall, F1-score, IoU |
| Fire | Precision, Recall, F1-score, ROC-AUC |

Model selection prioritizes appropriate validation performance rather than training accuracy alone.

---

## 🗺️ India-Wide Risk Visualization

The platform aims to provide geographical visualization of:

- Cyclone tracks and predicted movement.
- Rainfall distribution and forecast patterns.
- Flood probability and risk levels.
- Fire-risk locations.
- Combined multi-hazard assessment.
- State-wise and district-wise risk summaries.

Areas with unavailable data will be identified rather than assigned fabricated predictions.

---

## 📁 Project Structure

```text
AetherSense/
│
├── data/
│   ├── raw/
│   └── processed/
│
├── models/
│   ├── cyclone/
│   ├── rainfall/
│   ├── flood/
│   └── fire/
│
├── notebooks/
│   └── india_multi_hazard.ipynb
│
├── src/
│   ├── download_data.py
│   ├── preprocessing.py
│   ├── cyclone_model.py
│   ├── rainfall_model.py
│   ├── flood_model.py
│   ├── fire_adapter.py
│   ├── disaster_engine.py
│   └── evaluation.py
│
├── backend/
│   └── Node.js backend files
│
├── reports/
│   ├── dataset_status.csv
│   ├── model_comparison.csv
│   └── evaluation.json
│
├── dashboard/
│
├── main.py
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js and npm
- Git
- Google Colab or VS Code

### Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/AetherSense.git
cd AetherSense
```

### Set Up Python Environment

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

### Set Up Node.js Backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Start the backend using the actual entry point configured in the project.

### Execution Modes

```bash
python main.py --mode fast
```

```bash
python main.py --mode full
```

```bash
python main.py --mode predict
```

---

## 🛡️ Responsible Disaster Intelligence

AetherSense is designed to support disaster awareness and informed decision-making.

- Model predictions are distinguished from confirmed observations.
- Prediction uncertainty and data availability are considered.
- Official government advisories take priority over experimental predictions.
- AI-generated information must not be presented as an official emergency warning.
- Data quality and model performance are evaluated before communicating risk information.

AetherSense is intended to complement existing disaster-management systems, not replace authorized emergency services.

---

## 🚀 Future Roadmap

- [ ] Complete India-wide cyclone prediction.
- [ ] Develop rainfall prediction models.
- [ ] Integrate rainfall and cyclone predictions into flood assessment.
- [ ] Connect the existing fire model.
- [ ] Build a unified multi-hazard intelligence engine.
- [ ] Develop interactive India-wide risk maps.
- [ ] Integrate MEKO Track A and OpenAI.
- [ ] Implement intelligent WhatsApp alerts.
- [ ] Introduce location-aware risk notifications.
- [ ] Explore cascading and multi-hazard risk assessment.

---

## 🌍 Our Vision

We envision a future where disaster management is not limited to identifying what has already happened, but also understanding what could happen next.

By combining satellite intelligence, machine learning, geospatial analysis and contextual AI, AetherSense aims to make disaster prediction more connected, understandable and accessible across India.

**AetherSense — Sense the Risk. Predict the Threat. Protect the Future.**

---

## 📜 Disclaimer

AetherSense is an experimental AI-powered disaster prediction and research project. Its outputs should not be considered official emergency warnings. Always follow verified government advisories and instructions from authorized disaster-management authorities.
