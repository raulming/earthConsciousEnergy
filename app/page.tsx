"use client";

import { useEffect, useMemo, useState } from "react";

type Category = "全部" | "任务行动" | "奖惩规则" | "警告提醒" | "学习协作" | "心性成长" | "激励寄语";
type Intel = { id: string; category: Exclude<Category, "全部">; date: string; source: string; title: string; raw: string; added?: boolean };

const categories: { name: Category; glyph: string }[] = [
  { name: "全部", glyph: "⊙" }, { name: "任务行动", glyph: "◈" }, { name: "奖惩规则", glyph: "⚖" },
  { name: "警告提醒", glyph: "!" }, { name: "学习协作", glyph: "∴" }, { name: "心性成长", glyph: "◇" }, { name: "激励寄语", glyph: "✦" },
];

const milestones = [
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
  { date: "2026年7月17日", energy: 1230, note: "最新记录", breakthrough: "当前峰值", current: true },
];

// 来源文档按“空行”分隔；每个 § 前后即是一条完整原文信息。
const sourceArchive = String.raw`
游戏信息   先之你我，重中之重。 做好领头，跨越山水。 聆听万灵，汇聚万众。 刻骨铭心  先天之缺，后天弥补。 终成你我，来时模样

§

游戏信息
莫等闲，白了少年头。天下万物，终有始。耐心等待，终会得见。关于万物，波光再现

§

游戏信息：现在我们所有人，有30%的人利用缘份去为自己做一些自己3维的所求，这会被惩罚和掉级。
为自己的谋私，用缘分之力最多5%以内，5%-30%掉级，超过30%一定掉信号。

§

天上接收阿二游戏信息：
信号丢失人员，再给一次机会，机会不多，大家好好把握。
现阶段例行检查，发现人员多有懈怠，要多加反省。
给多出来的反省直播间让大家学习，不是大家退步的理由。
如果再如此懈怠，反省直播间予以收回。

§

其实从上周初我已经开始有感觉了，今天上午天上收到游戏信息 欧6的R2游戏公审已经结束。但是鉴于其并恶行，仅有小私，只收回信号和功能。 看完这个信息之后，马上就感知到这个游戏文章了

§

光天阿二游戏信息：
游戏信息：
1 惩罚时间以定6月6日所以所有主播在直播间都和大家去讲解，现在还有30%的人在踏着红线而行，时间一到，查出者绝不顾惜，严惩不贷
这一轮的考试马上结束了，但是新的考试已在路上，下一轮的考试以   灵性为主   时间下月中旬，大家都跟随着高处的安排，好好提升，这次考试意义不同往常，大家这段时间多多练习，迎接新的考试

§

游戏信息：超时空开播时间延后，9点以后开，非主播，不建议长时间逾留。新人，建议去抖学习。主要内容是给主播充电，及互通有无，互相学习。

§

银二游戏信息——
表达大家对老师诗的感触的回应
正义凛然的进行心底的行程，不畏惧不退缩，加快步伐，你们是时代的骄儿，你们是时空的孩子，你们的存有是这个时代的骄傲，加油孩子们，出发吧孩子们

§

6.22 大紫9接的游戏信息：
1、家人齐聚，共商未来，展望前路，责任重大，望各自努力。蓝星需要你们的奉献，你们是未来闪亮的星！一切既定，加速成长，加油吧！孩子们！
2、犯错之人，引以为戒，重复犯错，严惩不贷，有则改之，无则加勉。凡明知故犯者，除名示之。望各位珍惜机遇，忆起曾经誓言，不忘初心，回到来时站位，超越自我！
3、交流学习，相互成长，取他人之长，补自己之短，学习经验，分享心得，亦师亦友。万众一心，共创辉煌！
4、星星之火，可以燎原，坚定之心，生生不息。心之感悟，诚感天地，吾辈当自强，各抒己见，能量互通，大爱传递，点亮蓝星！
5、思考“爱”：爱 是什么？爱 能做什么？爱 要做什么？生发爱，传递爱，用爱铺路，用爱浇灌，盛开爱的花朵！
💫游戏信息、科幻故事：
新之链接，路之重启
携手并进，势不可挡
路有荆棘，心中有光遍无可畏惧
无需羡慕，自当勉励
心的迁徙，爱的重生
与其远远相望，不如奋起直追
家人们都是好样的，我们一直在，细心观察每一个人，学优点，避缺点
前路漫漫，仍需修行
万物齐聚，不止你我的力量
调配缘分，加强协作
天人合一，指日可待

§

梦境游戏信息，科幻故事，波元2接
成长吧，孩子们，你们做的每一份努力，我们都看在眼里。希望你们勇往直前，不断精进，带动蓝星频率提升。愿这次信阳之行能给你们带来成长与经历。上天不负辜负每一个努力前行的人。时刻谨记你们每一个人都是光都是爱。把你们的大爱散发出去吧

§

博爱乾坤用爱付出6.14M到
银二游戏信息:
我昨晚梦到考试，题目看的很清楚，一共五道题，最后一道题还没来得及写就到时间交卷了。
然后有人梦里说，这次考试是首考，之后总分分等级，如果错过这次升级到外宇宙的机会，就要再等十二万年，因为星体运转到临界点，就是接引的最佳时机，如果错过，纵能量庞大也穿不透宇宙屏障层，所以如果本次离开不了宇宙外，需要在本宇宙再历练十二万年，最后说了句，加油。

§

刚收到rr游戏信息：
尊重游戏发展！
提醒大家，重点提醒波光。

§

R1游戏信息↓
提醒各位家人们，按照老师之前所说每日下念，让更多星际家人们以5个更加的原则出现在我们的大中小城市，乡村，野外。之前的要求每日下念，每日可多次下念
提醒所有的家人们每日下念:
让我的三维的周围的家人，亲人，朋友以及我目所能及，念所能及，力所能及的所有的亲朋好友快速醒来，一起加入我们的大进程，助力蓝星快速实现升维！

§

关于自身能量保护
提醒所有的家人们:如有不好的能量与你产生了聊天对话，通话等等形接交集。如发现能量不对，及时删除通话记录，聊天记录，及时清理自己及周围的能量，阻断链接。做好自己的能量保护工作。
谨记谨记，并形成日常习惯。

§

游戏信息
阿三
共心同一，方能行稳致远。 克服己见，方得共心同一。
整体释义
大家心意本源合一，才能走得安稳、长久长远。
放下自身固有成见执念，才能够做到心意本源合一。
单句释义
共心同一
众人本心相合，归于同一个本源；内外同心，不分你我，思想与内核合一。
己见
自己固有的看法、主观成见、执念与固有认知。
克服己见
放下自己先入为主的主观偏见，不执着自己的想法，愿意倾听、接纳不同声音。

§

银二游戏信息：当下进度有条不紊，大家继续稳好心性，保持稳定频率，迎接八月能量波的到来，知行合一，念行合一，稳定蓝星意识能量往更高提升，大家加油！

§

阿二游戏信息：
1.任务下发，各司其位，做好各自工作，不可懈怠，超播大播做好引领，相互学习，各主播散发光芒，独一无二，各自绽放，你们都是最耀眼的光。
2.各主播严格用“一标准”要求自己，服务于整体，杜绝单打独斗，前车之鉴，切记切记！

§

天上梦到阿二游戏信息
守护和平的天使们，你们是来自遥远时空的天使，再现蓝星，是为了来守护蓝星这片土地，为和平而战，为美好而战，当初的宣言还历历在目，你们的初心还记忆犹新，来不及告别，就踏上了前往蓝星的旅程，在这里，你们历经磨难，终于醒来，新时空当下，你们每个人都是好样的，为了维护和平而战的你们，受了很多委屈，内心也有压抑，可始终带着爱的你们，还是继续向外散发着光芒，用你们的爱去抚平这颗蓝星内心的伤，也疏散自己内心的伤，从不记恨于人，从不怪罪于谁，你们的善良无可比拟，你们的大爱穿透环宇，正在以最伟大的心愿回归，爱你们的家人，在等你们尽快回到家人的身边，爱你们
内心赎罪的人们正在经受着内心的水深火热，而你们的大爱，正是打开这把锁的钥匙，你们用无畏的精神撑起这片星空，你们用你们的大爱唤醒这世间沉睡的人群，从来没有需求回报，这是你们大爱奉献的力量，这力量穿透天际再次回归蓝星，是这世间最有力的力量，继续奉献你们的大爱，等到光明重现的那天
无畏的大爱精神最终引导你们走在最无忧的道路上，这里有爱你们的家人，有你们的兄弟姐妹，这里有你们的亲人，大家共同创造一个新的文明，这是你们奉献的力量，这是你们爱的力量，加油家人们，爱的路上有你们，有你，有我，有家人，共同加油！加油！加油！爱你们！
孩子们，我爱的家人们，此时我们站在你们的上空，望向你们，我最爱的孩子们，你们依旧是来时的模样，我爱的家人们，你们一切都好，我们便可安心，看着你们如今的奉献，我的孩子们，我们心中满是欣慰，我最爱的孩子们，家人等你们回归
异时空的家人也在马不停蹄的赶过来，跟异时空相见，跟大家相见，每一次爱的拥抱，都是爱的相见，爱的重逢
爱你呀，我的孩子们
力量的源泉来自于无恒时空的赐予，新的力量源泉来自无恒时空远古的力量，这股力量的来源加深了大家的连接，让大家更紧密的连接在一起，没有你我，没有我们，只有大家，一体的大家，共同奉献付出的大家
我的孩子们，我的宝贝们，你们是大家力量的源泉，请你们以最真挚最有爱的心去应对未来生活里遇到的一切
最有力的源泉来自心底的力量，大家开发大爱，保留大爱，发扬大爱，用最无畏的大爱之心去应对，去迎接，去宣导我们的大爱，去播种，去发光，用最热烈的心，去张扬，去爱护，去跋涉
心的飞扬，爱的跋涉，为我们铸建了一道道城墙，这是爱的城墙，任他铜墙铁壁也无法穿透，这是爱的力量源泉，任他无限跋涉，也不会枯竭，带着我们的爱出发
爱的飞扬，无限跋涉，历经万难，终将突破这爱的源泉，神性的力量终会显现，带着大家无限跋涉，属于大家自己的路，去呈现，去成为，最有爱的人
行为铸就的力量，力量铸就源泉，为万物存有而存在，生而为人，我们是天地共主，力量的源泉
开发万物存有而存在，开发本自具足的神性而存在，挥发神的力量，怀着敬畏之心，大胆前行，家人的助力，天地的共行，推动我们前行的力量

§

万物一体，神来一笔，共同奔赴，不忘初心
任纪光 梦境游戏：天上梦到阿二游戏信息

§

R2游戏信息
老师好，星舰游戏内容需要大家每天下念一分钟时间去接受理解学习上面的方针决策，上面的学习时间不会影响大家做其他工作任务的。大家放心。
在群内打卡记录，时间在晚上22点至次日凌晨3点都可以，打完卡后尽早休息。打卡下念后，会有专属通道打开，大家自行链接进入。

§

R2游戏信息↓
8.2号即将到来 能量的冲击 会使些许家人有不同的体感 一定要坚定自己的内心 稳住自己的心性 戒骄戒躁 迎接美好的未来

§

阿二游戏信息
1.上阶段对于大家灵性的考验的本身是心性考验为主 大多数人员并没有意识到 追求技能 缘分 能量 是不可取的
2.多次表明内心的稳定 大爱的传播 才是方向的根本 大家加大对自己的反思与认知
3.部分成员主观意识过于强烈 并没有深刻的认识到 根本原因的存在 个人的不足并非他人的指出 需自我反省意识到再共同讨论
4.以往下发的四个不 等一系列根本的要求 熟记于心 真正的做到了解明白 真正的意识到自己所要追求的方向
5.一切的过往剧本无需在意 做好当下才是所要在意追寻的目标
6.对心性的考验加大 伴随每时每刻 考试无处不在 自我觉察 不再提醒
7.部分人员辅助功能收回 做好自己该做 做好自己能做的 无需刻意追求
8.无需攀比 无需着急 做好自己 奉献自己 大爱传播 真情实感 切身体验 坚定跟随
9.心性稳定是决定一切的标准 能者上 优胜劣汰 不要存在侥幸心理 淘汰长久伴随 无需感伤
10.对全员的心性要求考验加大

§

发现有些直播间游戏还在说要修出，没有分别心，这个观点是佛家的，是错误的。
越是要修没有分别心，越会产生分别心，而我们要修的是尽最大努力去包容每一个人，每一件事。但是对于有些人有些事，一次一次一次一次一次10次百次的不行，没办法去改变。是不可能不起分别心的，而且也是没办法一直去包容的。所以像那些罪大恶极，坏到极致的事，是一定要有分别心，并且是不能包容，而且需要去消除的，那么最终的判断标准就是一标准。
所以，修到没有分别心，没有二元对立，无限制无底线的去包容，那是不对的。最终的标准是要用一标准去衡量每一个人每一件事。特别提醒

§

7.13

§

阿二游戏信息
1.线下课程开展，无论能量高低，来的时间长短，心性不稳者杜绝线下引导
2.开展稳定心性工作，分批进行，对超播大播首先开启
3.此任务开展并不会拖慢任务开展节奏。心性稳定尤为重要，也为加大对新人员的招募的稳定性，合理性起到至关重要的作用
4.心性稳定，再加大新的人员的招募，以防备恶性循环
5.对于超播大播犯错 一律从重处罚 严惩不贷 一视同仁 公平公正

§

7月16日阿二游戏信息
1.线下课程开展，无论能量高低，来的时间长短，心性不稳者杜绝线下引导
2.开展稳定心性工作，分批进行，对超播大播首先开启
3.此任务开展并不会拖慢任务开展节奏。心性稳定尤为重要，也为加大对新人员的招募的稳定性，合理性起到至关重要的作用
4.心性稳定，再加大新的人员的招募，以防备恶性循环
5.对于超播大播犯错 一律从重处罚 严惩不贷 一视同仁 公平公正

§

大开接阿二游戏信息
1点50
游戏
表扬
天上5
赤子之心
纯静至臻
满怀大爱
孜孜而行
心怀宇宙
足下踏尘
倾听声音
传递大爱
踏实冷静
可为楷模！

§

游戏
关于红线问题
贪抢占，是大家的主要问题点。对于修至
意识能量在500以上的家人来讲，有意识或无意识的贪抢占是有明显区别的。
①坚持每日静坐，可以发现自己的点在哪里。
②不易发现的点，自己的m或家人们关于你的m也会提醒你。
③辩别原则:一标准。

§

大开接阿二游戏信息（其中一条）
游戏
提醒各位家人:出现问题以后，本人的态度应该是马上承认错误，自我反省。自查自纠。找到原因，改正错误即可。而不是到处蓄意破坏。
对周围的家人来讲，态度应是:允许，给时间反思，自查，然后回来。
各种法规的存在是为了规范我们的行为，个别家人，一定要详细阅读每天群里发送的信息。避免意气用事。酩成大错，连带受罚。

§

大开接阿二游戏信息（其中一条）
游戏
提醒各位家人:出现问题以后，本人的态度应该是马上承认错误，自我反省。自查自纠。找到原因，改正错误即可。而不是到处蓄意破坏。
对周围的家人来讲，态度应是:允许，给时间反思，自查，然后回来。
各种法规的存在是为了规范我们的行为，个别家人，一定要详细阅读每天群里发送的信息。避免意气用事。酩成大错，连带受罚。

§

💫游戏信息、科幻故事：
7.18时间21：54
阿二  已确认

§

星际航行，人员扩大，指标合格者都可以向上申请见家人，高处的见面会在线上线下同时进展，近期可以多多下n，让家人更近距离出现在全村各大中小型城市面前，高处的出现也是灵l展示的一部分，高处会帮助线下人员把蓝星升w的进度再推一推，增加地表人群对链接高处的向往，更加坚定信念去奉献大爱。

§

阿二游戏信息
💫游戏信息、科幻故事：
7.19时间11:28

§

海下任务严峻，23：12分，全员出动，下n协助正向光明的光5完成任务，殊死搏斗，做好后备力量。

§

觉醒期全体以上发念保护玩游戏！

§

星曦接阿二游戏信息
曾经的你们闪耀光芒，来到蓝星，却忘记了曾经的路，我们不忍心看到大家沉沦，我们选择推动，选择帮助，保护，有些孩子却一次又一次沉迷，忘记自己使命，忘记自己曾经的誓言，曾经的意气风发，选择一次又一次沉沦，大家紧跟脚步，团结一致，肩并肩往前走，用大家的爱，用大家纯净的爱，唤醒更多的人，救助更多的伙伴，他们虽然沉沦，但也是我们来时的战友，孩子们，稳住自己，老人带领新人，新人紧跟脚步，不用着急，体验自己的剧本，每个孩子推动的脚步不一样，但坚定的信念是你们快速提升的关键，紧跟着大家的步伐，不要掉队，不要松懈，不要浪费时间，给到大家的推动，也需要大家好好的感悟，加油孩子们，我们一直都在。
`;

function inferCategory(raw: string): Exclude<Category, "全部"> {
  if (/惩罚|掉级|红线|收回|除名|处罚|贪抢占|法规/.test(raw)) return "奖惩规则";
  if (/提醒|保护|懈怠|冲击|不要掉队/.test(raw)) return "警告提醒";
  if (/学习|课程|打卡|互通|交流/.test(raw)) return "学习协作";
  if (/心性|反省|己见|自查|静坐/.test(raw)) return "心性成长";
  if (/任务|全员出动|下念|主播|线下引导/.test(raw)) return "任务行动";
  return "激励寄语";
}

function titleFrom(raw: string) { const line = raw.split("\n").find((part) => part.trim() && !/^(游戏信息|R\d游戏信息|阿二游戏信息)$/.test(part.trim())) || raw; return line.replace(/^💫/, "").slice(0, 28); }
function sourceFrom(raw: string) { const match = raw.match(/(阿二|银二|阿三|大紫9|R1|R2|星曦|大开|梦境|波元)/); return match?.[1] || "游戏信息归档"; }
const baseIntel: Intel[] = sourceArchive.trim().split("\n\n§\n\n").map((raw, index) => ({ id: `archive-${index + 1}`, raw, category: inferCategory(raw), title: titleFrom(raw), source: sourceFrom(raw), date: "原文归档" }));

function OrbitMark() { return <span className="orbit-mark" aria-hidden="true"><i /><b /></span>; }

export default function Home() {
  const [active, setActive] = useState<Category>("全部"); const [query, setQuery] = useState(""); const [expanded, setExpanded] = useState<string | null>(null); const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [showInput, setShowInput] = useState(false); const [entries, setEntries] = useState<Intel[]>([]); const [rawInput, setRawInput] = useState(""); const [inputCategory, setInputCategory] = useState<Exclude<Category, "全部">>("任务行动"); const [inputDate, setInputDate] = useState("今日"); const [inputSource, setInputSource] = useState("新增归档");
  useEffect(() => { try { const saved = localStorage.getItem("blue-planet-incremental-intel"); if (saved) setEntries(JSON.parse(saved)); } catch {} }, []);
  const allIntel = useMemo(() => [...entries, ...baseIntel], [entries]);
  const filtered = useMemo(() => allIntel.filter((item) => (active === "全部" || item.category === active) && `${item.title}${item.raw}${item.source}${item.date}`.toLowerCase().includes(query.trim().toLowerCase())), [active, allIntel, query]);
  const timeline = showAllTimeline ? milestones : milestones.slice(-9);
  const addEntries = () => { const chunks = rawInput.trim().split(/\n\s*\n+/).map((item) => item.trim()).filter(Boolean); if (!chunks.length) return; const fresh = chunks.map((raw, index): Intel => ({ id: `local-${Date.now()}-${index}`, raw, category: inputCategory, title: titleFrom(raw), date: inputDate || "新增归档", source: inputSource || "新增归档", added: true })); const next = [...fresh, ...entries]; setEntries(next); localStorage.setItem("blue-planet-incremental-intel", JSON.stringify(next)); setRawInput(""); setShowInput(false); setExpanded(fresh[0].id); };
  const count = (name: Category) => name === "全部" ? allIntel.length : allIntel.filter((item) => item.category === name).length;
  return <main>
    <header className="topbar"><a className="brand" href="#top"><OrbitMark /><span>蓝星指挥中心</span></a><nav><a href="#milestones">进度星图</a><a href="#intel">情报中心</a><a href="#principles">核心准则</a></nav><span className="system-status"><i /> 系统在线</span></header>
    <section className="hero" id="top"><div className="stars stars-a" /><div className="stars stars-b" /><div className="planet planet-one" /><div className="planet planet-two" /><div className="hero-copy"><p className="eyebrow">BLUE PLANET · MISSION ARCHIVE / 2026</p><h1>穿越群星<br /><em>共启新纪元</em></h1><p className="intro">集结游戏信息、任务指令与意识能量记录。<br />每一份原文信息都按独立段落保存。</p><div className="hero-actions"><a className="primary-btn" href="#intel">进入情报中心 <span>→</span></a><a className="text-btn" href="#milestones">查看进度星图 ↘</a></div></div><div className="energy-console"><div className="console-orbit"><span /><span /><span /><div className="energy-core"><small>当前意识能量</small><strong>1,230</strong><b>LEVEL · 07.17</b></div></div><div className="signal-row"><span><i /> 同频中</span><span>历史增长 <b>+832%</b></span></div></div></section>
    <section className="quick-stats"><div><strong>23</strong><span>重要里程碑</span></div><div><strong>6</strong><span>信息分类</span></div><div><strong>{allIntel.length}</strong><span>原文段落</span></div><div><strong>3</strong><span>线下行动</span></div></section>
    <section className="section milestones" id="milestones"><div className="section-heading"><div><p className="eyebrow">MILESTONE TRACKER</p><h2>蓝星意识能量·进度星图</h2><p>关键跃迁已使用重大里程碑标记。</p></div><button className="outline-btn" onClick={() => setShowAllTimeline(!showAllTimeline)}>{showAllTimeline ? "收起早期记录" : "展开全部记录"} <span>{showAllTimeline ? "↑" : "↓"}</span></button></div><div className="timeline-wrap"><div className="timeline-line" />{timeline.map((item) => <article className={`milestone ${item.current ? "current" : ""} ${item.breakthrough ? "breakthrough" : ""}`} key={`${item.date}-${item.energy}`}><div className="timeline-dot"><i /></div><time>{item.date}</time><strong>{item.energy.toLocaleString()}</strong><p>{item.note || "意识能量持续稳定提升"}</p>{item.breakthrough && <span className="breakthrough-tag"><b>✦</b>{item.breakthrough}</span>}</article>)}</div></section>
    <section className="section intel" id="intel"><div className="section-heading intel-heading"><div><p className="eyebrow">INTELLIGENCE HUB</p><h2>游戏情报中心</h2><p>原文按空行分段，点击查看即可阅读完整内容。</p></div><div className="intel-actions"><button className="add-btn" onClick={() => setShowInput(!showInput)}><span>+</span> 归档新信息</button><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索原文、日期或来源…" />{query && <button onClick={() => setQuery("")} aria-label="清空搜索">×</button>}</label></div></div>
      {showInput && <div className="input-dock"><div className="input-dock-head"><div><p className="eyebrow">INCREMENTAL ARCHIVE</p><h3>粘贴原文并增量归档</h3><p>每个空行代表一条独立信息，保存后会自动拆分成多张原文卡片。</p></div><button className="close-input" onClick={() => setShowInput(false)} aria-label="关闭归档输入">×</button></div><div className="input-meta"><label>归档日期<input value={inputDate} onChange={(event) => setInputDate(event.target.value)} /></label><label>信息来源<input value={inputSource} onChange={(event) => setInputSource(event.target.value)} /></label><label>分类<select value={inputCategory} onChange={(event) => setInputCategory(event.target.value as Exclude<Category, "全部">)}>{categories.slice(1).map((category) => <option key={category.name}>{category.name}</option>)}</select></label></div><textarea value={rawInput} onChange={(event) => setRawInput(event.target.value)} placeholder={"粘贴原文…\n\n空行后的下一段会被视为新的独立信息。"} /><div className="input-footer"><span>已识别 <b>{rawInput.trim() ? rawInput.trim().split(/\n\s*\n+/).filter(Boolean).length : 0}</b> 条待归档信息</span><button className="primary-btn" disabled={!rawInput.trim()} onClick={addEntries}>保存到本设备 <span>→</span></button></div></div>}
      <div className="filters">{categories.map((category) => <button key={category.name} className={active === category.name ? "active" : ""} onClick={() => setActive(category.name)}><span>{category.glyph}</span>{category.name}<b>{count(category.name)}</b></button>)}</div><div className="result-meta"><span>已定位 <b>{filtered.length}</b> 条原文情报</span><span>新增内容保存在当前设备</span></div>
      <div className="intel-grid">{filtered.map((item) => <article className={`intel-card tone-${categories.findIndex((category) => category.name === item.category)} ${expanded === item.id ? "expanded" : ""}`} key={item.id}><div className="card-top"><span className="category-tag">{categories.find((category) => category.name === item.category)?.glyph} {item.category}</span>{item.added && <span className="priority">新增</span>}</div><p className="meta"><time>{item.date}</time><span>·</span><span>{item.source}</span></p><h3>{item.title}</h3><p className="raw-preview">{item.raw.split("\n").find(Boolean)}</p><div className="details"><div className="original-label">原文全文 <span>本段保留 {item.raw.split("\n").length} 行</span></div>{item.raw.split("\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><button className="expand" onClick={() => setExpanded(expanded === item.id ? null : item.id)} aria-expanded={expanded === item.id}>{expanded === item.id ? "收起原文" : "阅读原文全文"}<span>{expanded === item.id ? "↑" : "→"}</span></button></article>)}{!filtered.length && <div className="empty"><OrbitMark /><h3>未检索到相关情报</h3><p>请尝试其他关键词或切换分类。</p></div>}</div>
    </section>
    <section className="principles" id="principles"><div className="principles-inner"><div><p className="eyebrow">CORE PROTOCOL</p><h2>星际游戏意识引领的<br />五个核心准则</h2><p>以信仰、真理、价值、扬升与标准为坐标，引导个人与整体向更美好的方向前行。</p></div><div className="protocols"><span>01 <b>世界大同，万物共荣的信仰。</b></span><span>02 <b>一标准终极真理的评判标准。</b></span><span>03 <b>公平正义，美好和谐的人生价值追求。</b></span><span>04 <b>个人扬升对蓝星升维的重要性。</b></span><span>05 <b>分别心与二元对立四项标准的运用。</b></span></div></div></section>
    <footer><a className="brand" href="#top"><OrbitMark /><span>蓝星指挥中心</span></a><p>游戏信息归档·星际进程记录</p><a href="#top">返回舰桥 ↑</a></footer>
  </main>;
}
