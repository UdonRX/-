import { generateGemini, getGeminiModel } from '../lib/gemini.mjs';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const keyConfigured = Boolean(process.env.GEMINI_API_KEY);
  const model = getGeminiModel();
  const live = String(req.query?.live || '') === '1';

  if (!keyConfigured) {
    return res.status(500).json({
      ok: false,
      stage: 'environment',
      keyConfigured: false,
      model,
      message: 'Vercelに GEMINI_API_KEY が設定されていません。'
    });
  }

  if (!live) {
    return res.status(200).json({
      ok: true,
      stage: 'environment',
      keyConfigured: true,
      model,
      message: 'GEMINI_API_KEY をVercelが読み込めています。?live=1 を付けると実通信を確認できます。'
    });
  }

  try {
    const result = await generateGemini({
      prompt: '「OK」とだけ返してください。',
      systemInstruction: '短い接続テストです。',
      maxOutputTokens: 10,
      timeoutMs: 15000
    });

    return res.status(200).json({
      ok: true,
      stage: 'gemini',
      keyConfigured: true,
      model: result.model,
      message: 'VercelからGemini APIへの接続に成功しました。',
      response: result.text
    });
  } catch (err) {
    const payload = err?.publicError || { error: err?.message || 'Gemini接続テストに失敗しました。' };
    return res.status(err?.statusCode || 500).json({
      ok: false,
      stage: 'gemini',
      keyConfigured: true,
      model,
      ...payload
    });
  }
}
