// Dung danh sach slide tu du lieu. Bo cuc dong bo: dau trang (tieu de) - noi dung - chan trang.
(function () {
  const A = window.CLB_ASSETS || '/assets/';
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const nl = (s) => esc(s).replace(/\n/g, '<br>');
  const money = (n) => (Number(n) || 0).toLocaleString('vi-VN') + ' đ';

  function monthKey(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
  function parseKey(k) { const [y, m] = k.split('-').map(Number); return { y, m }; }
  function sessionNumber(st, key) {
    const s = st.settings, { y, m } = parseKey(key);
    return Number(s.baseNumber) + (y - Number(s.baseYear)) * 12 + (m - Number(s.baseMonth));
  }

  // Anh chan dung: luon hinh tron, cung 1 kieu, cac co m / l / xl
  const U = (v) => (v && String(v).indexOf('drive:') === 0) ? 'https://lh3.googleusercontent.com/d/' + String(v).slice(6) + '=w700' : v;
  const avatar = (src, size, ph) => src
    ? `<span class="av ${size || 'm'}"><img src="${esc(U(src))}" alt=""></span>`
    : `<span class="av ${size || 'm'} empty logo"><img src="${A}image6.png" alt=""></span>`;

  // Doi link Google Slides / Drive / Canva thanh link nhung de trinh chieu truc tiep
  function embedUrl(u) {
    u = String(u || '').trim(); if (!/^https?:\/\//i.test(u)) return '';
    let m = u.match(/docs\.google\.com\/presentation\/d\/([\w-]+)/);
    if (m) return 'https://docs.google.com/presentation/d/' + m[1] + '/embed?start=false&loop=false&delayms=3000';
    m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/) || u.match(/drive\.google\.com\/open\?id=([\w-]+)/);
    if (m) return 'https://drive.google.com/file/d/' + m[1] + '/preview';
    return u;
  }

  // Khung chung moi slide
  function frame(o) {
    return `
      <div class="logo"><img src="${A}image6.png" alt=""></div>
      <div class="head"><h2>${esc(o.title)}</h2>${o.sub ? `<p>${esc(o.sub)}</p>` : ''}</div>
      <div class="body ${o.cls || ''}">${o.body}</div>
      <div class="foot"><span>${esc(o.club)}</span><span>${esc(o.label || '')}</span></div>`;
  }

  function build(st, key) {
    const s = st.settings, fx = st.fixed;
    const mo = (st.months || {})[key] || {};
    const { y, m } = parseKey(key);
    const num = sessionNumber(st, key);
    const club = s.clubName, nk = fx.tenNhiemKy;
    const slides = [];
    let pending = [];
    const add = (id, music, html) => { slides.push({ id, music, html, controls: pending }); pending = []; };
    const TX = st.texts || {};
    // ov: van ban co the sua; tra ve ban da sua (neu co) hoac mac dinh, dong thoi dang ky o sua cho slide
    const ov = (k, d, label, type) => { pending.push({ scope: 'text', path: k, label: label || k, type: type || 'text', def: d }); return (TX[k] != null && String(TX[k]).trim() !== '') ? String(TX[k]) : d; };
    const ctl = (c) => { pending.push(c); };
    const T = (k, d) => (TX[k] != null && String(TX[k]).trim() !== '') ? String(TX[k]) : d;
    const note = (text, open) => ctl({ type: 'note', text, open });
    const F = (o) => frame(Object.assign({ club }, o));
    const card = (cls, inner) => `<div class="card ${cls || ''}">${inner}</div>`;

    // File dinh kem de trinh chieu (anh, PDF/PowerPoint da tach trang, video)
    const fileSlides = (prefix, files) => {
      (files || []).forEach((f, fi) => {
        const cap = (n, t) => `<span class="fcap">${esc(f.name || '')}${t > 1 ? ' · ' + n + '/' + t : ''}</span>`;
        if (f.kind === 'video') {
          add(`${prefix}-f${fi}`, null, `<div class="fileslide"><video src="${esc(f.urls[0])}" controls playsinline></video>${cap(1, 1)}</div>`);
        } else if (f.kind === 'pdf') {
          add(`${prefix}-f${fi}`, null, `<div class="fileslide"><iframe src="${esc(f.urls[0])}#toolbar=0&navpanes=0"></iframe>${cap(1, 1)}</div>`);
        } else {
          (f.urls || []).forEach((u, i, a) => add(`${prefix}-f${fi}-${i}`, null, `<div class="fileslide"><img src="${esc(u)}" alt="">${cap(i + 1, a.length)}</div>`));
        }
      });
    };

    const linkSlide = (id, url, name) => { const e = embedUrl(url); if (e) add(id, null, `<div class="fileslide"><iframe src="${esc(e)}" allowfullscreen></iframe><span class="fcap">${esc(name)}</span></div>`); };

    // 1. Bia
    ctl({ scope: 'settings', path: 'eventName', label: 'Tên chương trình (VD: MATCHING OFFLINE)' });
    ctl({ scope: 'settings', path: 'tagline', label: 'Khẩu hiệu dưới tên chương trình', type: 'area' });
    ctl({ scope: 'settings', path: 'clubName', label: 'Tên CLB' });
    ctl({ scope: 'settings', path: 'baseNumber', label: 'Số thứ tự của buổi họp gốc', type: 'number' });
    ctl({ scope: 'settings', path: 'baseYear', label: 'Năm của buổi họp gốc', type: 'number' });
    ctl({ scope: 'settings', path: 'baseMonth', label: 'Tháng của buổi họp gốc', type: 'number' });
    add('bia', 'start', `
      <div class="cover">
        <img class="cv-wave" src="${A}image3.png" alt="">
        <img class="cv-city" src="${A}image2.png" alt="">
        <img class="cv-logo" src="${A}image6.png" alt="">
        <div class="cv-month">THÁNG ${m}.${y}</div>
        <h1>${esc(s.eventName)} ${num}</h1>
        <p class="cv-tag">${esc(s.tagline)}</p>
        <div class="cv-club">${esc(club)}</div>
      </div>`);

    // 2. Ban dieu hanh (1 trang duy nhat: re chuot vao tung nguoi de xem the nhiem vu phong to)
    const bdh = fx.bdh || [];
    const TOP = ['PHÓ CHỦ TỊCH', 'CHỦ TỊCH', 'TỔNG THƯ KÝ'];
    const top = TOP.map((r) => bdh.find((p) => p.vaiTro === r)).filter(Boolean);
    const rest = bdh.filter((p) => !top.includes(p));
    const DUTY0 = {
      'CHỦ TỊCH': ['Chủ trì buổi họp, giới thiệu giá trị cốt lõi và lợi ích hội viên', 'Định hướng kế hoạch, duyệt các hoạt động lớn của CLB', 'Đại diện CLB, tri ân tiền nhiệm và khép lại chương trình'],
      'PHÓ CHỦ TỊCH': ['Hỗ trợ Chủ tịch điều hành, thay mặt khi Chủ tịch vắng', 'Phụ trách phần chào mừng hội viên mới', 'Điều phối trao cơ hội: referral, closed business'],
      'TỔNG THƯ KÝ': ['Ghi biên bản, quản lý danh sách và hồ sơ hội viên', 'Tổng hợp báo cáo thu chi hằng tháng', 'Báo cáo chỉ số tham dự, referral, closed business'],
      'TB THÀNH VIÊN': ['Nhập hồ sơ hội viên mới dự kiến kết nạp (ảnh, doanh nghiệp, ngành nghề)', 'Cập nhật tổng số thành viên mỗi tháng', 'Chăm sóc, giúp hội viên mới hòa nhập'],
      'TB TRUYỀN THÔNG & SỰ KIỆN': ['Nhập lịch sự kiện sắp tới: thăm doanh nghiệp, Business Tour', 'Truyền thông trước và sau họp: hình ảnh, bài đăng', 'Phụ trách bốc thăm trúng thưởng và hậu cần'],
      'TB KHÁCH MỜI': ['Mời, đón khách mời và ghi nhận người giới thiệu', 'Gửi thư mời, tổng hợp danh sách khách mời mỗi tháng', 'Theo dõi khách mời trở thành hội viên'],
      'TB ĐÀO TẠO': ['Chốt diễn giả, chủ đề; nhập ảnh, tóm tắt, link bài đào tạo', 'Chốt doanh nghiệp showcase và bài giới thiệu', 'Điều phối phần 30 giây kết nối'],
    };
    ctl({ scope: 'fixed', path: 'tenNhiemKy', label: 'Tên nhiệm kỳ (VD: Nhiệm kỳ VII)' });
    ctl({ scope: 'fixed', path: 'bdh', type: 'list', label: 'Thành viên Ban điều hành', item: [{ p: 'ten', label: 'Họ tên' },
      { p: 'vaiTro', label: 'Chức danh (giữ đúng chữ để thẻ nhiệm vụ hiện: CHỦ TỊCH, PHÓ CHỦ TỊCH, TỔNG THƯ KÝ, TB THÀNH VIÊN, TB TRUYỀN THÔNG & SỰ KIỆN, TB KHÁCH MỜI, TB ĐÀO TẠO)' },
      { p: 'anh', label: 'Ảnh chân dung', type: 'img' }], blank: { ten: '', vaiTro: '', anh: '' } });
    const DUTY = {};
    Object.keys(DUTY0).forEach((r) => { DUTY[r] = DUTY0[r].map((d, i) => ov('duty.' + r + '.' + i, d, r + ' · nhiệm vụ ' + (i + 1), 'area')); });
    const DCOL = { 'CHỦ TỊCH': '#b9770e', 'PHÓ CHỦ TỊCH': '#1760c4', 'TỔNG THƯ KÝ': '#0f9d94', 'TB THÀNH VIÊN': '#7a4dc0',
      'TB TRUYỀN THÔNG & SỰ KIỆN': '#d9531e', 'TB KHÁCH MỜI': '#2e8f4f', 'TB ĐÀO TẠO': '#c2306f' };
    const pcard = (p, big) => `<div class="pcard ${big ? 'lead' : ''}"${DUTY[p.vaiTro] ? ` data-p="${esc(p.vaiTro)}" title="Bấm để xem nhiệm vụ"` : ''}>${avatar(p.anh, big ? 'l' : 'm')}<b>${esc(p.ten)}</b><i>${esc(p.vaiTro)}</i></div>`;
    const bigCard = (p) => `<div class="dbig" data-p="${esc(p.vaiTro)}" style="--c:${DCOL[p.vaiTro] || '#1760c4'}">
      <div class="dbl">${avatar(p.anh, 's')}<b>${esc(p.ten)}</b><i>${esc(p.vaiTro)}</i></div>
      <div class="dbr"><h4>NHIỆM VỤ &amp; VAI TRÒ</h4><ol>${(DUTY[p.vaiTro] || []).map((t, i) => `<li><span>${i + 1}</span><p>${esc(t)}</p></li>`).join('')}</ol></div></div>`;
    const popup = `<div class="dpop">${bdh.filter((p) => DUTY[p.vaiTro]).map(bigCard).join('')}</div>`;
    add('bdh', 'bdh', F({
      title: 'BAN ĐIỀU HÀNH ' + nk.toUpperCase(), sub: 'Đội ngũ lãnh đạo bản lĩnh, kiến tạo cơ hội phát triển bền vững cho CLB',
      label: 'Bấm vào từng người để xem nhiệm vụ · ' + nk,
      body: `<div class="org"><div class="row top">${top.map((p) => pcard(p, p.vaiTro === 'CHỦ TỊCH')).join('')}</div>
             <div class="row sub">${rest.map((p) => pcard(p)).join('')}</div></div>`,
    }) + popup);

    // 3. Lich su
    const hist = [
      [ov('hist.0.t', 'KẾT NỐI', 'Sứ mệnh 1 · tiêu đề'), 'image38.png', ov('hist.0.d', 'Tạo mạng lưới liên kết bền vững. Gom nguồn lực nhỏ thành sức mạnh lớn. Phá vỡ khoảng cách giữa các doanh nghiệp.', 'Sứ mệnh 1 · mô tả', 'area')],
      [ov('hist.1.t', 'HỖ TRỢ', 'Sứ mệnh 2 · tiêu đề'), 'image39.png', ov('hist.1.d', 'Đồng hành, chia sẻ và đỡ đầu. Giúp nhau vượt qua thách thức thị trường. Chia sẻ kinh nghiệm và công nghệ.', 'Sứ mệnh 2 · mô tả', 'area')],
      [ov('hist.2.t', 'PHÁT TRIỂN', 'Sứ mệnh 3 · tiêu đề'), 'image40.png', ov('hist.2.d', 'Đột phá doanh thu, nâng tầm vị thế. Cùng nhau vươn xa, đóng góp kinh tế cho quê hương Thanh Trì.', 'Sứ mệnh 3 · mô tả', 'area')],
    ];
    add('lichsu', 'bdh', F({
      title: 'LỊCH SỬ HÌNH THÀNH VÀ PHÁT TRIỂN', sub: 'Thành lập từ 2022', label: 'Ba sứ mệnh của CLB',
      body: `<div class="quote">${esc(ov('lichsu.quote', '“Muốn đi nhanh hãy đi một mình, muốn đi xa hãy đi cùng nhau.”', 'Câu trích dẫn', 'area'))}<span>${esc(ov('lichsu.quote2', 'Ba sứ mệnh này là bệ phóng đưa doanh nghiệp địa phương cất cánh.', 'Câu dưới trích dẫn', 'area'))}</span></div>
        <div class="cols3">${hist.map((h) => card('center', `<img class="illus" src="${A}${h[1]}" alt=""><h3>${h[0]}</h3><p>${esc(h[2])}</p>`)).join('')}</div>`,
    }));

    // 4. Tri an chu tich tien nhiem
    ctl({ scope: 'fixed', path: 'chuTichTienNhiem', type: 'list', label: 'Chủ tịch tiền nhiệm', item: [{ p: 'ten', label: 'Họ tên' },
      { p: 'moTa', label: 'Mô tả đóng góp', type: 'area' }, { p: 'anh', label: 'Ảnh chân dung', type: 'img' }], blank: { ten: '', moTa: '', anh: '' } });
    add('triann', 'bdh', F({
      title: 'TRI ÂN CHỦ TỊCH TIỀN NHIỆM', sub: 'Tôn vinh các thế hệ lãnh đạo đặt nền móng và kiến tạo thành công cho CLB', label: 'Tri ân giá trị di sản qua các thời kỳ',
      body: `<div class="cols4">${(fx.chuTichTienNhiem || []).map((p) =>
        card('center', `${avatar(p.anh, 'l')}<h3>${esc(p.ten)}</h3><p>${esc(p.moTa)}</p>`)).join('')}</div>`,
    }));

    // 5. Gia tri cot loi
    const values = [
      [ov('giatri.0.t', 'Xây Dựng Mối Quan Hệ', 'Giá trị 1 · tiêu đề'), ov('giatri.0.d', 'Kết nối sâu sắc, chân thành giữa các chủ doanh nghiệp dựa trên sự tôn trọng, thấu hiểu và chia sẻ giá trị.', 'Giá trị 1 · mô tả', 'area')],
      [ov('giatri.1.t', 'Trao Cơ Hội Kinh Doanh', 'Giá trị 2 · tiêu đề'), ov('giatri.1.d', 'Thúc đẩy giao thương, thiết lập kênh chuyển giao cơ hội thương mại nội bộ thực chất và hiệu quả cao.', 'Giá trị 2 · mô tả', 'area')],
      [ov('giatri.2.t', 'Quảng Bá Thương Hiệu', 'Giá trị 3 · tiêu đề'), ov('giatri.2.d', 'Gia tăng độ nhận diện, hỗ trợ tối đa việc định vị và lan tỏa hình ảnh doanh nghiệp hội viên ra thị trường.', 'Giá trị 3 · mô tả', 'area')],
      [ov('giatri.3.t', 'Cộng Đồng Đáng Tin Cậy', 'Giá trị 4 · tiêu đề'), ov('giatri.3.d', 'Kiến tạo môi trường giao thương lành mạnh, bảo mật thông tin và nâng cao uy tín thương trường.', 'Giá trị 4 · mô tả', 'area')],
      [ov('giatri.4.t', 'Trách Nhiệm Xã Hội', 'Giá trị 5 · tiêu đề'), ov('giatri.4.d', 'Chung tay kiến tạo giá trị nhân văn thông qua các hoạt động phụng sự cộng đồng tại địa bàn Thanh Trì.', 'Giá trị 5 · mô tả', 'area')],
    ];
    add('giatri', null, F({
      title: 'GIÁ TRỊ CỐT LÕI', sub: 'Kim chỉ nam hoạt động thiết lập nền tảng phát triển vững bền', label: 'Giá trị cốt lõi ' + nk.toLowerCase(),
      body: `<div class="cols5">${values.map((v, i) => card('', `<em>0${i + 1}</em><h3>${esc(v[0])}</h3><p>${esc(v[1])}</p>`)).join('')}</div>`,
    }));

    // 6. Loi ich hoi vien
    const perks = [
      [ov('loiich.0.t', 'Gia tăng mạng lưới khách hàng', 'Lợi ích 1 · tiêu đề'), ov('loiich.0.d', 'Mở rộng cơ hội giao thương trực tiếp với hơn 100+ chủ doanh nghiệp chất lượng trong khu vực.', 'Lợi ích 1 · mô tả', 'area')],
      [ov('loiich.1.t', 'Tiếp cận nguồn tài nguyên đa dạng', 'Lợi ích 2 · tiêu đề'), ov('loiich.1.d', 'Kết nối và tối ưu hóa nguồn lực về công nghệ, cố vấn pháp lý và các giải pháp tài chính.', 'Lợi ích 2 · mô tả', 'area')],
      [ov('loiich.2.t', 'Đào tạo & Phát triển năng lực quản trị', 'Lợi ích 3 · tiêu đề'), ov('loiich.2.d', 'Học hỏi kinh nghiệm quản lý, chiến lược vận hành thực chiến từ những chuyên gia đầu ngành.', 'Lợi ích 3 · mô tả', 'area')],
      [ov('loiich.3.t', 'Nâng tầm uy tín thương hiệu', 'Lợi ích 4 · tiêu đề'), ov('loiich.3.d', 'Xây dựng định danh uy tín nhờ nền tảng truyền thông chéo của CLB Doanh nghiệp.', 'Lợi ích 4 · mô tả', 'area')],
    ];
    add('loiich', null, F({
      title: 'LỢI ÍCH HỘI VIÊN', sub: 'Đặc quyền thiết thực đồng hành cùng hành trình phát triển của doanh nghiệp', label: 'Lợi ích hội viên ' + nk.toLowerCase(),
      body: `<div class="split"><div class="stack">${perks.map((p, i) => card('item', `<em>${i + 1}</em><div><h3>${esc(p[0])}</h3><p>${esc(p[1])}</p></div>`)).join('')}</div>
             <div class="photo"><img src="${A}image68.png" alt=""></div></div>`,
    }));

    // 7. Chu de chia se
    const cd = mo.chuDe || {};
    ctl({ scope: 'month', path: 'chuDe.moTa', label: 'Mô tả chủ đề tháng này', type: 'area' });
    note('Tiêu đề chủ đề lấy từ biểu mẫu Diễn giả của Ban Đào tạo. Để đổi tiêu đề, sửa mục diễn giả ở biểu mẫu.', 'daotao');
    add('chude', null, F({
      title: 'CHỦ ĐỀ CHIA SẺ HÔM NAY', sub: 'Chương trình giao lưu - Kết nối trí tuệ, chia sẻ giải pháp vận hành doanh nghiệp', label: 'Tháng ' + m + '/' + y,
      body: `<div class="topic">${card('big center', `<small>CHỦ ĐỀ THÁNG ${m}</small><h1>${nl(cd.tieuDe || 'Chủ đề tháng ' + m + ' sẽ sớm được công bố')}</h1><p>${nl(cd.moTa || 'Nền tảng thảo luận cởi mở giữa các hội viên, chia sẻ kinh nghiệm thực chiến và kiến tạo cơ hội hợp tác đa phương trong giai đoạn mới.')}</p>`)}</div>`,
    }));

    // 8. Dien gia
    const dg = mo.dienGia || {};
    note('Họ tên, chức danh, ảnh, tóm tắt và link bài đào tạo của diễn giả nhập ở biểu mẫu Ban Đào tạo (có nút Sửa).', 'daotao');
    add('diengia', null, F({
      title: 'DIỄN GIẢ', sub: 'Sự kiện kết nối Talkshow hàng tháng', label: 'Talkshow tháng ' + m,
      body: `<div class="speaker">${avatar(dg.anh, 'xl', 'Ảnh diễn giả')}
        ${card('grow', `<h1>${esc(dg.ten || 'Diễn giả sẽ được công bố')}</h1><i>${esc(dg.chucDanh || 'Talkshow hàng tháng - CLB Doanh nghiệp Thanh Trì')}</i><p>${nl(dg.noiDung || 'Thông tin chi tiết về diễn giả và nội dung chia sẻ sẽ được cập nhật trước buổi họp.')}</p>`)}</div>`,
    }));

    fileSlides('chude', cd.files);
    linkSlide('chude-link', dg.link || cd.link, 'Bài đào tạo' + (dg.ten ? ' - ' + dg.ten : ''));

    // 9. Gioi thieu ket nap
    const hv = mo.hoiVienMoi || [];
    ctl({ scope: 'text', path: 'ketnap.intro', label: 'Đoạn giới thiệu', type: 'area', def: nk + ' đánh dấu bước chuyển mình bứt phá với sự tham gia của các chủ doanh nghiệp đầy năng động. Chúng ta cam kết cùng nhau xây dựng một cộng đồng kinh doanh tử tế và thịnh vượng.' });
    ctl({ scope: 'text', path: 'ketnap.1', label: 'Mục 1', def: 'Trao chứng nhận kết nạp chính thức' });
    ctl({ scope: 'text', path: 'ketnap.2', label: 'Mục 2', def: 'Giới thiệu hồ sơ năng lực doanh nghiệp mới' });
    ctl({ scope: 'text', path: 'ketnap.3', label: 'Mục 3', def: 'Khởi động chương trình cố vấn và kết nối giao thương chéo' });
    add('ketnap-0', 'ketnap', F({
      title: 'CHÀO MỪNG HỘI VIÊN MỚI', sub: 'Mở rộng vòng tay kết nối những mảnh ghép bản lĩnh mới', label: 'Phát triển hội viên',
      body: `<div class="split"><div class="stack">
        ${card('', `<p class="lead">${esc(T('ketnap.intro', nk + ' đánh dấu bước chuyển mình bứt phá với sự tham gia của các chủ doanh nghiệp đầy năng động. Chúng ta cam kết cùng nhau xây dựng một cộng đồng kinh doanh tử tế và thịnh vượng.'))}</p>`)}
        ${card('item', `<em>1</em><div><h3>${esc(T('ketnap.1', 'Trao chứng nhận kết nạp chính thức'))}</h3></div>`)}
        ${card('item', `<em>2</em><div><h3>${esc(T('ketnap.2', 'Giới thiệu hồ sơ năng lực doanh nghiệp mới'))}</h3></div>`)}
        ${card('item', `<em>3</em><div><h3>${esc(T('ketnap.3', 'Khởi động chương trình cố vấn và kết nối giao thương chéo'))}</h3></div>`)}</div>
        <div class="photo"><img src="${A}image78.png" alt=""></div></div>`,
    }));
    hv.forEach((p, i) => { note('Thông tin hội viên mới nhập ở biểu mẫu Ban Thành viên, hoặc sửa trong Cài đặt hội viên (có nút Sửa).', 'thanhvien'); add('ketnap-' + (i + 1), 'ketnap', F({
      title: 'CHÀO MỪNG HỘI VIÊN MỚI', sub: 'Giới thiệu nhân sự bản lĩnh gia nhập mái nhà chung CLB Doanh nghiệp Thanh Trì', label: 'Hội viên mới ' + (i + 1) + '/' + hv.length,
      body: `<div class="member"><div class="stack">
        ${card('field', `<small>Họ và tên hội viên</small><b>${esc(p.ten)}</b>`)}
        ${card('field', `<small>Tên doanh nghiệp / Đơn vị</small><b>${esc(p.dn)}</b>`)}
        ${card('field', `<small>Lĩnh vực / Ngành nghề hoạt động</small><b>${esc(p.nganh)}</b>`)}
        ${card('field', `<small>Địa chỉ trụ sở doanh nghiệp</small><b>${esc(p.diaChi)}</b>`)}
        ${card('field', `<small>Triết lý kinh doanh / Câu nói yêu thích</small><b>${esc(p.triLy || '………………………………………………')}</b>`)}</div>
        <div class="who">${avatar(p.anh, 'xl', 'Ảnh hội viên')}<span class="tag">HỘI VIÊN MỚI</span></div></div>`,
    })); });

    // 30s ket noi
    const three = (items) => `<div class="stack">${items.map((t, i) => card('item', `<em>${i + 1}</em><div><h3>${esc(t[0])}</h3><p>${esc(t[1])}</p></div>`)).join('')}</div>`;
    add('30s', null, F({
      title: 'THÀNH VIÊN GIỚI THIỆU', sub: 'Kết nối cơ hội - Khẳng định vị thế bản lĩnh trong CLB', label: '30 giây kết nối',
      body: `<div class="split">${three([
        [ov('s30.0.t', 'Tôi Là Ai', 'Mục 1 · tiêu đề'), ov('s30.0.d', 'Giới thiệu họ tên, chức vụ rõ ràng và thần thái tự tin.', 'Mục 1 · mô tả', 'area')],
        [ov('s30.1.t', 'Tôi Làm Gì', 'Mục 2 · tiêu đề'), ov('s30.1.d', 'Mô tả ngắn gọn về sản phẩm, dịch vụ cốt lõi của doanh nghiệp.', 'Mục 2 · mô tả', 'area')],
        [ov('s30.2.t', 'Tôi Muốn Kết Nối Với Ai', 'Mục 3 · tiêu đề'), ov('s30.2.d', 'Định vị chính xác khách hàng mục tiêu & đối tác chiến lược.', 'Mục 3 · mô tả', 'area')]])}
        <div class="photo"><img src="${A}image101.jpg" alt=""></div></div>`,
    }));

    // Khach moi
    const km = mo.khachMoi || [];
    ctl({ scope: 'month', path: 'khachMoi', type: 'list', label: 'Danh sách khách mời tháng này', item: [{ p: 'ten', label: 'Họ tên khách' },
      { p: 'dn', label: 'Doanh nghiệp' }, { p: 'nguoiMoi', label: 'Người mời' }], blank: { ten: '', dn: '', nguoiMoi: '' } });
    add('khachmoi', null, F({
      title: 'KHÁCH MỜI GIỚI THIỆU', sub: 'Đón chào những đối tác và cơ hội hợp tác mới', label: 'Kết nối đa chiều',
      body: `<div class="split">${km.length
        ? `<div class="stack">${card('', `<table class="tbl"><tr><th>Khách mời</th><th>Doanh nghiệp</th><th>Người mời</th></tr>${km.map((k) =>
            `<tr><td>${esc(k.ten)}</td><td>${esc(k.dn)}</td><td>${esc(k.nguoiMoi)}</td></tr>`).join('')}</table>`)}</div>`
        : three([
          [ov('km.0.t', 'Tôi Là Ai', 'Mục mặc định 1 · tiêu đề'), ov('km.0.d', 'Danh tính và vị trí lãnh đạo tại doanh nghiệp.', 'Mục mặc định 1 · mô tả', 'area')],
          [ov('km.1.t', 'Tôi Làm Gì', 'Mục mặc định 2 · tiêu đề'), ov('km.1.d', 'Ngành nghề và thế mạnh sản phẩm đang cung cấp.', 'Mục mặc định 2 · mô tả', 'area')],
          [ov('km.2.t', 'Tôi Muốn Kết Nối Với Ai', 'Mục mặc định 3 · tiêu đề'), ov('km.2.d', 'Mong muốn hợp tác đầu tư tại Thanh Trì.', 'Mục mặc định 3 · mô tả', 'area')],
          [ov('km.3.t', 'Tôi Được Ai Mời', 'Mục mặc định 4 · tiêu đề'), ov('km.3.d', 'Trân trọng tri ân thành viên đã kết nối cầu nối.', 'Mục mặc định 4 · mô tả', 'area')]])}
        <div class="photo"><img src="${A}image110.png" alt=""></div></div>`,
    }));

    // Showcase
    const sc = mo.showcase || {};
    note('Họ tên, doanh nghiệp, ảnh, nội dung 3 mục và link bài giới thiệu nhập ở biểu mẫu Ban Đào tạo (Người làm Showcase).', 'daotao');
    const scItems = [['Giới thiệu tổng quan - Triết lý kinh doanh', sc.gioiThieu], ['Sản phẩm dịch vụ - Lợi thế cạnh tranh', sc.sanPham], ['Chân dung khách hàng mục tiêu - Chương trình bán hàng', sc.khachHang]];
    add('showcase', null, F({
      title: 'SHOWCASE DOANH NGHIỆP', sub: 'Tiêu điểm giới thiệu năng lực vượt trội của hội viên', label: 'Doanh nghiệp tháng ' + m,
      body: `<div class="showcase"><div class="who">${avatar(sc.anh, 'xl', 'Ảnh đại diện')}
        <b>${esc(sc.ten || 'DOANH NGHIỆP SHOWCASE SẼ ĐƯỢC CÔNG BỐ')}</b><i>${esc(sc.dn)}</i></div>
        <div class="stack">${scItems.map((t, i) => card('item', `<em>${i + 1}</em><div><h3>${esc(t[0])}</h3><p>${nl(t[1] || 'Nội dung sẽ được cập nhật trước buổi họp.')}</p></div>`)).join('')}</div></div>`,
    }));

    fileSlides('showcase', sc.files);
    linkSlide('showcase-link', sc.link, 'Giới thiệu doanh nghiệp' + (sc.dn ? ' - ' + sc.dn : ''));

    // Trao co hoi
    const ch = mo.coHoi || {};
    ctl({ scope: 'month', path: 'coHoi.referral', label: 'Trao Referral (mô tả)', type: 'area' });
    ctl({ scope: 'month', path: 'coHoi.closed', label: 'Closed Business (mô tả)', type: 'area' });
    ctl({ scope: 'text', path: 'cohoi.3', label: 'Mục 3 · mô tả', type: 'area', def: 'Thiết lập các liên minh kinh doanh đa ngành vững chắc.' });
    add('cohoi', 'cohoi', F({
      title: 'TRAO CƠ HỘI KINH DOANH', sub: 'Đẩy mạnh giao thương, gia tăng doanh số thực tế giữa các hội viên', label: 'Kết nối trao cơ hội',
      body: `<div class="split">${three([
        ['Trao Referral', ch.referral || 'Chuyển giao cơ hội thương mại thực chất cho hội viên cùng ngành nghề.'],
        ['Closed Business', ch.closed || 'Ghi nhận giá trị doanh thu thực tế đóng góp tích cực cho CLB.'],
        ['Gia tăng hợp tác', T('cohoi.3', 'Thiết lập các liên minh kinh doanh đa ngành vững chắc.')]])}
        <div class="photo flat"><img src="${A}image121.jpg" alt=""></div></div>`,
    }));

    // Bao cao thu ky
    const tk = mo.thuKy || {};
    ctl({ scope: 'month', path: 'thuKy.vanHanh', label: 'Vận hành Ban Thư ký', type: 'area' });
    ctl({ scope: 'month', path: 'thuKy.chiSo', label: 'Chỉ số kết nối & sự kiện', type: 'area' });
    add('thuky', null, F({
      title: 'BÁO CÁO TỔNG THƯ KÝ', sub: 'Tổng hợp chỉ số sinh hoạt và vận hành CLB định kỳ', label: 'Báo cáo vận hành - Ban Thư ký',
      body: `<div class="cols2">${card('', `<h3>VẬN HÀNH BAN THƯ KÝ</h3><p>${nl(tk.vanHanh || 'Ban Thư ký duy trì vai trò quản lý hành chính, cập nhật danh sách hội viên chính thức, hỗ trợ Ban điều hành ghi biên bản và điều phối các công tác chung.')}</p>`)}
        ${card('', `<h3>CHỈ SỐ KẾT NỐI & SỰ KIỆN</h3><p>${nl(tk.chiSo || 'Ban Thư ký sẽ báo cáo tỷ lệ tham gia họp, số referral và closed business trong tháng tại buổi họp.')}</p>`)}</div>`,
    }));

    // Tai chinh (thang truoc thang hop)
    const tc = mo.taiChinh || {};
    note('Số liệu thu chi nhập ở biểu mẫu Ban Tài chính (có nút Sửa ở các mục đã nhập).', 'taichinh');
    const pad2 = (n) => String(n).padStart(2, '0');
    const pm = m === 1 ? 12 : m - 1, py = m === 1 ? y - 1 : y, pLast = new Date(py, pm, 0).getDate();
    const sum = (a) => (a || []).reduce((t, x) => t + (Number(x.so) || 0), 0);
    const thu = sum(tc.thu), chi = sum(tc.chi), dau = Number(tc.dauKy) || 0, cuoi = dau + thu - chi;
    const rows = (a, c) => (a || []).map((x) => `<tr><td>${esc(x.ten)}${x.ghiChu ? `<small>${esc(x.ghiChu)}</small>` : ''}</td><td class="${c}">${c === 'g' ? '+' : '-'}${money(x.so)}</td></tr>`).join('');
    add('taichinh', null, F({
      title: 'BÁO CÁO TÀI CHÍNH - THÁNG ' + pad2(pm) + '/' + py,
      sub: 'Kỳ báo cáo: 01/' + pad2(pm) + '/' + py + ' - ' + pLast + '/' + pad2(pm) + '/' + py,
      label: 'Báo cáo thu chi tháng ' + pm + '/' + py,
      body: `<div class="kpis"><div><small>SỐ DƯ ĐẦU KỲ</small><b>${money(dau)}</b></div>
        <div class="g"><small>TỔNG THU</small><b>+${money(thu)}</b></div><div class="r"><small>TỔNG CHI</small><b>-${money(chi)}</b></div>
        <div class="dk"><small>QUỸ CUỐI KỲ</small><b>${money(cuoi)}</b></div></div>
        <div class="cols2 fin">${card('gg', `<h3>CHI TIẾT NGUỒN THU (+${money(thu)})</h3><table>${rows(tc.thu, 'g')}</table>`)}
        ${card('rr', `<h3>CHI TIẾT HOẠT ĐỘNG CHI (-${money(chi)})</h3><table>${rows(tc.chi, 'r')}</table>`)}</div>
        ${tc.ghiChu ? `<p class="note">${nl(tc.ghiChu)}</p>` : ''}`,
    }));

    // Su kien trong diem
    ctl({ scope: 'fixed', path: 'suKien', type: 'list', label: 'Sự kiện trọng điểm (danh sách mặc định)', item: [{ p: 'ten', label: 'Tên sự kiện' },
      { p: 'moTa', label: 'Mô tả', type: 'area' }], blank: { ten: '', moTa: '' } });
    note('Khi Ban Truyền thông nhập sự kiện ở biểu mẫu, các sự kiện đó sẽ thay thế danh sách mặc định này.', 'truyenthong');
    add('sukien', null, F({
      title: 'SỰ KIỆN TRỌNG ĐIỂM', sub: 'Lịch trình hoạt động kết nối, đào tạo và giao thương sắp tới', label: 'Lịch trình hoạt động ' + nk.toLowerCase(),
      body: `<div class="cols3">${(fx.suKien || []).map((e, i) => card('center', `<em class="big">${i + 1}</em><h3>${esc(e.ten)}</h3><p>${esc(e.moTa)}</p>`)).join('')}</div>`,
    }));

    // Boc tham
    const bt = mo.bocTham || {};
    ctl({ scope: 'month', path: 'bocTham.giaiThuong', label: 'Giải thưởng bốc thăm', type: 'area' });
    ctl({ scope: 'month', path: 'bocTham.danhSach', label: 'Danh sách người tham dự (mỗi dòng 1 tên)', type: 'area' });
    add('boctham', 'boctham', F({
      title: 'BỐC THĂM TRÚNG THƯỞNG', sub: 'Hoạt động tri ân hội viên', label: 'Bốc thăm trúng thưởng',
      body: `<div class="draw"><div class="prize">${esc(bt.giaiThuong || 'Phần quà bốc thăm may mắn')}</div>
        <div class="winner" id="winner">?</div>
        <button class="btn" id="drawBtn" type="button">BỐC THĂM (phím B)</button>
        <div class="drawn" id="drawn"></div></div>`,
    }));

    // Cam on
    const thxT = ov('camon.t', 'CẢM ƠN QUÝ DOANH NHÂN', 'Tiêu đề lời cảm ơn');
    const thxP = ov('camon.p', 'Sự hiện diện của toàn thể Quý Doanh nhân thành viên và Quý Khách mời là nguồn động lực to lớn giúp CLB Doanh nghiệp Thanh Trì ngày càng vững mạnh!', 'Lời cảm ơn', 'area');
    add('camon', 'ketthuc', F({
      title: 'TRÂN TRỌNG CẢM ƠN', sub: nk + ' - Hành trình bứt phá', label: 'Kết nối giao thương - Hợp tác cùng phát triển',
      body: `<div class="thanks">${card('big center', `<h1>${esc(thxT)}</h1><p>${esc(thxP)}</p>`)}</div>`,
    }));

    return slides;
  }

  window.CLB = { build, monthKey, parseKey, sessionNumber, esc, embedUrl };
})();

// Bam chuot trai vao nguoi trong slide Ban dieu hanh -> hien the nhiem vu phong to giua man hinh; bam ra ngoai the thi dong
(function () {
  if (typeof document === 'undefined' || window.__dutyWired) return;
  window.__dutyWired = true;
  let cur = null;
  function close() {
    if (!cur) return;
    cur.classList.remove('on'); cur.querySelectorAll('.dbig.on').forEach((c) => c.classList.remove('on'));
    cur = null;
  }
  function open(pc) {
    const slide = pc.closest('.slide'), pop = slide && slide.querySelector('.dpop');
    if (!pop) return;
    const role = pc.getAttribute('data-p');
    const big = [...pop.querySelectorAll('.dbig')].find((c) => c.getAttribute('data-p') === role);
    if (!big) return;
    pop.querySelectorAll('.dbig.on').forEach((c) => c.classList.remove('on'));
    big.classList.add('on'); pop.classList.add('on');
    cur = pop;
  }
  const SEL = '.slide.on .pcard[data-p]';
  document.addEventListener('click', (e) => {
    if (cur && !document.contains(cur)) cur = null; // slide vua ve lai: bo trang thai cu
    const t = e.target;
    if (cur) { if (!(t.closest && t.closest('.dbig.on'))) close(); return; }
    const pc = t.closest && t.closest(SEL);
    if (pc) open(pc);
  });
  document.addEventListener('keydown', () => { if (cur) close(); }, true);
})();
