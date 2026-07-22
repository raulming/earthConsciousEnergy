"use client";

import { useEffect, useMemo, useState } from "react";

type Progress = { date: string; energy: number; note?: string; breakthrough?: string; current?: boolean; added?: boolean };

const milestones: Progress[] = [
  { date: "公元0年—2000年", energy: 132, note: "蓝星意识能量早期记录" }, { date: "2007年", energy: 194 }, { date: "2017年", energy: 222 }, { date: "2023年", energy: 232 },
  { date: "2024年7月", energy: 243, note: "下半年开始，光玩家为蓝星进程启航" }, { date: "2025年3月", energy: 422 }, { date: "2025年9月", energy: 482 },
  { date: "2025年12月", energy: 546, note: "首个 CB 阶段响应启动" }, { date: "2026年1月7日", energy: 711 }, { date: "2026年1月20日", energy: 730 }, { date: "2026年2月2日", energy: 813 },
  { date: "2026年3月7日", energy: 1000, note: "SX 阶段持续开播", breakthrough: "能级破千" },
  { date: "2026年6月14日", energy: 1131, note: "第 1 次线下行动", breakthrough: "线下行动 I" }, { date: "2026年6月15日", energy: 1136 }, { date: "2026年6月18日", energy: 1142 },
  { date: "2026年6月21日", energy: 1162, note: "第 2 次线下行动", breakthrough: "线下行动 II" }, { date: "2026年6月22日", energy: 1169 },
  { date: "2026年6月26日", energy: 1179, note: "全员集合，光之联机响应", breakthrough: "全员集结" },
  { date: "2026年7月1日", energy: 1182, note: "能量超过 100 的游戏玩家接近 20 名" }, { date: "2026年7月3日", energy: 1192 },
  { date: "2026年7月9日", energy: 1200, note: "个体能级突破 1200", breakthrough: "突破 1200" },
  { date: "2026年7月13日", energy: 1224, note: "第 3 次线下行动", breakthrough: "线下行动 III" },
  { date: "2026年7月17日", energy: 1230, note: "阶段记录" },
];

function OrbitMark() { return <span className="orbit-mark" aria-hidden="true"><i /><b /></span>; }

export default function Home() {
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [showProgressInput, setShowProgressInput] = useState(false);
  const [progressUpdates, setProgressUpdates] = useState<Progress[]>([]);
  const [progressDate, setProgressDate] = useState("今日");
  const [progressEnergy, setProgressEnergy] = useState("");
  const [progressNote, setProgressNote] = useState("");
  const [progressBreakthrough, setProgressBreakthrough] = useState(false);

  useEffect(() => { try { localStorage.removeItem("blue-planet-incremental-intel"); const savedProgress = localStorage.getItem("blue-planet-progress-updates"); if (savedProgress) setProgressUpdates(JSON.parse(savedProgress)); } catch {} }, []);

  const allProgress = useMemo(() => {
    const combined = [...milestones, ...progressUpdates];
    const peakEnergy = Math.max(...combined.map((item) => item.energy));
    return combined.map((item, index) => ({
      ...item,
      current: index === combined.length - 1,
      currentPeak: index === combined.length - 1 && item.energy === peakEnergy,
    }));
  }, [progressUpdates]);
  const latestProgress = allProgress[allProgress.length - 1];
  const timeline = showAllTimeline ? allProgress : allProgress.slice(-9);
  const addProgress = () => { const energy = Number(progressEnergy); if (!progressDate.trim() || !Number.isFinite(energy)) return; const fresh: Progress = { date: progressDate.trim(), energy, note: progressNote.trim() || "新增意识能量记录", breakthrough: progressBreakthrough ? "重大突破" : undefined, added: true }; setProgressUpdates((current) => { const next = [...current, fresh]; localStorage.setItem("blue-planet-progress-updates", JSON.stringify(next)); return next; }); setProgressEnergy(""); setProgressNote(""); setProgressBreakthrough(false); setShowProgressInput(false); setShowAllTimeline(false); };

  return <main>
    <header className="topbar"><a className="brand" href="#top"><OrbitMark /><span>蓝星指挥中心</span></a><nav><a href="#milestones">进度星图</a><a href="#principles">核心准则</a></nav><span className="system-status"><i /> 系统在线</span></header>
    <section className="hero" id="top"><div className="stars stars-a" /><div className="stars stars-b" /><div className="planet planet-one" /><div className="planet planet-two" /><div className="hero-copy"><p className="eyebrow">BLUE PLANET · ASCENSION TRACKER / 2026</p><h1>穿越群星<br /><em>共启新纪元</em></h1><p className="intro">记录蓝星意识能量的每一次跃迁。<br />以核心准则为坐标，见证共同前行的星际进程。</p><div className="hero-actions"><a className="primary-btn" href="#milestones">查看进度星图 <span>→</span></a><a className="text-btn" href="#principles">阅读核心准则 ↘</a></div></div><div className="energy-console"><div className="console-orbit"><span /><span /><span /><div className="energy-core"><small>当前意识能量</small><strong>{latestProgress.energy.toLocaleString()}</strong><b>LEVEL · {latestProgress.date}</b></div></div><div className="signal-row"><span><i /> 同频中</span><span>最新更新 <b>{latestProgress.date}</b></span></div></div></section>
    <section className="quick-stats progress-stats"><div><strong>{allProgress.length}</strong><span>重要里程碑</span></div><div><strong>{progressUpdates.length}</strong><span>新增进度记录</span></div><div><strong>{latestProgress.energy.toLocaleString()}</strong><span>最新能量</span></div></section>
    <section className="section milestones" id="milestones"><div className="section-heading"><div><p className="eyebrow">MILESTONE TRACKER</p><h2>蓝星意识能量·进度星图</h2><p>关键跃迁已使用重大里程碑标记，新记录会作为最后一个坐标加入。</p></div><div className="milestone-actions"><button className="add-btn" onClick={() => setShowProgressInput(!showProgressInput)}><span>+</span> 记录最新进度</button><button className="outline-btn" onClick={() => setShowAllTimeline(!showAllTimeline)}>{showAllTimeline ? "收起早期记录" : "展开全部记录"} <span>{showAllTimeline ? "↑" : "↓"}</span></button></div></div>{showProgressInput && <div className="progress-dock"><div className="input-dock-head"><div><p className="eyebrow">PROGRESS UPDATE</p><h3>添加最新意识能量记录</h3><p>保存后会更新顶部的当前能量数字，并添加到进度星图末端。</p></div><button className="close-input" onClick={() => setShowProgressInput(false)} aria-label="关闭进度录入">×</button></div><div className="progress-form"><label>日期<input value={progressDate} onChange={(event) => setProgressDate(event.target.value)} placeholder="例如2026年7月20日" /></label><label>意识能量<input value={progressEnergy} inputMode="numeric" onChange={(event) => setProgressEnergy(event.target.value)} placeholder="例如1245" /></label><label className="progress-note">记录说明<input value={progressNote} onChange={(event) => setProgressNote(event.target.value)} placeholder="例如第四次线下行动" /></label><label className="breakthrough-check"><input checked={progressBreakthrough} onChange={(event) => setProgressBreakthrough(event.target.checked)} type="checkbox" /> 作为重大突破标记</label><button className="primary-btn" disabled={!progressDate.trim() || !progressEnergy.trim()} onClick={addProgress}>保存进度 <span>→</span></button></div></div>}<div className="timeline-wrap" aria-live="polite"><div className="timeline-line" />{timeline.map((item) => <article className={`milestone ${item.current ? "current" : ""} ${item.breakthrough ? "breakthrough" : ""}`} key={`${item.date}-${item.energy}`}><div className="timeline-dot"><i /></div><time>{item.date}</time><strong>{item.energy.toLocaleString()}</strong><p>{item.note || "意识能量持续稳定提升"}</p><div className="milestone-tags">{item.current && <span className="latest">最新记录</span>}{item.currentPeak && <span className="peak-tag">当前峰值</span>}{item.breakthrough && <span className="breakthrough-tag"><b>✦</b>{item.breakthrough}</span>}</div></article>)}</div></section>
    <section className="principles" id="principles"><div className="principles-inner"><div><p className="eyebrow">CORE PROTOCOL</p><h2>星际游戏意识引领的<br />五个核心准则</h2><p>以信仰、真理、价值、扬升与标准为坐标，引导个人与整体向更美好的方向前行。</p></div><div className="protocols"><span>01 <b>世界大同，万物共荣的信仰。</b></span><span>02 <b>一标准终极真理的评判标准。</b></span><span>03 <b>公平正义，美好和谐的人生价值追求。</b></span><span>04 <b>个人扬升对蓝星升维的重要性。</b></span><span>05 <b>分别心与二元对立四项标准的运用。</b></span></div></div></section>
    <footer><a className="brand" href="#top"><OrbitMark /><span>蓝星指挥中心</span></a><p>蓝星意识能量·星际进程记录</p><a href="#top">返回舰桥 ↑</a></footer>
  </main>;
}
