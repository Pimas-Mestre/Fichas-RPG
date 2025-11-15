// script.js - funcionalidade principal para o site de fichas

/* -------------------------------
   Inicialização e renderização da ficha
   ------------------------------- */

// Renderiza o HTML da ficha dentro do index (para facilitar cópia)
document.addEventListener('DOMContentLoaded', () => {
  // Se a página não possui o container (por exemplo se for só a página de login), não executa
  const fichaContainer = document.getElementById('ficha');
  if (!fichaContainer) return;

  // Elementos da interface já existem no HTML principal (index.html)
  // Controle de abas
  window.showTab = function(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
  };

  // Login - verifica estado de sessão do mestre
  const mestreLogado = localStorage.getItem('mestreLogado') === 'true';
  if (mestreLogado) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    carregarListaFichas();
  }

  // Funções de acesso (expostas globalmente para uso nos onClick HTML)
  window.loginMaster = function() {
    const pass = document.getElementById('master-password').value;
    // senha padrão local — se quiser, altere aqui. Para segurança real, use Firebase Auth mais tarde.
    const SENHA_PADRAO = 'mestre123';
    if (pass === SENHA_PADRAO) {
      localStorage.setItem('mestreLogado', 'true');
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('main-content').classList.remove('hidden');
      carregarListaFichas();
    } else {
      const err = document.getElementById('login-error');
      err.style.display = 'block';
      setTimeout(() => err.style.display = 'none', 2500);
    }
  };

  // -------------------------------
  // Manipulação da Ficha (Salvar / Carregar)
  // -------------------------------

  function obterDadosFicha() {
    // campos principais
    const data = {
      id: document.getElementById('nome').value.trim().toLowerCase().replace(/\s+/g,'-') + '-' + Date.now(),
      nome: document.getElementById('nome').value || '',
      nacionalidade: document.getElementById('nacionalidade').value || '',
      paiDivino: document.getElementById('pai-divino').value || '',
      altura: document.getElementById('altura').value || '',
      aniversario: document.getElementById('aniversario').value || '',
      traumas: document.getElementById('traumas').value || '',
      atributos: {
        forca: Number(document.getElementById('forca').value) || 0,
        destreza: Number(document.getElementById('destreza').value) || 0,
        vigor: Number(document.getElementById('vigor').value) || 0,
        sabedoria: Number(document.getElementById('sabedoria').value) || 0,
        carisma: Number(document.getElementById('carisma').value) || 0,
        inteligencia: Number(document.getElementById('inteligencia').value) || 0,
        celestial: Number(document.getElementById('celestial').value) || 0
      },
      poderes: document.getElementById('poderes-area').value || '',
      inventario: {
        capacidade: Number(document.getElementById('capacidade').value) || 0,
        itensTexto: document.getElementById('itens').value || '',
        itensImg: localStorage.getItem('ultimaImgItem') || null
      },
      criadoEm: new Date().toISOString()
    };
    return data;
  }

  window.saveFicha = function() {
    const ficha = obterDadosFicha();
    // salva temporariamente como 'fichaAtual'
    localStorage.setItem('fichaAtual', JSON.stringify(ficha));
    mostrarToast('Ficha salva localmente.');
  };

  window.loadFicha = function() {
    const raw = localStorage.getItem('fichaAtual');
    if (!raw) return mostrarToast('Nenhuma ficha local encontrada.');
    const data = JSON.parse(raw);

    document.getElementById('nome').value = data.nome;
    document.getElementById('nacionalidade').value = data.nacionalidade;
    document.getElementById('pai-divino').value = data.paiDivino;
    document.getElementById('altura').value = data.altura;
    document.getElementById('aniversario').value = data.aniversario;
    document.getElementById('traumas').value = data.traumas;

    document.getElementById('forca').value = data.atributos.forca;
    document.getElementById('destreza').value = data.atributos.destreza;
    document.getElementById('vigor').value = data.atributos.vigor;
    document.getElementById('sabedoria').value = data.atributos.sabedoria;
    document.getElementById('carisma').value = data.atributos.carisma;
    document.getElementById('inteligencia').value = data.atributos.inteligencia;
    document.getElementById('celestial').value = data.atributos.celestial;

    document.getElementById('poderes-area').value = data.poderes;
    document.getElementById('capacidade').value = data.inventario.capacidade;
    document.getElementById('itens').value = data.inventario.itensTexto;

    mostrarToast('Ficha carregada.');
  };

  // -------------------------------
  // Enviar para o Mestre (salva em armazenamento do mestre)
  // -------------------------------
  window.enviarParaMestre = function() {
    const ficha = obterDadosFicha();

    // recupere lista atual do mestre
    const listaRaw = localStorage.getItem('fichas_master') || '[]';
    const lista = JSON.parse(listaRaw);

    // se já existir um id igual (nome+timestamp) — não é esperado, mas prevenimos
    lista.push(ficha);
    localStorage.setItem('fichas_master', JSON.stringify(lista));

    carregarListaFichas();
    mostrarToast('Ficha enviada ao mestre.');
  };

  window.carregarListaFichas = window.carregarListaFichas || function() {
    const lista = JSON.parse(localStorage.getItem('fichas_master') || '[]');
    const container = document.getElementById('lista-fichas');
    if (!container) return;
    if (lista.length === 0) {
      container.innerHTML = '<p>Nenhuma ficha enviada ainda.</p>';
      return;
    }

    // Ordena por data (mais recente primeiro)
    lista.sort((a,b)=> new Date(b.criadoEm) - new Date(a.criadoEm));

    const html = lista.map(f => {
      const preview = `
        <div class="ficha-card">
          <div class="meta"> <strong>${escapeHtml(f.nome)}</strong> — ${escapeHtml(f.paiDivino || '-')}</div>
          <div class="sub">${escapeHtml(f.nacionalidade || '')} • ${f.altura || ''}</div>
          <div class="acoes">
            <button onclick="verFicha('${f.id}')">Ver</button>
            <button onclick="baixarFicha('${f.id}')">Baixar</button>
            <button onclick="removerFicha('${f.id}')">Remover</button>
          </div>
        </div>
      `;
      return preview;
    }).join('\n');

    container.innerHTML = html;
  };

  // Visualizar ficha completa (abre modal simples)
  window.verFicha = function(id) {
    const lista = JSON.parse(localStorage.getItem('fichas_master') || '[]');
    const f = lista.find(x => x.id === id);
    if (!f) return mostrarToast('Ficha não encontrada.');

    const w = window.open('','_blank','width=700,height=800');
    const html = gerarHtmlFichaParaPrint(f);
    w.document.write(html);
    w.document.close();
  };

  // Baixar ficha como JSON
  window.baixarFicha = function(id) {
    const lista = JSON.parse(localStorage.getItem('fichas_master') || '[]');
    const f = lista.find(x => x.id === id);
    if (!f) return mostrarToast('Ficha não encontrada.');

    const blob = new Blob([JSON.stringify(f, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (f.nome || 'ficha') + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    mostrarToast('Arquivo JSON baixado.');
  };

  // Remover ficha (do mestre)
  window.removerFicha = function(id) {
    let lista = JSON.parse(localStorage.getItem('fichas_master') || '[]');
    lista = lista.filter(x => x.id !== id);
    localStorage.setItem('fichas_master', JSON.stringify(lista));
    carregarListaFichas();
    mostrarToast('Ficha removida.');
  };

  // -------------------------------
  // Salvar inventário e imagens (imagem é convertida em base64 e guardada temporariamente)
  // -------------------------------
  const inputImg = document.getElementById('img-item');
  if (inputImg) {
    inputImg.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        // salva a última imagem em localStorage para ser atrelada à ficha ao salvar
        localStorage.setItem('ultimaImgItem', evt.target.result);
        mostrarToast('Imagem carregada e pronta para anexar.');
      };
      reader.readAsDataURL(file);
    });
  }

  window.saveInventario = function() {
    // apenas salva a ficha atual (que já inclui o campo ultimaImgItem no inventario)
    saveFicha();
    mostrarToast('Inventário salvo.');
  };

  window.savePoderes = function() {
    saveFicha();
    mostrarToast('Poderes salvos.');
  };

  // -------------------------------
  // Geração de PDF / Impressão (usa uma nova janela + print)
  // -------------------------------
  window.gerarPDF = function() {
    const ficha = obterDadosFicha();
    const html = gerarHtmlFichaParaPrint(ficha);
    const w = window.open('','_blank','width=800,height=900');
    w.document.write(html);
    w.document.close();
    // Dar tempo para a página carregar antes de chamar print
    w.onload = () => {
      w.focus();
      w.print();
    };
  };

  // Cria o HTML que será impresso/visualizado
  function gerarHtmlFichaParaPrint(f) {
    const imgHtml = f.inventario.itensImg ? `<div style="margin-top:12px"><img src="${f.inventario.itensImg}" style="max-width:100%;height:auto;border-radius:8px;" /></div>` : '';

    return `
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Ficha - ${escapeHtml(f.nome)}</title>
        <style>
          body{font-family: Arial, Helvetica, sans-serif; padding:20px; color:#111}
          h1{font-size:24px}
          .atrib{display:flex;gap:10px}
          .card{border:1px solid #ddd;padding:12px;border-radius:8px;margin-bottom:10px}
        </style>
      </head>
      <body>
        <h1>Ficha — ${escapeHtml(f.nome)}</h1>
        <div class="card">
          <strong>Informações:</strong>
          <p>Paí Divino: ${escapeHtml(f.paiDivino)}</p>
          <p>Nacionalidade: ${escapeHtml(f.nacionalidade)}</p>
          <p>Altura: ${escapeHtml(f.altura)}</p>
          <p>Aniversário: ${escapeHtml(f.aniversario)}</p>
          <p>Traumas: ${escapeHtml(f.traumas)}</p>
        </div>

        <div class="card">
          <strong>Atributos</strong>
          <div class="atrib">
            <div>Força: ${f.atributos.forca}</div>
            <div>Destreza: ${f.atributos.destreza}</div>
            <div>Vigor: ${f.atributos.vigor}</div>
            <div>Sabedoria: ${f.atributos.sabedoria}</div>
            <div>Carisma: ${f.atributos.carisma}</div>
            <div>Inteligência: ${f.atributos.inteligencia}</div>
            <div>Celestial: ${f.atributos.celestial}</div>
          </div>
        </div>

        <div class="card">
          <strong>Poderes</strong>
          <pre style="white-space:pre-wrap">${escapeHtml(f.poderes)}</pre>
        </div>

        <div class="card">
          <strong>Inventário</strong>
          <p>Capacidade: ${f.inventario.capacidade}</p>
          <pre style="white-space:pre-wrap">${escapeHtml(f.inventario.itensTexto)}</pre>
          ${imgHtml}
        </div>
      </body>
      </html>
    `;
  }

  // -------------------------------
  // Utils
  // -------------------------------
  function mostrarToast(msg) {
    // toast simples — cria elemento temporário
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.position = 'fixed';
    t.style.left = '50%';
    t.style.transform = 'translateX(-50%)';
    t.style.bottom = '30px';
    t.style.background = 'rgba(0,0,0,0.7)';
    t.style.color = '#fff';
    t.style.padding = '10px 16px';
    t.style.borderRadius = '8px';
    t.style.zIndex = 99999;
    document.body.appendChild(t);
    setTimeout(()=> t.remove(), 2400);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>\"'`]/g, function (s) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;', '`':'&#x60;'})[s];
    });
  }

  // Inicializa partículas místicas simples
  initParticles();
});

/* -------------------------------
   Partículas místicas (canvas)
   ------------------------------- */
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  resize();
  addEventListener('resize', resize);

  const particles = [];
  const COLORS = ['rgba(168,75,230,0.9)','rgba(212,175,55,0.9)','rgba(120,90,200,0.8)'];
  for (let i=0;i<140;i++) {
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      vx: (Math.random()-0.5)*0.6,
      vy: (Math.random()-0.5)*0.6,
      r: 0.6 + Math.random()*2.2,
      c: COLORS[Math.floor(Math.random()*COLORS.length)],
      life: 20 + Math.random()*80
    });
  }

  function step(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let p of particles) {
      p.x += p.vx; p.y += p.vy;
      p.life -= 0.2;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;

      ctx.beginPath();
      ctx.fillStyle = p.c.replace(/0\.9|0\.8/, (p.life/100).toFixed(2));
      ctx.globalCompositeOperation = 'lighter';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* -------------------------------
   Função pública para deslogar o mestre
   ------------------------------- */
function logoutMaster() {
  localStorage.removeItem('mestreLogado');
  location.reload();
}
