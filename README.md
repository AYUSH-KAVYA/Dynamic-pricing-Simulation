# Dynamic Pricing Simulator
An interactive simulator under price given by user


One-line project description.

## 1. Problem Statement: 
    ** Problem Title:- Lack of environment for predictive pricing simulation and experimentation.

    ** Problem Description:- In competitive e-commerce markets, pricing decisions directly impact revenue, market share, and inventory turnover. However, most pricing decisions are made using static spreadsheets or limited historical data analysis, which carries significant financial risk without the ability to simulate dynamic market environments.

    ** Target Users:- e-commerce Managers,Revenue Operations Teams
___________________________________________________________________________________________________________________

## 2. Problem Understanding & Approach

    ** Root Cause Analysis:- How the price of a product decided by shopkeepr effect's the revenue and customer attraction towards his products and its directly effects his revenue and profit.

    ** Solution Strategy:- Me and my team thinking to create a simulation web software on which e-commerce Managers or shopkeeper can  set price,inventory and his competitor's price of product on our simulation. Which will give him a rough idea of his sells,revenue.That will gonna help him to decide strategic pricing of his product and customer attraction.

___________________________________________________________________________________________________________________

## 3. Proposed Solution

    ** Solution Overview:- A web-based interactive simulator tool 

    ** Core Idea:- Introduce a simulator where users set their base price, costs, initial stock, and a pricing strategy.The system simulates the grpah of revenue,inventory.

    **Key Features: 
        1. Adjust price of product,set inventory.
        2. Animated charts showing revenue,inventory depletion and price dynamics.
        3.Real-time display of profit margins, market share, and final stock.

___________________________________________________________________________________________________________________


## 4. System Architecture

    ** High-Level Flow:- User input → Frontend state manager → Simulation engine → Visualization Components.



    ** Architecture Description:- N/A

    ** Architecture Diagram:- N/A
    (Add system architecture diagram image here)

___________________________________________________________________________________________________________________

## 5. Database Design
    ER Diagram
    (Add ER diagram image here)

    ER Diagram Description

___________________________________________________________________________________________________________________

## 6. Dataset Selected
    ** Dataset Name:-  Retail Demand Forecasting Dataset,Flipkart E-COMMERCE dataset E-Commerce Behavior Dataset

    ** Source:- KAGGLE ,GOOGLE DATASET SEARCH

    ** Data Type:-  Date , Store ID, Item ID, Units Sold, Historical time-series sales,Product names, Categories, Listed price, Discounted price, Ratings, Reviews, Product specifications

    ** Selection Reason:-  provides real historical demand patterns,flipkart provides real world pricing , distribution , and helps analyze discount behaviour, helps model seasonality, contains transactional data , real revenue calculation , supports demand probabilty estimation

    ** Preprocessing Steps:-Data from Kaggle  was cleaned by removing duplicates, handling missing values, converting prices to numeric format, filtering outliers, and aggregating daily sales to derive revenue and normalized demand features.


___________________________________________________________________________________________________________________

## 7. Model Selected
    Model Name
    Selection Reasoning
    Alternatives Considered
    Evaluation Metrics

___________________________________________________________________________________________________________________

## 8. Technology Stack

    ** Frontend:- HTML,CSS,JavaScript

    ** Backend:- Node.js,express.js,Recharts, Lucide React


    ** Database:- MongoDB
    ** Deployment:- 

___________________________________________________________________________________________________________________

## 9. API Documentation & Testing
    API Endpoints List

    Endpoint 1:
    Endpoint 2:
    Endpoint 3:
    API Testing Screenshots
    (Add Postman / Thunder Client screenshots here)

___________________________________________________________________________________________________________________


## 10. Module-wise Development & Deliverables

    ** Checkpoint 1: Research & Planning
        -Deliverables: using of maths forumlas and on data giving by user.
    Checkpoint 2: Backend Development
    Deliverables:
    ** Checkpoint 3: Frontend Development
        -Deliverables: 

    **Checkpoint 4: Model Training
        -Deliverables:

    ** Checkpoint 5: Model Integration
        -Deliverables:
    ** Checkpoint 6: Deployment
        -Deliverables: 

___________________________________________________________________________________________________________________


## 11. End-to-End Workflow

  ** User Input – User configures pricing parameters (price, elasticity, inventory, competitor price, simulation days) and submits strategy.

  ** Simulation Execution – Backend runs a time-based simulation loop calculating demand, competitor reaction, sales, revenue, and inventory updates.

  ** Metrics Calculation – System aggregates daily data and computes final KPIs (total revenue, units sold, final stock, market share).

  ** Database Storage – Simulation configuration and results are stored for historical tracking and comparison.

  ** Visualization & Analysis – Frontend displays time-series charts and allows comparison of past strategies for decision support.


___________________________________________________________________________________________________________________

## 12. Demo & Video

    **Live Demo Link:
    **Demo Video Link:
    **GitHub Repository: https://github.com/Shubhansh28/Dynamic-pricing-Simulation

## 13. Hackathon Deliverables Summary


___________________________________________________________________________________________________________________

## 14. Team Roles & Responsibilities
Member          Name	                 Role	                Responsibilities
1.          Shubh Ansh Kesharwani       leader                  Backend,database
2.          Ayush Sharma                member                  database,frontend
3.          Avikesh Gurjar              member                  Frontend
___________________________________________________________________________________________________________________

## 15. Future Scope & Scalability

Short-Term
Long-Term

___________________________________________________________________________________________________________________


## 16. Known Limitations

___________________________________________________________________________________________________________________

## 17. Impact
