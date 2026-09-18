// ---------- Menu mobile ----------
(function(){
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if(!toggle || !menu) return;

  toggle.addEventListener('click', function(){
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  menu.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// ---------- Simulador de viagem ----------
(function(){
  const ids = ['simPessoas','simNoites','simPassagem','simHotel','simComida','simPasseios','simTransporte','simCotacao'];
  const els = {};
  ids.forEach(function(id){ els[id] = document.getElementById(id); });
  const breakdownEl = document.getElementById('simBreakdown');
  const totalBRLEl = document.getElementById('simTotalBRL');
  const totalMXNEl = document.getElementById('simTotalMXN');
  const usarMXNEl = document.getElementById('simUsarMXN');
  const modeToggle = document.getElementById('modeToggle');
  const hints = {
    passagem: document.getElementById('hintPassagem'),
    comida: document.getElementById('hintComida'),
    passeios: document.getElementById('hintPasseios'),
    transporte: document.getElementById('hintTransporte'),
  };

  if(!els.simPessoas || !modeToggle) return;

  let modo = 'total'; // 'pessoa' ou 'total' — precisa bater com o botão marcado como .active no HTML

  modeToggle.querySelectorAll('.mode-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      modeToggle.querySelectorAll('.mode-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      modo = btn.getAttribute('data-mode');
      calcular();
    });
  });

  function formatMoeda(v, moeda){
    return (moeda === 'MXN' ? 'MXN ' : 'R$ ') + v.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }
  function num(el){
    const v = parseFloat(el.value);
    return isNaN(v) || v < 0 ? 0 : v;
  }

  function atualizarDicas(pessoas, dias){
    if(modo === 'pessoa'){
      hints.passagem.textContent = ' — valor de 1 pessoa (será × ' + pessoas + ')';
      hints.comida.textContent = ' — valor de 1 pessoa (será × ' + pessoas + ' pessoas × ' + dias + ' dias)';
      hints.passeios.textContent = ' — valor de 1 pessoa (será × ' + pessoas + ')';
      hints.transporte.textContent = ' — valor de 1 pessoa (será × ' + pessoas + ')';
    } else {
      hints.passagem.textContent = ' — valor já é do grupo inteiro';
      hints.comida.textContent = ' — valor do grupo inteiro, por dia (será × ' + dias + ' dias)';
      hints.passeios.textContent = ' — valor já é do grupo inteiro';
      hints.transporte.textContent = ' — valor já é do grupo inteiro';
    }
  }

  function calcular(){
    const pessoas = Math.max(1, Math.round(num(els.simPessoas)));
    const noites = Math.max(1, Math.round(num(els.simNoites)));
    const dias = noites + 1; // conta o dia de chegada nas refeições
    const usarMXN = usarMXNEl.checked;
    const cotacao = num(els.simCotacao) || 1;
    const moedaCampos = usarMXN ? 'MXN' : 'R$';

    atualizarDicas(pessoas, dias);

    const passagemInput = num(els.simPassagem);
    const hotelNoite = num(els.simHotel);
    const comidaInput = num(els.simComida);
    const passeiosInput = num(els.simPasseios);
    const transporteInput = num(els.simTransporte);

    const multiplicadorPessoa = (modo === 'pessoa') ? pessoas : 1;

    // hospedagem: sempre é o valor da diária inteira (não multiplica por pessoa)
    const totalHotel = hotelNoite * noites;
    const totalComida = comidaInput * multiplicadorPessoa * dias;
    const totalPasseios = passeiosInput * multiplicadorPessoa;
    const totalTransporte = transporteInput * multiplicadorPessoa;
    // passagem aérea é sempre em reais, direto
    const totalPassagemBRL = passagemInput * multiplicadorPessoa;

    const somaCamposConvertiveis = totalHotel + totalComida + totalPasseios + totalTransporte;
    const somaCamposEmBRL = usarMXN ? somaCamposConvertiveis * cotacao : somaCamposConvertiveis;
    const totalGeralBRL = totalPassagemBRL + somaCamposEmBRL;

    function linha(label, valor){
      const emBRL = usarMXN ? valor * cotacao : valor;
      const texto = usarMXN
        ? formatMoeda(valor, 'MXN') + ' → ' + formatMoeda(emBRL, 'R$')
        : formatMoeda(valor, 'R$');
      return '<li><span>' + label + '</span><span>' + texto + '</span></li>';
    }
    function linhaBRL(label, valor){
      return '<li><span>' + label + '</span><span>' + formatMoeda(valor, 'R$') + '</span></li>';
    }

    const linhas = [
      linhaBRL('Passagens aéreas', totalPassagemBRL),
      linha('Hospedagem (' + noites + ' noites)', totalHotel),
      linha('Alimentação (' + dias + ' dias)', totalComida),
      linha('Passeios', totalPasseios),
      linha('Transporte local + seguro', totalTransporte),
    ];

    breakdownEl.innerHTML = linhas.join('');
    totalBRLEl.textContent = formatMoeda(totalGeralBRL, 'R$');
    totalMXNEl.textContent = usarMXN
      ? 'Gastos em pesos, sem a passagem: ' + formatMoeda(somaCamposConvertiveis, 'MXN')
      : '';
  }

  ids.forEach(function(id){
    if(els[id]) els[id].addEventListener('input', calcular);
  });
  usarMXNEl.addEventListener('change', calcular);
  calcular();
})();

// ---------- Checklist com memória local ----------
(function(){
  const list = document.getElementById('checklist');
  if(!list) return;
  const STORAGE_KEY = 'tenochtitlan-checklist';

  let saved = {};
  try{
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  }catch(e){ saved = {}; }

  const boxes = list.querySelectorAll('input[type="checkbox"]');
  boxes.forEach(function(box){
    const key = box.getAttribute('data-key');
    if(saved[key]) box.checked = true;
    box.addEventListener('change', function(){
      saved[key] = box.checked;
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }catch(e){}
    });
  });
})();
