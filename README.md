# INSIGHTX — Enterprise AI-Powered Business Intelligence Platform

An enterprise-grade, dark-themed AI Business Intelligence platform engineered with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Recharts**, **FastAPI**, **Pandas**, **NumPy**, and **SQLAlchemy/SQLite/PostgreSQL**.

---

## 🎨 Visual Design Language & Color Palette

Designed specifically to match high-density, dark-themed enterprise analytics interfaces:

| Surface / Token | Hex Value | Application |
|---|---|---|
| **Background** | `#090B10` | App root canvas |
| **Sidebar** | `#0D1018` | Fixed compact navigation sidebar |
| **Card Background** | `#121620` | Analytical containers and KPI cards |
| **Elevated Surface** | `#171C29` | Modals, table headers, controls |
| **Subtle Border** | `#252B38` | Structural dividers and card outlines |
| **Primary Text** | `#F3F4F8` | Headers, metrics, active labels |
| **Secondary Text** | `#9299AA` | Metric subtitles, captions, timestamps |
| **Accent Purple** | `#7755E8` | Selected navigation, primary buttons |
| **Accent Violet** | `#9A7AFF` | Data visualization series, AI badges |
| **Success Green** | `#43B581` | Positive trends, healthy statuses |
| **Warning Amber** | `#E5AE55` | Elevated latency, churn warnings |
| **Danger Coral** | `#E36F75` | Query failures, severe anomalies |

---

## 🏛️ Application Architecture & Layout

### 1. Left Navigation Sidebar
- **Brand**: INSIGHTX logo with glowing purple emblem and `BI v2.4` badge.
- **Workspace Navigation**:
  - `Overview`: Six KPI cards + 3 analytical rows (Activity, Distribution, Performance, Quality, Queries, Datasets, AI Recommendations).
  - `Data Sources`: Manage database connections, upload CSV/Excel files, schema inspector, and live sample preview.
  - `AI Query Studio`: Interactive natural-language-to-SQL workspace with dynamic Recharts, execution plan, and business takeaways.
  - `Analytics`: Multi-dimensional slicing, metric aggregations, and customizable charts.
  - `Reports`: Executive dossiers with print-ready PDF export and CSV downloads.
- **Management**:
  - `Query History`: Real-time query telemetry log, execution times, and one-click re-run in Studio.
  - `Settings`: LLM model configuration, PostgreSQL connection pooling, and workspace density options.
- **Footer**:
  - Live PostgreSQL connection status with real-time ping latency (`12ms`).
  - Active user profile (`Alex Rivera - Principal Architect`).

### 2. Main Dashboard & Header
- **Dynamic Header**: Title, subtitle, dataset selector dropdown, date range selector, spinning refresh trigger with sync timestamp, and "Export Report" button.
- **KPI Card Grid**:
  1. **Connected Datasets**: `8 active` (+2 this month) with sparkline.
  2. **Total Records**: `2,845,920` (+14.2% vs prev period) with sparkline.
  3. **Queries Executed**: `14,289` (+8.4%) with sparkline.
  4. **Successful Queries**: `99.1%` (14,160 / 14,289) (+0.3%) with sparkline.
  5. **Detected Anomalies**: `18` (-4 from last week) with sparkline.
  6. **Reports Generated**: `142` (+22 this month) with sparkline.
- **Analytical Grid**:
  - **Row 1**: Data Activity Over Time (Area Chart with dual series) & Dataset Distribution (Donut Chart).
  - **Row 2**: Query Performance (Bar Chart by category), Data Quality Overview (Valid, Missing, Duplicate bars), and Recent AI Insights.
  - **Row 3**: Recent Query Activity (Telemetry table), Recently Connected Datasets, and AI Recommendations.

### 3. AI Query Studio
- Dedicated analytical workspace featuring:
  - Dataset selector.
  - Natural language query input with keyboard shortcut (`Ctrl + Enter`).
  - Suggested enterprise prompts (Top 5 products by revenue, Churn risk, ROAS by channel, Query latency).
  - Execution telemetry bar: Execution latency (ms), rows scanned, confidence score, cache status.
  - Tabs:
    - **Visualization**: Auto-selects Bar, Line, Area, or Donut chart with on-the-fly switcher.
    - **Data Table**: Paginated, sortable, filterable table with CSV export.
    - **Generated SQL**: Syntax-highlighted, copyable PostgreSQL/SQLite query with AST validation.
    - **Optimizer Plan**: Detailed relational execution plan and index diagnostics.
  - AI Business Intelligence panel: Executive summary, key findings, and actionable recommendations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Running the Platform
Simply double-click `start.bat` on Windows, or run:

```bash
# 1. Start the FastAPI backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir backend

# 2. In another terminal, start the Vite frontend
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

- **Frontend Application**: `http://127.0.0.1:5173/`
- **FastAPI Interactive Docs**: `http://127.0.0.1:8000/docs`
