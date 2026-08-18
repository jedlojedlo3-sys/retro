const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const cfg = window.RETRO_CONFIG;
const products = window.RETRO_PRODUCTS;
let lang = localStorage.getItem('retro-lang') || 'mk';
let cart = JSON.parse(localStorage.getItem('retro-cart') || '[]');
let activeFilter = 'all';

function setLanguage(next){
  lang=next; localStorage.setItem('retro-lang',lang); document.documentElement.lang=lang;
  $$('[data-mk][data-en]').forEach(el=>{ el.innerHTML = el.dataset[lang]; });
  $('#langToggle').textContent=lang==='mk'?'EN':'MK'; $('#langToggleMobile').textContent=lang==='mk'?'EN':'MK';
  renderProducts(); renderCart();
}
function toggleLanguage(){setLanguage(lang==='mk'?'en':'mk')}
$('#langToggle').addEventListener('click',toggleLanguage); $('#langToggleMobile').addEventListener('click',toggleLanguage);

const menuBtn=$('#menuBtn'), mobileNav=$('#mobileNav');
menuBtn.addEventListener('click',()=>{const open=mobileNav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',open);menuBtn.textContent=open?'✕':'☰'});
$$('#mobileNav a').forEach(a=>a.addEventListener('click',()=>{mobileNav.classList.remove('open');menuBtn.textContent='☰'}));

function getProduct(id){return products.find(p=>p.id===id)}
function label(p,key){return lang==='mk'?p[key+'Mk']:p[key+'En']}
function saveCart(){localStorage.setItem('retro-cart',JSON.stringify(cart));updateCount()}
function updateCount(){const n=cart.reduce((s,i)=>s+i.qty,0);$('#cartCount').textContent=n;$('#cartCountMobile').textContent=n}
function toast(text){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=text;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),1800)}

function renderProducts(){
  const filtered=products.filter(p=>activeFilter==='all'||p.categoryMk===activeFilter);
  $('#productGrid').innerHTML=filtered.map(p=>`
    <article class="product-card">
      <div class="product-media"><img src="${p.image}" alt="${label(p,'name')}" loading="lazy"><span class="product-badge">${label(p,'badge')}</span></div>
      <div class="product-info">
        <span class="product-cat">${label(p,'category')}</span><h3>${label(p,'name')}</h3>
        <p class="product-price">${p.price ? p.price+' '+cfg.currency : (lang==='mk'?'Цена во продавница':'Price in store')}</p>
        <div class="product-actions">
          <select class="size-select" aria-label="Size" data-size-for="${p.id}">${p.sizes.map(s=>`<option value="${s}">${lang==='mk'?'Гол.':'Size'} ${s}</option>`).join('')}</select>
          <button class="add-btn" type="button" data-add="${p.id}">${lang==='mk'?'Додај':'Add'}</button>
        </div>
      </div>
    </article>`).join('');
  $$('[data-add]').forEach(btn=>btn.addEventListener('click',()=>addToCart(btn.dataset.add)));
}

function addToCart(id){const size=$(`[data-size-for="${id}"]`).value;const existing=cart.find(i=>i.id===id&&i.size===size);if(existing)existing.qty++;else cart.push({id,size,qty:1});saveCart();renderCart();toast(lang==='mk'?'Додадено во кошничка':'Added to bag')}

$$('.filter').forEach(btn=>btn.addEventListener('click',()=>{activeFilter=btn.dataset.filter;$$('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderProducts()}));

function openCart(){renderCart();$('#cartDrawer').classList.add('open');$('#cartDrawer').setAttribute('aria-hidden','false');document.body.classList.add('locked')}
function closeCart(){ $('#cartDrawer').classList.remove('open');$('#cartDrawer').setAttribute('aria-hidden','true');document.body.classList.remove('locked') }
$('#cartButton').addEventListener('click',openCart);$('#cartButtonMobile').addEventListener('click',openCart);$('#closeCart').addEventListener('click',closeCart);$('#cartBackdrop').addEventListener('click',closeCart);$('#emptyShopLink').addEventListener('click',closeCart);

function renderCart(){
  const empty=cart.length===0;$('#cartEmpty').hidden=!empty;$('#cartFooter').hidden=empty;
  $('#cartItems').innerHTML=cart.map((item,index)=>{const p=getProduct(item.id);return `<div class="cart-item"><img src="${p.image}" alt="${label(p,'name')}"><div><h4>${label(p,'name')}</h4><p>${lang==='mk'?'Големина':'Size'}: ${item.size} · ${lang==='mk'?'Кол.':'Qty'}: ${item.qty}</p></div><button class="remove-item" data-remove="${index}">${lang==='mk'?'Отстрани':'Remove'}</button></div>`}).join('');
  $$('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{cart.splice(Number(btn.dataset.remove),1);saveCart();renderCart()}));
  updateCount();
}

function openCheckout(){if(!cart.length)return;closeCart();$('#checkoutModal').classList.add('open');$('#checkoutModal').setAttribute('aria-hidden','false');document.body.classList.add('locked');$('#orderResult').hidden=true;$('#checkoutForm').hidden=false}
function closeCheckout(){ $('#checkoutModal').classList.remove('open');$('#checkoutModal').setAttribute('aria-hidden','true');document.body.classList.remove('locked') }
$('#checkoutButton').addEventListener('click',openCheckout);$$('[data-close-checkout]').forEach(el=>el.addEventListener('click',closeCheckout));

function buildMessage(){
 const name=$('#customerName').value.trim(), contact=$('#customerContact').value.trim(), pickup=$('#pickupPreference').value, note=$('#customerNote').value.trim();
 const lines=cart.map(item=>{const p=getProduct(item.id);return `• ${p.nameMk} — големина ${item.size} × ${item.qty}`});
 return `Здраво Retro Boutique, сакам да резервирам за подигање во продавница:\n\n${lines.join('\n')}\n\nИме: ${name}\nКонтакт: ${contact}\nПодигање: ${pickup}${note?`\nЗабелешка: ${note}`:''}\n\nЛокација: Stiv Naumov 8, Prilep\n*Барам потврда за достапност пред да дојдам.*`;
}
$('#checkoutForm').addEventListener('submit',e=>{e.preventDefault();$('#orderMessage').value=buildMessage();$('#checkoutForm').hidden=true;$('#orderResult').hidden=false});
$('#copyOrder').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#orderMessage').value);toast(lang==='mk'?'Копирано':'Copied')}catch{ $('#orderMessage').select();document.execCommand('copy');toast(lang==='mk'?'Копирано':'Copied') }});

$('#year').textContent=new Date().getFullYear();
setLanguage(lang);renderProducts();renderCart();
