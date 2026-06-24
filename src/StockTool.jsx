import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Clock3,
  LineChart,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Wifi,
} from 'lucide-react';
import './stockTool.css';

const watchlist = [
  { code: '600519', name: '贵州茅台', sector: '白酒消费' },
  { code: '300750', name: '宁德时代', sector: '新能源' },
  { code: '000858', name: '五粮液', sector: '白酒消费' },
  { code: '601318', name: '中国平安', sector: '金融保险' },
  { code: '000001', name: '平安银行', sector: '银行' },
  { code: '002594', name: '比亚迪', sector: '新能源车' },
];

const periods = [
  { key: 'day', label: '日线', klt: '101', limit: 90, description: '交易日K线' },
  { key: 'week', label: '周线', klt: '102', limit: 120, description: '周K线' },
  { key: 'month', label: '月线', klt: '103', limit: 120, description: '月K线' },
  { key: 'five', label: '五日K线', klt: '5', limit: 240, description: '5分钟K线' },
];

function getMarket(code) {
  if (/^(6|5|9)/.test(code)) return '1';
  if (/^(8|4|92)/.test(code)) return '0';
  return '0';
}

function getSecid(code) {
  return `${getMarket(code)}.${code}`;
}

function divide(value, unit = 100) {
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0 || number === -1) return null;
  return number / unit;
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '--';
  return Number(value).toFixed(digits);
}

function formatMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '--';
  if (number >= 100000000) return `${(number / 100000000).toFixed(2)}亿`;
  if (number >= 10000) return `${(number / 10000).toFixed(2)}万`;
  return number.toFixed(0);
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sma(data, period) {
  return data.map((_, index) => {
    if (index + 1 < period) return null;
    return average(data.slice(index + 1 - period, index + 1).map((item) => item.close));
  });
}

function ema(values, period) {
  const k = 2 / (period + 1);
  const result = [];
  values.forEach((value, index) => {
    result.push(index === 0 ? value : value * k + result[index - 1] * (1 - k));
  });
  return result;
}

function rsi(data, period = 14) {
  if (data.length <= period) return 50;
  let gains = 0;
  let losses = 0;
  const slice = data.slice(-period - 1);
  for (let index = 1; index < slice.length; index += 1) {
    const diff = slice[index].close - slice[index - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function macd(data) {
  const closes = data.map((item) => item.close);
  const fast = ema(closes, 12);
  const slow = ema(closes, 26);
  const dif = fast.map((value, index) => value - slow[index]);
  const dea = ema(dif, 9);
  const hist = dif.map((value, index) => value - dea[index]);
  return { dif: dif.at(-1) ?? 0, dea: dea.at(-1) ?? 0, hist: hist.at(-1) ?? 0 };
}

function kdj(data, period = 9) {
  if (data.length < period) return { k: 50, d: 50, j: 50 };
  let k = 50;
  let d = 50;
  data.forEach((item, index) => {
    if (index + 1 < period) return;
    const window = data.slice(index + 1 - period, index + 1);
    const low = Math.min(...window.map((entry) => entry.low));
    const high = Math.max(...window.map((entry) => entry.high));
    const rsv = high === low ? 50 : ((item.close - low) / (high - low)) * 100;
    k = (2 / 3) * k + (1 / 3) * rsv;
    d = (2 / 3) * d + (1 / 3) * k;
  });
  return { k, d, j: 3 * k - 2 * d };
}

function parseKline(payload) {
  const lines = payload?.data?.klines ?? [];
  return lines
    .map((line) => {
      const [date, open, close, high, low, volume, amount] = line.split(',');
      return {
        date: date.slice(5),
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close),
        volume: Number(volume),
        amount: Number(amount),
      };
    })
    .filter((item) => Number.isFinite(item.close));
}

function normalizeQuote(payload) {
  const item = payload?.data;
  if (!item) return null;
  const price = divide(item.f43);
  const previousClose = divide(item.f60);
  const changeValue = divide(item.f169);
  const changePercent = divide(item.f170);
  return {
    code: item.f57,
    name: item.f58,
    price,
    high: divide(item.f44),
    low: divide(item.f45),
    open: divide(item.f46),
    previousClose,
    volume: item.f47,
    amount: item.f48,
    totalMarketValue: item.f116,
    turnoverRate: divide(item.f168),
    changeValue,
    changePercent,
    timestamp: new Date(),
  };
}

async function fetchQuote(code) {
  const fields = 'f43,f44,f45,f46,f47,f48,f57,f58,f60,f116,f168,f169,f170';
  const response = await fetch(`https://push2.eastmoney.com/api/qt/stock/get?secid=${getSecid(code)}&fields=${fields}`);
  if (!response.ok) throw new Error('实时行情请求失败');
  return normalizeQuote(await response.json());
}

async function fetchKline(code, period = periods[0]) {
  const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${getSecid(code)}&klt=${period.klt}&fqt=1&lmt=${period.limit}&end=20500101&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('K线请求失败');
  return parseKline(await response.json());
}

async function fetchStockPool() {
  const url = 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=7000&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23,m:0+t:81+s:2048&fields=f12,f13,f14';
  const response = await fetch(url);
  if (!response.ok) throw new Error('股票池加载失败');
  const payload = await response.json();
  return (payload?.data?.diff ?? [])
    .map((item) => ({
      code: item.f12,
      name: item.f14,
      sector: item.f13 === 1 ? '沪市' : '深/北市',
    }))
    .filter((item) => item.code && item.name);
}

function matchStocks(query, stockPool) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return [];
  const source = stockPool.length ? stockPool : watchlist;
  return source
    .filter((item) => item.code.includes(keyword) || item.name.toLowerCase().includes(keyword))
    .sort((a, b) => {
      const aExact = a.code === keyword || a.name.toLowerCase() === keyword ? 0 : 1;
      const bExact = b.code === keyword || b.name.toLowerCase() === keyword ? 0 : 1;
      const aStarts = a.code.startsWith(keyword) || a.name.toLowerCase().startsWith(keyword) ? 0 : 1;
      const bStarts = b.code.startsWith(keyword) || b.name.toLowerCase().startsWith(keyword) ? 0 : 1;
      return aExact - bExact || aStarts - bStarts || a.code.localeCompare(b.code);
    })
    .slice(0, 8);
}

function buildPath(values, width, height, padding = 18) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1 || 1)) * (width - padding * 2);
      const y = padding + ((max - value) / span) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function StockChart({ data, ma5, ma20 }) {
  const width = 980;
  const height = 360;
  const closes = data.map((item) => item.close);
  const volumes = data.map((item) => item.volume || 0);
  const pricePath = buildPath(closes, width, height);
  const ma5Path = buildPath(ma5.map((item, index) => item ?? closes[index]), width, height);
  const ma20Path = buildPath(ma20.map((item, index) => item ?? closes[index]), width, height);
  const maxVolume = Math.max(...volumes, 1);

  return (
    <div className="stock-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="A股实时走势与均线">
        <defs>
          <linearGradient id="priceFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 61, 45, 0.34)" />
            <stop offset="100%" stopColor="rgba(255, 61, 45, 0)" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => (
          <line key={line} x1="18" x2="962" y1={42 + line * 76} y2={42 + line * 76} />
        ))}
        {data.map((item, index) => {
          const x = 18 + (index / (data.length - 1 || 1)) * 944;
          const barHeight = ((item.volume || 0) / maxVolume) * 62;
          return (
            <rect
              key={`${item.date}-${index}`}
              x={x - 2}
              y={336 - barHeight}
              width="4"
              height={barHeight}
              className={index > 0 && item.close >= data[index - 1].close ? 'up' : 'down'}
            />
          );
        })}
        <path d={`${pricePath} L 962 342 L 18 342 Z`} className="price-fill" />
        <path d={pricePath} className="price-line" />
        <path d={ma5Path} className="ma-line ma-fast" />
        <path d={ma20Path} className="ma-line ma-slow" />
      </svg>
      <div className="chart-legend">
        <span><i className="price-dot" />现价/收盘</span>
        <span><i className="fast-dot" />MA5</span>
        <span><i className="slow-dot" />MA20</span>
        <span><i className="vol-dot" />成交量</span>
      </div>
    </div>
  );
}

function StockTool() {
  const [code, setCode] = useState('600519');
  const [inputCode, setInputCode] = useState('贵州茅台');
  const [stockPool, setStockPool] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [periodKey, setPeriodKey] = useState('day');
  const [quote, setQuote] = useState(null);
  const [kline, setKline] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [note, setNote] = useState('记录：关注分时强弱、量能是否放大、是否靠近关键均线。');

  const suggestions = useMemo(() => matchStocks(inputCode, stockPool), [inputCode, stockPool]);
  const selectedPeriod = useMemo(() => periods.find((item) => item.key === periodKey) ?? periods[0], [periodKey]);

  const loadData = async (targetCode = code, targetPeriod = selectedPeriod) => {
    if (!/^\d{6}$/.test(targetCode)) {
      setError('请输入 6 位 A 股代码，例如 600519 或 300750。');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [nextQuote, nextKline] = await Promise.all([fetchQuote(targetCode), fetchKline(targetCode, targetPeriod)]);
      if (!nextQuote) throw new Error('没有获取到该股票行情');
      setQuote(nextQuote);
      setKline(nextKline);
      setLastUpdated(new Date());
    } catch (nextError) {
      setError(nextError.message || '行情加载失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(code, selectedPeriod);
  }, [code, selectedPeriod]);

  useEffect(() => {
    let active = true;
    fetchStockPool()
      .then((items) => {
        if (active) setStockPool(items);
      })
      .catch(() => {
        if (active) setStockPool(watchlist);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = window.setInterval(() => loadData(code, selectedPeriod), 8000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, code, selectedPeriod]);

  const data = useMemo(() => {
    if (!kline.length) return [];
    const next = [...kline];
    if (quote?.price) {
      const last = next.at(-1);
      next[next.length - 1] = {
        ...last,
        close: quote.price,
        high: quote.high ? Math.max(last.high, quote.high) : last.high,
        low: quote.low ? Math.min(last.low, quote.low) : last.low,
        open: quote.open ?? last.open,
        volume: quote.volume ?? last.volume,
        amount: quote.amount ?? last.amount,
      };
    }
    return next;
  }, [kline, quote]);

  const computed = useMemo(() => {
    if (!data.length) return null;
    const last = data.at(-1);
    const first = data[0];
    const ma5 = sma(data, 5);
    const ma20 = sma(data, 20);
    const latestMa5 = ma5.at(-1) ?? last.close;
    const latestMa20 = ma20.at(-1) ?? last.close;
    const rsiValue = rsi(data);
    const macdValue = macd(data);
    const kdjValue = kdj(data);
    const vol5 = average(data.slice(-5).map((item) => item.volume || 0));
    const vol20 = average(data.slice(-20).map((item) => item.volume || 0));
    const rangeChange = ((last.close - first.close) / first.close) * 100;
    const changePercent =
      quote?.changePercent ??
      (quote?.previousClose ? ((last.close - quote.previousClose) / quote.previousClose) * 100 : 0);

    let score = 50;
    if (last.close > latestMa5) score += 10;
    if (latestMa5 > latestMa20) score += 12;
    if (macdValue.hist > 0) score += 10;
    if (vol5 > vol20 * 1.12) score += 8;
    if (rsiValue > 70) score -= 10;
    if (rsiValue < 35) score -= 6;
    score = Math.max(0, Math.min(100, Math.round(score)));

    const signals = [
      last.close > latestMa5 ? '现价站上 MA5，短线保持偏强观察。' : '现价低于 MA5，短线动能需要等待修复。',
      latestMa5 > latestMa20 ? 'MA5 位于 MA20 上方，趋势结构较顺。' : 'MA5 未能上穿 MA20，趋势仍偏整理。',
      vol5 > vol20 * 1.12 ? '近 5 日量能高于 20 日均量，关注资金活跃度。' : '量能未明显放大，突破有效性需要验证。',
      rsiValue > 70 ? 'RSI 偏高，需留意追高和回落风险。' : rsiValue < 35 ? 'RSI 偏低，可能处于弱势或修复前段。' : 'RSI 位于中性区间，适合结合量价继续观察。',
    ];

    return {
      last,
      ma5,
      ma20,
      latestMa5,
      latestMa20,
      rsiValue,
      macdValue,
      kdjValue,
      vol5,
      vol20,
      rangeChange,
      changePercent,
      score,
      signals,
    };
  }, [data, quote]);

  const submitCode = (event) => {
    event.preventDefault();
    const query = inputCode.trim();
    const nextStock = /^\d{6}$/.test(query) ? { code: query, name: query } : suggestions[0];
    if (nextStock?.code) {
      setInputCode(nextStock.name);
      setCode(nextStock.code);
      setShowSuggestions(false);
    } else {
      setError('没有匹配到股票，请输入股票名称或 6 位 A 股代码。');
    }
  };

  const selectStock = (stock) => {
    setInputCode(stock.name);
    setCode(stock.code);
    setShowSuggestions(false);
  };

  const viewName = quote?.name || watchlist.find((item) => item.code === code)?.name || 'A股标的';
  const isUp = (quote?.changePercent ?? 0) >= 0;

  return (
    <main className="stock-app">
      <header className="stock-hero">
        <div>
          <p className="stock-kicker">A-Share Live Watch / Finance Challenge</p>
          <h1>A股实时盯盘</h1>
          <p>
            面向全国大学生金融挑战赛的短线实时监看工具，支持输入 A 股代码，自动刷新现价、涨跌幅、
            成交额、换手率，并结合 MA、RSI、MACD、KDJ 做复盘辅助。
          </p>
        </div>
        <div className="stock-warning">
          <ShieldCheck size={22} />
          <span>数据来自公开行情接口，可能延迟；仅用于比赛研究，不构成投资建议。</span>
        </div>
      </header>

      <section className="stock-shell">
        <aside className="stock-sidebar">
          <div className="panel-title">
            <Wifi size={20} />
            <span>实时行情</span>
          </div>

          <form className="code-search" onSubmit={submitCode}>
            <Search size={17} />
            <input
              value={inputCode}
              placeholder="输入名称或代码，如 茅台 / 600519"
              onFocus={() => setShowSuggestions(true)}
              onChange={(event) => {
                setInputCode(event.target.value);
                setShowSuggestions(true);
              }}
            />
            <button type="submit">查看</button>
            {showSuggestions && suggestions.length > 0 && (
              <div className="stock-suggestions">
                {suggestions.map((stock) => (
                  <button key={`${stock.code}-${stock.name}`} type="button" onMouseDown={() => selectStock(stock)}>
                    <strong>{stock.name}</strong>
                    <span>{stock.code} / {stock.sector}</span>
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="period-panel">
            <div className="panel-title compact">
              <LineChart size={18} />
              <span>K线周期</span>
            </div>
            <div className="period-list">
              {periods.map((period) => (
                <button
                  className={period.key === periodKey ? 'active' : ''}
                  key={period.key}
                  type="button"
                  onClick={() => setPeriodKey(period.key)}
                >
                  <strong>{period.label}</strong>
                  <span>{period.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="stock-list">
            {watchlist.map((stock) => (
              <button
                className={stock.code === code ? 'active' : ''}
                key={stock.code}
                type="button"
                onClick={() => {
                  setInputCode(stock.name);
                  setCode(stock.code);
                }}
              >
                <strong>{stock.name}</strong>
                <span>{stock.code} / {stock.sector}</span>
              </button>
            ))}
          </div>

          <button className="reset-data" type="button" onClick={() => loadData(code, selectedPeriod)}>
            <RefreshCw size={17} />
            {loading ? '刷新中...' : '手动刷新'}
          </button>
          <button className={`reset-data ${autoRefresh ? 'active-refresh' : ''}`} type="button" onClick={() => setAutoRefresh(!autoRefresh)}>
            <Clock3 size={17} />
            {autoRefresh ? '8秒自动刷新：开' : '自动刷新：关'}
          </button>

          {error && <div className="stock-error">{error}</div>}

          <div className="stock-note-box">
            <Bell size={18} />
            <textarea value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
        </aside>

        <section className="stock-main">
          <div className="stock-summary">
            <div>
              <p className="stock-kicker">LIVE VIEW</p>
              <h2>{viewName} {code}</h2>
              <div className="live-meta">
                <span>{lastUpdated ? `更新时间 ${lastUpdated.toLocaleTimeString('zh-CN', { hour12: false })}` : '正在连接行情源'}</span>
                <span>当前周期：{selectedPeriod.label}</span>
                <span>数据源：东方财富公开行情</span>
              </div>
            </div>
            <div className={isUp ? 'price-card up' : 'price-card down'}>
              <span>实时现价</span>
              <strong>{formatNumber(quote?.price)}</strong>
              <small>{isUp ? '+' : ''}{formatNumber(quote?.changePercent)}%</small>
            </div>
            <div className="score-card">
              <span>短线观察分</span>
              <strong>{computed?.score ?? '--'}</strong>
              <small>量价/趋势/指标综合</small>
            </div>
          </div>

          {computed ? (
            <>
              <StockChart data={data} ma5={computed.ma5} ma20={computed.ma20} />
              <div className="quote-grid">
                <article><span>今开</span><strong>{formatNumber(quote?.open)}</strong></article>
                <article><span>最高</span><strong>{formatNumber(quote?.high)}</strong></article>
                <article><span>最低</span><strong>{formatNumber(quote?.low)}</strong></article>
                <article><span>昨收</span><strong>{formatNumber(quote?.previousClose)}</strong></article>
                <article><span>成交额</span><strong>{formatMoney(quote?.amount)}</strong></article>
                <article><span>换手率</span><strong>{formatNumber(quote?.turnoverRate)}%</strong></article>
              </div>
              <div className="indicator-grid">
                <article>
                  <LineChart size={20} />
                  <span>区间涨跌</span>
                  <strong>{computed.rangeChange >= 0 ? '+' : ''}{computed.rangeChange.toFixed(2)}%</strong>
                </article>
                <article>
                  <TrendingUp size={20} />
                  <span>MA5 / MA20</span>
                  <strong>{computed.latestMa5.toFixed(2)} / {computed.latestMa20.toFixed(2)}</strong>
                </article>
                <article>
                  <Activity size={20} />
                  <span>RSI(14)</span>
                  <strong>{computed.rsiValue.toFixed(1)}</strong>
                </article>
                <article>
                  <BarChart3 size={20} />
                  <span>MACD 柱</span>
                  <strong>{computed.macdValue.hist.toFixed(2)}</strong>
                </article>
              </div>
            </>
          ) : (
            <div className="loading-panel">正在加载实时行情...</div>
          )}
        </section>

        <aside className="signal-panel">
          <div className="panel-title">
            <AlertTriangle size={20} />
            <span>盯盘解读</span>
          </div>
          <div className="signal-score">
            <div style={{ '--score': `${computed?.score ?? 0}%` }} />
            <span>{computed ? (computed.score >= 72 ? '偏强观察' : computed.score >= 52 ? '中性跟踪' : '谨慎观察') : '等待数据'}</span>
          </div>
          <ul>
            {(computed?.signals ?? ['正在连接行情源，稍等几秒。']).map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
          <div className="risk-box">
            <strong>比赛复盘建议</strong>
            <p>
              实时盯盘时记录“入选理由、触发条件、无效条件、盘中变化、收盘复盘”，能让你的比赛报告更像专业投研表达。
            </p>
          </div>
          {computed && (
            <div className="mini-table">
              <span>KDJ K</span><b>{computed.kdjValue.k.toFixed(1)}</b>
              <span>KDJ D</span><b>{computed.kdjValue.d.toFixed(1)}</b>
              <span>5日均量</span><b>{formatMoney(computed.vol5)}</b>
              <span>20日均量</span><b>{formatMoney(computed.vol20)}</b>
              <span>总市值</span><b>{formatMoney(quote?.totalMarketValue)}</b>
              <span>涨跌额</span><b>{formatNumber(quote?.changeValue)}</b>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

export default StockTool;
