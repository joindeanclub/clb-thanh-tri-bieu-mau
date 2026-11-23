// Doc du lieu truc tiep tu Google Sheet (qua Apps Script) + gop voi du lieu goc, roi liet ke muc con thieu.
// Chay hoan toan tren trinh duyet — khong can may tinh cua Tung.
// File nay duoc dung chung boi: trang slide online (slide/) va trang chu bieu mau.
(function () {
  const CFG = window.CLB_CONFIG || {};
  const API = CFG.api, TOKEN = CFG.token;

  const photo = (id, w) => id ? 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w' + (w || 700) : '';
  const getJson = (q) => fetch(API + '?' + q, { redirect: 'follow' }).then((r) => r.json());

  // Moi (thang) lay ban ghi nhap SAU CUNG
  function latest(rows) {
    const best = {};
    (rows || []).forEach((x) => { if (x.thang && (!best[x.thang] || String(x.thoiGian) >= String(best[x.thang].thoiGian))) best[x.thang] = x; });
    return best;
  }
  const items = (v) => { try { return JSON.parse(v || '[]').map((r) => ({ ten: String(r.ten || ''), so: Number(r.so) || 0, ghiChu: '' })); } catch (e) { return []; } };

  // Gop du lieu goc (base.json) voi du lieu bieu mau (ex) — cung quy tac voi app tren may
  function merge(base, ex) {
    const st = JSON.parse(JSON.stringify(base));
    st.months = st.months || {};
    const mo = (k) => (st.months[k] = st.months[k] || {});
    (ex.hoiVien || []).forEach((x) => {
      if (!x.thang) return;
      const m = mo(x.thang);
      m.hoiVienMoi = (m.hoiVienMoi || []).filter((h) => !h.src || h.id !== x.id);
      m.hoiVienMoi.push({ src: 'form', id: x.id, ten: String(x.hoTen || '').toUpperCase(), dn: x.congTy || '', nganh: x.nganhNghe || '',
        diaChi: x.diaChi || '', triLy: (base.hvTriLy || {})[x.id] || '', ngaySinh: x.ngaySinh || '', anh: photo(x.anhId, 500) });
    });
    Object.entries(latest(ex.dienGia)).forEach(([k, x]) => {
      const m = mo(k);
      m.dienGia = Object.assign({}, m.dienGia, { ten: x.hoTen || '', chucDanh: x.chucDanh || '', noiDung: x.noiDung || '', anh: photo(x.anhId, 700) || (m.dienGia || {}).anh || '', link: x.linkBai || '' });
      if (x.chuDe) m.chuDe = Object.assign({}, m.chuDe, { tieuDe: x.chuDe });
    });
    Object.entries(latest(ex.showcase)).forEach(([k, x]) => {
      const m = mo(k);
      m.showcase = Object.assign({}, m.showcase, { ten: String(x.hoTen || '').toUpperCase(), dn: x.doanhNghiep || '', gioiThieu: x.gioiThieu || '',
        sanPham: x.sanPham || '', khachHang: x.khachHang || '', anh: photo(x.anhId, 700) || (m.showcase || {}).anh || '', link: x.linkBai || '' });
    });
    Object.entries(latest(ex.taiChinh)).forEach(([k, x]) => {
      mo(k).taiChinh = { dauKy: Number(x.dauKy) || 0, thu: items(x.thu), chi: items(x.chi), ghiChu: x.ghiChu || '' };
    });
    const today = new Date().toISOString().slice(0, 10);
    const ev = (ex.suKien || []).filter((x) => x.tenSuKien && (!x.ngay || String(x.ngay) >= today))
      .sort((a, b) => String(a.ngay || '9999').localeCompare(String(b.ngay || '9999'))).slice(0, 6)
      .map((x) => {
        let d = ''; if (x.ngay) { const [yy, mm, dd] = String(x.ngay).split('-'); d = dd + '/' + mm + '/' + yy; }
        return { ten: String(x.tenSuKien).toUpperCase(), moTa: [[d, x.gio].filter(Boolean).join(' · '), x.diaDiem, x.moTa].filter(Boolean).join(' — ') };
      });
    st.liveEvents = ev.length;
    if (ev.length) { st.fixed = st.fixed || {}; st.fixed.suKien = ev; }
    return st;
  }

  // Liet ke muc con thieu cua buoi hop thang `key`, gom theo ban
  function missing(st, key) {
    const mo = (st.months || {})[key] || {};
    const out = { 'Ban Đào tạo': [], 'Ban Thành viên': [], 'Ban Truyền thông': [], 'Ban Tài chính': [] };
    const need = (ban, ok, text) => { if (!ok) out[ban].push(text); };
    const dg = mo.dienGia || {}, sc = mo.showcase || {}, cd = mo.chuDe || {};
    const dgHas = !!(dg.ten && String(dg.ten).trim());
    need('Ban Đào tạo', dgHas, 'Diễn giả: chưa có họ tên');
    need('Ban Đào tạo', !!(cd.tieuDe && cd.tieuDe.trim()), 'Diễn giả: chưa có chủ đề chia sẻ');
    need('Ban Đào tạo', !!dg.chucDanh, 'Diễn giả: chưa có chức danh / công ty');
    need('Ban Đào tạo', !!(dg.anh), 'Diễn giả: chưa có ảnh đại diện');
    need('Ban Đào tạo', !!(dg.noiDung && dg.noiDung.trim()), 'Diễn giả: chưa có tóm tắt nội dung');
    need('Ban Đào tạo', !!(dg.link || (cd.files || []).length), 'Diễn giả: chưa có trang trình bày bài đào tạo (dán link Google Slides)');
    const scHas = !!(sc.ten && String(sc.ten).trim());
    need('Ban Đào tạo', scHas, 'Showcase: chưa có người / doanh nghiệp làm showcase');
    if (scHas) {
      need('Ban Đào tạo', !!sc.anh, 'Showcase: chưa có ảnh đại diện');
      need('Ban Đào tạo', !!(sc.gioiThieu && sc.gioiThieu.trim()), 'Showcase: chưa có giới thiệu tổng quan - triết lý kinh doanh');
      need('Ban Đào tạo', !!(sc.sanPham && sc.sanPham.trim()), 'Showcase: chưa có sản phẩm dịch vụ - lợi thế cạnh tranh');
      need('Ban Đào tạo', !!(sc.khachHang && sc.khachHang.trim()), 'Showcase: chưa có chân dung khách hàng mục tiêu');
    }
    need('Ban Đào tạo', !!(sc.link || (sc.files || []).length), 'Showcase: chưa có trang trình bày giới thiệu doanh nghiệp (dán link Google Slides)');
    const hv = mo.hoiVienMoi || [];
    need('Ban Thành viên', hv.length > 0, 'Hội viên mới: chưa có ai được nhập (nếu tháng này không có thì bỏ qua)');
    hv.forEach((h) => {
      const bad = [!h.anh && 'ảnh đại diện', !h.dn && 'tên doanh nghiệp', !h.nganh && 'ngành nghề', !h.diaChi && 'địa chỉ'].filter(Boolean);
      if (bad.length) out['Ban Thành viên'].push('Hội viên ' + (h.ten || '?') + ': thiếu ' + bad.join(', '));
    });
    need('Ban Truyền thông', st.liveEvents > 0, 'Sự kiện sắp tới: chưa có sự kiện nào');
    const tc = mo.taiChinh || {};
    const has = tc.dauKy || (tc.thu || []).length || (tc.chi || []).length;
    need('Ban Tài chính', !!has, 'Báo cáo quỹ tháng liền trước: chưa nhập');
    Object.keys(out).forEach((k) => { if (!out[k].length) delete out[k]; });
    return out;
  }

  // Tin Zalo soan san de gui nhom
  function zaloMessage(key, miss, people) {
    const p = key.split('-'); const lines = ['Kính gửi các Trưởng ban,', '', 'Slide buổi họp tháng ' + Number(p[1]) + '/' + p[0] + ' của CLB Doanh nghiệp Thanh Trì còn thiếu:'];
    const keyOf = { 'Ban Đào tạo': 'daotao', 'Ban Thành viên': 'thanhvien', 'Ban Truyền thông': 'truyenthong', 'Ban Tài chính': 'taichinh' };
    Object.keys(miss).forEach((ban) => {
      const who = (people || []).filter((x) => x.ban === keyOf[ban]).map((x) => x.ten.replace(/^(MR|MS)\s+/i, '')).join(', ');
      lines.push('', '▪ ' + ban + (who ? ' (' + who + ')' : '') + ':');
      miss[ban].forEach((t) => lines.push('  - ' + t));
    });
    lines.push('', 'Các ban vui lòng nhập bổ sung tại: ' + (CFG.formUrl || location.origin + '/clb-thanh-tri-bieu-mau/') + ' — nhập xong slide tự cập nhật. Xin cảm ơn!');
    return lines.join('\n');
  }

  // Du lieu goc (base.json) + cai dat luu tren Sheet (ghi de) = "base"; sau do gop du lieu bieu mau (ex) thanh "store"
  function overlay(seed, cfg) {
    const b = JSON.parse(JSON.stringify(seed));
    ['settings', 'fixed', 'texts', 'music', 'hvTriLy'].forEach((k) => { if (cfg[k] != null) b[k] = cfg[k]; });
    Object.keys(cfg).forEach((k) => { if (k.indexOf('m:') === 0) { (b.months = b.months || {})[k.slice(2)] = cfg[k]; } });
    b.texts = b.texts || {}; b.months = b.months || {}; b.music = b.music || {};
    return b;
  }

  const post = (o) => fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow', body: JSON.stringify(o) }).then((r) => r.json());

  async function load() {
    const [seed, ex, ctx, cfg] = await Promise.all([
      fetch((CFG.baseUrl || 'base.json') + '?t=' + Date.now()).then((r) => r.json()),
      getJson('action=export&token=' + encodeURIComponent(TOKEN)),
      getJson('action=context').catch(() => ({ people: [] })),
      getJson('action=settings').catch(() => ({ result: {} })),
    ]);
    if (ex.error) throw new Error(ex.error);
    const c = ctx.result || ctx;
    const base = overlay(seed, (cfg && cfg.result) || {});
    return { base, ex, store: merge(base, ex), people: c.people || [] };
  }

  // Luu 1 khoa cai dat len Sheet (settings | fixed | texts | music | hvTriLy | m:YYYY-MM)
  async function saveKey(key, value) {
    const r = await post({ action: 'saveSetting', key, value, who: 'Trang web' });
    if (!r.ok) throw new Error(r.error || 'Không lưu được');
    return r.result;
  }
  async function upload(dataUrl, label) {
    const r = await post({ action: 'uploadImage', dataUrl, label: label || 'anh' });
    if (!r.ok) throw new Error(r.error || 'Không tải được ảnh');
    return r.result.id;
  }
  async function history(key) {
    const r = await getJson('action=history&key=' + encodeURIComponent(key));
    return r.result || [];
  }

  window.CLBData = { load, merge, missing, zaloMessage, photo, saveKey, upload, history };
})();
