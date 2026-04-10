import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 辅助函数：尝试修复被截断的JSON
function tryFixJson(jsonStr: string): object | null {
  const openBraces = (jsonStr.match(/\{/g) || []).length;
  const closeBraces = (jsonStr.match(/\}/g) || []).length;
  
  if (openBraces > closeBraces) {
    // 缺少闭合括号，尝试补全
    const needed = openBraces - closeBraces;
    
    // 找到最后一个完整对象的闭合位置
    let lastCompleteObject = jsonStr.length;
    let braceCount = 0;
    
    for (let i = jsonStr.length - 1; i >= 0; i--) {
      if (jsonStr[i] === '}') {
        braceCount++;
        if (braceCount === closeBraces + needed) {
          lastCompleteObject = i + 1;
          break;
        }
      }
    }
    
    // 截取到最后一个完整对象位置
    let fixedJson = jsonStr.substring(0, lastCompleteObject);
    
    // 补全缺失的闭合括号
    fixedJson += '}'.repeat(needed);
    
    try {
      return JSON.parse(fixedJson);
    } catch {
      return null;
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { sceneDescription, selectedOption, sceneCategory, userRole = 'wife' } = await request.json();

    if (!sceneDescription || !selectedOption) {
      return NextResponse.json(
        { error: '缺少场景描述或选择的回应' },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const isWife = userRole === 'wife';
    const partnerName = isWife ? '老公' : '老婆';
    const userName = isWife ? '妻子' : '丈夫';
    const partnerPersonality = isWife 
      ? '内敛固执、说教型、期望被照顾' 
      : '敏感细腻、期望被理解、喜欢被赞美';

    const systemPrompt = '你是婚姻沟通教练。' +
      '用户角色：' + userName + '（练习者），配偶角色：' + partnerName + '。' + 
      partnerName + '性格：' + partnerPersonality + '。' +
      '场景中，' + partnerName + '遇到了某个情况，用户作为' + userName + '需要选择如何回应。' +
      'JSON格式：' +
      '{"partnerResponse":"【' + partnerName + '听到用户的话后的回应，纯对话台词，10-30字，中文】",' +
      '"feedback":{"systemAnalysis":"【分析' + userName + '刚才说的那句话好在哪里或不好在哪里，30-60字。评分1-2分时说缺点，评分4-5分时说优点，评分3分时客观分析】",' +
      '"partnerInnerThought":"【站在' + partnerName + '角度，用"我"表达真实想法。评分1-2分时表达不满或受伤，评分4-5分时表达感动或认同，评分3分时表达中立】",' +
      '"advice":"【给' + userName + '的沟通建议，30-60字】"},' +
      '"rating":1-5,' +
      '"knowledgeTip":{"title":"【知识点名称】","content":"【50-80字内容】","source":"【出处】"}}。' +
      '重要规则：' +
      '1. partnerResponse 是' + partnerName + '说的话' +
      '2. 评分与反馈内容必须一致：评分低时分析缺点和负面情绪，评分高时分析优点和正面情绪' +
      '3. 所有输出必须使用中文' +
      '4. 禁止动作描写、表情符号、括号内容';

    const userPrompt = '场景：' + sceneDescription + '。' +
      userName + '（用户）对' + partnerName + '说："' + selectedOption + '"。' +
      '请生成' + partnerName + '的反应和对用户选择的反馈。注意：评价内容必须与评分一致。';

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    // 重试机制
    const MAX_RETRIES = 3;
    let lastError: Error | string | null = null;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await client.invoke(messages, {
          model: 'doubao-seed-2-0-mini-260215',
          temperature: 0.7,
        });

        let result;
        let parseSuccess = false;
        
        // 方法1: 直接解析
        try {
          result = JSON.parse(response.content);
          parseSuccess = true;
        } catch {
          console.error(`第${attempt}次尝试：JSON直接解析失败`);
        }
        
        // 方法2: 提取并修复JSON
        if (!parseSuccess) {
          let jsonStr = response.content;
          const firstBrace = jsonStr.indexOf('{');
          const lastBrace = jsonStr.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
          }
          
          try {
            result = JSON.parse(jsonStr);
            parseSuccess = true;
          } catch {
            console.error(`第${attempt}次尝试：JSON提取后解析失败`);
          }
        }
        
        // 方法3: 修复特殊字符后解析
        if (!parseSuccess) {
          let jsonStr = response.content;
          const firstBrace = jsonStr.indexOf('{');
          const lastBrace = jsonStr.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
          }
          
          jsonStr = jsonStr
            .replace(/[\x00-\x1F\x7F]/g, '')
            .replace(/,\s*([\]}])/g, '$1')
            .replace(/'/g, '"')
            .replace(/\u201c/g, '"')
            .replace(/\u201d/g, '"')
            .replace(/\u2018/g, "'")
            .replace(/\u2019/g, "'");
          
          try {
            result = JSON.parse(jsonStr);
            parseSuccess = true;
          } catch {
            console.error(`第${attempt}次尝试：JSON修复字符后解析失败`);
          }
        }
        
        // 方法4: 尝试修复截断的JSON
        if (!parseSuccess) {
          const fixed = tryFixJson(response.content);
          if (fixed) {
            result = fixed;
            parseSuccess = true;
          }
        }
        
        // 所有方法都失败
        if (!parseSuccess) {
          if (attempt < MAX_RETRIES) {
            lastError = 'JSON解析失败，将重试';
            continue;
          }
          return NextResponse.json({
            partnerResponse: partnerName + '说："这个回应让我有点困惑，能换个方式说吗？"',
            feedback: {
              systemAnalysis: '这个回应可能需要更清晰地表达您的想法，建议尝试更直接的沟通方式。',
              partnerInnerThought: '我需要更多时间来理解你的意思...',
              advice: '沟通时尽量使用清晰、直接的语言，避免让对方产生误解。'
            },
            rating: 3,
            knowledgeTip: {
              title: '清晰表达',
              content: '有效的沟通需要清晰、直接地表达自己的想法，避免使用模糊或可能引起误解的表达方式。',
              source: '沟通技巧基础'
            }
          });
        }

        // 标准化结果结构
        let normalizedResult = result;
        
        // 如果 rating 在 feedback 里，把它提到顶层并清理 feedback
        if (result.feedback && typeof result.feedback === 'object' && 'rating' in result.feedback) {
          const { rating, knowledgeTip, ...cleanFeedback } = result.feedback;
          normalizedResult = {
            partnerResponse: result.partnerResponse,
            feedback: cleanFeedback,
            rating: rating,
            knowledgeTip: knowledgeTip
          };
        }

        // 验证返回结构完整性
        const hasPartnerResponse = normalizedResult.partnerResponse && typeof normalizedResult.partnerResponse === 'string';
        const hasFeedback = normalizedResult.feedback && typeof normalizedResult.feedback === 'object';
        const hasRating = normalizedResult.rating !== undefined && normalizedResult.rating !== null;
        
        if (!hasPartnerResponse || !hasFeedback || !hasRating) {
          console.error('返回结构不完整:', normalizedResult);
          if (attempt < MAX_RETRIES) {
            lastError = '返回结构不完整，将重试';
            continue;
          }
          return NextResponse.json({
            partnerResponse: partnerName + '说："嗯...我需要你再说一遍。"',
            feedback: {
              systemAnalysis: '系统处理出现异常，请重试。',
              partnerInnerThought: '我有些困惑...',
              advice: '请重新选择您的回应方式。'
            },
            rating: 3,
            knowledgeTip: {
              title: '重试建议',
              content: '如果遇到问题，可以尝试刷新页面重新开始练习。',
              source: '系统提示'
            }
          });
        }

        return NextResponse.json(normalizedResult);
      } catch (invokeError) {
        console.error(`第${attempt}次调用失败:`, invokeError);
        lastError = invokeError instanceof Error ? invokeError : new Error(String(invokeError));
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    console.error('所有重试都失败:', lastError);
    return NextResponse.json(
      { error: '评估失败，请重试' },
      { status: 500 }
    );
  } catch (error) {
    console.error('评估失败:', error);
    return NextResponse.json(
      { error: '评估失败，请重试' },
      { status: 500 }
    );
  }
}
