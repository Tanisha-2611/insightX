"""
InsightX Sample Enterprise Datasets Generator
Generates realistic, high-volume enterprise datasets for BI Analytics:
1. Enterprise Sales Transactions
2. SaaS Subscriptions & Churn Metrics
3. B2B Marketing & Pipeline Performance
4. System Query Logs & Performance Audits
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_enterprise_sales(n_records: int = 5000) -> pd.DataFrame:
    np.random.seed(42)
    random.seed(42)
    
    start_date = datetime.now() - timedelta(days=180)
    dates = [start_date + timedelta(days=int(d), hours=random.randint(8, 20), minutes=random.randint(0, 59)) 
             for d in np.random.uniform(0, 180, n_records)]
    
    regions = ["North America", "EMEA", "Asia Pacific", "Latin America"]
    region_weights = [0.42, 0.31, 0.20, 0.07]
    
    categories = {
        "Cloud Infrastructure": ["Compute Engine X1", "Kubernetes Fleet", "Cloud Storage Vault", "Edge CDN Mesh"],
        "Enterprise Software": ["InsightX BI Enterprise", "Security Guard Sentinel", "API Gateway Pro", "DataSync ETL"],
        "AI & Analytics": ["Neural Forecast AI", "AutoML Pipeline Suite", "LLM Vector Store", "Data Lakehouse Studio"],
        "Developer Tools": ["DevOps Pipeline CI/CD", "Observability APM", "Code Quality Suite", "Secrets Vault"]
    }
    
    segments = ["Enterprise", "Mid-Market", "Growth", "Government"]
    segment_weights = [0.55, 0.25, 0.15, 0.05]
    
    data = []
    for i in range(n_records):
        cat = random.choice(list(categories.keys()))
        prod = random.choice(categories[cat])
        reg = np.random.choice(regions, p=region_weights)
        seg = np.random.choice(segments, p=segment_weights)
        
        base_price = {
            "Cloud Infrastructure": random.uniform(1200, 4800),
            "Enterprise Software": random.uniform(2500, 8500),
            "AI & Analytics": random.uniform(3200, 11000),
            "Developer Tools": random.uniform(800, 3200)
        }[cat]
        
        quantity = random.randint(1, 12) if seg != "Enterprise" else random.randint(5, 45)
        discount = round(random.choice([0.0, 0.05, 0.10, 0.15, 0.20]), 2)
        revenue = round(base_price * quantity * (1.0 - discount), 2)
        cost = round(revenue * random.uniform(0.38, 0.62), 2)
        profit = round(revenue - cost, 2)
        margin = round((profit / revenue) * 100, 1)
        
        data.append({
            "transaction_id": f"TXN-{100000 + i}",
            "date": dates[i].strftime("%Y-%m-%d %H:%M:%S"),
            "customer_name": f"Client-{random.randint(101, 899)} Inc",
            "region": reg,
            "category": cat,
            "product_name": prod,
            "segment": seg,
            "units": quantity,
            "unit_price": round(base_price, 2),
            "discount_pct": discount * 100,
            "revenue": revenue,
            "cost": cost,
            "profit": profit,
            "profit_margin_pct": margin
        })
        
    df = pd.DataFrame(data)
    df.sort_values(by="date", inplace=True)
    return df

def generate_saas_churn(n_records: int = 2500) -> pd.DataFrame:
    np.random.seed(101)
    random.seed(101)
    
    plans = ["Starter", "Professional", "Enterprise Scale", "Ultimate Cloud"]
    plan_prices = {"Starter": 199, "Professional": 799, "Enterprise Scale": 2499, "Ultimate Cloud": 6500}
    industries = ["FinTech", "HealthTech", "E-Commerce", "SaaS B2B", "Logistics", "EdTech"]
    
    data = []
    for i in range(n_records):
        plan = random.choice(plans)
        mrr = plan_prices[plan] + random.randint(-50, 150)
        arr = mrr * 12
        seats = random.randint(5, 250) if plan in ["Enterprise Scale", "Ultimate Cloud"] else random.randint(2, 25)
        health_score = random.randint(35, 99)
        churn_risk = "High" if health_score < 55 else ("Medium" if health_score < 75 else "Low")
        support_tickets = random.randint(0, 14)
        active_days_pct = random.randint(40, 100)
        
        data.append({
            "subscription_id": f"SUB-{20000 + i}",
            "customer_id": f"CUST-{5000 + i}",
            "company_name": f"Acme-{random.randint(10, 999)} Corp",
            "plan_tier": plan,
            "industry": random.choice(industries),
            "mrr": mrr,
            "arr": arr,
            "seat_count": seats,
            "health_score": health_score,
            "churn_risk": churn_risk,
            "open_tickets": support_tickets,
            "usage_frequency_pct": active_days_pct,
            "renewal_quarter": random.choice(["Q1-2026", "Q2-2026", "Q3-2026", "Q4-2026"])
        })
        
    return pd.DataFrame(data)

def generate_marketing_pipeline(n_records: int = 1800) -> pd.DataFrame:
    np.random.seed(202)
    random.seed(202)
    
    channels = ["Google Search", "LinkedIn Ads", "Direct Sales Outbound", "Webinars & Events", "Organic SEO", "Partner Referrals"]
    campaigns = [f"Q{q}-{c}" for q in [1, 2, 3, 4] for c in ["Growth-Campaign", "Enterprise-LeadGen", "Retargeting-Push", "Global-Summit"]]
    
    data = []
    for i in range(n_records):
        ch = random.choice(channels)
        camp = random.choice(campaigns)
        impressions = random.randint(5000, 95000)
        clicks = int(impressions * random.uniform(0.015, 0.058))
        leads = int(clicks * random.uniform(0.08, 0.22))
        opps = max(1, int(leads * random.uniform(0.12, 0.35)))
        closed_won = int(opps * random.uniform(0.20, 0.50))
        spend = round(clicks * random.uniform(2.8, 8.5), 2)
        revenue = round(closed_won * random.uniform(4200, 18500), 2)
        roas = round((revenue / spend), 2) if spend > 0 else 0.0
        cac = round((spend / closed_won), 2) if closed_won > 0 else spend
        
        data.append({
            "campaign_id": f"CAMP-{3000 + i}",
            "campaign_name": camp,
            "channel": ch,
            "impressions": impressions,
            "clicks": clicks,
            "leads": leads,
            "opportunities": opps,
            "closed_won": closed_won,
            "spend": spend,
            "revenue": revenue,
            "roas": roas,
            "cac": cac
        })
    return pd.DataFrame(data)

def generate_query_audit_logs(n_records: int = 1200) -> pd.DataFrame:
    np.random.seed(303)
    random.seed(303)
    
    datasets = ["enterprise_sales", "saas_subscriptions", "marketing_pipeline", "customer_cohorts", "inventory_warehouse"]
    query_types = ["Aggregation", "Time-Series Window", "Multi-Table Join", "Anomaly Filter", "Cohort Clustering"]
    users = ["alex.rivera@insightx.io", "sarah.chen@insightx.io", "marcus.vance@insightx.io", "elena.rostova@insightx.io", "system_cron"]
    
    data = []
    start_time = datetime.now() - timedelta(days=7)
    for i in range(n_records):
        ds = random.choice(datasets)
        qt = random.choice(query_types)
        duration = int(np.random.exponential(scale=65) + random.uniform(15, 45))
        status = np.random.choice(["Success", "Success", "Success", "Success", "Warning", "Failed"], p=[0.75, 0.15, 0.05, 0.02, 0.02, 0.01])
        ts = start_time + timedelta(minutes=int(i * 8.4))
        
        data.append({
            "query_id": f"QRY-{40000 + i}",
            "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
            "dataset": ds,
            "query_type": qt,
            "duration_ms": duration,
            "rows_scanned": random.randint(1200, 240000),
            "rows_returned": random.randint(5, 1200),
            "user": random.choice(users),
            "status": status,
            "cache_hit": random.choice([True, False, False])
        })
    return pd.DataFrame(data)
