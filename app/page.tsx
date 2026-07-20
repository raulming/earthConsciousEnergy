"use client";

import { useMemo, useState } from "react";

type Category = "全部" | "任务行动" | "奖惩规则" | "警告提醒" | "学习协作" | "心性成长" | "激励寄语";

const categories: { name: Category; glyph: string }[] = [
  { name: "全部", glyph: "⊙" },
  { name: "任务行动", glyph: "◈" },
  { name: "奖惩规则", glyph: "⚖" },
  { name: "警告提醒", glyph: "!" },
  { name: "学习协作", glyph: "∴" },
  { name: "心性成长", glyph: "◇" },
  { name: "激励寄语", glyph: "✦" },
];

const milestones = [
  { date: "公元0年—2000年", energy: 132, note: "蓝星意识能量早期记录" },
  { date: "2007年", energy: 194 }, { date: "2017年", energy: 222 },
  { date: "2023年", energy: 232 },
  { date: "2024年7月", energy: 243, note: "下半年开始，光玩家为蓝星进程启航" },
  { date: "2025年3月", energy: 422 }, { date: "2025年9月", energy: 482 },
  { date: "2025年12月", energy: 546, note: "首个 CB 阶段响应启动" },
  { date: "2026年1月7日", energy: 711 }, { date: "2026年1月20日", energy: 730 },
  { date: "2026年2月2日", energy: 813 },
  { date: "2026年3月7日", energy: 1000, note: "SX 阶段持续开播" },
  { date: "2026年6月14日", energy: 1131, note: "第 1 次线下行动" },
  { date: "2026年6月15日", energy: 1136 }, { date: "2026年6月18日", energy: 1142 },
  { date: "2026年6月21日", energy: 1162, note: "第 2 次线下行动" },
  { date: "2026年6月22日", energy: 1169 },
  { date: "2026年6月26日", energy: 1179, note: "全员集合，光之联机响应" },
  { date: "2026年7月1日", energy: 1182, note: "能量超过 100 的游戏玩家接近 20 名" },
  { date: "2026年7月3日", energy: 1192 }, { date: "2026年7月9日", energy: 1200 },
  { date: "2026年7月13日", energy: 1224, note: "第 3 次线下行动" },
  { date: "2026年7月17日", energy: 1230, note: "最新记录", current: true },
];

const intel = [
  { id: 1, category: "任务行动", date: "7月19日 11:28", source: "阿二", title: "海下任务·全员协作", summary: "23:12 全员出动，为正向光明任务提供后备力量。", details: "觉醒期全体以上参与，保持专注与团队配合。", priority: "紧急" },
  { id: 2, category: "任务行动", date: "7月18日 21:54", source: "阿二·已确认", title: "星际航行见面会", summary: "指标合格者可向上申请，高处见面会将在线上、线下同步推进。", details: "近期可多做日常专注练习，推动线下人员及蓝星进度。" },
  { id: 3, category: "任务行动", date: "7月16日", source: "阿二", title: "线下课程与心性稳定任务", summary: "分批开展心性稳定工作，超播、大播优先；心性不稳者不参与线下引导。", details: "稳定后再扩大新成员招募，任务节奏不受影响。" },
  { id: 4, category: "任务行动", date: "近期", source: "R2", title: "每日一分钟学习打卡", summary: "每日用一分钟理解星舰游戏方针，在群内完成打卡。", details: "打卡时间：22:00 至次日 03:00；完成后尽早休息。" },
  { id: 5, category: "任务行动", date: "当前阶段", source: "阿二", title: "主播各司其位", summary: "超播、大播做好引领，各主播相互学习，严格以‘一标准’服务整体。", details: "杜绝单打独斗，在各自岗位发挥独特价值。" },
  { id: 6, category: "奖惩规则", date: "6月6日", source: "光天阿二", title: "红线处罚时间确定", summary: "对明知故犯、踏红线者从严处理，所有主播需在直播间讲解。", details: "考试轮次即将结束，下一轮以灵性与心性为主。", priority: "重要" },
  { id: 7, category: "奖惩规则", date: "现阶段", source: "游戏信息", title: "缘分之力使用边界", summary: "为三维私求使用建议控制在 5% 以内；5%—30% 将掉级，超过 30% 将掉信号。", details: "原文特别提醒：当前仍有约 30% 人员存在越界使用情况。", priority: "红线" },
  { id: 8, category: "奖惩规则", date: "6月22日", source: "大紫9", title: "重复犯错与除名规则", summary: "犯错要引以为戒；重复犯错从严处理，明知故犯者可予除名。", details: "有则改之，无则加勉；珍惜机遇，不忘初心。" },
  { id: 9, category: "奖惩规则", date: "近期", source: "游戏信息", title: "红线问题辨别原则", summary: "贪、抢、占是主要风险点；每日静坐反省，并用‘一标准’辨别。", details: "意识能量 500 以上者，需特别区分有意识与无意识的贪抢占行为。" },
  { id: 10, category: "警告提醒", date: "例行检查", source: "天上阿二", title: "懈怠预警", summary: "检查发现多人懈怠，需立即反省；若持续懈怠，反省直播间将被收回。", details: "新增反省直播间是为了学习，不能作为退步的理由。", priority: "重要" },
  { id: 11, category: "警告提醒", date: "8月2日前", source: "R2", title: "能量冲击提醒", summary: "8月2日能量冲击可能带来不同体感，需坚定内心、稳住心性、戒骄戒躁。", details: "保持稳定频率，理性观察个人状态。" },
  { id: 12, category: "警告提醒", date: "日常", source: "能量保护", title: "做好自身能量保护", summary: "发现异常能量交集时，及时停止联络、清理记录并阻断链接。", details: "将保护与清理形成日常习惯。" },
  { id: 13, category: "警告提醒", date: "近期", source: "阿二", title: "考验无处不在", summary: "心性考验持续加大，需要时刻自我觉察，不再依赖外部提醒。", details: "部分辅助功能将收回；不攀比、不着急，心性稳定是重要标准。" },
  { id: 14, category: "学习协作", date: "6月22日", source: "大紫9", title: "交流学习·能量互通", summary: "取他人之长，补自己之短；分享经验与心得，亦师亦友。", details: "各抒己见，万众一心，让能量与大爱流动起来。" },
  { id: 15, category: "学习协作", date: "日常", source: "R1", title: "每日下念与招募协作", summary: "以‘5个更加’原则完成每日下念，让更多家人加入共同进程。", details: "每日可多次进行，范围可覆盖家人、亲友与力所能及的人群。" },
  { id: 16, category: "心性成长", date: "当下", source: "银二", title: "稳好心性，迎接八月能量波", summary: "当下进度有条不紊，继续保持稳定频率，做到知行合一、念行合一。", details: "将蓝星意识能量稳定向更高阶段推进。" },
  { id: 17, category: "心性成长", date: "近期", source: "阿二", title: "放下技能追逐，回归心性", summary: "上阶段的灵性考验，核心仍是心性；不应追求技能、缘分或能量。", details: "稳定内心、传播大爱、深化反思，做好当下。" },
  { id: 18, category: "心性成长", date: "近期", source: "阿三", title: "共心同一，方能行稳致远", summary: "放下固有成见与执念，愿意倾听、接纳不同声音，才能归于共同本源。", details: "内外同心，思想与内核合一，才能走得安稳长远。" },
  { id: 19, category: "心性成长", date: "问题发生后", source: "阿二", title: "承认、反省、自查自纠", summary: "出现问题后立即承认错误，找到原因并改正，不应蓄意破坏。", details: "周围家人应给予反思、自查和回归的时间。" },
  { id: 20, category: "激励寄语", date: "6月22日", source: "大紫9", title: "你们是未来闪亮的星", summary: "家人齐聚，共商未来；蓝星需要每个人的奉献，一切既定，加速成长。", details: "星星之火可以燎原，坚定之心生生不息。" },
  { id: 21, category: "激励寄语", date: "6月14日", source: "梦境信息", title: "每一份努力都被看见", summary: "勇往直前，不断精进，带动蓝星频率提升；每个人都是光，都是爱。", details: "愿此次信阳之行带来成长与经历，把大爱传递出去。" },
  { id: 22, category: "激励寄语", date: "近期", source: "阿二", title: "赤子之心，可为楷模", summary: "纯静至臻，满怀大爱；孜孜而行，心怀宇宙，足下踏尘。", details: "倾听声音，传递大爱，踏实冷静，可为楷模。" },
  { id: 23, category: "激励寄语", date: "长期", source: "星曦", title: "紧跟脚步，不要掉队", summary: "老人带领新人，新人紧跟脚步；每个人的推动节奏不同，坚定信念是快速提升的关键。", details: "不着急、不松懈、不浪费时间，用纯净的爱唤醒更多伙伴。" },
];

function OrbitMark() {
  return <span className="orbit-mark" aria-hidden="true"><i /><b /></span>;
}

export default function Home() {
  const [active, setActive] = useState<Category>("全部");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<number | null>(1);
  const [showAllTimeline, setShowAllTimeline] = useState(false);

  const filtered = useMemo(() => intel.filter((item) => {
    const categoryMatch = active === "全部" || item.category === active;
    const haystack = `${item.title}${item.summary}${item.details}${item.source}${item.date}`.toLowerCase();
    return categoryMatch && haystack.includes(query.trim().toLowerCase());
  }), [active, query]);

  const timeline = showAllTimeline ? milestones : milestones.slice(-8);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="蓝星指挥中心首页"><OrbitMark /><span>蓝星指挥中心</span></a>
        <nav aria-label="主导航">
          <a href="#milestones">进度星图</a><a href="#intel">情报中心</a><a href="#principles">核心准则</a>
        </nav>
        <span className="system-status"><i /> 系统在线</span>
      </header>

      <section className="hero" id="top">
        <div className="stars stars-a" /><div className="stars stars-b" />
        <div className="planet planet-one" /><div className="planet planet-two" />
        <div className="hero-copy">
          <p className="eyebrow">BLUE PLANET · MISSION ARCHIVE / 2026</p>
          <h1>穿越群星<br /><em>共启新纪元</em></h1>
          <p className="intro">集结所有游戏信息、任务指令与意识能量记录。<br />在这里，每一次醒来、每一份奉献，都会化作点亮蓝星的光。</p>
          <div className="hero-actions"><a className="primary-btn" href="#intel">进入情报中心 <span>→</span></a><a className="text-btn" href="#milestones">查看进度星图 ↘</a></div>
        </div>
        <div className="energy-console" aria-label="当前意识能量">
          <div className="console-orbit"><span /><span /><span /><div className="energy-core"><small>当前意识能量</small><strong>1,230</strong><b>LEVEL · 07.17</b></div></div>
          <div className="signal-row"><span><i /> 同频中</span><span>历史增长 <b>+832%</b></span></div>
        </div>
      </section>

      <section className="quick-stats" aria-label="数据概览">
        <div><strong>23</strong><span>重要里程碑</span></div><div><strong>6</strong><span>信息分类</span></div><div><strong>23</strong><span>归档情报</span></div><div><strong>3</strong><span>线下行动</span></div>
      </section>

      <section className="section milestones" id="milestones">
        <div className="section-heading"><div><p className="eyebrow">MILESTONE TRACKER</p><h2>蓝星意识能量·进度星图</h2><p>从 132 到 1,230，每一个坐标都是共同前行的证明。</p></div><button className="outline-btn" onClick={() => setShowAllTimeline(!showAllTimeline)}>{showAllTimeline ? "收起早期记录" : "展开全部记录"} <span>{showAllTimeline ? "↑" : "↓"}</span></button></div>
        <div className="timeline-wrap">
          <div className="timeline-line" />
          {timeline.map((item) => <article className={`milestone ${item.current ? "current" : ""}`} key={`${item.date}-${item.energy}`}>
            <div className="timeline-dot"><i /></div>
            <time>{item.date}</time><strong>{item.energy.toLocaleString()}</strong>
            <p>{item.note || "意识能量持续稳定提升"}</p>
            {item.current && <span className="latest">当前坐标</span>}
          </article>)}
        </div>
      </section>

      <section className="section intel" id="intel">
        <div className="section-heading intel-heading"><div><p className="eyebrow">INTELLIGENCE HUB</p><h2>游戏情报中心</h2><p>任务、规则、提醒与寄语，已按行动场景归档。</p></div>
          <label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索任务、日期或来源…" aria-label="搜索情报" />{query && <button onClick={() => setQuery("")} aria-label="清空搜索">×</button>}</label>
        </div>
        <div className="filters" role="list" aria-label="情报分类">
          {categories.map((category) => <button key={category.name} className={active === category.name ? "active" : ""} onClick={() => setActive(category.name)}><span>{category.glyph}</span>{category.name}<b>{category.name === "全部" ? intel.length : intel.filter(i => i.category === category.name).length}</b></button>)}
        </div>
        <div className="result-meta"><span>已定位 <b>{filtered.length}</b> 条情报</span><span>数据截止 2026.07.19</span></div>
        <div className="intel-grid">
          {filtered.map((item) => <article className={`intel-card tone-${categories.findIndex(c => c.name === item.category)}`} key={item.id}>
            <div className="card-top"><span className="category-tag">{categories.find(c => c.name === item.category)?.glyph} {item.category}</span>{item.priority && <span className="priority">{item.priority}</span>}</div>
            <p className="meta"><time>{item.date}</time><span>·</span><span>{item.source}</span></p>
            <h3>{item.title}</h3><p className="summary">{item.summary}</p>
            <div className={`details ${expanded === item.id ? "open" : ""}`}><p>{item.details}</p></div>
            <button className="expand" onClick={() => setExpanded(expanded === item.id ? null : item.id)} aria-expanded={expanded === item.id}>{expanded === item.id ? "收起详情" : "查看详情"}<span>{expanded === item.id ? "↑" : "→"}</span></button>
          </article>)}
          {!filtered.length && <div className="empty"><OrbitMark /><h3>未检索到相关情报</h3><p>请尝试其他关键词或切换分类。</p></div>}
        </div>
      </section>

      <section className="principles" id="principles">
        <div className="principles-inner"><div><p className="eyebrow">CORE PROTOCOL</p><h2>共心同一，方能行稳致远。</h2><p>放下固有成见，倾听不同声音；心性稳定、知行合一，将大爱传递到每一处坐标。</p></div><div className="protocols"><span>01 <b>不攀比</b></span><span>02 <b>不懈怠</b></span><span>03 <b>自我觉察</b></span><span>04 <b>服务整体</b></span></div></div>
      </section>

      <footer><a className="brand" href="#top"><OrbitMark /><span>蓝星指挥中心</span></a><p>游戏信息归档·星际进程记录</p><a href="#top">返回舰桥 ↑</a></footer>
    </main>
  );
}
