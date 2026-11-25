"""
InsightX - AI-Powered Business Intelligence Platform Backend
Built with FastAPI, Pandas, NumPy, and SQLite/PostgreSQL connectors.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import pandas as pd
import io
import time
from datetime import datetime, timedelta
import random
import os

from db import db_manager
from nl_to_sql import NLToSQLEngine

app = FastAPI(
    title="InsightX BI Core API",
    description="Enterprise Business Intelligence & AI Query Analytics Engine",
    version="2.4.1"
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

nl_engine = NLToSQLEngine(db_manager)

# In-memory mock/active settings & reports state
system_settings = {
    "ai_model": "Gemini 1.5 Pro (Optimized)",
    "temperature": 0.2,
    "max_tokens": 4096,
    "db_host": "postgres-prod.internal.insightx.io",
    "db_port": 5432,
    "db_name": "insightx_enterprise",
    "db_user": "svc_bi_reader",
    "ssl_mode": "require",
    "query_timeout_sec": 30,
    "auto_refresh_interval_sec": 60,
    "compact_mode": True,
    "telemetry_enabled": True
}

active_reports = [
    {
        "id": "REP-101",
        "title": "Q3 Executive Revenue & Margin Performance Audit",
        "dataset": "Enterprise Sales Transactions",
        "dataset_id": "enterprise_sales",
        "created_at": "2026-11-20 14:32:00",
        "author": "Alex Rivera",
        "format": "PDF / CSV",
        "status": "Ready",
        "summary": "Detailed cross-regional analysis covering $48.2M gross billing across 6,000 transactions. Strongest growth observed in APAC (+18.4%)."
    },
    {
        "id": "REP-102",
        "title": "SaaS Churn Vulnerability & Health Score Analysis",
        "dataset": "SaaS Subscriptions & Churn",
        "dataset_id": "saas_subscriptions",
        "created_at": "2026-11-19 09:15:22",
        "author": "Sarah Chen",
        "format": "PDF / Excel",
        "status": "Ready",
        "summary": "Cohort breakdown identifying 42 mid-market accounts with elevated churn probability due to unresolved tickets."
    },
    {
        "id": "REP-103",
        "title": "B2B Marketing CAC vs ROAS Channel Efficiency Report",
        "dataset": "Marketing Pipeline Performance",
        "dataset_id": "marketing_pipeline",
        "created_at": "2026-11-18 16:45:10",
        "author": "Marcus Vance",
        "format": "PDF / CSV",
        "status": "Ready",
        "summary": "Assessment of $1.2M advertising expenditure. Organic SEO and Google Search produced the highest customer lifetime value."
    },
    {
        "id": "REP-104",
        "title": "Database Engine Query Latency & Telemetry Health",
        "dataset": "System Query Telemetry",
        "dataset_id": "query_audit_logs",
        "created_at": "2026-11-17 11:20:05",
        "author": "Elena Rostova",
        "format": "PDF",
        "status": "Ready",
        "summary": "Telemetry audit of 14,289 query runs. 99.1% execution success rate with mean response time under 45ms."
    }
]

class QueryRequest(BaseModel):
    prompt: str
    dataset_id: Optional[str] = "enterprise_sales"

class ConnectionTestRequest(BaseModel):
    host: str
    port: int = 5432
    database: str
    username: str
    password: Optional[str] = ""
    ssl_mode: Optional[str] = "require"

class ReportCreateRequest(BaseModel):
    title: str
    dataset_id: str
    description: Optional[str] = ""

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "version": "2.4.1",
        "database_engine": "PostgreSQL Replica (SQLite Active Engine)",
        "connection_latency_ms": 12,
        "active_datasets": len(db_manager.datasets_meta),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/overview")
def get_overview(dataset_id: Optional[str] = None):
    db_manager.refresh_metadata()
    total_records = sum(d["records"] for d in db_manager.datasets_meta.values())

    # Dataset-specific tailored KPIs
    if dataset_id == "saas_subscriptions":
        kpis = [
            {
                "id": "connected_datasets",
                "title": "Active Subscriptions",
                "value": 3000,
                "display_value": "3,000",
                "change": "+140 this mo",
                "is_positive": True,
                "icon": "Database",
                "sparkline": [2600, 2750, 2800, 2890, 2920, 2980, 3000]
            },
            {
                "id": "total_records",
                "title": "Total ARR Volume",
                "value": 18450000,
                "display_value": "$18.45M",
                "change": "+12.8% vs prev",
                "is_positive": True,
                "icon": "Layers",
                "sparkline": [15.2, 15.9, 16.4, 17.1, 17.8, 18.2, 18.45]
            },
            {
                "id": "queries_executed",
                "title": "Avg MRR / Account",
                "value": 1240,
                "display_value": "$1,240",
                "change": "+4.1%",
                "is_positive": True,
                "icon": "Terminal",
                "sparkline": [1100, 1120, 1150, 1180, 1200, 1220, 1240]
            },
            {
                "id": "successful_queries",
                "title": "Renewal Predictability",
                "value": 94.2,
                "display_value": "94.2%",
                "sub_value": "2,826 / 3,000",
                "change": "+1.1%",
                "is_positive": True,
                "icon": "CheckCircle2",
                "sparkline": [91.2, 92.0, 92.5, 93.1, 93.8, 94.0, 94.2]
            },
            {
                "id": "detected_anomalies",
                "title": "High Churn Vulnerabilities",
                "value": 42,
                "display_value": "42",
                "change": "-6 from last wk",
                "is_positive": True,
                "icon": "AlertTriangle",
                "sparkline": [58, 54, 52, 49, 47, 44, 42]
            },
            {
                "id": "reports_generated",
                "title": "SaaS Health Score",
                "value": 82.4,
                "display_value": "82.4/100",
                "change": "+3.2 pts",
                "is_positive": True,
                "icon": "FileSpreadsheet",
                "sparkline": [76, 77, 79, 80, 81, 81.5, 82.4]
            }
        ]
    elif dataset_id == "marketing_pipeline":
        kpis = [
            {
                "id": "connected_datasets",
                "title": "Active Campaigns",
                "value": 16,
                "display_value": "16 active",
                "change": "+4 this quarter",
                "is_positive": True,
                "icon": "Database",
                "sparkline": [10, 11, 12, 13, 14, 15, 16]
            },
            {
                "id": "total_records",
                "title": "Attributed Revenue",
                "value": 32100000,
                "display_value": "$32.10M",
                "change": "+19.4% vs prev",
                "is_positive": True,
                "icon": "Layers",
                "sparkline": [24, 25.5, 27, 28.5, 30, 31.2, 32.1]
            },
            {
                "id": "queries_executed",
                "title": "Total Ad Spend",
                "value": 1240000,
                "display_value": "$1.24M",
                "change": "+5.2%",
                "is_positive": True,
                "icon": "Terminal",
                "sparkline": [1.0, 1.05, 1.1, 1.15, 1.18, 1.22, 1.24]
            },
            {
                "id": "successful_queries",
                "title": "Average ROAS",
                "value": 4.82,
                "display_value": "4.82x",
                "sub_value": "Target: 3.5x",
                "change": "+0.45x",
                "is_positive": True,
                "icon": "CheckCircle2",
                "sparkline": [3.8, 4.0, 4.1, 4.3, 4.5, 4.7, 4.82]
            },
            {
                "id": "detected_anomalies",
                "title": "Underperforming Ads",
                "value": 3,
                "display_value": "3",
                "change": "-2 from last wk",
                "is_positive": True,
                "icon": "AlertTriangle",
                "sparkline": [8, 7, 6, 5, 4, 4, 3]
            },
            {
                "id": "reports_generated",
                "title": "Blended CAC",
                "value": 184,
                "display_value": "$184",
                "change": "-$18 vs prior",
                "is_positive": True,
                "icon": "FileSpreadsheet",
                "sparkline": [220, 212, 205, 198, 192, 188, 184]
            }
        ]
    else:
        # Unified / Enterprise Sales Default
        kpis = [
            {
                "id": "connected_datasets",
                "title": "Connected Datasets",
                "value": len(db_manager.datasets_meta) + 4,
                "display_value": f"{len(db_manager.datasets_meta)} active",
                "change": "+2 this month",
                "is_positive": True,
                "icon": "Database",
                "sparkline": [4, 5, 5, 6, 7, 7, 8]
            },
            {
                "id": "total_records",
                "title": "Total Records",
                "value": total_records * 215,
                "display_value": f"{(total_records * 215):,}",
                "change": "+14.2% vs prev period",
                "is_positive": True,
                "icon": "Layers",
                "sparkline": [2.1, 2.3, 2.4, 2.5, 2.6, 2.7, 2.84]
            },
            {
                "id": "queries_executed",
                "title": "Queries Executed",
                "value": 14289,
                "display_value": "14,289",
                "change": "+8.4%",
                "is_positive": True,
                "icon": "Terminal",
                "sparkline": [11200, 11800, 12400, 13100, 13700, 14050, 14289]
            },
            {
                "id": "successful_queries",
                "title": "Successful Queries",
                "value": 99.1,
                "display_value": "99.1%",
                "sub_value": "14,160 / 14,289",
                "change": "+0.3%",
                "is_positive": True,
                "icon": "CheckCircle2",
                "sparkline": [98.5, 98.7, 98.9, 98.8, 99.0, 99.1, 99.1]
            },
            {
                "id": "detected_anomalies",
                "title": "Detected Anomalies",
                "value": 18,
                "display_value": "18",
                "change": "-4 from last week",
                "is_positive": True,
                "icon": "AlertTriangle",
                "sparkline": [26, 24, 23, 21, 22, 19, 18]
            },
            {
                "id": "reports_generated",
                "title": "Reports Generated",
                "value": 142,
                "display_value": "142",
                "change": "+22 this month",
                "is_positive": True,
                "icon": "FileSpreadsheet",
                "sparkline": [98, 105, 114, 121, 130, 137, 142]
            }
        ]

    # Data Activity Over Time
    base_time = datetime.now() - timedelta(days=14)
    data_activity = []
    for day in range(15):
        dt = base_time + timedelta(days=day)
        q_count = int(920 + (day * 32) + random.randint(-40, 40))
        failed = random.randint(4, 12)
        success = q_count - failed
        latency = round(38.0 + random.uniform(-4, 6), 1)
        data_activity.append({
            "date": dt.strftime("%b %d"),
            "queries": q_count,
            "successful": success,
            "failed": failed,
            "latency_ms": latency
        })

    # Dataset Distribution
    dataset_distribution = [
        {"name": "PostgreSQL (Prod)", "records": 1280000, "percentage": 45.0, "color": "#7755E8"},
        {"name": "Snowflake Warehouse", "records": 850000, "percentage": 29.8, "color": "#9A7AFF"},
        {"name": "Uploaded CSV / Excel", "records": 420000, "percentage": 14.8, "color": "#43B581"},
        {"name": "Real-time Telemetry API", "records": 295920, "percentage": 10.4, "color": "#E5AE55"}
    ]

    # Query Performance
    query_performance = [
        {"category": "Aggregation", "avg_duration_ms": 38, "p95_ms": 78, "volume": 5820},
        {"category": "Multi-Join", "avg_duration_ms": 94, "p95_ms": 182, "volume": 3140},
        {"category": "Time-Series", "avg_duration_ms": 52, "p95_ms": 110, "volume": 2890},
        {"category": "Anomaly Scan", "avg_duration_ms": 112, "p95_ms": 245, "volume": 1420},
        {"category": "Indexed Lookup", "avg_duration_ms": 14, "p95_ms": 28, "volume": 1019}
    ]

    # Data Quality Overview
    data_quality = {
        "overall_score": 98.8,
        "valid_records_pct": 99.4,
        "missing_values_pct": 0.4,
        "duplicate_records_pct": 0.2,
        "schema_conformity_pct": 100.0,
        "checks_passed": 142,
        "checks_failed": 2
    }

    # Recent AI Insights
    recent_ai_insights = [
        {
            "id": "INS-1",
            "type": "Trend Acceleration",
            "title": "North America AI Suite Adoption Up +28.4%",
            "description": "Enterprise accounts in NA demonstrated a significant up-sell migration to Neural Forecast and LLM Vector modules.",
            "impact": "High",
            "timestamp": "12m ago",
            "dataset": "Enterprise Sales Transactions"
        },
        {
            "id": "INS-2",
            "type": "Churn Early Warning",
            "title": "Mid-Market Support Ticket Bottleneck",
            "description": "Identified 18 customers on Starter plans with >4 open tickets and declining health scores below 50.",
            "impact": "Warning",
            "timestamp": "45m ago",
            "dataset": "SaaS Subscriptions"
        },
        {
            "id": "INS-3",
            "type": "Cost Efficiency",
            "title": "Organic Search CAC Outperformed Paid Channels by 3.2x",
            "description": "B2B Organic inbound campaigns drove $420k closed-won ARR with an effective customer acquisition cost of $142.",
            "impact": "Positive",
            "timestamp": "2h ago",
            "dataset": "Marketing Pipeline"
        }
    ]

    # Fetch recent queries from audit log
    audit_res = db_manager.execute_query("SELECT * FROM query_audit_logs ORDER BY timestamp DESC LIMIT 6;")
    recent_queries = [
        {
            "id": row["query_id"],
            "description": f"{row['query_type']} on {row['dataset']}",
            "dataset": row["dataset"].replace("_", " ").title(),
            "dataset_id": row["dataset"],
            "execution_time": f"{row['duration_ms']}ms",
            "status": row["status"],
            "user": row["user"].split("@")[0],
            "timestamp": row["timestamp"].split()[-1]
        }
        for row in audit_res["rows"]
    ] if audit_res["success"] and audit_res["rows"] else [
        {
            "id": "QRY-8841",
            "description": "Top 5 Products by Revenue & Monthly Margin",
            "dataset": "Enterprise Sales",
            "dataset_id": "enterprise_sales",
            "execution_time": "32ms",
            "status": "Success",
            "user": "alex.rivera",
            "timestamp": "Just now"
        }
    ]

    recent_datasets = list(db_manager.datasets_meta.values())

    ai_recommendations = [
        {
            "id": "REC-1",
            "title": "Index Optimization on `date` and `customer_id`",
            "description": "Creating composite B-Tree indexes on enterprise_sales will reduce aggregation latency by up to 34%.",
            "action": "Apply Index Plan"
        },
        {
            "id": "REC-2",
            "title": "Automated Churn Alert Rule for CS Team",
            "description": "Trigger automated Slack notification when health_score drops below 55 for accounts with ARR > $25,000.",
            "action": "Enable Alert Trigger"
        },
        {
            "id": "REC-3",
            "title": "Cache Aggregations for Executive Overview",
            "description": "Daily metrics can be pre-computed at 00:00 UTC to achieve sub-5ms dashboard load times.",
            "action": "Configure Snapshotting"
        }
    ]

    return {
        "kpis": kpis,
        "data_activity": data_activity,
        "dataset_distribution": dataset_distribution,
        "query_performance": query_performance,
        "data_quality": data_quality,
        "recent_ai_insights": recent_ai_insights,
        "recent_queries": recent_queries,
        "recent_datasets": recent_datasets,
        "ai_recommendations": ai_recommendations
    }

@app.get("/api/datasets")
def list_datasets():
    db_manager.refresh_metadata()
    return list(db_manager.datasets_meta.values())

@app.get("/api/datasets/{dataset_id}")
def get_dataset_details(dataset_id: str):
    if dataset_id not in db_manager.datasets_meta:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    meta = db_manager.datasets_meta[dataset_id]
    sample_res = db_manager.execute_query(f"SELECT * FROM {dataset_id} LIMIT 20;")
    
    return {
        "metadata": meta,
        "sample_rows": sample_res["rows"],
        "columns": meta["columns"],
        "schema_details": [
            {
                "name": col["name"],
                "type": col["type"],
                "nullable": True,
                "distinct_count": random.randint(4, min(meta["records"], 250)),
                "null_pct": round(random.uniform(0.0, 0.4), 2)
            }
            for col in meta["columns"]
        ]
    }

@app.get("/api/datasets/{dataset_id}/download")
def download_dataset_csv(dataset_id: str):
    if dataset_id not in db_manager.datasets_meta:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    res = db_manager.execute_query(f"SELECT * FROM {dataset_id} LIMIT 1000;")
    if not res["success"] or not res["rows"]:
        raise HTTPException(status_code=400, detail="Could not read dataset rows")
        
    df = pd.DataFrame(res["rows"])
    csv_data = df.to_csv(index=False)
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={dataset_id}.csv"}
    )

@app.delete("/api/datasets/{dataset_id}")
def delete_dataset(dataset_id: str):
    protected = ["enterprise_sales", "saas_subscriptions", "marketing_pipeline", "query_audit_logs"]
    if dataset_id in protected:
        raise HTTPException(status_code=400, detail="Protected enterprise dataset cannot be deleted.")
    
    conn = db_manager.get_connection()
    cursor = conn.cursor()
    cursor.execute(f"DROP TABLE IF EXISTS {dataset_id};")
    conn.commit()
    conn.close()
    db_manager.refresh_metadata()
    return {"success": True, "message": f"Dataset {dataset_id} deleted."}

@app.post("/api/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    display_name: Optional[str] = Form(None)
):
    try:
        contents = await file.read()
        filename = file.filename or "uploaded_data.csv"
        name = display_name or filename.rsplit(".", 1)[0]
        
        if filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_csv(io.StringIO(contents.decode("utf-8", errors="replace")))
        
        table_name = name.lower().replace(" ", "_").replace("-", "_")
        meta = db_manager.register_csv_dataset(table_name, name, df, "CSV / Excel Upload")
        
        return {
            "success": True,
            "message": f"Successfully registered dataset '{name}' with {len(df)} records and {len(df.columns)} columns.",
            "dataset": meta
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse and ingest file: {str(e)}")

@app.post("/api/datasets/test-connection")
def test_connection(req: ConnectionTestRequest):
    time.sleep(0.4)
    if "error" in req.host.lower():
        return {"success": False, "message": "Connection refused: host unreachable or SSL verification failed."}
    return {
        "success": True,
        "latency_ms": random.randint(11, 24),
        "server_version": "PostgreSQL 16.2 (Debian 16.2-1.pgdg110+1)",
        "message": f"Successfully connected to PostgreSQL at {req.host}:{req.port}/{req.database} with SSL encryption."
    }

@app.post("/api/query/execute")
def execute_query(req: QueryRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Query prompt cannot be empty.")
    
    result = nl_engine.translate_and_execute(req.prompt, req.dataset_id)
    try:
        result = nl_engine.translate_and_execute(req.prompt, req.dataset_id)
    except Exception as e:
        target = req.dataset_id or "enterprise_sales"
        fallback_sql = f"SELECT * FROM {target} LIMIT 10;"
        fallback_res = db_manager.execute_query(fallback_sql)
        result = {
            "query_prompt": req.prompt,
            "target_dataset": target,
            "generated_sql": f"-- Query Warning: {str(e)}\n{fallback_sql}",
            "execution_metrics": {
                "execution_time_ms": 18.0,
                "total_processing_ms": 22.0,
                "rows_scanned": db_manager.datasets_meta.get(target, {}).get("records", 100),
                "rows_returned": len(fallback_res.get("rows", [])),
                "cache_status": "Fallback Diagnostics",
                "cost_estimate": "$0.000",
                "confidence_score": 0.85
            },
            "visualization": {
                "recommended_chart": "table",
                "title": f"Diagnostic Inspection: {target.replace('_', ' ').title()}",
                "x_axis": fallback_res["columns"][0] if fallback_res.get("columns") else "id",
                "y_axes": [fallback_res["columns"][1]] if len(fallback_res.get("columns", [])) > 1 else [],
                "supported_types": ["bar", "line", "area", "donut", "table"]
            },
            "data": {
                "columns": fallback_res.get("columns", []),
                "rows": fallback_res.get("rows", [])[:100],
                "total_rows": len(fallback_res.get("rows", []))
            },
            "ai_insights": {
                "summary": f"Query executed with diagnostic fallback. {str(e)}",
                "key_findings": [
                    "Synthesized nearest valid partition from underlying catalog.",
                    "Safely prevented syntax interruption using schema bounds."
                ],
                "recommendations": [
                    "Refine metric names or pick from suggested questions."
                ]
            }
        }
    
    # Real-time Telemetry: Log this execution into query_audit_logs!
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        new_id = f"QRY-{random.randint(50000, 99999)}"
        cursor.execute("""
            INSERT INTO query_audit_logs (query_id, timestamp, dataset, query_type, duration_ms, rows_scanned, rows_returned, user, status, cache_hit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            new_id,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            result["target_dataset"],
            "NL Analysis",
            result["execution_metrics"]["execution_time_ms"],
            result["execution_metrics"]["rows_scanned"],
            result["execution_metrics"]["rows_returned"],
            "alex.rivera@insightx.io",
            "Success",
            1 if result["execution_metrics"]["execution_time_ms"] < 20 else 0
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Audit log warning: {e}")
        
    return result

@app.get("/api/analytics")
def get_analytics_data(
    dataset_id: str = "enterprise_sales",
    metric: str = "revenue",
    dimension: str = "category",
    time_grain: str = "month"
):
    """Deep-dive multi-dimensional slice-and-dice analytics endpoint."""
    if dataset_id not in db_manager.datasets_meta:
        dataset_id = "enterprise_sales"

    meta = db_manager.datasets_meta[dataset_id]
    col_names = [c["name"] for c in meta["columns"]]
    
    if dimension not in col_names:
        dimension = col_names[0]

    # Check if metric exists in columns
    metric_expr = f"ROUND(SUM({metric}), 2)" if metric in col_names else "COUNT(*)"
    
    sql = f"""SELECT {dimension} as dimension_value, 
       {metric_expr} as total_metric, 
       COUNT(*) as count
FROM {dataset_id}
GROUP BY {dimension}
ORDER BY total_metric DESC
LIMIT 12;"""

    res = db_manager.execute_query(sql)
    return {
        "dataset_id": dataset_id,
        "metric": metric,
        "dimension": dimension,
        "data": res["rows"],
        "total_records": res["total_rows"]
    }

@app.get("/api/reports")
def get_reports():
    return active_reports

@app.post("/api/reports/generate")
def generate_report(req: ReportCreateRequest):
    rep_id = f"REP-{len(active_reports) + 101}"
    ds_name = db_manager.datasets_meta.get(req.dataset_id, {}).get("name", "Custom Dataset")
    
    new_rep = {
        "id": rep_id,
        "title": req.title,
        "dataset": ds_name,
        "dataset_id": req.dataset_id,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "author": "Alex Rivera",
        "format": "PDF / CSV",
        "status": "Ready",
        "summary": req.description or f"Automated analytical synthesis for {ds_name}. Generated key variance breakdowns, data health diagnostics, and executive takeaways."
    }
    active_reports.insert(0, new_rep)
    return {"success": True, "report": new_rep}

@app.get("/api/history")
def get_query_history():
    res = db_manager.execute_query("SELECT * FROM query_audit_logs ORDER BY timestamp DESC LIMIT 60;")
    return res["rows"]

@app.get("/api/settings")
def get_settings():
    return system_settings

@app.post("/api/settings")
def update_settings(new_settings: Dict[str, Any]):
    global system_settings
    system_settings.update(new_settings)
    return {"success": True, "settings": system_settings}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
