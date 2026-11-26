/* Fábrica de Convites · motor dos convites interativos
   Cada convite define window.CONVITE antes de carregar este arquivo. */
(function () {
  const C = window.CONVITE;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  if (C.tema) for (const [k, v] of Object.entries(C.tema)) document.documentElement.style.setProperty('--' + k, v);
  document.title = C.titulo || document.title;

  const ICONES = {
    mapa: '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><path d="M9.6 9.6c0-1.3 1-2.1 2.4-.9 1.4-1.2 2.4-.4 2.4.9 0 1.5-2.4 3-2.4 3s-2.4-1.5-2.4-3z"/></svg>',
    presentes: '<svg viewBox="0 0 24 24"><rect x="3.5" y="9" width="17" height="11.5" rx="1"/><path d="M2.5 6.5h19V9h-19zM12 6.5v14"/><path d="M12 6.5C10 3 7 3.5 7.6 5.4 8 6.6 12 6.5 12 6.5zM12 6.5c2-3.5 5-3 4.4-1.1-.4 1.2-4.4 1.1-4.4 1.1z"/></svg>',
    rsvp: '<svg viewBox="0 0 24 24"><circle cx="9.5" cy="8" r="3.5"/><path d="M3 20c0-3.6 2.9-6.5 6.5-6.5 1.4 0 2.6.4 3.6 1.1"/><path d="M14.5 17.5l2.2 2.2 4.3-4.6"/></svg>',
    traje: '<svg viewBox="0 0 24 24"><path d="M8 3l-4 3 1.5 4L7 9v12h4V9.5L8 3zM16 3l4 3-1.5 4L17 9v12h-4V9.5L16 3z"/><path d="M8 3l4 4 4-4"/></svg>',
    manual: '<svg viewBox="0 0 24 24"><circle cx="9" cy="14" r="5"/><circle cx="15.5" cy="14" r="5"/><path d="M13.5 5.5l2-2 2 2-2 2.2z"/></svg>',
    historia: '<svg viewBox="0 0 24 24"><path d="M4 5.5C6.5 4 9.5 4 12 5.5v14c-2.5-1.5-5.5-1.5-8 0zM20 5.5C17.5 4 14.5 4 12 5.5v14c2.5-1.5 5.5-1.5 8 0z"/></svg>',
    agenda: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M9.5 15l2 2 3.5-4"/></svg>'
  };

  // ---------- montagem ----------
  const palco = $('.palco');
  const livro = el('div', 'livro');
  palco.appendChild(livro);

  const paginas = C.paginas.map((p, i) => {
    const trans = p.transicao || C.transicao || 'livro';
    const pg = el('section', 'pagina t-' + trans + ' ' + (p.classe || ''));
    if (p.cor) pg.style.background = p.cor;
    if (p.fundo) {
      const bg = el('div', 'bg kb-' + (p.kb || ['in', 'esq', 'out', 'dir'][i % 4]));
      bg.style.backgroundImage = `url(${p.fundo})`;
      pg.appendChild(bg);
    }
    pg.style.zIndex = C.paginas.length - i;
    if (p.veu) { const v = el('div', 'veu'); v.style.background = p.veu; pg.appendChild(v); }
    let html = p.html
      .replace('{{icones}}', iconesHTML())
      .replace('{{contagem}}', '<div class="contagem entra"><div><strong data-c="d">0</strong><span>dias</span></div><div><strong data-c="h">0</strong><span>horas</span></div><div><strong data-c="m">0</strong><span>min</span></div><div><strong data-c="s">0</strong><span>seg</span></div></div>');
    const ct = el('div', 'conteudo', html);
    if (p.justifica) { pg.style.justifyContent = p.justifica; }
    pg.appendChild(ct);
    ct.querySelectorAll('.foto-baixa, .fim-foto').forEach(f => pg.insertBefore(f, ct));
    // letras que entram uma a uma
    ct.querySelectorAll('.a-letras').forEach(n => {
      let k = 0;
      const parte = node => [...node.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(pal => {
            if (!pal) return;
            if (/^\s+$/.test(pal)) { frag.appendChild(document.createTextNode(' ')); k++; return; }
            const w = el('span', 'palavra');
            [...pal].forEach(ch => {
              const sp = el('span', 'letra', ch);
              sp.style.transitionDelay = (0.35 + k++ * 0.06) + 's';
              w.appendChild(sp);
            });
            frag.appendChild(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1) parte(c);
      });
      parte(n);
    });
    if (i < C.paginas.length - 1) pg.appendChild(trans === 'livro'
      ? el('div', 'canto', '<span>puxe aqui</span>')
      : el('div', 'seta', '<span>deslize</span><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>'));
    else pg.classList.add('ultima');
    livro.appendChild(pg);
    return pg;
  });

  function iconesHTML() {
    return '<div class="icones">' + C.icones.map(ic =>
      `<button class="icone" data-folha="${ic.id}"><b>${ICONES[ic.svg || ic.id] || ''}</b>${ic.rotulo}</button>`).join('') + '</div>';
  }

  const pontos = el('div', 'pontos', paginas.map(() => '<i></i>').join(''));
  palco.appendChild(pontos);

  // música
  let audio = null;
  const btnMusica = el('button', 'musica', '<span class="barras"><i></i><i></i><i></i></span>');
  btnMusica.setAttribute('aria-label', 'Ligar ou desligar a música');
  if (C.musica) {
    audio = new Audio(); audio.preload = 'none'; audio.loop = true; audio.volume = .55; audio.src = C.musica; // só baixa quando a pessoa toca no lacre
    palco.appendChild(btnMusica);
    btnMusica.addEventListener('click', e => {
      e.stopPropagation();
      if (audio.paused) { audio.play(); btnMusica.classList.remove('parada'); }
      else { audio.pause(); btnMusica.classList.add('parada'); }
    });
  }

  if (C.demo) palco.appendChild(el('div', 'selo-demo', C.demo));

  // ---------- abertura ----------
  const ab = el('div', 'abertura' + (C.abertura.tipo ? ' ' + C.abertura.tipo : ''));
  if (C.abertura.fundo) ab.style.backgroundImage = `url(${C.abertura.fundo})`;
  if (C.abertura.aba) ab.style.setProperty('--papel-aba', C.abertura.aba);
  if (C.abertura.texturaAba) ab.style.setProperty('--textura-aba', `url(${C.abertura.texturaAba})`);
  if (C.abertura.bolso) ab.style.setProperty('--papel-bolso', C.abertura.bolso);
  if (C.abertura.tipo === 'sol' && C.abertura.video) {
    ab.classList.add('com-video');
    ab.style.setProperty('--sx', (C.abertura.solX ?? 50) + '%'); ab.style.setProperty('--sy', (C.abertura.solY ?? 40) + '%');
    ab.innerHTML = `<video class="video-fundo" src="${C.abertura.video}" poster="${C.abertura.poster || ''}" muted autoplay loop playsinline preload="auto"></video>
    <div class="sol-topo">${C.abertura.topo || ''}</div>
    <button class="lacre" aria-label="Abrir o convite"><i></i><i></i></button>
    <div class="etiqueta">${C.abertura.etiqueta || 'toque no sol'}</div><div class="clarao"></div>`;
  } else if (C.abertura.tipo === 'sol') ab.innerHTML = `<div class="ceu"></div><div class="mar"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="sol-topo">${C.abertura.topo || ''}</div>
    <div class="horizonte"><button class="lacre" aria-label="Abrir o convite"></button></div>
    <div class="etiqueta">${C.abertura.etiqueta || 'toque no sol'}</div><div class="clarao"></div>`;
  else ab.innerHTML = `<div class="sombra-bolso"><div class="bolso"></div></div><div class="aba"></div>
    <button class="lacre" aria-label="Abrir o convite"><span>${C.iniciais}</span></button>
    <div class="etiqueta">${C.abertura.etiqueta || 'toque aqui'}</div>
    <svg class="mao" viewBox="0 0 24 24" fill="#fff" stroke="#333" stroke-width="1"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10l4.6.9c1 .2 1.6 1.1 1.5 2.1l-.6 5A3 3 0 0 1 14.5 21H11a3 3 0 0 1-2.3-1.1L5.4 16a1.4 1.4 0 0 1 2-2L9 15.5z"/></svg>`;
  palco.appendChild(ab);
  $('.lacre', ab).addEventListener('click', () => {
    ab.classList.add('abrindo');
    if (audio) audio.play().catch(() => btnMusica.classList.add('parada'));
    setTimeout(() => { btnMusica.classList.add('visivel'); pontos.classList.add('visivel'); ir(0); }, 1200);
    setTimeout(() => ab.remove(), 2600);
  });

  // ---------- navegação ----------
  let atual = -1;
  function ir(n) {
    n = Math.max(0, Math.min(paginas.length - 1, n));
    paginas.forEach((p, i) => {
      if (i < n) { p.classList.remove('voltando'); p.classList.add('virada'); }
      else if (p.classList.contains('virada')) { p.classList.add('voltando'); p.classList.remove('virada'); }
      p.classList.toggle('ativa', i === n);
    });
    atual = n;
    [...pontos.children].forEach((d, i) => d.classList.toggle('on', i === n));
  }

  let x0 = null, y0 = null, t0 = 0;
  livro.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; t0 = Date.now(); });
  livro.addEventListener('pointerup', e => {
    if (x0 == null || atual < 0) return;
    if (e.target.closest('button, a, input, select, label')) { x0 = null; return; }
    const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { ir(atual + (dx < 0 ? 1 : -1)); return; }
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      const r = livro.getBoundingClientRect();
      ir(atual + ((e.clientX - r.left) > r.width * .3 ? 1 : -1));
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') ir(atual + 1);
    if (e.key === 'ArrowLeft') ir(atual - 1);
    if (e.key === 'Escape') fecharFolha();
  });

  // ---------- partículas ----------
  if (C.particulas) {
    const cv = el('canvas', 'particulas'); palco.appendChild(cv);
    const cx = cv.getContext('2d'); let W, H, dpr = Math.min(2, devicePixelRatio || 1);
    const tam = () => { W = cv.width = palco.clientWidth * dpr; H = cv.height = palco.clientHeight * dpr; };
    tam(); addEventListener('resize', tam);
    const brilho = C.particulas === 'brilho', confete = C.particulas === 'confete';
    const cores = C.coresParticulas || (brilho ? ['#ffe3a3', '#fff4d6', '#f3c27a'] : confete ? ['#ff5a5f', '#ffc93c', '#3ec1d3', '#7bd389', '#a66cff', '#ff8c42'] : ['#f4efe2', '#e8dcc0', '#c9d1ad', '#ffffff']);
    const ps = Array.from({ length: brilho ? 45 : confete ? 34 : 22 }, () => novo(true));
    function novo(ini) {
      return { x: Math.random() * W, y: ini ? Math.random() * H : -20 * dpr, r: (brilho ? 1 + Math.random() * 2.2 : 4 + Math.random() * 5) * dpr,
        vy: (brilho ? .15 + Math.random() * .35 : .4 + Math.random() * .6) * dpr, vx: (Math.random() - .5) * .4 * dpr,
        a: Math.random() * 6.28, va: (Math.random() - .5) * .04, f: Math.random() * 6.28, c: cores[Math.random() * cores.length | 0] };
    }
    (function loop(t) {
      cx.clearRect(0, 0, W, H);
      ps.forEach((p, i) => {
        p.y += p.vy; p.x += p.vx + Math.sin(t / 900 + p.f) * .35 * dpr; p.a += p.va;
        if (p.y > H + 20 * dpr) ps[i] = novo(false);
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a);
        if (brilho) {
          const pis = .35 + .65 * Math.abs(Math.sin(t / 500 + p.f));
          cx.globalAlpha = pis; cx.fillStyle = p.c; cx.shadowColor = p.c; cx.shadowBlur = 8 * dpr;
          cx.beginPath(); cx.arc(0, 0, p.r, 0, 6.28); cx.fill();
          if (p.r > 2.4 * dpr) { cx.fillRect(-p.r * 3, -.4 * dpr, p.r * 6, .8 * dpr); cx.fillRect(-.4 * dpr, -p.r * 3, .8 * dpr, p.r * 6); }
        } else if (confete) {
          cx.globalAlpha = .9; cx.fillStyle = p.c;
          cx.scale(1, Math.sin(t / 260 + p.f));
          cx.fillRect(-p.r * .45, -p.r * .9, p.r * .9, p.r * 1.8);
        } else {
          cx.globalAlpha = .85; cx.fillStyle = p.c;
          cx.scale(1, .55 + .45 * Math.sin(t / 400 + p.f));
          cx.beginPath(); cx.ellipse(0, 0, p.r, p.r * .62, 0, 0, 6.28); cx.fill();
        }
        cx.restore();
      });
      requestAnimationFrame(loop);
    })(0);
  }

  // ---------- contagem ----------
  const alvo = new Date(C.data).getTime();
  function conta() {
    let s = Math.max(0, Math.floor((alvo - Date.now()) / 1000));
    const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    document.querySelectorAll('[data-c]').forEach(n => n.textContent = String(v[n.dataset.c]).padStart(n.dataset.c === 'd' ? 1 : 2, '0'));
  }
  conta(); setInterval(conta, 1000);

  // ---------- folhas ----------
  const fundoF = el('div', 'folha-fundo');
  const folha = el('div', 'folha');
  palco.append(fundoF, folha);
  fundoF.addEventListener('click', fecharFolha);
  function fecharFolha() { fundoF.classList.remove('aberta'); folha.classList.remove('aberta'); }
  function abrirFolha(html) {
    folha.innerHTML = '<div class="alca"></div>' + html + '<button class="btn leve" data-fechar>Voltar ao convite</button>';
    folha.scrollTop = 0;
    requestAnimationFrame(() => { fundoF.classList.add('aberta'); folha.classList.add('aberta'); });
  }
  folha.addEventListener('click', e => { if (e.target.closest('[data-fechar]')) fecharFolha(); });

  palco.addEventListener('click', e => {
    const b = e.target.closest('[data-folha]');
    if (!b) return;
    const id = b.dataset.folha;
    if (id === 'rsvp') return abrirRSVP();
    if (id === 'agenda') return baixarAgenda();
    const f = C.folhas[id];
    if (f) abrirFolha(f);
  });

  function abrirRSVP() {
    const r = C.rsvp || {};
    abrirFolha(`<h3>Confirmar presença</h3>
      <p>${r.texto || 'Por favor, confirme até ' + (r.prazo || 'a data combinada') + '.'}</p>
      <form id="frsvp">
        <label class="campo">Seu nome<input name="nome" required autocomplete="name" placeholder="Nome e sobrenome"></label>
        <div class="campo">Você vai?</div>
        <div class="escolha">
          <label><input type="radio" name="vai" value="sim" checked><span>Vou com certeza</span></label>
          <label><input type="radio" name="vai" value="nao"><span>Não poderei ir</span></label>
        </div>
        <label class="campo">Quantas pessoas (contando você)
          <select name="qtd">${[1, 2, 3, 4, 5].map(n => `<option>${n}</option>`).join('')}</select></label>
        <label class="campo">Recado para ${r.para || 'os noivos'} (opcional)<input name="recado" placeholder="Escreva uma mensagem"></label>
        <button class="btn" type="submit">Confirmar</button>
      </form>`);
    $('#frsvp').addEventListener('submit', e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const vai = d.vai === 'sim';
      if (r.whatsapp) {
        const msg = vai
          ? `Olá! Confirmo presença ${C.rsvp.evento || ''}: ${d.nome}, ${d.qtd} pessoa(s).${d.recado ? ' Recado: ' + d.recado : ''}`
          : `Olá! Infelizmente não poderei ir ${C.rsvp.evento || ''}. ${d.nome}.${d.recado ? ' ' + d.recado : ''}`;
        window.open(`https://wa.me/${r.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
      }
      folha.innerHTML = `<div class="alca"></div><div class="ok">${vai ? '♥' : '✉'}</div>
        <h3>${vai ? 'Presença confirmada!' : 'Obrigado por avisar'}</h3>
        <p>${vai ? (r.obrigado || 'Que alegria ter você com a gente!') : 'Vamos sentir sua falta!'}</p>
        ${C.demo ? '<p style="font-size:3.4cqw;opacity:.6">No convite do cliente, a confirmação chega direto no WhatsApp dele.</p>' : ''}
        <button class="btn leve" data-fechar>Voltar ao convite</button>`;
    });
  }

  function baixarAgenda() {
    const ini = new Date(C.data); const fim = new Date(ini.getTime() + 5 * 3600e3);
    const f = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(C.titulo)}&dates=${f(ini)}/${f(fim)}&location=${encodeURIComponent(C.local || '')}`;
    window.open(url, '_blank');
  }
})();
