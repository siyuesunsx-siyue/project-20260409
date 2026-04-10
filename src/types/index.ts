// 练习相关类型定义

export type ResponseOption = {
  id: string;
  text: string;
};

export type Feedback = {
  systemAnalysis: string;  // 系统分析
  partnerInnerThought: string;  // 配偶内心独白
  advice: string;  // 给用户的沟通建议
};

export type HusbandResponse = {
  text: string;  // 老公的回应文字
  audioUri?: string;  // 语音文件URL（可选，如果TTS失败则没有）
};

export type PracticeResult = {
  response: HusbandResponse;
  feedback: Feedback;
  rating: number;  // 1-5星
  knowledgeTip?: {
    title: string;  // 知识点标题
    content: string;  // 知识点内容
    source: string;  // 权威出处
  };
};

export type UserPractice = {
  id: string;
  sceneId?: number;  // 预设场景ID，自定义场景为undefined
  customScene?: string;  // 自定义场景描述
  selectedOption: string;  // 用户选择的回应
  result: PracticeResult;
  timestamp: number;
};

export type UserStats = {
  rounds: number; // 完成的轮次
  affection: number; // 好感度（0-100）
  totalPractices: number;
  totalScore: number;
  averageRating: number;
  passedRounds: number; // 通关轮次
  failedRounds: number; // 失败轮次
  categoryStats: {
    daily: {
      count: number;
      totalScore: number;
      averageRating: number;
    };
    conflict: {
      count: number;
      totalScore: number;
      averageRating: number;
    };
  };
  practiceHistory: UserPractice[];
  weakPoints: { painPoint: string; count: number }[];
  errorPatterns: { pattern: string; count: number }[];
};

// 博客文章类型定义
export type BlogPost = {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishDate: string;
  readTime: number; // 阅读时间（分钟）
};
