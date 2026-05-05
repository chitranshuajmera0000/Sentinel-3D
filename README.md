# 🛡️ Sentinel-3D: Next-Gen Fight Detection Dashboard

[![React](https://img.shields.io/badge/Frontend-React%2018-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/Deep%20Learning-PyTorch-EE4C2C?logo=pytorch)](https://pytorch.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Sentinel-3D** is a professional-grade surveillance analysis suite designed for real-time violent action recognition. Leveraging the **R3D-18 (ResNet-3D 18-layer)** architecture, it processes spatiotemporal data to distinguish between safe interactions and aggressive physical altercations with high precision.

---

## 🚀 Key Features

### 📡 Real-Time Live Monitoring
*   **Zero-Persistence Session:** Stream live webcam or screen-share feeds directly to the inference engine.
*   **Instant Alerting:** Visual pulsing banners and audio cues trigger immediately upon fight detection.
*   **Latency Tracking:** Transparent metrics showing both Backend GPU inference time and total network round-trip time (RTT).

### 📂 Post-Incident Analysis (Video Upload)
*   **Frame-by-Frame Sparklines:** An interactive timeline showing the probability of violence throughout the entire video.
*   **GradCAM Support:** Visual heatmaps highlighting the specific spatial regions the model "focused" on during a detected incident.
*   **Incident Catalog:** Automatic indexing of detected events for rapid review.

### 🧠 Dual-Persona Documentation
*   **DL Evaluator Mode:** Deep dives into training curves, confusion matrices, and the layer-by-layer architecture of the R3D-18 model.
*   **CV Depth Mode:** Detailed analysis of 8 core Computer Vision techniques used, from uniform temporal sampling to sliding window inference.

---

## 🏗️ The Spatiotemporal Engine: R3D-18

Unlike standard 2D CNNs that analyze single frames independently, **Sentinel-3D** uses 3D Convolutions to learn motion patterns across the temporal dimension.

| Component | Specification |
|---|---|
| **Architecture** | ResNet-3D 18-Layer (R3D-18) |
| **Input Shape** | `(1, 3, 16, 112, 112)` (Batch, Channels, Frames, Height, Width) |
| **Parameters** | ~11.2 Million |
| **Dataset** | RWF-2000 (2,000 clips, balanced) |
| **Transfer Learning** | Pretrained on Kinetics-400 |

---

## 🛠️ Technology Stack

*   **Frontend:** React 18, Tailwind CSS (Vanilla styling), Recharts (Analytics), Lucide Icons.
*   **Backend:** FastAPI (Python), PyTorch, OpenCV.
*   **Deployment:** Vercel (Frontend), ngrok/Kaggle (Backend Inference).

---

## ⚙️ Installation & Setup

### 1. Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   A running **Sentinel-3D Backend** (FastAPI)

### 2. Clone and Install
```bash
git clone https://github.com/chitranshuajmera0000/Sentinel-3D.git
cd Sentinel-3D
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# The URL of your FastAPI backend engine
VITE_API_URL=https://your-ngrok-url.ngrok-free.app

# 'dl' for Deep Learning metrics, 'cv' for Computer Vision technicals
VITE_ABOUT_MODE=dl
```

### 4. Run Locally
```bash
npm run dev
```

---

## 📊 Performance Benchmark

Sentinel-3D outperforms standard 2D approaches by analyzing motion trajectories rather than just static pixels.

*   **Val F1 Score:** 0.9694
*   **Accuracy:** 96.5%
*   **Precision:** 97.2%
*   **Recall:** 96.7%

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author
**Chitranshu Ajmera**
*   GitHub: [@chitranshuajmera0000](https://github.com/chitranshuajmera0000)
*   Portfolio: [Your-Portfolio-Link]
