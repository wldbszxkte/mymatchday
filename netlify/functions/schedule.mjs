import { getSchedule } from '../../sources.mjs';

export default async function handler(request) {
  const url = new URL(request.url);
  const source = url.searchParams.get('source');
  const month = url.searchParams.get('month');
  try {
    const result = await getSchedule(source, month, url.origin, url.searchParams.get('refresh') === '1');
    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, events: [], error: '일정 요청이 올바르지 않습니다.' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
}
