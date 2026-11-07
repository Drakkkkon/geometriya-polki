// Cloudflare Worker для программы «Геометрия Полки».
// Telegram не отдаёт картинки чужим сайтам напрямую. Этот Worker берёт страницу поста или картинку у t.me
// и возвращает её программе с разрешением CORS. Пропускаются только t.me и серверы картинок Telegram.
export default {
  async fetch(req) {
    const u = new URL(req.url);
    const t = u.searchParams.get('u') || '';
    const cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'};
    if (req.method === 'OPTIONS') return new Response(null, {headers: cors});
    if (!/^https:\/\/(t\.me|cdn[0-9]*\.(telesco\.pe|cdn-telegram\.org))\//.test(t)) {
      return new Response('Только t.me и серверы картинок Telegram', {status: 403, headers: cors});
    }
    const r = await fetch(t, {headers: {'User-Agent': 'Mozilla/5.0'}, cf: {cacheTtl: 3600}});
    const h = new Headers(r.headers);
    Object.keys(cors).forEach(k => h.set(k, cors[k]));
    return new Response(r.body, {status: r.status, headers: h});
  }
};
