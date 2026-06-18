import { Activity, ReviewItemType, CommentSample } from '@/types/reputation'

export const mockActivities: Activity[] = [
  {
    id: 'act-001',
    title: '第30届大学生电影节红毯',
    type: 'red_carpet',
    date: '2024-06-15',
    summary: '整体造型获得媒体好评，气质状态在线',
    overallScore: 86,
    scoreChange: 4,
    radarData: [
      { name: '外形状态', score: 90, previousScore: 85, changeReason: '红毯礼服选品与妆发搭配获好评，镜头表现稳定' },
      { name: '业务能力', score: 82, previousScore: 80, changeReason: '近期作品角色讨论度持续上升' },
      { name: '互动礼貌', score: 88, previousScore: 86, changeReason: '红毯环节主动与粉丝打招呼，媒体采访回应得体' },
      { name: '争议误读', score: 75, previousScore: 72, changeReason: '部分造型细节被讨论，但未形成负面传播' },
      { name: '路人好感', score: 80, previousScore: 78, changeReason: '多平台路人评价偏向正面，出圈度提升' }
    ],
    keywords: [
      { word: '气质好', count: 2341, sentiment: 'positive', dimension: '外形状态' },
      { word: '礼服好看', count: 1892, sentiment: 'positive', dimension: '外形状态' },
      { word: '状态在线', count: 1567, sentiment: 'positive', dimension: '外形状态' },
      { word: '演技', count: 1423, sentiment: 'neutral', dimension: '业务能力' },
      { word: '有礼貌', count: 986, sentiment: 'positive', dimension: '互动礼貌' },
      { word: '亲民', count: 756, sentiment: 'positive', dimension: '互动礼貌' },
      { word: '新剧期待', count: 1123, sentiment: 'positive', dimension: '业务能力' },
      { word: '发型', count: 634, sentiment: 'neutral', dimension: '外形状态' },
      { word: '采访得体', count: 521, sentiment: 'positive', dimension: '互动礼貌' },
      { word: '资源好', count: 478, sentiment: 'neutral', dimension: '业务能力' }
    ],
    totalComments: 12456
  },
  {
    id: 'act-002',
    title: '《南风知我意》开播直播',
    type: 'live',
    date: '2024-06-10',
    summary: '开播直播互动热烈，角色讨论度高',
    overallScore: 83,
    scoreChange: -2,
    radarData: [
      { name: '外形状态', score: 78, previousScore: 82, changeReason: '直播镜头妆容略显厚重，部分角度引起讨论' },
      { name: '业务能力', score: 88, previousScore: 85, changeReason: '新剧开播首日播放量破纪录，角色认可度高' },
      { name: '互动礼貌', score: 85, previousScore: 87, changeReason: '直播节奏把控良好，与主持人互动自然' },
      { name: '争议误读', score: 70, previousScore: 75, changeReason: '某句话被断章取义，工作室已及时澄清' },
      { name: '路人好感', score: 76, previousScore: 79, changeReason: '剧粉增量明显，但部分争议造成小幅波动' }
    ],
    keywords: [
      { word: '演技在线', count: 3210, sentiment: 'positive', dimension: '业务能力' },
      { word: '剧情上头', count: 2876, sentiment: 'positive', dimension: '业务能力' },
      { word: '直播状态', count: 1543, sentiment: 'neutral', dimension: '外形状态' },
      { word: '角色', count: 2134, sentiment: 'positive', dimension: '业务能力' },
      { word: 'CP感', count: 1876, sentiment: 'positive', dimension: '业务能力' },
      { word: '妆容', count: 987, sentiment: 'neutral', dimension: '外形状态' },
      { word: '宠粉', count: 765, sentiment: 'positive', dimension: '互动礼貌' },
      { word: '热搜', count: 654, sentiment: 'neutral', dimension: '争议误读' },
      { word: '台词', count: 543, sentiment: 'positive', dimension: '业务能力' },
      { word: '原声', count: 432, sentiment: 'positive', dimension: '业务能力' }
    ],
    totalComments: 18765
  },
  {
    id: 'act-003',
    title: '《人物》杂志专访',
    type: 'interview',
    date: '2024-06-05',
    summary: '深度专访内容真诚，口碑反馈正面',
    overallScore: 89,
    scoreChange: 5,
    radarData: [
      { name: '外形状态', score: 85, previousScore: 84, changeReason: '杂志拍摄造型风格多变，时尚感获认可' },
      { name: '业务能力', score: 90, previousScore: 87, changeReason: '专访中展现专业态度和对作品的深度理解' },
      { name: '互动礼貌', score: 92, previousScore: 88, changeReason: '回答真诚有料，展现良好的沟通能力与素养' },
      { name: '争议误读', score: 82, previousScore: 78, changeReason: '内容表达清晰，基本无负面解读空间' },
      { name: '路人好感', score: 85, previousScore: 82, changeReason: '深度内容出圈，收获大量路人好感与转粉' }
    ],
    keywords: [
      { word: '三观正', count: 4521, sentiment: 'positive', dimension: '互动礼貌' },
      { word: '真诚', count: 3876, sentiment: 'positive', dimension: '互动礼貌' },
      { word: '有深度', count: 2934, sentiment: 'positive', dimension: '业务能力' },
      { word: '清醒', count: 2567, sentiment: 'positive', dimension: '互动礼貌' },
      { word: '时尚感', count: 1876, sentiment: 'positive', dimension: '外形状态' },
      { word: '专业', count: 1543, sentiment: 'positive', dimension: '业务能力' },
      { word: '努力', count: 1234, sentiment: 'positive', dimension: '业务能力' },
      { word: '采访', count: 987, sentiment: 'neutral', dimension: '互动礼貌' },
      { word: '高级脸', count: 765, sentiment: 'positive', dimension: '外形状态' },
      { word: '圈粉', count: 654, sentiment: 'positive', dimension: '路人好感' }
    ],
    totalComments: 9876
  },
  {
    id: 'act-004',
    title: '《星途璀璨》第8-10集播出',
    type: 'work_release',
    date: '2024-06-01',
    summary: '剧情高潮迭起，角色弧光完整',
    overallScore: 84,
    scoreChange: 1,
    radarData: [
      { name: '外形状态', score: 80, previousScore: 80, changeReason: '剧中造型与角色契合度高，无额外讨论' },
      { name: '业务能力', score: 87, previousScore: 86, changeReason: '多场重头戏演技获得认可，微表情处理细腻' },
      { name: '互动礼貌', score: 78, previousScore: 78, changeReason: '剧集播出期间正常宣传互动，无特殊事件' },
      { name: '争议误读', score: 72, previousScore: 70, changeReason: '角色人设讨论较多，但未上升至演员本人' },
      { name: '路人好感', score: 79, previousScore: 78, changeReason: '剧集热度稳步上升，观众追剧意愿强' }
    ],
    keywords: [
      { word: '演技炸裂', count: 5678, sentiment: 'positive', dimension: '业务能力' },
      { word: '哭戏', count: 4321, sentiment: 'positive', dimension: '业务能力' },
      { word: '剧情', count: 3987, sentiment: 'neutral', dimension: '业务能力' },
      { word: '角色代入', count: 2876, sentiment: 'positive', dimension: '业务能力' },
      { word: '共情力', count: 2345, sentiment: 'positive', dimension: '业务能力' },
      { word: '女主', count: 1987, sentiment: 'neutral', dimension: '业务能力' },
      { word: '造型好看', count: 1543, sentiment: 'positive', dimension: '外形状态' },
      { word: '上头', count: 1234, sentiment: 'positive', dimension: '业务能力' },
      { word: '人设', count: 987, sentiment: 'neutral', dimension: '争议误读' },
      { word: '配音', count: 654, sentiment: 'neutral', dimension: '业务能力' }
    ],
    totalComments: 25678
  },
  {
    id: 'act-005',
    title: '微博之夜红毯',
    type: 'red_carpet',
    date: '2024-05-25',
    summary: '高定礼服造型出圈，话题度高',
    overallScore: 88,
    scoreChange: 6,
    radarData: [
      { name: '外形状态', score: 93, previousScore: 87, changeReason: '高定礼服造型出圈，多个时尚媒体评为最佳红毯造型' },
      { name: '业务能力', score: 79, previousScore: 80, changeReason: '红毯活动以展示为主，业务能力讨论度较低' },
      { name: '互动礼貌', score: 86, previousScore: 85, changeReason: '与同行互动自然，合影环节举止得体' },
      { name: '争议误读', score: 78, previousScore: 75, changeReason: '造型对比类话题较多，但整体评价偏向正面' },
      { name: '路人好感', score: 82, previousScore: 78, changeReason: '红毯美图出圈，吸引大量路人关注与好评' }
    ],
    keywords: [
      { word: '美', count: 8765, sentiment: 'positive', dimension: '外形状态' },
      { word: '红毯神图', count: 6543, sentiment: 'positive', dimension: '外形状态' },
      { word: '高定', count: 4321, sentiment: 'positive', dimension: '外形状态' },
      { word: '身材', count: 3876, sentiment: 'positive', dimension: '外形状态' },
      { word: '贵气', count: 2934, sentiment: 'positive', dimension: '外形状态' },
      { word: '女明星', count: 2567, sentiment: 'neutral', dimension: '外形状态' },
      { word: '状态好', count: 2345, sentiment: 'positive', dimension: '外形状态' },
      { word: '艳压', count: 1876, sentiment: 'neutral', dimension: '争议误读' },
      { word: '妆容精致', count: 1543, sentiment: 'positive', dimension: '外形状态' },
      { word: '生图', count: 1234, sentiment: 'positive', dimension: '外形状态' }
    ],
    totalComments: 32456
  }
]

export const mockReviewItems: ReviewItemType[] = [
  {
    id: 'review-001',
    category: 'styling',
    title: '红毯发型可增加蓬松感',
    description: '最近两次红毯发型偏贴头皮，建议与造型师沟通增加颅顶蓬松度，上镜效果会更好。参考同类型艺人的红毯造型，高颅顶发型在镜头前更显精神。',
    priority: 'medium',
    status: 'pending',
    relatedActivityId: 'act-001'
  },
  {
    id: 'review-002',
    category: 'interview',
    title: '直播中避免讨论未官宣项目',
    description: '上次直播中被问及下部作品时回答略显犹豫，容易被过度解读。建议统一口径："有好消息会第一时间跟大家分享"，既保持期待感又不会引发猜测。',
    priority: 'high',
    status: 'pending',
    relatedActivityId: 'act-002'
  },
  {
    id: 'review-003',
    category: 'fan_communication',
    title: '粉丝互动频率可适当提升',
    description: '近一个月仅发布2条原创微博，粉丝活跃度有所下降。建议每周至少1-2条日常分享，保持与粉丝的情感连接，但避免过度消耗神秘感。',
    priority: 'medium',
    status: 'pending'
  },
  {
    id: 'review-004',
    category: 'interview',
    title: '深度访谈可提前准备金句',
    description: '《人物》专访整体效果很好，如能提前准备1-2句有记忆点的表达，更利于内容二次传播。建议团队提前梳理采访重点，准备好出圈点。',
    priority: 'low',
    status: 'done',
    relatedActivityId: 'act-003'
  },
  {
    id: 'review-005',
    category: 'styling',
    title: '剧集宣传期造型风格需统一',
    description: '开播直播妆容与剧中形象反差较大，部分观众表示"出戏"。建议剧集宣传期造型尽量贴近角色风格，帮助观众保持角色代入感。',
    priority: 'high',
    status: 'pending',
    relatedActivityId: 'act-002'
  },
  {
    id: 'review-006',
    category: 'other',
    title: '建立舆情快速响应机制',
    description: '上次争议事件响应时间偏晚（约4小时），建议建立2小时内的快速响应机制。提前准备常见争议类型的回应模板，缩短决策链路。',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 'review-007',
    category: 'fan_communication',
    title: '生日活动策划提前启动',
    description: '距离生日还有两个月，建议提前启动生日月粉丝活动策划。可考虑线上直播+公益联动的形式，提升正面形象和粉丝凝聚力。',
    priority: 'medium',
    status: 'done'
  },
  {
    id: 'review-008',
    category: 'interview',
    title: '综艺录制前加强体能储备',
    description: '下月初有户外综艺录制，时长较长强度较大。建议提前两周调整作息，适当增加运动，确保录制时状态在线。',
    priority: 'low',
    status: 'pending'
  }
]

export const mockComments: Record<string, CommentSample[]> = {
  '气质好': [
    { id: 'c1', content: '真的太有气质了，站在那里就是风景线', type: 'fan', source: '微博', likes: 2341, time: '2小时前' },
    { id: 'c2', content: '仪态是真的好，看得出来平时有在练', type: 'passerby', source: '小红书', likes: 876, time: '5小时前' },
    { id: 'c3', content: '该艺人红毯造型一向稳定，气质在同年龄段女星中属于第一梯队', type: 'media', source: '搜狐娱乐', likes: 543, time: '1天前' }
  ],
  '演技': [
    { id: 'c4', content: '演技真的绝了，这段哭戏我跟着哭了', type: 'fan', source: '微博', likes: 5678, time: '3小时前' },
    { id: 'c5', content: '说真的，演技在小花里算能打的，不出戏', type: 'passerby', source: '豆瓣', likes: 2341, time: '8小时前' },
    { id: 'c6', content: '业内评价：该演员对角色的理解和呈现能力在同龄演员中较为突出，具备进一步发展的潜力', type: 'media', source: '影视独舌', likes: 1234, time: '2天前' }
  ],
  '真诚': [
    { id: 'c7', content: '看了专访，真的好真诚一女的，粉了粉了', type: 'fan', source: '微博', likes: 3876, time: '1小时前' },
    { id: 'c8', content: '难得看到这么实在的采访，不打太极，有什么说什么', type: 'passerby', source: '知乎', likes: 1876, time: '6小时前' },
    { id: 'c9', content: '专访内容有深度有态度，展现了青年演员的思考与担当', type: 'media', source: '人物杂志', likes: 2543, time: '3天前' }
  ],
  '礼服好看': [
    { id: 'c10', content: '这套礼服绝了！太适合她了', type: 'fan', source: '微博', likes: 1892, time: '4小时前' },
    { id: 'c11', content: '高定就是不一样，质感真好', type: 'passerby', source: '小红书', likes: 956, time: '10小时前' },
    { id: 'c12', content: '本次红毯最佳造型之一，选款精准，与个人气质高度契合', type: 'media', source: '时尚芭莎', likes: 765, time: '1天前' }
  ],
  '演技在线': [
    { id: 'c13', content: '姐姐演技一直在线，放心追', type: 'fan', source: '微博', likes: 3210, time: '2小时前' },
    { id: 'c14', content: '本来是冲着剧情看的，结果被女主演技圈粉了', type: 'passerby', source: '豆瓣', likes: 1876, time: '12小时前' },
    { id: 'c15', content: '剧集播出后女主角演技收获好评，角色完成度高', type: 'media', source: '骨朵传媒', likes: 1023, time: '2天前' }
  ],
  '三观正': [
    { id: 'c16', content: '三观太正了，真的是优质偶像', type: 'fan', source: '微博', likes: 4521, time: '30分钟前' },
    { id: 'c17', content: '能说出这番话的艺人不多了，很清醒', type: 'passerby', source: '知乎', likes: 2341, time: '3小时前' },
    { id: 'c18', content: '专访展现了艺人成熟的职业观和价值观，为年轻人树立了正面榜样', type: 'media', source: '光明网', likes: 1876, time: '2天前' }
  ]
}

export function getActivityById(id: string): Activity | undefined {
  return mockActivities.find(item => item.id === id)
}

export function getCommentsByKeyword(keyword: string): CommentSample[] {
  return mockComments[keyword] || []
}
