// 预设场景库数据

export type SceneCategory = 'daily' | 'conflict';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type PainPoint = 
  | '情感疏离' 
  | '价值观冲突' 
  | '情绪压抑' 
  | '无效沟通' 
  | '不会关心人' 
  | '无法理解对方' 
  | '不会表达情感'
  | '不会主动沟通'
  | '教育理念分歧'
  | '大男子主义'
  | '不会表达爱意';

export interface Scene {
  id: number;
  name: string;
  description: string;
  category: SceneCategory;
  difficulty: Difficulty;
  painPoints: PainPoint[];
}

export const scenes: Scene[] = [
  // 日常交流类场景（15个）
  {
    id: 1,
    name: '老公加班回家',
    description: '老公晚上10点才下班回家，看起来很累，进门就坐在沙发上不说话。你应该如何开场？',
    category: 'daily',
    difficulty: 'beginner',
    painPoints: ['情感疏离', '无效沟通']
  },
  {
    id: 2,
    name: '老公生病了',
    description: '老公感冒发烧，躺在床上不想动，但还有工作要处理。你应该如何关心他？',
    category: 'daily',
    difficulty: 'beginner',
    painPoints: ['不会关心人', '情感疏离']
  },
  {
    id: 3,
    name: '周末的安排',
    description: '周末快到了，你希望一家人出去活动，但老公总是说"累了想在家休息"。你应该如何和他商量？',
    category: 'daily',
    difficulty: 'intermediate',
    painPoints: ['情绪压抑', '无效沟通']
  },
  {
    id: 4,
    name: '老公升职了',
    description: '老公升职了，但他没有第一时间告诉你，你从别人那里听到的。你应该如何和他沟通这件事？',
    category: 'daily',
    difficulty: 'intermediate',
    painPoints: ['情感疏离', '无效沟通']
  },
  {
    id: 5,
    name: '纪念日快到了',
    description: '结婚纪念日快到了，但老公似乎完全没放在心上。你应该如何提醒他，而不是让他觉得被指责？',
    category: 'daily',
    difficulty: 'intermediate',
    painPoints: ['情绪压抑', '不会表达情感']
  },
  {
    id: 6,
    name: '老公心情不好',
    description: '老公下班回家脸色很难看，你问怎么了，他只说"没什么"，然后一直沉默。你应该如何应对？',
    category: 'daily',
    difficulty: 'intermediate',
    painPoints: ['情感疏离', '无法理解对方']
  },
  {
    id: 7,
    name: '孩子想爸爸了',
    description: '孩子说"好想爸爸，想让爸爸陪玩"，但老公最近工作很忙。你应该如何和孩子沟通，又如何和老公提这个需求？',
    category: 'daily',
    difficulty: 'intermediate',
    painPoints: ['不会关心人', '情绪压抑']
  },
  {
    id: 8,
    name: '老公的老同学聚会',
    description: '老公的老同学聚会，他不太想去，但你希望他去社交一下。你应该如何说服他？',
    category: 'daily',
    difficulty: 'intermediate',
    painPoints: ['无效沟通', '价值观冲突']
  },
  {
    id: 9,
    name: '老公要出差了',
    description: '老公明天要去出差一周，现在正在收拾行李。你应该如何和他道别并表达关心？',
    category: 'daily',
    difficulty: 'beginner',
    painPoints: ['不会关心人', '情感疏离']
  },
  {
    id: 10,
    name: '出差期间的联系',
    description: '老公出差第二天，他发消息说"一切正常，勿念"。你知道他其实很忙很累，想关心他但又怕打扰。你应该怎么回复？',
    category: 'daily',
    difficulty: 'intermediate',
    painPoints: ['不会主动沟通', '无效沟通']
  },
  {
    id: 11,
    name: '老公出差回家',
    description: '老公出差一周后回家，看起来很疲惫，进门就问"家里怎么样了"。你应该如何迎接他并表达关心？',
    category: 'daily',
    difficulty: 'beginner',
    painPoints: ['不会关心人', '情感疏离']
  },
  {
    id: 12,
    name: '出差后的抱怨',
    description: '老公出差回来后，一直抱怨客户难搞、旅途辛苦，你关心他他却说"你在家有什么累的"。你应该如何回应？',
    category: 'daily',
    difficulty: 'intermediate',
    painPoints: ['价值观冲突', '情绪压抑']
  },
  {
    id: 13,
    name: '老公在外地工作',
    description: '老公因为工作调动，在外地工作已经三个月了，每两周才回来一次。视频时他说"这边吃不好睡不好"，你想关心他但不知道说什么。',
    category: 'daily',
    difficulty: 'intermediate',
    painPoints: ['不会关心人', '情感疏离']
  },
  {
    id: 14,
    name: '外地生病的老公',
    description: '老公在外地工作生病了，发消息说"发烧了，一个人在医院挂水"。你很担心，打电话过去他又说"没事，别大惊小怪"。你应该如何关心他？',
    category: 'daily',
    difficulty: 'intermediate',
    painPoints: ['不会关心人', '情感疏离']
  },
  {
    id: 15,
    name: '想给老公惊喜',
    description: '老公在外地工作快一个月没回来了，你想带着孩子去看他，给他一个惊喜，但又怕他觉得太突然或打扰工作。你应该怎么做？',
    category: 'daily',
    difficulty: 'intermediate',
    painPoints: ['不会主动沟通', '情绪压抑']
  },

  // 冲突化解类场景（18个）
  {
    id: 16,
    name: '孩子作业辅导分歧',
    description: '孩子数学题不会做，老公骂孩子"这么简单都不会"，你心疼孩子，想阻止老公但又怕冲突。你应该怎么做？',
    category: 'conflict',
    difficulty: 'intermediate',
    painPoints: ['教育理念分歧', '情绪压抑']
  },
  {
    id: 17,
    name: '孩子玩手机',
    description: '孩子放学回家一直玩手机，老公直接没收手机并训斥孩子。你觉得这样太粗暴，但老公坚持"不打不成器"。你应该如何处理？',
    category: 'conflict',
    difficulty: 'advanced',
    painPoints: ['教育理念分歧', '价值观冲突']
  },
  {
    id: 18,
    name: '孩子成绩下降',
    description: '孩子期末考试成绩下降，老公说"都是你惯的"，你很委屈但又不想吵架。你应该如何回应？',
    category: 'conflict',
    difficulty: 'advanced',
    painPoints: ['教育理念分歧', '无效沟通']
  },
  {
    id: 19,
    name: '孩子想报兴趣班',
    description: '孩子想报舞蹈班，老公说"浪费时间，有这时间不如多补习"。孩子很伤心。你应该如何平衡？',
    category: 'conflict',
    difficulty: 'intermediate',
    painPoints: ['教育理念分歧', '情绪压抑']
  },
  {
    id: 20,
    name: '老公抱怨你的育儿方式',
    description: '老公当着孩子的面说"你就是太惯着孩子"，你很生气又不想在孩子面前吵架。你应该怎么做？',
    category: 'conflict',
    difficulty: 'advanced',
    painPoints: ['教育理念分歧', '情绪压抑']
  },
  {
    id: 21,
    name: '家务分配矛盾',
    description: '老公回家看到家里有点乱，说"你在家连家务都做不好"。你觉得不公平，因为他从来不帮忙。你应该如何沟通？',
    category: 'conflict',
    difficulty: 'advanced',
    painPoints: ['价值观冲突', '情绪压抑']
  },
  {
    id: 22,
    name: '经济决策分歧',
    description: '孩子想买一套贵的课外书，老公说"浪费钱"，你觉得值得买。老公说"家里的钱都是我挣的"。你应该怎么回应？',
    category: 'conflict',
    difficulty: 'advanced',
    painPoints: ['价值观冲突', '大男子主义']
  },
  {
    id: 23,
    name: '婆媳关系',
    description: '婆婆从老家来了，总是批评你的育儿方式，老公站在婆婆那边说"老人家有经验"。你感到很委屈，应该如何和老公沟通？',
    category: 'conflict',
    difficulty: 'advanced',
    painPoints: ['价值观冲突', '大男子主义']
  },
  {
    id: 24,
    name: '孩子和同学吵架',
    description: '孩子和同学吵架了，老公说"你就教他打回去"，你觉得这样不对。老公说"现在的孩子就是太软弱"。你应该如何沟通？',
    category: 'conflict',
    difficulty: 'advanced',
    painPoints: ['教育理念分歧', '价值观冲突']
  },
  {
    id: 25,
    name: '老公抱怨工作',
    description: '老公抱怨上司不讲理、工作压力大。你想安慰他，但老公又说"你不懂，别瞎掺和"。你应该如何真正帮助到他？',
    category: 'conflict',
    difficulty: 'intermediate',
    painPoints: ['情感疏离', '无效沟通']
  },
  {
    id: 26,
    name: '冷战了一周',
    description: '你和老公因为育儿问题争吵后，已经冷战了一周。家里气氛很压抑，你想打破僵局，但不知道如何开口。你应该怎么做？',
    category: 'conflict',
    difficulty: 'advanced',
    painPoints: ['情感疏离', '情绪压抑']
  },
  {
    id: 27,
    name: '老公说"我累了"',
    description: '当你想和他沟通感情时，他总是说"我累了，别烦我"。你觉得被拒绝，但又不知道如何真正走进他的内心。你应该如何应对？',
    category: 'conflict',
    difficulty: 'advanced',
    painPoints: ['情感疏离', '无法理解对方']
  },
  {
    id: 28,
    name: '孩子不愿跟爸爸玩',
    description: '孩子说"我不喜欢和爸爸玩，他总是骂我"。老公听到后说"小孩懂什么，我是为他好"。你应该如何调解父子关系？',
    category: 'conflict',
    difficulty: 'advanced',
    painPoints: ['教育理念分歧', '情感疏离']
  },
  {
    id: 29,
    name: '孩子害怕爸爸',
    description: '你发现孩子看到爸爸回家就躲进房间，老公却说"他就是在闹脾气"。你很担心父子关系，应该如何和老公沟通？',
    category: 'conflict',
    difficulty: 'advanced',
    painPoints: ['教育理念分歧', '情绪压抑']
  },
  {
    id: 30,
    name: '想买学习平板',
    description: '孩子说想买一个学习平板，老师也推荐。老公说"就是想玩游戏，浪费钱"。孩子很伤心，你应该如何沟通？',
    category: 'conflict',
    difficulty: 'intermediate',
    painPoints: ['教育理念分歧', '价值观冲突']
  },
  {
    id: 31,
    name: '想换新沙发',
    description: '家里的沙发用了快十年了，有点破旧。你想换个新沙发，老公说"还能用，别乱花钱"。你应该如何说服他？',
    category: 'conflict',
    difficulty: 'intermediate',
    painPoints: ['价值观冲突', '情绪压抑']
  },
  {
    id: 32,
    name: '想给孩子报夏令营',
    description: '暑假你想给孩子报一个夏令营，费用较高但能锻炼孩子。老公说"太贵了，没必要"。你应该如何沟通？',
    category: 'conflict',
    difficulty: 'intermediate',
    painPoints: ['教育理念分歧', '价值观冲突']
  },
  {
    id: 33,
    name: '你想买护肤品',
    description: '你想买一套护肤品，老公看到价格后说"都是乱花钱，年纪这么大了还折腾"。你很委屈，应该如何回应？',
    category: 'conflict',
    difficulty: 'advanced',
    painPoints: ['价值观冲突', '情绪压抑']
  }
];

// 按类别分组
export const scenesByCategory = {
  daily: scenes.filter(s => s.category === 'daily'),
  conflict: scenes.filter(s => s.category === 'conflict')
};

// 按难度分组
export const scenesByDifficulty = {
  beginner: scenes.filter(s => s.difficulty === 'beginner'),
  intermediate: scenes.filter(s => s.difficulty === 'intermediate'),
  advanced: scenes.filter(s => s.difficulty === 'advanced')
};
