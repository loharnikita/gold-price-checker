import { useState, useEffect, useMemo } from "react";
import { Input, Select, Card } from "./components/UI";
import { fetchMetals } from "./services/metalsApi";
import "./App.css";

const TROY_OUNCE_TO_GRAM = 31.1034768;
const POPULAR_CURRENCIES = ["USD","INR","EUR","GBP","AED","AUD","CAD","JPY","CNY","SGD","CHF"];

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("metals_api_key") || "");
  const [baseCurrency, setBaseCurrency] = useState(localStorage.getItem("base_currency") || "USD");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useMock, setUseMock] = useState(false);

  const [amount, setAmount] = useState("1");
  const [fromCur, setFromCur] = useState("USD");
  const [toCur, setToCur] = useState("INR");

  useEffect(() => { localStorage.setItem("metals_api_key", apiKey || ""); }, [apiKey]);
  useEffect(() => { localStorage.setItem("base_currency", baseCurrency || "USD"); }, [baseCurrency]);

  async function load() {
    setError("");
    setLoading(true);
    try {
      if (useMock) {
        const mock = {
          base: baseCurrency,
          rates: { XAU: 0.00045, XAG: 0.038, USD: 1, EUR: 0.92, INR: 84.1, GBP: 0.78, AED: 3.67, AUD: 1.48, CAD: 1.36, JPY: 144.6, CNY: 7.2, SGD: 1.34, CHF: 0.88 },
          timestamp: Math.floor(Date.now() / 1000),
        };
        setData(mock);
      } else {
        if (!apiKey) throw new Error("Enter your Metals-API access key.");
        const payload = await fetchMetals({ apiKey, base: baseCurrency });
        setData(payload);
      }
    } catch (e) {
      setError(e.message || String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const computed = useMemo(() => {
    if (!data || !data.rates) return null;
    const { rates, base } = data;

    const ounceGold = rates.XAU ? 1 / rates.XAU : null;
    const ounceSilver = rates.XAG ? 1 / rates.XAG : null;
    const gramGold = ounceGold != null ? ounceGold / TROY_OUNCE_TO_GRAM : null;
    const gramSilver = ounceSilver != null ? ounceSilver / TROY_OUNCE_TO_GRAM : null;

    function convert(amount, from, to) {
      const a = parseFloat(amount);
      if (!isFinite(a)) return 0;
      const rFrom = rates[from];
      const rTo = rates[to];
      if (rFrom == null || rTo == null) return 0;
      const inBase = a / rFrom;
      return inBase * rTo;
    }

    return { base, rates, ounceGold, ounceSilver, gramGold, gramSilver, convert };
  }, [data]);

  return (
    <div className="App">
      <h1>Gold & Silver Price Checker</h1>
      <Input label="API Key" value={apiKey} onChange={setApiKey} placeholder="Enter Metals-API Key" />
      <Select label="Base Currency" value={baseCurrency} onChange={setBaseCurrency} options={POPULAR_CURRENCIES} />
      <button onClick={load} disabled={loading}>{loading ? "Loading..." : "Fetch Prices"}</button>
      <label>
        <input type="checkbox" checked={useMock} onChange={(e) => setUseMock(e.target.checked)} /> Use Mock Data
      </label>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {computed && (
        <>
          <Card>
            <h2>Metals Prices</h2>
            <p>Gold (per gram): {computed.gramGold?.toFixed(2)} {baseCurrency}</p>
            <p>Silver (per gram): {computed.gramSilver?.toFixed(2)} {baseCurrency}</p>
          </Card>

          <Card>
            <h2>Currency Converter</h2>
            <Input label="Amount" value={amount} onChange={setAmount} />
            <Select label="From" value={fromCur} onChange={setFromCur} options={POPULAR_CURRENCIES} />
            <Select label="To" value={toCur} onChange={setToCur} options={POPULAR_CURRENCIES} />
            <p>Converted: {computed.convert(amount, fromCur, toCur).toFixed(2)} {toCur}</p>
          </Card>
        </>
      )}
    </div>
  );
}
