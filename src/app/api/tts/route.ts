import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'zh_male_m191_uranus_bigtts' } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: '缺少要转换的文本' },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new TTSClient(config, customHeaders);

    // 使用选择的男性声音，符合"老公"的角色设定
    const response = await client.synthesize({
      uid: 'husband-tts',
      text: text.substring(0, 500), // 限制文本长度，避免过长
      speaker: voice, // 使用前端选择的语音
      audioFormat: 'mp3',
      sampleRate: 24000,
    });

    // 下载音频文件并转换为base64
    const audioData = await axios.get(response.audioUri, {
      responseType: 'arraybuffer'
    });

    const base64Audio = Buffer.from(audioData.data).toString('base64');
    const dataUrl = `data:audio/mp3;base64,${base64Audio}`;

    return NextResponse.json({
      audioUri: dataUrl,
      audioSize: response.audioSize
    });
  } catch (error) {
    console.error('TTS生成失败:', error);
    return NextResponse.json(
      { error: '语音生成失败', audioUri: null },
      { status: 500 }
    );
  }
}
