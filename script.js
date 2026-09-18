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

  if(!els.simPessoas) return;

  function formatBRL(v){
    return 'R$ ' + v.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }
  function formatMXN(v){
    return 'MXN ' + v.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }
  function num(el){
    const v = parseFloat(el.value);
    return isNaN(v) || v < 0 ? 0 : v;
  }

  function calcular(){
    const pessoas = Math.max(1, Math.round(num(els.simPessoas)));
    const noites = Math.max(1, Math.round(num(els.simNoites)));
    const dias = noites + 1; // conta o dia de chegada nas refeições

    const passagemUnit = num(els.simPassagem);
    const hotelNoite = num(els.simHotel);
    const comidaDia = num(els.simComida);
    const passeiosPessoa = num(els.simPasseios);
    const transportePessoa = num(els.simTransporte);
    const cotacao = num(els.simCotacao);

    const quartos = Math.ceil(pessoas / 2);

    const totalPassagemBRL = passagemUnit * pessoas;
    const totalHotelMXN = hotelNoite * noites * quartos;
    const totalComidaMXN = comidaDia * pessoas * dias;
    const totalPasseiosMXN = passeiosPessoa * pessoas;
    const totalTransporteMXN = transportePessoa * pessoas;

    const totalMXN = totalHotelMXN + totalComidaMXN + totalPasseiosMXN + totalTransporteMXN;
    const totalMXNemBRL = totalMXN * cotacao;
    const totalGeralBRL = totalPassagemBRL + totalMXNemBRL;

    const linhas = [
      ['Passagens aéreas (' + pessoas + ' pessoa' + (pessoas>1?'s':'') + ')', formatBRL(totalPassagemBRL)],
      ['Hotel (' + quartos + ' quarto' + (quartos>1?'s':'') + ' × ' + noites + ' noites)', formatMXN(totalHotelMXN) + ' → ' + formatBRL(totalHotelMXN*cotacao)],
      ['Comida (' + pessoas + ' pessoa(s) × ' + dias + ' dias)', formatMXN(totalComidaMXN) + ' → ' + formatBRL(totalComidaMXN*cotacao)],
      ['Passeios', formatMXN(totalPasseiosMXN) + ' → ' + formatBRL(totalPasseiosMXN*cotacao)],
      ['Transporte local + seguro', formatMXN(totalTransporteMXN) + ' → ' + formatBRL(totalTransporteMXN*cotacao)],
    ];

    breakdownEl.innerHTML = linhas.map(function(l){
      return '<li><span>' + l[0] + '</span><span>' + l[1] + '</span></li>';
    }).join('');

    totalBRLEl.textContent = formatBRL(totalGeralBRL);
    totalMXNEl.textContent = 'Gastos em pesos (sem a passagem): ' + formatMXN(totalMXN);
  }

  ids.forEach(function(id){
    els[id].addEventListener('input', calcular);
  });
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
