'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Scene } from '@/lib/scenes';
import type { ResponseOption, Feedback, UserStats } from '@/types';
import { ArrowRight, LogOut, Trophy, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<'practice' | 'stats'>('practice');
  const [selectedMode, setSelectedMode] = useState<'preset' | 'custom'>('preset');
  const [userRole, setUserRole] = useState<'husband' | 'wife'>('wife');
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [customScene, setCustomScene] = useState('');
  const [options, setOptions] = useState<ResponseOption[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedOption, setSelectedOption] = useState<ResponseOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    partnerResponse: string;
    feedback: Feedback;
    rating: number;
    knowledgeTip?: {
      title: string;
      content: string;
      source: string;
    };
  } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('zh_male_m191_uranus_bigtts');
  const [userSelectedOptionText, setUserSelectedOptionText] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // 伴侣声音选项（根据用户角色选择对应的声音）
  const partnerVoices = [
    { id: 'zh_male_m191_uranus_bigtts', name: '标准男声', description: '稳重、平和', gender: 'male' },
    { id: 'zh_male_dayi_saturn_bigtts', name: '成熟男声', description: '深沉、有质感', gender: 'male' },
    { id: 'zh_female_xiaohe_uranus_bigtts', name: '温柔女声', description: '柔和、亲切', gender: 'female' },
    { id: 'zh_female_mizai_saturn_bigtts', name: '优雅女声', description: '知性、温暖', gender: 'female' },
  ];

  // 丈夫声音选项（只保留前2个）
  const husbandVoices = partnerVoices.filter(voice => voice.gender === 'male').slice(0, 2);
  // 妻子声音选项
  const wifeVoices = partnerVoices.filter(voice => voice.gender === 'female');

  // 妻子专用场景（关于老公）
  const wifeScenes: Scene[] = [
    // 日常交流类
    { id: 1, name: '老公加班回家', description: '老公晚上10点才下班回家，看起来很累，进门就坐在沙发上不说话。你应该如何开场？', category: 'daily', difficulty: 'beginner', painPoints: ['情感疏离', '无效沟通'] },
    { id: 2, name: '老公生病了', description: '老公感冒发烧，躺在床上不想动，但还有工作要处理。你应该如何关心他？', category: 'daily', difficulty: 'beginner', painPoints: ['不会关心人', '情感疏离'] },
    { id: 3, name: '周末的安排', description: '周末快到了，你提议一家人出去活动，但老公最近工作很累，他想在家休息。你应该如何和他商量？', category: 'daily', difficulty: 'intermediate', painPoints: ['情绪压抑', '无效沟通'] },
    { id: 4, name: '老公升职了', description: '老公升职了，但他没有第一时间告诉你，你从别人那里听到的。你应该如何和他沟通这件事？', category: 'daily', difficulty: 'intermediate', painPoints: ['情感疏离', '无效沟通'] },
    { id: 5, name: '纪念日快到了', description: '结婚纪念日快到了，但老公似乎完全没放在心上。你应该如何提醒他，而不是让他觉得被指责？', category: 'daily', difficulty: 'intermediate', painPoints: ['情绪压抑', '不会表达情感'] },
    { id: 6, name: '老公心情不好', description: '老公下班回家脸色很难看，你问怎么了，他只说"没什么"，然后一直沉默。你应该如何应对？', category: 'daily', difficulty: 'intermediate', painPoints: ['情感疏离', '无法理解对方'] },
    { id: 7, name: '孩子想爸爸了', description: '孩子说"好想爸爸，想让爸爸陪玩"，但老公最近工作很忙。你应该如何和孩子沟通，又如何和老公提这个需求？', category: 'daily', difficulty: 'intermediate', painPoints: ['不会关心人', '情绪压抑'] },
    { id: 8, name: '老公的老同学聚会', description: '老公的老同学聚会，他不太想去，但你希望他去社交一下。你应该如何说服他？', category: 'daily', difficulty: 'intermediate', painPoints: ['无效沟通', '价值观冲突'] },
    { id: 9, name: '老公要出差了', description: '老公明天要去出差一周，现在正在收拾行李。你应该如何和他道别并表达关心？', category: 'daily', difficulty: 'beginner', painPoints: ['不会关心人', '情感疏离'] },
    { id: 10, name: '出差期间的联系', description: '老公出差第二天，他发消息说"一切正常，勿念"。你知道他其实很忙很累，想关心他但又怕打扰。你应该怎么回复？', category: 'daily', difficulty: 'intermediate', painPoints: ['不会主动沟通', '无效沟通'] },
    { id: 11, name: '老公出差回家', description: '老公出差一周后回家，看起来很疲惫，进门就问"家里怎么样了"。你应该如何迎接他并表达关心？', category: 'daily', difficulty: 'beginner', painPoints: ['不会关心人', '情感疏离'] },
    // 冲突化解类
    { id: 12, name: '孩子作业辅导分歧', description: '孩子数学题不会做，老公骂孩子"这么简单都不会"，你心疼孩子，想阻止老公但又怕冲突。你应该怎么做？', category: 'conflict', difficulty: 'intermediate', painPoints: ['教育理念分歧', '情绪压抑'] },
    { id: 13, name: '孩子玩手机', description: '孩子放学回家一直玩手机，老公直接没收手机并训斥孩子。你觉得这样太粗暴，但老公坚持"不打不成器"。你应该如何处理？', category: 'conflict', difficulty: 'advanced', painPoints: ['教育理念分歧', '价值观冲突'] },
    { id: 14, name: '孩子成绩下降', description: '孩子期末考试成绩下降，老公说"都是你惯的"，你很委屈但又不想吵架。你应该如何回应？', category: 'conflict', difficulty: 'advanced', painPoints: ['教育理念分歧', '无效沟通'] },
    { id: 15, name: '孩子想报兴趣班', description: '孩子想报舞蹈班，老公说"浪费时间，有这时间不如多补习"。孩子很伤心。你应该如何平衡？', category: 'conflict', difficulty: 'intermediate', painPoints: ['教育理念分歧', '情绪压抑'] },
    { id: 16, name: '老公抱怨你的育儿方式', description: '老公当着孩子的面说"你就是太惯着孩子"，你很生气又不想在孩子面前吵架。你应该怎么做？', category: 'conflict', difficulty: 'advanced', painPoints: ['教育理念分歧', '情绪压抑'] },
    { id: 17, name: '家务分配矛盾', description: '老公回家看到家里有点乱，说"你在家连家务都做不好"。你觉得不公平，因为他从来不帮忙。你应该如何沟通？', category: 'conflict', difficulty: 'advanced', painPoints: ['价值观冲突', '情绪压抑'] },
    { id: 18, name: '经济决策分歧', description: '孩子想买一套贵的课外书，老公说"浪费钱"，你觉得值得买。老公说"家里的钱都是我挣的"。你应该怎么回应？', category: 'conflict', difficulty: 'advanced', painPoints: ['价值观冲突', '大男子主义'] },
    { id: 19, name: '婆媳关系', description: '婆婆从老家来了，总是批评你的育儿方式，老公站在婆婆那边说"老人家有经验"。你感到很委屈，应该如何和老公沟通？', category: 'conflict', difficulty: 'advanced', painPoints: ['价值观冲突', '大男子主义'] },
    { id: 20, name: '老公抱怨工作', description: '老公抱怨上司不讲理、工作压力大。你想安慰他，但老公又说"你不懂，别瞎掺和"。你应该如何真正帮助到他？', category: 'conflict', difficulty: 'intermediate', painPoints: ['情感疏离', '无效沟通'] },
    { id: 21, name: '冷战了一周', description: '你和老公因为育儿问题争吵后，已经冷战了一周。家里气氛很压抑，你想打破僵局，但不知道如何开口。你应该怎么做？', category: 'conflict', difficulty: 'advanced', painPoints: ['情感疏离', '情绪压抑'] },
    { id: 22, name: '老公说"我累了"', description: '当你想和他沟通感情时，他总是说"我累了，别烦我"。你觉得被拒绝，但又不知道如何真正走进他的内心。你应该如何应对？', category: 'conflict', difficulty: 'advanced', painPoints: ['情感疏离', '无法理解对方'] },
    { id: 23, name: '孩子不愿跟爸爸玩', description: '孩子说"我不喜欢和爸爸玩，他总是骂我"。老公听到后说"小孩懂什么，我是为他好"。你应该如何调解孩子和爸爸的关系？', category: 'conflict', difficulty: 'advanced', painPoints: ['教育理念分歧', '情感疏离'] },
    { id: 24, name: '孩子害怕爸爸', description: '你发现孩子看到爸爸回家就躲进房间，老公却说"他就是在闹脾气"。你很担心孩子和爸爸的关系，应该如何和老公沟通？', category: 'conflict', difficulty: 'advanced', painPoints: ['教育理念分歧', '情绪压抑'] },
    { id: 25, name: '老公想买护肤品送你', description: '老公想给你买一套护肤品当礼物，但又担心你觉得贵舍不得用。他平时不太会表达爱意，这次鼓起勇气开口了，你应该怎么回应？', category: 'conflict', difficulty: 'advanced', painPoints: ['不会表达爱意', '情感疏离'] },
  ];

  // 丈夫专用场景（关于老婆）
  const husbandScenes: Scene[] = [
    // 日常交流类
    { id: 101, name: '老婆加班回家', description: '老婆晚上10点才下班回家，看起来很累，进门就坐在沙发上不说话。你应该如何开场？', category: 'daily', difficulty: 'beginner', painPoints: ['情感疏离', '无效沟通'] },
    { id: 102, name: '老婆生病了', description: '老婆感冒发烧，躺在床上不想动，但还有家务要处理。你应该如何关心她？', category: 'daily', difficulty: 'beginner', painPoints: ['不会关心人', '情感疏离'] },
    { id: 103, name: '周末的安排', description: '周末快到了，老婆提议一家人出去活动，但你最近工作很累，想在家休息。你应该如何和她商量？', category: 'daily', difficulty: 'intermediate', painPoints: ['情绪压抑', '无效沟通'] },
    { id: 104, name: '老婆升职了', description: '老婆升职了，但她没有第一时间告诉你，你从别人那里听到的。你应该如何和她沟通这件事？', category: 'daily', difficulty: 'intermediate', painPoints: ['情感疏离', '无效沟通'] },
    { id: 105, name: '纪念日快到了', description: '结婚纪念日快到了，但老婆似乎完全没放在心上。你应该如何提醒她，而不是让她觉得被指责？', category: 'daily', difficulty: 'intermediate', painPoints: ['情绪压抑', '不会表达情感'] },
    { id: 106, name: '老婆心情不好', description: '老婆下班回家脸色很难看，你问怎么了，她只说"没什么"，然后一直沉默。你应该如何应对？', category: 'daily', difficulty: 'intermediate', painPoints: ['情感疏离', '无法理解对方'] },
    { id: 107, name: '孩子想妈妈了', description: '孩子说"好想妈妈，想让妈妈陪玩"，但老婆最近工作很忙。你应该如何和孩子沟通，又如何和老婆提这个需求？', category: 'daily', difficulty: 'intermediate', painPoints: ['不会关心人', '情绪压抑'] },
    { id: 108, name: '老婆的老同学聚会', description: '老婆的老同学聚会，她不太想去，但你希望她去社交一下。你应该如何说服她？', category: 'daily', difficulty: 'intermediate', painPoints: ['无效沟通', '价值观冲突'] },
    { id: 109, name: '老婆要出差了', description: '老婆明天要去出差一周，现在正在收拾行李。你应该如何和她道别并表达关心？', category: 'daily', difficulty: 'beginner', painPoints: ['不会关心人', '情感疏离'] },
    { id: 110, name: '出差期间的联系', description: '老婆出差第二天，她发消息说"一切正常，勿念"。你知道她其实很忙很累，想关心她但又怕打扰。你应该怎么回复？', category: 'daily', difficulty: 'intermediate', painPoints: ['不会主动沟通', '无效沟通'] },
    { id: 111, name: '老婆出差回家', description: '老婆出差一周后回家，看起来很疲惫，进门就问"家里怎么样了"。你应该如何迎接她并表达关心？', category: 'daily', difficulty: 'beginner', painPoints: ['不会关心人', '情感疏离'] },
    // 冲突化解类
    { id: 112, name: '孩子作业辅导分歧', description: '孩子数学题不会做，老婆骂孩子"这么简单都不会"，你心疼孩子，想阻止老婆但又怕冲突。你应该怎么做？', category: 'conflict', difficulty: 'intermediate', painPoints: ['教育理念分歧', '情绪压抑'] },
    { id: 113, name: '孩子玩手机', description: '孩子放学回家一直玩手机，老婆直接没收手机并训斥孩子。你觉得这样太粗暴，但老婆坚持"不打不成器"。你应该如何处理？', category: 'conflict', difficulty: 'advanced', painPoints: ['教育理念分歧', '价值观冲突'] },
    { id: 114, name: '孩子成绩下降', description: '孩子期末考试成绩下降，老婆说"都是你惯的"，你很委屈但又不想吵架。你应该如何回应？', category: 'conflict', difficulty: 'advanced', painPoints: ['教育理念分歧', '无效沟通'] },
    { id: 115, name: '孩子想报兴趣班', description: '孩子想报篮球班，老婆说"浪费时间，有这时间不如多补习"。孩子很伤心。你应该如何平衡？', category: 'conflict', difficulty: 'intermediate', painPoints: ['教育理念分歧', '情绪压抑'] },
    { id: 116, name: '老婆抱怨你的育儿方式', description: '老婆当着孩子的面说"你就是太惯着孩子"，你很生气又不想在孩子面前吵架。你应该怎么做？', category: 'conflict', difficulty: 'advanced', painPoints: ['教育理念分歧', '情绪压抑'] },
    { id: 117, name: '家务分配矛盾', description: '老婆回家看到家里有点乱，说"你在家连家务都做不好"。你觉得不公平，因为她从来不帮忙。你应该如何沟通？', category: 'conflict', difficulty: 'advanced', painPoints: ['价值观冲突', '情绪压抑'] },
    { id: 118, name: '经济决策分歧', description: '孩子想买一套贵的课外书，老婆说"浪费钱"，你觉得值得买。老婆说"家里的钱都是我挣的"。你应该怎么回应？', category: 'conflict', difficulty: 'advanced', painPoints: ['价值观冲突', '情绪压抑'] },
    { id: 119, name: '婆媳关系', description: '婆婆从老家来了，总是批评老婆的育儿方式，老婆很难过但又不想和婆婆起冲突。你应该如何处理？', category: 'conflict', difficulty: 'advanced', painPoints: ['价值观冲突', '情感疏离'] },
    { id: 120, name: '老婆抱怨工作', description: '老婆抱怨上司不讲理、工作压力大。你想安慰她，但老婆又说"你不懂，别瞎掺和"。你应该如何真正帮助到她？', category: 'conflict', difficulty: 'intermediate', painPoints: ['情感疏离', '无效沟通'] },
    { id: 121, name: '冷战了一周', description: '你和老婆因为育儿问题争吵后，已经冷战了一周。家里气氛很压抑，你想打破僵局，但不知道如何开口。你应该怎么做？', category: 'conflict', difficulty: 'advanced', painPoints: ['情感疏离', '情绪压抑'] },
    { id: 122, name: '老婆说"我累了"', description: '当你想和她沟通感情时，她总是说"我累了，别烦我"。你觉得被拒绝，但又不知道如何真正走进她的内心。你应该如何应对？', category: 'conflict', difficulty: 'advanced', painPoints: ['情感疏离', '无法理解对方'] },
    { id: 123, name: '孩子不愿跟妈妈玩', description: '孩子说"我不喜欢和妈妈玩，她总是骂我"。老婆听到后说"小孩懂什么，我是为她好"。你应该如何调解孩子和妈妈的关系？', category: 'conflict', difficulty: 'advanced', painPoints: ['教育理念分歧', '情感疏离'] },
    { id: 124, name: '孩子害怕妈妈', description: '你发现孩子看到妈妈回家就躲进房间，老婆却说"她就是在闹脾气"。你很担心孩子和妈妈的关系，应该如何和老婆沟通？', category: 'conflict', difficulty: 'advanced', painPoints: ['教育理念分歧', '情绪压抑'] },
    { id: 125, name: '老婆想买护肤品', description: '老婆说她想买一套护肤品，但觉得太贵舍不得买。她平时为家庭省吃俭用，你看着她委屈的样子，应该怎么回应？', category: 'conflict', difficulty: 'advanced', painPoints: ['价值观冲突', '不会表达爱意'] },
  ];

  // 根据角色获取对应场景
  const getScenesByRole = (): Scene[] => {
    return userRole === 'wife' ? wifeScenes : husbandScenes;
  };

  const scenes = getScenesByRole();

  // 角色名称映射
  const getRoleNames = () => {
    return {
      user: userRole === 'wife' ? '妻子' : '丈夫',
      partner: userRole === 'wife' ? '老公' : '老婆',
      partnerTitle: userRole === 'wife' ? '他' : '她'
    };
  };

  const roleNames = getRoleNames();

  // 从localStorage加载数据
  useEffect(() => {
    const savedRole = localStorage.getItem('marriageSimulator_role') as 'husband' | 'wife' | null;
    if (savedRole) {
      setUserRole(savedRole);
    }

    const savedStats = localStorage.getItem(`marriageSimulator_stats_${savedRole || 'wife'}`);
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }

    const savedVoice = localStorage.getItem(`marriageSimulator_voice_${savedRole || 'wife'}`);
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, []);

  // 保存角色到localStorage
  useEffect(() => {
    localStorage.setItem('marriageSimulator_role', userRole);
  }, [userRole]);

  // 保存声音选择
  useEffect(() => {
    localStorage.setItem(`marriageSimulator_voice_${userRole}`, selectedVoice);
  }, [selectedVoice, userRole]);

  // 保存用户统计
  useEffect(() => {
    if (userStats) {
      localStorage.setItem(`marriageSimulator_stats_${userRole}`, JSON.stringify(userStats));
    }
  }, [userStats, userRole]);

  // 保存数据到localStorage
  useEffect(() => {
    if (userStats) {
      localStorage.setItem('husbandSimulator_stats', JSON.stringify(userStats));
    }
    localStorage.setItem('husbandSimulator_voice', selectedVoice);
  }, [userStats, selectedVoice]);

  // 试听声音
  const handlePreviewVoice = async (voiceId: string) => {
    // 如果已经在播放这个声音，不重复播放
    if (playingVoiceId === voiceId && previewAudioUrl) {
      return;
    }

    // 停止当前播放
    setPlayingVoiceId(null);
    setPreviewAudioUrl(null);

    // 开始播放新声音
    setPlayingVoiceId(voiceId);
    generatePreviewAudio(voiceId);
  };

  const generatePreviewAudio = async (voiceId: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '我累了，不想说话，让我休息一会儿吧。',
          voice: voiceId,
        }),
      });

      const data = await response.json();
      if (data.audioUri) {
        setPreviewAudioUrl(data.audioUri);
        // 自动播放
        const audio = new Audio(data.audioUri);
        audio.play();
        audio.onended = () => {
          setPreviewAudioUrl(null);
          setPlayingVoiceId(null);
        };
      }
    } catch (error) {
      console.error('试听失败:', error);
      setPlayingVoiceId(null);
    }
  };

  // 生成回应选项
  const generateOptions = async (sceneDescription: string) => {
    setIsLoading(true);
    setLoadingMessage('正在生成回应选项...');
    try {
      const response = await fetch('/api/practice/generate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneDescription, userRole }),
      });

      const data = await response.json();
      if (data.options) {
        setOptions(data.options);
      }
    } catch (error) {
      console.error('生成选项失败:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // 选择预设场景
  const handleSelectPresetScene = (scene: Scene) => {
    setSelectedScene(scene);
    setFeedback(null);
    setSelectedOption(null);
    setOptions([]);
    setAudioUrl(null);
    setUserSelectedOptionText('');
    generateOptions(scene.description);
  };

  // 提交自定义场景
  const handleSubmitCustomScene = () => {
    if (customScene.trim()) {
      const customSceneData: Scene = {
        id: 999,
        name: '自定义场景',
        description: customScene,
        category: 'daily',
        difficulty: 'intermediate',
        painPoints: [],
      };
      setSelectedScene(customSceneData);
      setFeedback(null);
      setSelectedOption(null);
      setOptions([]);
      setAudioUrl(null);
      setUserSelectedOptionText('');
      generateOptions(customScene);
    }
  };

  // 保存练习记录到数据库（user_id 可来自 body；httpOnly cookie 需 credentials: 'include'）
  const saveGameRecord = async (rating: number, finalAffection: number, scenarioName: string) => {
    const localUserId = localStorage.getItem('user_id');
    const localUsername = localStorage.getItem('username');
    const hasClientSession = Boolean(localUserId && localUsername);

    try {
      const response = await fetch('/api/game-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...(localUserId ? { user_id: localUserId } : {}),
          scenario: scenarioName,
          final_score: finalAffection,
          result: rating >= 4 ? 'success' : 'failure',
        }),
      });

      const data = await response.json();

      console.log('保存记录响应:', response.status, data);

      if (response.status === 401) {
        return {
          saved: false,
          message: typeof data.error === 'string' ? data.error : '登录后可保存你的练习记录',
        };
      }

      if (response.ok && data.saved) {
        return { saved: true, message: '您的练习记录已经保存' };
      }

      return {
        saved: false,
        message:
          typeof data.error === 'string' ? data.error : '保存失败，请稍后重试',
      };
    } catch {
      return {
        saved: false,
        message: hasClientSession
          ? '保存失败，请稍后重试'
          : '登录后可保存你的练习记录',
      };
    }
  };

  // 选择回应选项
  const handleSelectOption = async (option: ResponseOption) => {
    setSelectedOption(option);
    setUserSelectedOptionText(option.text);
    setIsLoading(true);
    setLoadingMessage('正在分析你的回应...');
    try {
      // 获取反馈和伴侣反应
      const evalResponse = await fetch('/api/practice/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneDescription: selectedScene?.description,
          selectedOption: option.text,
          sceneCategory: selectedScene?.category,
          userRole: userRole,
        }),
      });

      const evalData = await evalResponse.json();
      
      // 检查 API 返回是否有效
      if (!evalResponse.ok || !evalData.partnerResponse || !evalData.feedback) {
        alert('获取反馈失败，请重试');
        setIsLoading(false);
        setLoadingMessage('');
        return;
      }
      
      // 计算最终的好感度和结果
      const rating = Number(evalData.rating) || 3;
      let currentAffection = userStats?.affection || 50;
      const isPassed = rating >= 4;
      if (isPassed) {
        const affectionGain = 5 + (rating - 4) * 5;
        currentAffection = Math.min(100, currentAffection + affectionGain);
      } else {
        const affectionLoss = 3 + (3 - rating) * 2;
        currentAffection = Math.max(0, currentAffection - affectionLoss);
      }

      // 更新统计
      updateUserStats(rating);

      // 保存记录到数据库（异步，不阻塞UI）
      const scenarioName = selectedScene?.name || '自定义场景';
      saveGameRecord(rating, currentAffection, scenarioName).then((recordResult) => {
        // 根据保存结果显示提示
        setTimeout(() => {
          alert(recordResult.message);
        }, 500);
      });

      setFeedback({ ...evalData, rating });
      setLoadingMessage(`正在生成${roleNames.partner}的语音...`);

      // 生成语音（不等待完成）
      try {
        const ttsResponse = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: evalData.partnerResponse,
            voice: selectedVoice,
          }),
        });
        const ttsData = await ttsResponse.json();
        if (ttsData.audioUri) {
          setAudioUrl(ttsData.audioUri);
        }
      } catch (ttsError) {
        console.error('TTS生成失败:', ttsError);
      }
    } catch (error) {
      console.error('评估失败:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // 更新用户统计数据
  const updateUserStats = (rating: number) => {
    setUserStats((prev) => {
      const newStats = prev || {
        rounds: 0,
        affection: 50, // 初始好感度 50
        totalPractices: 0,
        totalScore: 0,
        averageRating: 0,
        passedRounds: 0,
        failedRounds: 0,
        categoryStats: {
          daily: { count: 0, totalScore: 0, averageRating: 0 },
          conflict: { count: 0, totalScore: 0, averageRating: 0 },
        },
        practiceHistory: [],
        weakPoints: [],
        errorPatterns: [],
      };

      // 增加轮次
      newStats.rounds += 1;
      newStats.totalPractices += 1;
      newStats.totalScore += rating;
      newStats.averageRating = newStats.totalScore / newStats.totalPractices;

      // 判定通关/失败
      const isPassed = rating >= 4;
      if (isPassed) {
        newStats.passedRounds += 1;
        // 通关增加好感度：5-10点（评分越高增加越多）
        const affectionGain = 5 + (rating - 4) * 5;
        newStats.affection = Math.min(100, newStats.affection + affectionGain);
      } else {
        newStats.failedRounds += 1;
        // 失败减少好感度：3-5点（评分越低减少越多）
        const affectionLoss = 3 + (3 - rating) * 2;
        newStats.affection = Math.max(0, newStats.affection - affectionLoss);
      }

      if (selectedScene) {
        const category = selectedScene.category;
        newStats.categoryStats[category].count += 1;
        newStats.categoryStats[category].totalScore += rating;
        newStats.categoryStats[category].averageRating =
          newStats.categoryStats[category].totalScore / newStats.categoryStats[category].count;
      }

      return newStats;
    });
  };

  // 重置练习
  const handleReset = () => {
    setSelectedScene(null);
    setCustomScene('');
    setOptions([]);
    setSelectedOption(null);
    setFeedback(null);
    setAudioUrl(null);
    setUserSelectedOptionText('');
  };

  // 导出数据
  const handleExport = () => {
    if (userStats) {
      const dataStr = JSON.stringify(userStats, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `husband-simulator-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // 导入数据
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setUserStats(data);
          alert('数据导入成功！');
        } catch {
          alert('数据导入失败，请检查文件格式。');
        }
      };
      reader.readAsText(file);
    }
  };

  const getCategoryColor = (category: string) => {
    return category === 'daily' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-semibold text-gray-900">夫妻沟通模拟器</span>
          </div>
          <div className="flex items-center gap-4">
            {authLoading ? (
              <span className="text-gray-500 text-sm">加载中...</span>
            ) : user ? (
              <>
                <Link href="/records" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                  我的记录
                </Link>
                <span className="text-gray-700 text-sm">欢迎, {user.username}</span>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Hero 区域 */}
        <div className="text-center py-8 md:py-12">
          <div className="mb-6 flex justify-center">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 md:w-20 md:h-20" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-4 leading-tight">
            夫妻沟通<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-600">
              让爱更近一步
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            通过AI模拟真实场景，帮助你掌握与伴侣沟通的技巧
          </p>

          {/* 角色选择 */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-3">选择你的角色</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setUserRole('wife');
                  // 自动切换到男声
                  const maleVoice = husbandVoices[0];
                  if (maleVoice) setSelectedVoice(maleVoice.id);
                }}
                className={`px-6 py-3 rounded-full transition-all font-medium ${
                  userRole === 'wife'
                    ? 'bg-pink-100 text-pink-700 border-2 border-pink-300'
                    : 'bg-white text-gray-700 hover:bg-pink-50 border-2 border-gray-200'
                }`}
              >
                我是妻子
              </button>
              <button
                onClick={() => {
                  setUserRole('husband');
                  // 自动切换到女声
                  const femaleVoice = wifeVoices[0];
                  if (femaleVoice) setSelectedVoice(femaleVoice.id);
                }}
                className={`px-6 py-3 rounded-full transition-all font-medium ${
                  userRole === 'husband'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border-2 border-gray-200'
                }`}
              >
                我是丈夫
              </button>
            </div>
          </div>

          {/* 声音选择器 - 根据角色动态显示 */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">
              {userRole === 'wife' ? '选择丈夫声音' : '选择妻子声音'}
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              {(userRole === 'wife' ? husbandVoices : wifeVoices).map((voice) => (
                <div key={voice.id} className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-all font-medium ${
                      selectedVoice === voice.id
                        ? userRole === 'wife' ? 'bg-blue-600 text-white shadow-lg' : 'bg-pink-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                    title={voice.description}
                  >
                    {voice.name}
                  </button>
                  <button
                    onClick={() => handlePreviewVoice(voice.id)}
                    className={`p-1.5 rounded-full transition-all text-sm ${
                      playingVoiceId === voice.id
                        ? 'bg-orange-100 text-orange-600 animate-bounce'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={`试听${voice.name}`}
                  >
                    🔊
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CTA 按钮 */}
          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-6 text-lg rounded-full shadow-xl transition-all hover:shadow-2xl"
              onClick={() => {
                setCurrentTab('practice');
                // 等待Tab切换和渲染完成
                setTimeout(() => {
                  const element = document.getElementById('practice-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 300);
              }}
            >
              开始练习
            </Button>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/blog" 
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full text-blue-600 text-sm font-medium hover:from-blue-100 hover:to-indigo-100 hover:border-blue-200 transition-all shadow-sm"
              >
                <BookOpen className="h-4 w-4" />
                沟通攻略
              </Link>
              <Link 
                href="/leaderboard" 
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-full text-orange-600 text-sm font-medium hover:from-orange-100 hover:to-amber-100 hover:border-orange-200 transition-all shadow-sm"
              >
                <Trophy className="h-4 w-4" />
                排行榜
              </Link>
            </div>
          </div>
        </div>

        {/* 主标签页 */}
        <div className="py-8 md:py-12">
          <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as 'practice' | 'stats')}>
            <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md mx-auto">
              <TabsTrigger value="practice">开始练习</TabsTrigger>
              <TabsTrigger value="stats">练习记录</TabsTrigger>
            </TabsList>

          {/* 练习标签页 */}
          <TabsContent value="practice" id="practice-section">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 左侧：场景选择 */}
              <Card>
                <CardHeader>
                  <CardTitle>选择场景</CardTitle>
                  <CardDescription>选择预设场景或输入自定义场景开始练习</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedMode} onValueChange={(v) => setSelectedMode(v as 'preset' | 'custom')}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="preset">预设场景</TabsTrigger>
                      <TabsTrigger value="custom">自定义场景</TabsTrigger>
                    </TabsList>

                    {/* 预设场景 */}
                    <TabsContent value="preset">
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-2">
                          {scenes.map((scene) => (
                            <Card
                              key={scene.id}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedScene?.id === scene.id ? 'ring-2 ring-purple-500' : ''
                              }`}
                              onClick={() => handleSelectPresetScene(scene)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-sm">{scene.name}</h3>
                                  <Badge className={getCategoryColor(scene.category)}>
                                    {scene.category === 'daily' ? '日常交流' : '冲突化解'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">{scene.description}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* 自定义场景 */}
                    <TabsContent value="custom">
                      <div className="space-y-4">
                        <Textarea
                          placeholder={`描述你遇到的场景...例如：${roleNames.partner}今天加班到很晚，回家后一直不说话，我该怎么做？`}
                          value={customScene}
                          onChange={(e) => setCustomScene(e.target.value)}
                          rows={8}
                          className="resize-none"
                        />
                        <Button
                          onClick={handleSubmitCustomScene}
                          disabled={!customScene.trim() || isLoading}
                          className="w-full"
                        >
                          {isLoading ? '生成中...' : '开始练习'}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* 右侧：练习交互 */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedScene ? selectedScene.name : '等待选择场景'}
                  </CardTitle>
                  <CardDescription>
                    {selectedScene
                      ? `选择一个回应，看看${roleNames.partner}会有什么反应`
                      : '从左侧选择一个场景开始练习'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedScene ? (
                    <div className="flex items-center justify-center h-[400px] text-gray-400">
                      <div className="text-center">
                        <p className="text-lg mb-2">👈 请先选择一个场景</p>
                        <p className="text-sm">点击左侧场景列表开始练习</p>
                      </div>
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center h-[400px] text-gray-400">
                      <div className="text-center">
                        <div className="text-4xl mb-4 animate-pulse">⏳</div>
                        <p className="text-lg mb-2 font-medium text-gray-600">{loadingMessage || '正在处理...'}</p>
                        <p className="text-sm text-gray-500">AI正在努力生成，请稍候</p>
                      </div>
                    </div>
                  ) : options.length === 0 ? (
                    <div className="flex items-center justify-center h-[400px] text-gray-400">
                      <Button onClick={() => generateOptions(selectedScene.description)}>
                        生成回应选项
                      </Button>
                    </div>
                  ) : !feedback ? (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 mb-3">你会怎么回应？</p>
                        {options.map((option) => (
                          <Button
                            key={option.id}
                            variant="outline"
                            className="w-full text-left h-auto py-3 px-4 whitespace-normal text-sm"
                            onClick={() => handleSelectOption(option)}
                          >
                            {option.text}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {/* 你的选择 */}
                        {userSelectedOptionText && (
                          <div className="bg-pink-50 border-2 border-pink-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-pink-900">💬 你的选择</h3>
                              <Badge className="bg-pink-100 text-pink-800 text-xs">刚刚选的</Badge>
                            </div>
                            <p className="text-sm text-pink-800 font-medium">{userSelectedOptionText}</p>
                          </div>
                        )}

                        {/* 评分 */}
                        <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg text-center">
                          <div className="text-sm text-purple-600 mb-1">第 {userStats?.rounds || 0} 轮</div>
                          <div className="text-3xl font-bold text-purple-700 mb-1">
                            {feedback.rating} / 5 分
                          </div>
                          <div className="text-sm text-purple-600">本次练习评分</div>
                        </div>

                        {/* 通关/失败状态和好感度 */}
                        <div className={`p-4 rounded-lg ${feedback.rating >= 4 ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {feedback.rating >= 4 ? (
                                <span className="text-2xl">🎉</span>
                              ) : (
                                <span className="text-2xl">💔</span>
                              )}
                              <h3 className={`font-bold text-lg ${feedback.rating >= 4 ? 'text-green-700' : 'text-red-700'}`}>
                                {feedback.rating >= 4 ? '通关成功！' : '失败'}
                              </h3>
                            </div>
                            <Badge className={feedback.rating >= 4 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                              {feedback.rating >= 4 ? 'PASS' : 'FAIL'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              {roleNames.partner}好感度
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${userStats?.affection || 50 >= 60 ? 'bg-pink-500' : 'bg-orange-500'}`}
                                  style={{
                                    width: `${userStats?.affection || 50}%`,
                                  }}
                                />
                              </div>
                              <span className={`font-bold ${userStats?.affection || 50 >= 60 ? 'text-pink-600' : 'text-orange-600'}`}>
                                {userStats?.affection || 50}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 text-center">
                            {(() => {
                              const rating = Number(feedback.rating) || 0;
                              if (rating >= 4) {
                                return <span className="text-green-600">好感度上升 +{5 + (rating - 4) * 5}</span>;
                              } else {
                                return <span className="text-red-600">好感度下降 -{3 + (3 - rating) * 2}</span>;
                              }
                            })()}
                          </div>
                        </div>

                        {/* 伴侣的反应（整合语音和文字） */}
                        <Card className="border-2 border-blue-200 overflow-hidden">
                          {/* 语音块 */}
                          {audioUrl && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border-b border-blue-200">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">🔊</span>
                                <h3 className="font-semibold text-blue-900 text-lg">{roleNames.partner}的语音</h3>
                              </div>
                              <audio controls className="w-full h-10">
                                <source src={audioUrl} type="audio/mpeg" />
                              </audio>
                              {/* 语音对应的文字 */}
                              {feedback.partnerResponse && (
                                <div className="mt-3 p-3 bg-white/80 rounded-lg border border-blue-200">
                                  <p className="text-sm text-blue-800">{feedback.partnerResponse}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 无语音时直接显示文字 */}
                          {!audioUrl && feedback.partnerResponse && (
                            <div className="bg-blue-50 p-4">
                              <h3 className="font-semibold text-blue-900 mb-2">👤 {roleNames.partner}的反应</h3>
                              <p className="text-sm text-blue-800">{feedback.partnerResponse}</p>
                            </div>
                          )}
                        </Card>

                        {/* 多角度反馈 */}
                        <div className="space-y-4">
                          {/* 系统分析 */}
                          <div className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">1</span>
                              </div>
                              <h4 className="font-medium text-gray-900 text-sm">系统分析</h4>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed pl-8">{feedback.feedback.systemAnalysis}</p>
                          </div>

                          {/* 内心独白 */}
                          <div className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-amber-50/50 to-white">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-amber-700">2</span>
                              </div>
                              <h4 className="font-medium text-gray-900 text-sm">{roleNames.partner}此刻在想什么</h4>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed pl-8">{feedback.feedback.partnerInnerThought}</p>
                          </div>

                          {/* 沟通建议 */}
                          <div className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50/50 to-white">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-700">3</span>
                              </div>
                              <h4 className="font-medium text-gray-900 text-sm">沟通建议</h4>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed pl-8">{feedback.feedback.advice}</p>
                          </div>

                          {/* 专业知识点 */}
                          {feedback.knowledgeTip && (
                            <div className="p-4 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <span className="text-xs">💡</span>
                                </div>
                                <h4 className="font-medium text-indigo-900 text-sm">专业知识点</h4>
                              </div>
                              <div className="pl-7 space-y-2">
                                <p className="text-sm font-medium text-gray-900">
                                  {feedback.knowledgeTip.title}
                                </p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {feedback.knowledgeTip.content}
                                </p>
                                <p className="text-xs text-gray-400 italic">
                                  {feedback.knowledgeTip.source}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 下一步操作 */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={handleReset}
                            variant="outline"
                            className="flex-1"
                          >
                            继续练习
                          </Button>
                          <Button
                            onClick={() => {
                              setFeedback(null);
                              setSelectedOption(null);
                              setAudioUrl(null);
                              setUserSelectedOptionText('');
                            }}
                            variant="ghost"
                            className="flex-1"
                          >
                            选择其他选项
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 统计标签页 */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>练习记录</CardTitle>
                    <CardDescription>查看练习数据和成长轨迹</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleExport} variant="outline" size="sm">
                      导出数据
                    </Button>
                    <Button
                      onClick={() => document.getElementById('import-input')?.click()}
                      variant="outline"
                      size="sm"
                    >
                      导入数据
                    </Button>
                    <input
                      type="file"
                      id="import-input"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!userStats || userStats.totalPractices === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-gray-400">
                    <div className="text-center">
                      <p className="text-lg mb-2">📊 暂无练习数据</p>
                      <p className="text-sm">完成练习后，这里会显示练习记录</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 总体统计 */}
                    <div className="grid grid-cols-4 gap-3">
                      <Card className="text-center p-3">
                        <div className="text-2xl font-bold text-green-600">{userStats.rounds}</div>
                        <div className="text-xs text-gray-600">完成轮次</div>
                      </Card>
                      <Card className="text-center p-3">
                        <div className="text-2xl font-bold text-pink-600">{userStats.affection}</div>
                        <div className="text-xs text-gray-600">好感度</div>
                      </Card>
                      <Card className="text-center p-3">
                        <div className="text-2xl font-bold text-blue-600">
                          {userStats.passedRounds}/{userStats.failedRounds}
                        </div>
                        <div className="text-xs text-gray-600">通关/失败</div>
                      </Card>
                      <Card className="text-center p-3">
                        <div className="text-2xl font-bold text-purple-600">
                          {userStats.averageRating.toFixed(1)} / 5
                        </div>
                        <div className="text-xs text-gray-600">平均评分</div>
                      </Card>
                    </div>

                    {/* 好感度进度条 */}
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{roleNames.partner}好感度</h3>
                        <span className={`font-bold text-lg ${userStats.affection >= 60 ? 'text-pink-600' : 'text-orange-600'}`}>
                          {userStats.affection} / 100
                        </span>
                      </div>
                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${userStats.affection >= 60 ? 'bg-gradient-to-r from-pink-400 to-pink-600' : 'bg-gradient-to-r from-orange-400 to-orange-600'}`}
                          style={{
                            width: `${userStats.affection}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>冷漠</span>
                        <span>友好</span>
                        <span>亲密</span>
                      </div>
                    </Card>

                    {/* 分类统计 */}
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3">📈 场景分布</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>日常交流</span>
                            <span>{userStats.categoryStats.daily.count} 次</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500"
                              style={{
                                width: `${(userStats.categoryStats.daily.count / userStats.totalPractices) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>冲突化解</span>
                            <span>{userStats.categoryStats.conflict.count} 次</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500"
                              style={{
                                width: `${(userStats.categoryStats.conflict.count / userStats.totalPractices) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* 分类平均分 */}
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3">⭐ 各类场景平均评分</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">日常交流</span>
                          <span className="font-semibold text-purple-600">
                            {userStats.categoryStats.daily.count > 0
                              ? userStats.categoryStats.daily.averageRating.toFixed(1)
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">冲突化解</span>
                          <span className="font-semibold text-orange-600">
                            {userStats.categoryStats.conflict.count > 0
                              ? userStats.categoryStats.conflict.averageRating.toFixed(1)
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}
