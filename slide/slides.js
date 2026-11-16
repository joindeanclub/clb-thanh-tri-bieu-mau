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
  const avatar = (src, size, ph) => src
    ? `<span class="av ${size || 'm'}"><img src="${esc(src)}" alt=""></span>`
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
    const add = (id, music, html) => slides.push({ id, music, html });
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

    // 2. Ban dieu hanh
    const bdh = fx.bdh || [];
    const TOP = ['PHÓ CHỦ TỊCH', 'CHỦ TỊCH', 'TỔNG THƯ KÝ'];
    const top = TOP.map((r) => bdh.find((p) => p.vaiTro === r)).filter(Boolean);
    const rest = bdh.filter((p) => !top.includes(p));
    const pcard = (p, big) => `<div class="pcard ${big ? 'lead' : ''}">${avatar(p.anh, big ? 'l' : 'm')}<b>${esc(p.ten)}</b><i>${esc(p.vaiTro)}</i></div>`;
    add('bdh', 'bdh', F({
      title: 'BAN ĐIỀU HÀNH ' + nk.toUpperCase(), sub: 'Đội ngũ lãnh đạo bản lĩnh, kiến tạo cơ hội phát triển bền vững cho CLB',
      label: 'Cơ cấu tổ chức ' + nk,
      body: `<div class="org"><div class="row top">${top.map((p) => pcard(p, p.vaiTro === 'CHỦ TỊCH')).join('')}</div>
             <div class="row sub">${rest.map((p) => pcard(p)).join('')}</div></div>`,
    }));

    // 3. Lich su
    const hist = [
      ['KẾT NỐI', 'image38.png', 'Tạo mạng lưới liên kết bền vững. Gom nguồn lực nhỏ thành sức mạnh lớn. Phá vỡ khoảng cách giữa các doanh nghiệp.'],
      ['HỖ TRỢ', 'image39.png', 'Đồng hành, chia sẻ và đỡ đầu. Giúp nhau vượt qua thách thức thị trường. Chia sẻ kinh nghiệm và công nghệ.'],
      ['PHÁT TRIỂN', 'image40.png', 'Đột phá doanh thu, nâng tầm vị thế. Cùng nhau vươn xa, đóng góp kinh tế cho quê hương Thanh Trì.'],
    ];
    add('lichsu', 'bdh', F({
      title: 'LỊCH SỬ HÌNH THÀNH VÀ PHÁT TRIỂN', sub: 'Thành lập từ 2022', label: 'Ba sứ mệnh của CLB',
      body: `<div class="quote">“Muốn đi nhanh hãy đi một mình, muốn đi xa hãy đi cùng nhau.”<span>Ba sứ mệnh này là bệ phóng đưa doanh nghiệp địa phương cất cánh.</span></div>
        <div class="cols3">${hist.map((h) => card('center', `<img class="illus" src="${A}${h[1]}" alt=""><h3>${h[0]}</h3><p>${esc(h[2])}</p>`)).join('')}</div>`,
    }));

    // 4. Tri an chu tich tien nhiem
    add('triann', 'bdh', F({
      title: 'TRI ÂN CHỦ TỊCH TIỀN NHIỆM', sub: 'Tôn vinh các thế hệ lãnh đạo đặt nền móng và kiến tạo thành công cho CLB', label: 'Tri ân giá trị di sản qua các thời kỳ',
      body: `<div class="cols4">${(fx.chuTichTienNhiem || []).map((p) =>
        card('center', `${avatar(p.anh, 'l')}<h3>${esc(p.ten)}</h3><p>${esc(p.moTa)}</p>`)).join('')}</div>`,
    }));

    // 5. Gia tri cot loi
    const values = [
      ['Xây Dựng Mối Quan Hệ', 'Kết nối sâu sắc, chân thành giữa các chủ doanh nghiệp dựa trên sự tôn trọng, thấu hiểu và chia sẻ giá trị.'],
      ['Trao Cơ Hội Kinh Doanh', 'Thúc đẩy giao thương, thiết lập kênh chuyển giao cơ hội thương mại nội bộ thực chất và hiệu quả cao.'],
      ['Quảng Bá Thương Hiệu', 'Gia tăng độ nhận diện, hỗ trợ tối đa việc định vị và lan tỏa hình ảnh doanh nghiệp hội viên ra thị trường.'],
      ['Cộng Đồng Đáng Tin Cậy', 'Kiến tạo môi trường giao thương lành mạnh, bảo mật thông tin và nâng cao uy tín thương trường.'],
      ['Trách Nhiệm Xã Hội', 'Chung tay kiến tạo giá trị nhân văn thông qua các hoạt động phụng sự cộng đồng tại địa bàn Thanh Trì.'],
    ];
    add('giatri', null, F({
      title: 'GIÁ TRỊ CỐT LÕI', sub: 'Kim chỉ nam hoạt động thiết lập nền tảng phát triển vững bền', label: 'Giá trị cốt lõi ' + nk.toLowerCase(),
      body: `<div class="cols5">${values.map((v, i) => card('', `<em>0${i + 1}</em><h3>${esc(v[0])}</h3><p>${esc(v[1])}</p>`)).join('')}</div>`,
    }));

    // 6. Loi ich hoi vien
    const perks = [
      ['Gia tăng mạng lưới khách hàng', 'Mở rộng cơ hội giao thương trực tiếp với hơn 100+ chủ doanh nghiệp chất lượng trong khu vực.'],
      ['Tiếp cận nguồn tài nguyên đa dạng', 'Kết nối và tối ưu hóa nguồn lực về công nghệ, cố vấn pháp lý và các giải pháp tài chính.'],
      ['Đào tạo & Phát triển năng lực quản trị', 'Học hỏi kinh nghiệm quản lý, chiến lược vận hành thực chiến từ những chuyên gia đầu ngành.'],
      ['Nâng tầm uy tín thương hiệu', 'Xây dựng định danh uy tín nhờ nền tảng truyền thông chéo của CLB Doanh nghiệp.'],
    ];
    add('loiich', null, F({
      title: 'LỢI ÍCH HỘI VIÊN', sub: 'Đặc quyền thiết thực đồng hành cùng hành trình phát triển của doanh nghiệp', label: 'Lợi ích hội viên ' + nk.toLowerCase(),
      body: `<div class="split"><div class="stack">${perks.map((p, i) => card('item', `<em>${i + 1}</em><div><h3>${esc(p[0])}</h3><p>${esc(p[1])}</p></div>`)).join('')}</div>
             <div class="photo"><img src="${A}image68.png" alt=""></div></div>`,
    }));

    // 7. Chu de chia se
    const cd = mo.chuDe || {};
    add('chude', null, F({
      title: 'CHỦ ĐỀ CHIA SẺ HÔM NAY', sub: 'Chương trình giao lưu - Kết nối trí tuệ, chia sẻ giải pháp vận hành doanh nghiệp', label: 'Tháng ' + m + '/' + y,
      body: `<div class="topic">${card('big center', `<small>CHỦ ĐỀ THÁNG ${m}</small><h1>${nl(cd.tieuDe || 'Chủ đề tháng ' + m + ' sẽ sớm được công bố')}</h1><p>${nl(cd.moTa || 'Nền tảng thảo luận cởi mở giữa các hội viên, chia sẻ kinh nghiệm thực chiến và kiến tạo cơ hội hợp tác đa phương trong giai đoạn mới.')}</p>`)}</div>`,
    }));

    // 8. Dien gia
    const dg = mo.dienGia || {};
    add('diengia', null, F({
      title: 'DIỄN GIẢ', sub: 'Sự kiện kết nối Talkshow hàng tháng', label: 'Talkshow tháng ' + m,
      body: `<div class="speaker">${avatar(dg.anh, 'xl', 'Ảnh diễn giả')}
        ${card('grow', `<h1>${esc(dg.ten || 'Diễn giả sẽ được công bố')}</h1><i>${esc(dg.chucDanh || 'Talkshow hàng tháng - CLB Doanh nghiệp Thanh Trì')}</i><p>${nl(dg.noiDung || 'Thông tin chi tiết về diễn giả và nội dung chia sẻ sẽ được cập nhật trước buổi họp.')}</p>`)}</div>`,
    }));

    fileSlides('chude', cd.files);
    linkSlide('chude-link', dg.link || cd.link, 'Bài đào tạo' + (dg.ten ? ' - ' + dg.ten : ''));

    // 9. Gioi thieu ket nap
    const hv = mo.hoiVienMoi || [];
    add('ketnap-0', 'ketnap', F({
      title: 'CHÀO MỪNG HỘI VIÊN MỚI', sub: 'Mở rộng vòng tay kết nối những mảnh ghép bản lĩnh mới', label: 'Phát triển hội viên',
      body: `<div class="split"><div class="stack">
        ${card('', `<p class="lead">${esc(nk)} đánh dấu bước chuyển mình bứt phá với sự tham gia của các chủ doanh nghiệp đầy năng động. Chúng ta cam kết cùng nhau xây dựng một cộng đồng kinh doanh tử tế và thịnh vượng.</p>`)}
        ${card('item', `<em>1</em><div><h3>Trao chứng nhận kết nạp chính thức</h3></div>`)}
        ${card('item', `<em>2</em><div><h3>Giới thiệu hồ sơ năng lực doanh nghiệp mới</h3></div>`)}
        ${card('item', `<em>3</em><div><h3>Khởi động chương trình cố vấn và kết nối giao thương chéo</h3></div>`)}</div>
        <div class="photo"><img src="${A}image78.png" alt=""></div></div>`,
    }));
    hv.forEach((p, i) => add('ketnap-' + (i + 1), 'ketnap', F({
      title: 'CHÀO MỪNG HỘI VIÊN MỚI', sub: 'Giới thiệu nhân sự bản lĩnh gia nhập mái nhà chung CLB Doanh nghiệp Thanh Trì', label: 'Hội viên mới ' + (i + 1) + '/' + hv.length,
      body: `<div class="member"><div class="stack">
        ${card('field', `<small>Họ và tên hội viên</small><b>${esc(p.ten)}</b>`)}
        ${card('field', `<small>Tên doanh nghiệp / Đơn vị</small><b>${esc(p.dn)}</b>`)}
        ${card('field', `<small>Lĩnh vực / Ngành nghề hoạt động</small><b>${esc(p.nganh)}</b>`)}
        ${card('field', `<small>Địa chỉ trụ sở doanh nghiệp</small><b>${esc(p.diaChi)}</b>`)}
        ${card('field', `<small>Triết lý kinh doanh / Câu nói yêu thích</small><b>${esc(p.triLy || '………………………………………………')}</b>`)}</div>
        <div class="who">${avatar(p.anh, 'xl', 'Ảnh hội viên')}<span class="tag">HỘI VIÊN MỚI</span></div></div>`,
    })));

    // 30s ket noi
    const three = (items) => `<div class="stack">${items.map((t, i) => card('item', `<em>${i + 1}</em><div><h3>${esc(t[0])}</h3><p>${esc(t[1])}</p></div>`)).join('')}</div>`;
    add('30s', null, F({
      title: 'THÀNH VIÊN GIỚI THIỆU', sub: 'Kết nối cơ hội - Khẳng định vị thế bản lĩnh trong CLB', label: '30 giây kết nối',
      body: `<div class="split">${three([
        ['Tôi Là Ai', 'Giới thiệu họ tên, chức vụ rõ ràng và thần thái tự tin.'],
        ['Tôi Làm Gì', 'Mô tả ngắn gọn về sản phẩm, dịch vụ cốt lõi của doanh nghiệp.'],
        ['Tôi Muốn Kết Nối Với Ai', 'Định vị chính xác khách hàng mục tiêu & đối tác chiến lược.']])}
        <div class="photo"><img src="${A}image101.jpg" alt=""></div></div>`,
    }));

    // Khach moi
    const km = mo.khachMoi || [];
    add('khachmoi', null, F({
      title: 'KHÁCH MỜI GIỚI THIỆU', sub: 'Đón chào những đối tác và cơ hội hợp tác mới', label: 'Kết nối đa chiều',
      body: `<div class="split">${km.length
        ? `<div class="stack">${card('', `<table class="tbl"><tr><th>Khách mời</th><th>Doanh nghiệp</th><th>Người mời</th></tr>${km.map((k) =>
            `<tr><td>${esc(k.ten)}</td><td>${esc(k.dn)}</td><td>${esc(k.nguoiMoi)}</td></tr>`).join('')}</table>`)}</div>`
        : three([
          ['Tôi Là Ai', 'Danh tính và vị trí lãnh đạo tại doanh nghiệp.'],
          ['Tôi Làm Gì', 'Ngành nghề và thế mạnh sản phẩm đang cung cấp.'],
          ['Tôi Muốn Kết Nối Với Ai', 'Mong muốn hợp tác đầu tư tại Thanh Trì.'],
          ['Tôi Được Ai Mời', 'Trân trọng tri ân thành viên đã kết nối cầu nối.']])}
        <div class="photo"><img src="${A}image110.png" alt=""></div></div>`,
    }));

    // Showcase
    const sc = mo.showcase || {};
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
    add('cohoi', 'cohoi', F({
      title: 'TRAO CƠ HỘI KINH DOANH', sub: 'Đẩy mạnh giao thương, gia tăng doanh số thực tế giữa các hội viên', label: 'Kết nối trao cơ hội',
      body: `<div class="split">${three([
        ['Trao Referral', ch.referral || 'Chuyển giao cơ hội thương mại thực chất cho hội viên cùng ngành nghề.'],
        ['Closed Business', ch.closed || 'Ghi nhận giá trị doanh thu thực tế đóng góp tích cực cho CLB.'],
        ['Gia tăng hợp tác', 'Thiết lập các liên minh kinh doanh đa ngành vững chắc.']])}
        <div class="photo flat"><img src="${A}image121.jpg" alt=""></div></div>`,
    }));

    // Bao cao thu ky
    const tk = mo.thuKy || {};
    add('thuky', null, F({
      title: 'BÁO CÁO TỔNG THƯ KÝ', sub: 'Tổng hợp chỉ số sinh hoạt và vận hành CLB định kỳ', label: 'Báo cáo vận hành - Ban Thư ký',
      body: `<div class="cols2">${card('', `<h3>VẬN HÀNH BAN THƯ KÝ</h3><p>${nl(tk.vanHanh || 'Ban Thư ký duy trì vai trò quản lý hành chính, cập nhật danh sách hội viên chính thức, hỗ trợ Ban điều hành ghi biên bản và điều phối các công tác chung.')}</p>`)}
        ${card('', `<h3>CHỈ SỐ KẾT NỐI & SỰ KIỆN</h3><p>${nl(tk.chiSo || 'Ban Thư ký sẽ báo cáo tỷ lệ tham gia họp, số referral và closed business trong tháng tại buổi họp.')}</p>`)}</div>`,
    }));

    // Tai chinh (thang truoc thang hop)
    const tc = mo.taiChinh || {};
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
    add('sukien', null, F({
      title: 'SỰ KIỆN TRỌNG ĐIỂM', sub: 'Lịch trình hoạt động kết nối, đào tạo và giao thương sắp tới', label: 'Lịch trình hoạt động ' + nk.toLowerCase(),
      body: `<div class="cols3">${(fx.suKien || []).map((e, i) => card('center', `<em class="big">${i + 1}</em><h3>${esc(e.ten)}</h3><p>${esc(e.moTa)}</p>`)).join('')}</div>`,
    }));

    // Boc tham
    const bt = mo.bocTham || {};
    add('boctham', 'boctham', F({
      title: 'BỐC THĂM TRÚNG THƯỞNG', sub: 'Hoạt động tri ân hội viên', label: 'Bốc thăm trúng thưởng',
      body: `<div class="draw"><div class="prize">${esc(bt.giaiThuong || 'Phần quà bốc thăm may mắn')}</div>
        <div class="winner" id="winner">?</div>
        <button class="btn" id="drawBtn" type="button">BỐC THĂM (phím B)</button>
        <div class="drawn" id="drawn"></div></div>`,
    }));

    // Cam on
    add('camon', 'ketthuc', F({
      title: 'TRÂN TRỌNG CẢM ƠN', sub: nk + ' - Hành trình bứt phá', label: 'Kết nối giao thương - Hợp tác cùng phát triển',
      body: `<div class="thanks">${card('big center', `<h1>CẢM ƠN QUÝ DOANH NHÂN</h1><p>Sự hiện diện của toàn thể Quý Doanh nhân thành viên và Quý Khách mời là nguồn động lực to lớn giúp CLB Doanh nghiệp Thanh Trì ngày càng vững mạnh!</p>`)}</div>`,
    }));

    return slides;
  }

  window.CLB = { build, monthKey, parseKey, sessionNumber, esc, embedUrl };
})();
