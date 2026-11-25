import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  Sliders, 
  Save, 
  CheckCircle2, 
  Key, 
  Server,
  Zap,
  Bell
} from 'lucide-react';
import { apiService } from '../services/api';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    ai_model: "Gemini 1.5 Pro (Optimized)",
    temperature: 0.2,
    max_tokens: 4096,
    db_host: "postgres-prod.internal.insightx.io",
    db_port: 5432,
    db_name: "insightx_enterprise",
    db_user: "svc_bi_reader",
    ssl_mode: "require",
    query_timeout_sec: 30,
    auto_refresh_interval_sec: 60,
    compact_mode: true,
    telemetry_enabled: true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••');

  useEffect(() => {
    apiService.getSettings()
      .then(data => {
        if (data) setSettings(data);
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="bg-[#121620] border border-[#252B38] rounded-lg p-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#F3F4F8] flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#9A7AFF]" />
            <span>Platform Configuration & System Settings</span>
          </h2>
          <p className="text-xs text-[#9299AA] mt-1">
            Configure LLM inference models, PostgreSQL connection pooling, and workspace telemetry.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-[#43B581] bg-[#43B581]/15 border border-[#43B581]/30 px-3 py-1.5 rounded-md font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* SECTION 1: AI MODEL & INFERENCE */}
        <div className="bg-[#121620] border border-[#252B38] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#252B38]">
            <Sparkles className="w-4 h-4 text-[#9A7AFF]" />
            <h3 className="text-xs font-semibold text-[#F3F4F8]">AI Query & Semantic Grounding</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#9299AA] mb-1 font-medium">Inference Engine</label>
              <select
                value={settings.ai_model}
                onChange={(e) => setSettings({ ...settings, ai_model: e.target.value })}
                className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8] focus:outline-hidden cursor-pointer"
              >
                <option value="Gemini 1.5 Pro (Optimized)">Gemini 1.5 Pro (High Reasoning Enterprise)</option>
                <option value="Gemini 1.5 Flash (Ultra-Fast)">Gemini 1.5 Flash (Sub-30ms Latency)</option>
                <option value="OpenAI GPT-4o">OpenAI GPT-4o Enterprise</option>
                <option value="Local AST NL-to-SQL Engine">Local AST NL-to-SQL Compiler (Offline / Air-Gapped)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9299AA] mb-1 font-medium">API Credential Token</label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8] focus:outline-hidden"
                />
                <Key className="w-3.5 h-3.5 text-[#9299AA] absolute right-2.5 top-2" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#9299AA] mb-1 font-medium">
                <span>Sampling Temperature</span>
                <span className="font-mono text-[#F3F4F8]">{settings.temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                className="w-full accent-[#7755E8] cursor-pointer"
              />
              <span className="text-[10px] text-[#9299AA]">Lower values yield deterministic, validated SQL queries.</span>
            </div>

            <div>
              <label className="block text-[#9299AA] mb-1 font-medium">Max Context Window Tokens</label>
              <select
                value={settings.max_tokens}
                onChange={(e) => setSettings({ ...settings, max_tokens: parseInt(e.target.value) })}
                className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8] focus:outline-hidden cursor-pointer"
              >
                <option value={2048}>2,048 Tokens</option>
                <option value={4096}>4,096 Tokens (Recommended)</option>
                <option value={8192}>8,192 Tokens (Large Catalogs)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: POSTGRESQL & RELATIONAL ENGINE */}
        <div className="bg-[#121620] border border-[#252B38] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#252B38]">
            <Server className="w-4 h-4 text-[#7755E8]" />
            <h3 className="text-xs font-semibold text-[#F3F4F8]">Database & Connection Pooling</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[#9299AA] mb-1 font-medium">PostgreSQL Host</label>
              <input
                type="text"
                value={settings.db_host}
                onChange={(e) => setSettings({ ...settings, db_host: e.target.value })}
                className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8]"
              />
            </div>

            <div>
              <label className="block text-[#9299AA] mb-1 font-medium">Default Port</label>
              <input
                type="number"
                value={settings.db_port}
                onChange={(e) => setSettings({ ...settings, db_port: parseInt(e.target.value) })}
                className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8]"
              />
            </div>

            <div>
              <label className="block text-[#9299AA] mb-1 font-medium">Database Name</label>
              <input
                type="text"
                value={settings.db_name}
                onChange={(e) => setSettings({ ...settings, db_name: e.target.value })}
                className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8]"
              />
            </div>

            <div>
              <label className="block text-[#9299AA] mb-1 font-medium">Service User</label>
              <input
                type="text"
                value={settings.db_user}
                onChange={(e) => setSettings({ ...settings, db_user: e.target.value })}
                className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8]"
              />
            </div>

            <div>
              <label className="block text-[#9299AA] mb-1 font-medium">SSL Mode</label>
              <select
                value={settings.ssl_mode}
                onChange={(e) => setSettings({ ...settings, ssl_mode: e.target.value })}
                className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8] cursor-pointer"
              >
                <option value="require">Require (TLS 1.3)</option>
                <option value="verify-full">Verify Full</option>
                <option value="prefer">Prefer</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9299AA] mb-1 font-medium">Query Timeout (Seconds)</label>
              <input
                type="number"
                value={settings.query_timeout_sec}
                onChange={(e) => setSettings({ ...settings, query_timeout_sec: parseInt(e.target.value) })}
                className="w-full bg-[#171C29] border border-[#252B38] rounded-md px-3 py-1.5 text-xs text-[#F3F4F8] focus:border-[#7755E8]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: WORKSPACE PREFERENCES */}
        <div className="bg-[#121620] border border-[#252B38] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#252B38]">
            <Sliders className="w-4 h-4 text-[#43B581]" />
            <h3 className="text-xs font-semibold text-[#F3F4F8]">Workspace & Density Preferences</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-[#171C29] rounded-md border border-[#252B38]">
              <div>
                <div className="font-medium text-[#F3F4F8]">Compact Enterprise Density</div>
                <div className="text-[11px] text-[#9299AA]">Renders small KPI cards and high information density rows.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.compact_mode}
                onChange={(e) => setSettings({ ...settings, compact_mode: e.target.checked })}
                className="w-4 h-4 accent-[#7755E8] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#171C29] rounded-md border border-[#252B38]">
              <div>
                <div className="font-medium text-[#F3F4F8]">Telemetry & Audit Tracking</div>
                <div className="text-[11px] text-[#9299AA]">Records SQL query execution duration and latency statistics.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.telemetry_enabled}
                onChange={(e) => setSettings({ ...settings, telemetry_enabled: e.target.checked })}
                className="w-4 h-4 accent-[#7755E8] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#7755E8] hover:bg-[#6844db] text-white px-5 py-2 rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
