"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Progress = {
  id?: string;
  date: string;
  energy: number;
  note?: string;
  breakthrough?: string;
  current?: boolean;
  currentPeak?: boolean;
  added?: boolean;
};

type AdminStatus = "loading" | "unconfigured" | "guest" | "admin";

const milestones: Progress[] = [
  { date: "公元0年-2000年", energy: 132, note: "蓝星意识能量早期记录" },
  { date: "2007年", energy: 194 },
  { date: "2017年", energy: 222 },
  { date: "2023年", energy: 232 },
  { date: "2024年7月", energy: 243, note: "下半年开始，光玩家为蓝星进程启航" },
  { date: "2025年3月", energy: 422 },
  { date: "2025年9月", energy: 482 },
  { date: "2025年12月", energy: 546, note: "首个 CB 阶段响应启动" },
  { date: "2026年1月7日", energy: 711 },
  { date: "2026年1月20日", energy: 730 },
  { date: "2026年2月2日", energy: 813 },
  { date: "2026年3月7日", energy: 1000, note: "SX 阶段持续开播", breakthrough: "能级破千" },
  { date: "2026年6月14日", energy: 1131, note: "第 1 次线下行动", breakthrough: "线下行动 I" },
  { date: "2026年6月15日", energy: 1136 },
  { date: "2026年6月18日", energy: 1142 },
  { date: "2026年6月21日", energy: 1162, note: "第 2 次线下行动", breakthrough: "线下行动 II" },
  { date: "2026年6月22日", energy: 1169 },
  { date: "2026年6月26日", energy: 1179, note: "全员集合，光之联机响应", breakthrough: "全员集结" },
  { date: "2026年7月1日", energy: 1182, note: "能量超过 100 的游戏玩家接近 20 名" },
  { date: "2026年7月3日", energy: 1192 },
  { date: "2026年7月9日", energy: 1200, note: "个体能级突破 1200", breakthrough: "突破 1200" },
  { date: "2026年7月13日", energy: 1224, note: "第 3 次线下行动", breakthrough: "线下行动 III" },
  { date: "2026年7月17日", energy: 1230, note: "阶段记录" },
];

function OrbitMark() {
  return <span className="orbit-mark" aria-hidden="true"><i /><b /></span>;
}

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let stars: Array<{ x: number; y: number; radius: number; alpha: number; speed: number; phase: number }> = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.floor(width * scale));
      canvas.height = Math.max(1, Math.floor(height * scale));
      context.setTransform(scale, 0, 0, scale, 0, 0);
      const count = Math.max(76, Math.floor((width * height) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.25 + .25,
        alpha: Math.random() * .68 + .2,
        speed: Math.random() * .012 + .004,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      for (const star of stars) {
        const drift = reduceMotion ? 0 : (time * star.speed) % Math.max(height, 1);
        const y = (star.y + drift) % Math.max(height, 1);
        const twinkle = reduceMotion ? star.alpha : star.alpha * (.72 + Math.sin(time * .0016 + star.phase) * .28);
        context.beginPath();
        context.fillStyle = `rgba(182, 226, 255, ${Math.max(.08, twinkle)})`;
        context.arc(star.x, y, star.radius, 0, Math.PI * 2);
        context.fill();
      }
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw();
    });
    observer.observe(canvas);
    resize();
    draw();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}

async function readError(response: Response, fallback: string) {
  try {
    const payload = await response.json() as { error?: string };
    return payload.error || fallback;
  } catch {
    return fallback;
  }
}

export default function Home() {
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [showProgressInput, setShowProgressInput] = useState(false);
  const [progressUpdates, setProgressUpdates] = useState<Progress[]>([]);
  const [progressDate, setProgressDate] = useState("今日");
  const [progressEnergy, setProgressEnergy] = useState("");
  const [progressNote, setProgressNote] = useState("");
  const [progressBreakthrough, setProgressBreakthrough] = useState(false);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState("");
  const [adminStatus, setAdminStatus] = useState<AdminStatus>("loading");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [authPassword, setAuthPassword] = useState("");
  const [authPasswordAgain, setAuthPasswordAgain] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    localStorage.removeItem("blue-planet-incremental-intel");

    void Promise.all([
      fetch("/api/progress", { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) throw new Error(await readError(response, "进度数据暂时不可用"));
          const payload = await response.json() as { updates?: Progress[] };
          setProgressUpdates(payload.updates ?? []);
        })
        .catch((error: Error) => setProgressError(error.message))
        .finally(() => setProgressLoading(false)),
      fetch("/api/admin/session", { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) throw new Error(await readError(response, "管理员状态暂时不可用"));
          const payload = await response.json() as { configured: boolean; authenticated: boolean };
          setAdminStatus(payload.authenticated ? "admin" : payload.configured ? "guest" : "unconfigured");
        })
        .catch(() => setAdminStatus("guest")),
    ]);
  }, []);

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

  async function setupAdmin(event: FormEvent) {
    event.preventDefault();
    setAuthError("");
    if (authPassword.length < 12) return setAuthError("密码至少需要 12 位");
    if (authPassword !== authPasswordAgain) return setAuthError("两次输入的密码不一致");
    setAuthBusy(true);
    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupCode, password: authPassword }),
      });
      if (!response.ok) throw new Error(await readError(response, "管理员设置失败"));
      setAdminStatus("admin");
      setShowAdminPanel(false);
      setSetupCode("");
      setAuthPassword("");
      setAuthPasswordAgain("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "管理员设置失败");
    } finally {
      setAuthBusy(false);
    }
  }

  async function loginAdmin(event: FormEvent) {
    event.preventDefault();
    setAuthError("");
    setAuthBusy(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: authPassword }),
      });
      if (!response.ok) throw new Error(await readError(response, "登录失败"));
      setAdminStatus("admin");
      setShowAdminPanel(false);
      setAuthPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "登录失败");
    } finally {
      setAuthBusy(false);
    }
  }

  async function logoutAdmin() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAdminStatus("guest");
    setShowProgressInput(false);
    setShowAdminPanel(false);
  }

  async function addProgress(event: FormEvent) {
    event.preventDefault();
    const energy = Number(progressEnergy);
    if (!progressDate.trim() || !Number.isFinite(energy)) return;
    setSavingProgress(true);
    setProgressError("");
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: progressDate.trim(), energy, note: progressNote.trim(), breakthrough: progressBreakthrough }),
      });
      if (response.status === 401) {
        setAdminStatus("guest");
        setShowProgressInput(false);
        setShowAdminPanel(true);
      }
      if (!response.ok) throw new Error(await readError(response, "保存进度失败"));
      const payload = await response.json() as { update: Progress };
      setProgressUpdates((current) => [...current, payload.update]);
      setProgressEnergy("");
      setProgressNote("");
      setProgressBreakthrough(false);
      setShowProgressInput(false);
      setShowAllTimeline(false);
    } catch (error) {
      setProgressError(error instanceof Error ? error.message : "保存进度失败");
    } finally {
      setSavingProgress(false);
    }
  }

  async function deleteProgress(item: Progress) {
    if (!item.id || !window.confirm(`确认删除 ${item.date} 的进度记录吗？`)) return;
    setProgressError("");
    const response = await fetch(`/api/progress/${encodeURIComponent(item.id)}`, { method: "DELETE" });
    if (response.status === 401) {
      setAdminStatus("guest");
      setShowAdminPanel(true);
    }
    if (!response.ok) return setProgressError(await readError(response, "删除进度失败"));
    setProgressUpdates((current) => current.filter((update) => update.id !== item.id));
  }

  const openAdminPanel = () => {
    setAuthError("");
    setShowAdminPanel((current) => !current);
  };

  return <main id="top">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="返回蓝星能量星图首页"><OrbitMark /><span>蓝星能量星图</span></a>
      <nav aria-label="主导航"><a href="#milestones">进度星图</a><a href="#principles">核心准则</a></nav>
      <div className="admin-actions">
        <span className={`access-chip ${adminStatus === "admin" ? "is-admin" : ""}`}>
          <i /> {adminStatus === "admin" ? "管理员在线" : "访客只读"}
        </span>
        {adminStatus !== "loading" && <button type="button" className="admin-button" onClick={adminStatus === "admin" ? logoutAdmin : openAdminPanel}>
          {adminStatus === "admin" ? "退出" : adminStatus === "unconfigured" ? "设置管理员" : "管理员登录"}
        </button>}
      </div>
    </header>

    <section className="hero" aria-labelledby="hero-title">
      <Starfield />
      <div className="space-scene" aria-hidden="true">
        <span className="deep-planet"><i /></span>
        <span className="nebula nebula-one" /><span className="nebula nebula-two" />
        <span className="signal-line signal-one" /><span className="signal-line signal-two" />
      </div>
      <div className="hero-layout">
        <div className="hero-copy">
          <p className="system-name">意识能量进度星图</p>
          <h1 id="hero-title"><span>蓝星能量</span><strong>星图</strong></h1>
          <p className="english-lockup">BLUE PLANET <i /> ENERGY MAP</p>
          <p className="hero-slogan"><strong>穿越群星</strong><em>共启新纪元</em></p>
          <p className="intro">记录蓝星意识能量的每一次跃迁，以核心准则为坐标，见证共同前行。</p>
          <div className="hero-actions"><a className="primary-btn" href="#milestones">查看进度 <span aria-hidden="true">→</span></a><a className="text-btn" href="#principles">核心准则</a></div>
        </div>

        <div className="holo-stage" role="group" aria-label={`当前意识能量 ${latestProgress.energy.toLocaleString()}，最新记录 ${latestProgress.date}`}>
          <div className="scan-beam" aria-hidden="true" />
          <div className="orbit-plane orbit-plane-one" aria-hidden="true"><span className="orbit-runner"><i /></span></div>
          <div className="orbit-plane orbit-plane-two" aria-hidden="true"><span className="orbit-runner"><i /></span></div>
          <div className="orbit-plane orbit-plane-three" aria-hidden="true"><span className="orbit-runner"><i /></span></div>
          <div className="energy-shell" aria-hidden="true"><span /><span /><span /></div>
          <div className="energy-core">
            <span className="core-caption">CURRENT ENERGY</span>
            <strong>{latestProgress.energy.toLocaleString()}</strong>
            <span className="core-date">{latestProgress.date}</span>
          </div>
          <div className="holo-platform" aria-hidden="true"><span /><span /><span /></div>
        </div>
      </div>
    </section>

    <section className="quick-stats" aria-label="进度摘要"><div className="primary-stat"><strong>{latestProgress.energy.toLocaleString()}</strong><span>当前能量</span></div><div><strong>{allProgress.length}</strong><span>进度坐标</span></div><div><strong>{progressUpdates.length}</strong><span>云端新记录</span></div></section>

    <section className="section milestones" id="milestones">
      <div className="section-heading">
        <div><h2>意识能量进度星图</h2><p>重大突破以高亮坐标标记。共享记录由管理员维护，所有访客均可查看。</p></div>
        <div className="milestone-actions">
          {adminStatus === "admin" && <button type="button" className="add-btn" onClick={() => setShowProgressInput(!showProgressInput)}>记录最新进度 <span aria-hidden="true">+</span></button>}
          <button type="button" className="outline-btn" onClick={() => setShowAllTimeline(!showAllTimeline)}>{showAllTimeline ? "收起记录" : "查看全部"} <span aria-hidden="true">{showAllTimeline ? "↑" : "↓"}</span></button>
        </div>
      </div>

      {showAdminPanel && adminStatus !== "admin" && <aside className="admin-panel" aria-live="polite">
        <div className="admin-panel-copy"><span className="panel-label">管理员权限</span><h3>{adminStatus === "unconfigured" ? "首次设置管理员密码" : "管理员登录"}</h3><p>{adminStatus === "unconfigured" ? "使用一次性设置码为默认账号创建密码。设置成功后，该设置码立即失效。" : "登录后可新增和删除共享进度记录。访客始终保持只读。"}</p></div>
        <form className="auth-form" onSubmit={adminStatus === "unconfigured" ? setupAdmin : loginAdmin}>
          <label>管理员账号<input value="admin" readOnly aria-label="管理员账号" /></label>
          {adminStatus === "unconfigured" && <label>一次性设置码<input value={setupCode} onChange={(event) => setSetupCode(event.target.value)} autoComplete="one-time-code" placeholder="输入发布时提供的设置码" /></label>}
          <label>{adminStatus === "unconfigured" ? "设置密码" : "密码"}<input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} autoComplete={adminStatus === "unconfigured" ? "new-password" : "current-password"} placeholder={adminStatus === "unconfigured" ? "至少 12 位" : "输入管理员密码"} /></label>
          {adminStatus === "unconfigured" && <label>确认密码<input type="password" value={authPasswordAgain} onChange={(event) => setAuthPasswordAgain(event.target.value)} autoComplete="new-password" placeholder="再次输入密码" /></label>}
          <div className="auth-submit"><button className="primary-btn" disabled={authBusy}>{authBusy ? "处理中…" : adminStatus === "unconfigured" ? "设置并登录" : "登录"}</button><button type="button" className="text-btn" onClick={() => setShowAdminPanel(false)}>取消</button></div>
          {authError && <p className="auth-error" role="alert">{authError}</p>}
        </form>
      </aside>}

      {showProgressInput && adminStatus === "admin" && <div className="progress-dock">
        <div className="input-dock-head"><div><span className="panel-label">进度维护</span><h3>添加最新意识能量记录</h3><p>保存后将同步到共享星图，并自动更新当前能量与最新记录标识。</p></div><button type="button" className="close-input" onClick={() => setShowProgressInput(false)} aria-label="关闭进度录入">×</button></div>
        <form className="progress-form" onSubmit={addProgress}>
          <label>日期<input value={progressDate} onChange={(event) => setProgressDate(event.target.value)} placeholder="例如2026年7月20日" /></label>
          <label>意识能量<input value={progressEnergy} inputMode="numeric" onChange={(event) => setProgressEnergy(event.target.value)} placeholder="例如1245" /></label>
          <label className="progress-note">记录说明<input value={progressNote} onChange={(event) => setProgressNote(event.target.value)} placeholder="例如第四次线下行动" /></label>
          <label className="breakthrough-check"><input checked={progressBreakthrough} onChange={(event) => setProgressBreakthrough(event.target.checked)} type="checkbox" /> 作为重大突破标记</label>
          <button className="primary-btn" disabled={savingProgress || !progressDate.trim() || !progressEnergy.trim()}>{savingProgress ? "保存中…" : "保存进度"}</button>
        </form>
      </div>}

      {(progressLoading || progressError) && <p className={`progress-state ${progressError ? "is-error" : ""}`} role="status">{progressError || "正在同步共享进度…"}</p>}
      <div className="timeline-wrap" aria-live="polite">
        <div className="timeline-line" />
        {timeline.map((item) => <article className={`milestone ${item.current ? "current" : ""} ${item.breakthrough ? "breakthrough" : ""}`} key={item.id ?? `${item.date}-${item.energy}`}>
          <div className="timeline-dot"><i /></div><time>{item.date}</time><strong>{item.energy.toLocaleString()}</strong><p>{item.note || "意识能量持续稳定提升"}</p>
          <div className="milestone-tags">
            {item.current && <span className="latest">最新记录</span>}
            {item.currentPeak && <span className="peak-tag">当前峰值</span>}
            {item.breakthrough && <span className="breakthrough-tag">重大突破 / {item.breakthrough}</span>}
            {adminStatus === "admin" && item.id && <button type="button" className="delete-progress" onClick={() => deleteProgress(item)} aria-label={`删除 ${item.date} 的进度记录`}>删除</button>}
          </div>
        </article>)}
      </div>
    </section>

    <section className="principles" id="principles"><div className="principles-inner"><div className="principles-copy"><h2>星际游戏意识引领的五个核心准则</h2><p>以信仰、真理、价值、扬升与标准为坐标，引导个人与整体向更美好的方向前行。</p></div><ol className="protocols"><li><span>01</span><b>世界大同，万物共荣的信仰。</b></li><li><span>02</span><b>一标准终极真理的评判标准。</b></li><li><span>03</span><b>公平正义，美好和谐的人生价值追求。</b></li><li><span>04</span><b>个人扬升对蓝星升维的重要性。</b></li><li><span>05</span><b>分别心与二元对立四项标准的运用。</b></li></ol></div></section>
    <footer><a className="brand" href="#top"><OrbitMark /><span>蓝星能量星图</span></a><p>蓝星意识能量进程记录</p><a href="#top">返回顶部 ↑</a></footer>
  </main>;
}
