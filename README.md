# Dynamic Pricing Simulator

<div align="center">

**An interactive web-based simulator for dynamic pricing strategy and market analysis**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://dynamic-pricing-simulation.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/Shubhansh28/Dynamic-pricing-Simulation)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen?style=for-the-badge&logo=mongodb)](https://mongodb.com)

</div>

---

## 📌 1. Problem Statement

> **Problem Title:** Lack of environment for predictive pricing simulation and experimentation.

**Problem Description:**
In competitive e-commerce markets, pricing decisions directly impact revenue, market share, and inventory turnover. However, most pricing decisions are made using static spreadsheets or limited historical data analysis, which carries significant financial risk without the ability to simulate dynamic market environments.

**Target Users:** e-commerce Managers · Revenue Operations Teams

---

## 🔍 2. Problem Understanding & Approach

**Root Cause Analysis:**
How the price of a product decided by shopkeeper effects the revenue and customer attraction towards his products and its directly effects his revenue and profit.

**Solution Strategy:**
Me and my team thinking to create a simulation web software on which e-commerce Managers or shopkeeper can set price, inventory and his competitor's price of product on our simulation. Which will give him a rough idea of his sells, revenue. That will gonna help him to decide strategic pricing of his product and customer attraction.

---

## 💡 3. Proposed Solution

**Solution Overview:** A web-based interactive simulator tool.

**Core Idea:** Introduce a simulator where users set their base price, costs, initial stock, and a pricing strategy. The system simulates the graph of revenue, inventory.

**Key Features:**
- ✅ Adjust price of product, set inventory.
- ✅ Animated charts showing revenue, inventory depletion and price dynamics.
- ✅ Real-time display of profit margins, market share, and final stock.

---

## 🏗️ 4. System Architecture

**High-Level Flow:**
```
User Input  →  Frontend State Manager  →  Simulation Engine  →  Visualization Components
```

- **Architecture Description:** N/A
- **Architecture Diagram:** N/A *(Add system architecture diagram image here)*

---

## 📊 6. Dataset Selected

| Field | Details |
|---|---|
| **Dataset Name** | Retail Demand Forecasting Dataset · Flipkart E-COMMERCE Dataset · E-Commerce Behavior Dataset |
| **Source** | Kaggle · Google Dataset Search |
| **Data Type** | Date, Store ID, Item ID, Units Sold, Historical time-series sales, Product names, Categories, Listed price, Discounted price, Ratings, Reviews, Product specifications |
| **Selection Reason** | Provides real historical demand patterns; Flipkart provides real world pricing, distribution, and helps analyze discount behaviour; helps model seasonality; contains transactional data, real revenue calculation; supports demand probability estimation |

**Preprocessing Steps:**
Data from Kaggle was cleaned by removing duplicates, handling missing values, converting prices to numeric format, filtering outliers, and aggregating daily sales to derive revenue and normalized demand features.

---

## 🛠️ 8. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML · CSS · JavaScript |
| **Backend** | Node.js · Express.js · Recharts · Lucide React |
| **Database** | MongoDB |
| **Deployment** | Vercel |

---

## 🔌 9. API Documentation & Testing

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/simulate` | Run a new simulation. Accepts pricing config (price, cost, inventory, demand params, strategy, days). Returns day-by-day time-series + aggregated KPIs. |
| `GET` | `/api/simulate` | Fetch last 20 past simulations (summary only). Supports `?limit=N&page=N` pagination. |
| `GET` | `/api/simulate/:id` | Fetch a specific simulation with full day-by-day time-series data. |
| `DELETE` | `/api/simulate/:id` | Delete a saved simulation by ID. |
| `POST` | `/api/learn` | Train α, β, γ parameters from Flipkart data. Accepts optional category/brand filters. |
| `GET` | `/api/health` | Server health check. Returns status and timestamp. |

---

## 📦 10. Module-wise Development & Deliverables

<details open>
<summary><b>✅ Checkpoint 1 — Research & Planning</b></summary>

- Defined economic formulas: demand elasticity, competitor reaction, profit, market share, cost-plus floor.
- Selected Flipkart dataset from Kaggle for real-world pricing data.
</details>

<details open>
<summary><b>✅ Checkpoint 2 — Backend Development</b></summary>

- Built Node.js/Express REST API with 6 endpoints.
- Created 7 modular engine files: demand, competitor, inventory, revenue, marketShare, pricing, simulate.
- Connected MongoDB Atlas for data storage.
</details>

<details open>
<summary><b>✅ Checkpoint 3 — Frontend Development</b></summary>

- Built dark/light glassmorphism dashboard using Vanilla HTML/CSS/JS.
- Chart.js time-series charts, animated KPI cards, Day-by-Day Analysis table, CSV export.
</details>

<details open>
<summary><b>✅ Checkpoint 4 — Model Training</b></summary>

- Implemented `learning/trainer.js` — runs OLS linear regression on 20,000+ Flipkart products.
- Auto-learns α (price elasticity), β (market sensitivity), γ (competitor reaction rate) on page load.
</details>

<details open>
<summary><b>✅ Checkpoint 5 — Model Integration</b></summary>

- Wired auto-train → form fill on page load.
- Simulation results feed charts, analysis table, and MongoDB history simultaneously.
</details>

<details open>
<summary><b>✅ Checkpoint 6 — Deployment</b></summary>

- Deployed to Vercel with `vercel.json` configuration.
- MongoDB connection cached for serverless environment to handle cold starts.
</details>

---

## 🔄 11. End-to-End Workflow

```
1. User Input          →  Configure price, elasticity, inventory, competitor price, strategy, days
2. Simulation Engine   →  Time-based loop: demand, competitor reaction, sales, revenue, inventory
3. Metrics Calculation →  Aggregate KPIs: total revenue, units sold, final stock, market share
4. Database Storage    →  Save config + results to MongoDB for historical tracking
5. Visualization       →  Charts, analysis table, strategy comparison on frontend
```

---

## 🚀 12. Demo & Video

| Resource | Link |
|---|---|
| 🌐 Live Demo | https://dynamic-pricing-simulation.vercel.app |
| 💻 GitHub | https://github.com/Shubhansh28/Dynamic-pricing-Simulation |

---

## 📋 13. Hackathon Deliverables Summary

---

## 👥 14. Team Roles & Responsibilities

| # | Name | Role | Responsibilities |
|---|---|---|---|
| 1 | Shubh Ansh Kesharwani | Leader | Backend, Database |
| 2 | Ayush Sharma | Member | Database, Frontend |
| 3 | Avikesh Gurjar | Member | Frontend |

---

## 🔮 15. Future Scope & Scalability

**Short-Term**
- A/B testing between two strategies on the same product.
- Multi-product simulation support.
- Email/notification when inventory hits the reorder point.

**Long-Term**
- ML-based demand forecasting using LSTM time-series models.
- Real-time competitor price scraping integration.
- User authentication with personal simulation history.
- Mobile app version.

---

## ⚠️ 16. Known Limitations

- Auto-training from Flipkart data may time out on Vercel free tier (10s serverless limit) — falls back to default parameters.
- Demand model is simplified linear/log; does not capture seasonal spikes or external shocks.
- Competitor model is reactive/aggressive only — does not model strategic Nash equilibrium behaviour.
- No real-time market data feed; all training data is a static Kaggle dataset.

---

## 🌟 17. Impact

- Helps e-commerce managers simulate pricing decisions before committing — reducing financial risk.
- Quantifies the effect of competitor reactions on market share in real-time.
- Demonstrates how inventory replenishment cycles affect profitability over a simulation period.
- Enables data-backed pricing strategy selection instead of intuition-based decisions.
- Trained on 20,000+ real Flipkart products, making simulations grounded in actual market behaviour.
