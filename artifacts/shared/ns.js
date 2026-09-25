/* ==========================================================================
   Northstar Design System · ns.js  (runtime)
   Shared shell + router + components + charts for the Northstar Labs family.
   Zero dependencies. Designed & built by Ronak Mehta.
   --------------------------------------------------------------------------
   PUBLIC API (window.NS)
     NS.esc(s) · NS.html`…` · NS.raw(s) · NS.icon(name,{size,cls})
     NS.fmt.{num,int,compact,pct,frac,money,date,month,rel,initials,plural,ordinal,signed,days}
     NS.rng(seed) → fn · NS.pick(rng,arr) · NS.between(rng,a,b) · NS.gauss(rng)
     NS.util.{groupBy,countBy,sum,avg,median,uniq,sortBy,clamp,debounce,uid,range,round,lerp,by,max,min}
     NS.store(ns) → {get,set,del,clear,all}
     NS.theme.{get,set,toggle}
     NS.toast(title,{desc,type,action,duration})
     NS.modal({title,sub,body,foot,actions,size,onClose}) → {close,el}
     NS.confirm({title,body,confirmLabel,danger}) → Promise<boolean>
     NS.drawer({title,sub,body,foot,size,onClose}) → {close,el}
     NS.dropdown(anchor,{items,align,cls,html}) → {close}
     NS.avatar(personOrName,{size,cls,status}) · NS.badge(text,cls) · NS.ring({value,size,thickness,label,sub,color})
     NS.spark(values,{height,color,area,min,max,dot})
     NS.chart.{line,bars,hbars,donut,radar,heatmap,scatter,funnel}(el,opts)
     NS.table(el,opts) → api · NS.dnd(container,opts)
     NS.app(config) → boots shell+router · NS.go(path,query) · NS.link(path,query) · NS.refresh() · NS.route · NS.persona
   ========================================================================== */
(function () {
  'use strict';
  const NS = {};
  const doc = document;

  /* ---------- escaping & templating ---------- */
  const escMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  NS.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => escMap[c]);
  class Raw { constructor(s) { this.s = String(s); } toString() { return this.s; } }
  NS.raw = (s) => new Raw(s);
  NS.html = (strings, ...vals) => {
    let out = '';
    strings.forEach((str, i) => {
      out += str;
      if (i < vals.length) {
        const v = vals[i];
        if (v == null || v === false) return;
        if (v instanceof Raw) out += v.s;
        else if (Array.isArray(v)) out += v.map((x) => (x instanceof Raw ? x.s : NS.esc(x))).join('');
        else out += NS.esc(v);
      }
    });
    return new Raw(out);
  };
  const str = (v) => (v instanceof Raw ? v.s : v == null ? '' : String(v));
  NS.str = str;
  NS.el = (html) => { const t = doc.createElement('template'); t.innerHTML = str(html).trim(); return t.content.firstElementChild; };
  NS.qs = (sel, root = doc) => root.querySelector(sel);
  NS.qsa = (sel, root = doc) => Array.from(root.querySelectorAll(sel));
  NS.on = (root, evt, sel, fn) => root.addEventListener(evt, (e) => { const t = e.target.closest(sel); if (t && root.contains(t)) fn(e, t); });

  /* ---------- icons (Lucide-style, ISC) ---------- */
  const I = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    goal: '<path d="M12 13V2l8 4-8 4"/><path d="M20.561 10.222a9 9 0 1 1-12.55-5.29"/><path d="M8.002 9.997a5 5 0 1 0 8.9 2.02"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
    'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    'user-x': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m17 8 5 5"/><path d="m22 8-5 5"/>',
    'user-minus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11h-6"/>',
    'id-card': '<path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/>',
    'bar-chart': '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    'bar-chart-2': '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>',
    'line-chart': '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
    'pie-chart': '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    'scatter-chart': '<circle cx="7.5" cy="7.5" r="1" fill="currentColor"/><circle cx="18.5" cy="5.5" r="1" fill="currentColor"/><circle cx="11.5" cy="11.5" r="1" fill="currentColor"/><circle cx="7.5" cy="16.5" r="1" fill="currentColor"/><circle cx="17.5" cy="14.5" r="1" fill="currentColor"/><path d="M3 3v16a2 2 0 0 0 2 2h16"/>',
    'trending-up': '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    'trending-down': '<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
    activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    radar: '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    sliders: '<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    'plus-circle': '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>', 'chevron-up': '<path d="m18 15-6-6-6 6"/>', 'chevron-left': '<path d="m15 18-6-6 6-6"/>', 'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevrons-left': '<path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/>', 'chevrons-right': '<path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/>', 'chevrons-up-down': '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'alert-circle': '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    timer: '<path d="M10 2h4"/><path d="M12 14v-4"/><circle cx="12" cy="14" r="8"/>',
    hourglass: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    'dollar-sign': '<path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    banknote: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    hash: '<path d="M4 9h16"/><path d="M4 15h16"/><path d="M10 3 8 21"/><path d="M16 3l-2 18"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    calculator: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8"/><path d="M16 14v4"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    crown: '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
    medal: '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/>',
    gem: '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    milestone: '<path d="M12 13v8"/><path d="M12 3v3"/><path d="M4 6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h13a2 2 0 0 0 1.152-.365l3.424-2.317a1 1 0 0 0 0-1.635l-3.424-2.318A2 2 0 0 0 17 6z"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    unlock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    'heart-pulse': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    wand: '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/>',
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    'git-branch': '<path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
    workflow: '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', 'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>', 'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>', 'arrow-down-right': '<path d="m7 7 10 10"/><path d="M17 7v10H7"/>',
    'arrow-left-right': '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
    'arrow-up-down': '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
    'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    'more-horizontal': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    'more-vertical': '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
    pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    'clipboard-check': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    'graduation-cap': '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    'list-checks': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    kanban: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 7v7"/><path d="M12 7v4"/><path d="M16 7v9"/>',
    columns: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>',
    table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    'thumbs-up': '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
    frown: '<circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
    meh: '<circle cx="12" cy="12" r="10"/><path d="M8 15h8"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    menu: '<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>',
    'panel-left': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
    maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
    headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    'life-buoy': '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/>',
    printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
    save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
    server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
    cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
    'git-commit': '<circle cx="12" cy="12" r="3"/><path d="M3 12h6"/><path d="M15 12h6"/>',
    package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
    coffee: '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
    sunrise: '<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
    play: '<path d="m6 3 14 9-14 9V3z"/>', pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    circle: '<circle cx="12" cy="12" r="10"/>', 'circle-dot': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    languages: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
    puzzle: '<path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>',
    ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    dot: '<circle cx="12.1" cy="12.1" r="1"/>',
    northstar: '<path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/><path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16z"/>',
  };
  NS.icons = I;
  NS.icon = (name, o = {}) => {
    const p = I[name] || I['circle-dot'];
    const s = o.size || 24;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${o.stroke || 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${o.cls ? ` class="${o.cls}"` : ''}${o.style ? ` style="${o.style}"` : ''}>${p}</svg>`;
  };
  NS.ic = (name, o) => NS.raw(NS.icon(name, o));

  /* ---------- formatters ---------- */
  const nf = (d) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
  const F = {
    num: (n, d = 0) => (n == null || isNaN(n) ? '—' : nf(d).format(n)),
    int: (n) => (n == null || isNaN(n) ? '—' : Math.round(n).toLocaleString('en-US')),
    compact: (n, d = 1) => {
      if (n == null || isNaN(n)) return '—';
      const a = Math.abs(n);
      if (a >= 1e9) return (n / 1e9).toFixed(d).replace(/\.0$/, '') + 'B';
      if (a >= 1e6) return (n / 1e6).toFixed(d).replace(/\.0$/, '') + 'M';
      if (a >= 1e3) return (n / 1e3).toFixed(a >= 1e5 ? 0 : d).replace(/\.0$/, '') + 'K';
      return String(Math.round(n));
    },
    pct: (n, d = 0) => (n == null || isNaN(n) ? '—' : nf(d).format(n) + '%'),
    frac: (n, d = 0) => (n == null || isNaN(n) ? '—' : nf(d).format(n * 100) + '%'),
    money: (n, o = {}) => {
      if (n == null || isNaN(n)) return '—';
      const cur = o.cur || '$';
      const neg = n < 0 ? '−' : '';
      const a = Math.abs(n);
      if (o.compact) return neg + cur + F.compact(a, o.d ?? 1);
      return neg + cur + nf(o.d ?? 0).format(a);
    },
    signed: (n, d = 0, suf = '') => (n == null || isNaN(n) ? '—' : (n > 0 ? '+' : n < 0 ? '−' : '') + nf(d).format(Math.abs(n)) + suf),
    date: (d, style = 'med') => {
      if (!d) return '—';
      d = d instanceof Date ? d : new Date(d);
      if (isNaN(d)) return '—';
      const o = style === 'short' ? { day: 'numeric', month: 'short' } : style === 'long' ? { weekday: 'long', day: 'numeric', month: 'long' } : style === 'full' ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } : style === 'my' ? { month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' };
      return d.toLocaleDateString('en-GB', o);
    },
    month: (d) => F.date(d, 'my'),
    time: (d) => (d instanceof Date ? d : new Date(d)).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    rel: (d) => {
      d = d instanceof Date ? d : new Date(d);
      const s = Math.round((Date.now() - d.getTime()) / 1000);
      const abs = Math.abs(s), fut = s < 0;
      const f = (n, u) => `${fut ? 'in ' : ''}${n} ${u}${n === 1 ? '' : 's'}${fut ? '' : ' ago'}`;
      if (abs < 60) return 'just now';
      if (abs < 3600) return f(Math.round(abs / 60), 'min');
      if (abs < 86400) return f(Math.round(abs / 3600), 'hour');
      if (abs < 86400 * 30) return f(Math.round(abs / 86400), 'day');
      if (abs < 86400 * 365) return f(Math.round(abs / (86400 * 30)), 'month');
      return f(Math.round(abs / (86400 * 365)), 'year');
    },
    days: (n) => (n === 0 ? 'today' : n === 1 ? '1 day' : `${n} days`),
    initials: (name) => String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join(''),
    plural: (n, w, p) => `${F.int(n)} ${n === 1 ? w : p || w + 's'}`,
    ordinal: (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); },
    tenure: (years) => (years < 1 ? `${Math.max(1, Math.round(years * 12))} mo` : years < 10 ? `${years.toFixed(1)} yrs` : `${Math.round(years)} yrs`),
  };
  NS.fmt = F;

  /* ---------- random & util ---------- */
  NS.rng = (seed = 1) => { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
  NS.pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  NS.between = (rng, a, b) => a + rng() * (b - a);
  NS.gauss = (rng) => { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  NS.hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const U = {
    groupBy: (arr, k) => arr.reduce((m, x) => { const key = typeof k === 'function' ? k(x) : x[k]; (m[key] ||= []).push(x); return m; }, {}),
    countBy: (arr, k) => arr.reduce((m, x) => { const key = typeof k === 'function' ? k(x) : x[k]; m[key] = (m[key] || 0) + 1; return m; }, {}),
    sum: (arr, k) => arr.reduce((a, x) => a + (k ? (typeof k === 'function' ? k(x) : x[k]) : x), 0),
    avg: (arr, k) => (arr.length ? U.sum(arr, k) / arr.length : 0),
    median: (arr, k) => { const v = arr.map((x) => (k ? (typeof k === 'function' ? k(x) : x[k]) : x)).sort((a, b) => a - b); const m = v.length >> 1; return v.length ? (v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2) : 0; },
    max: (arr, k) => Math.max(...arr.map((x) => (k ? (typeof k === 'function' ? k(x) : x[k]) : x))),
    min: (arr, k) => Math.min(...arr.map((x) => (k ? (typeof k === 'function' ? k(x) : x[k]) : x))),
    uniq: (arr) => Array.from(new Set(arr)),
    sortBy: (arr, k, dir = 1) => arr.slice().sort((a, b) => { const va = typeof k === 'function' ? k(a) : a[k], vb = typeof k === 'function' ? k(b) : b[k]; return (va > vb ? 1 : va < vb ? -1 : 0) * dir; }),
    clamp: (n, a, b) => Math.min(b, Math.max(a, n)),
    round: (n, d = 0) => Math.round(n * 10 ** d) / 10 ** d,
    lerp: (a, b, t) => a + (b - a) * t,
    range: (n, s = 0) => Array.from({ length: n }, (_, i) => i + s),
    debounce: (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; },
    uid: () => 'ns' + Math.random().toString(36).slice(2, 9),
    by: (k) => (a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0),
    addDays: (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; },
    daysBetween: (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000),
    pctOf: (a, b) => (b ? (a / b) * 100 : 0),
  };
  NS.util = U;

  /* ---------- storage ---------- */
  NS.store = (ns) => {
    const k = (key) => `ns:${ns}:${key}`;
    return {
      get(key, def) { try { const v = localStorage.getItem(k(key)); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
      set(key, v) { try { localStorage.setItem(k(key), JSON.stringify(v)); } catch (e) { } return v; },
      del(key) { try { localStorage.removeItem(k(key)); } catch (e) { } },
      clear() { try { Object.keys(localStorage).filter((x) => x.startsWith(`ns:${ns}:`)).forEach((x) => localStorage.removeItem(x)); } catch (e) { } },
    };
  };
  const gstore = NS.store('global');

  /* ---------- theme ---------- */
  NS.theme = {
    get: () => doc.documentElement.dataset.theme || 'light',
    set(t, ev) {
      const apply = () => { doc.documentElement.dataset.theme = t; gstore.set('theme', t); NS._onTheme && NS._onTheme(t); };
      if (doc.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (ev && ev.clientX != null) { doc.documentElement.style.setProperty('--vt-x', ev.clientX + 'px'); doc.documentElement.style.setProperty('--vt-y', ev.clientY + 'px'); }
        doc.startViewTransition(apply);
      } else apply();
    },
    toggle(ev) { NS.theme.set(NS.theme.get() === 'dark' ? 'light' : 'dark', ev); },
    init() { const t = gstore.get('theme'); if (t) doc.documentElement.dataset.theme = t; else if (matchMedia('(prefers-color-scheme: dark)').matches) doc.documentElement.dataset.theme = 'dark'; else doc.documentElement.dataset.theme = 'light'; },
  };
  NS.theme.init();

  /* ---------- toasts ---------- */
  let toastWrap;
  NS.toast = (title, o = {}) => {
    if (!toastWrap) { toastWrap = NS.el('<div class="ns-toasts" role="status" aria-live="polite"></div>'); doc.body.appendChild(toastWrap); }
    const type = o.type || 'ok';
    const icon = { ok: 'check-circle', bad: 'x-circle', warn: 'alert-triangle', info: 'info' }[type] || 'info';
    const el = NS.el(`<div class="ns-toast"><span class="t-${type}">${NS.icon(icon)}</span><div class="grow"><b>${NS.esc(title)}</b>${o.desc ? `<p>${NS.esc(o.desc)}</p>` : ''}</div>${o.action ? `<button class="act">${NS.esc(o.action.label)}</button>` : ''}</div>`);
    if (o.action) el.querySelector('.act').onclick = () => { o.action.onClick && o.action.onClick(); kill(); };
    toastWrap.appendChild(el);
    let t;
    const kill = () => { clearTimeout(t); el.classList.add('out'); setTimeout(() => el.remove(), 200); };
    t = setTimeout(kill, o.duration || 3800);
    el.addEventListener('click', (e) => { if (!e.target.closest('.act')) kill(); });
    return kill;
  };

  /* ---------- overlays: modal / confirm / drawer / dropdown ---------- */
  const overlays = [];
  const trapFocus = (el) => { const f = el.querySelector('input,button,textarea,select,[tabindex]:not([tabindex="-1"])'); if (f) setTimeout(() => f.focus({ preventScroll: true }), 30); };
  NS.modal = (o = {}) => {
    const wrap = NS.el(`<div class="ns-overlay ns-center" role="dialog" aria-modal="true"><div class="ns-modal ${o.size || ''}"><div class="ns-modal-head"><div><h2>${str(o.title)}</h2>${o.sub ? `<p>${str(o.sub)}</p>` : ''}</div><button class="ns-icon-btn" data-close aria-label="Close">${NS.icon('x')}</button></div><div class="ns-modal-body">${str(o.body)}</div>${o.foot || (o.actions && o.actions.length) ? `<div class="ns-modal-foot">${str(o.foot)}</div>` : ''}</div></div>`);
    const close = () => { if (!wrap.isConnected) return; wrap.remove(); overlays.splice(overlays.indexOf(api), 1); o.onClose && o.onClose(); };
    const api = { close, el: wrap };
    if (o.actions) {
      const foot = wrap.querySelector('.ns-modal-foot');
      o.actions.forEach((a) => { const b = NS.el(`<button class="ns-btn ${a.cls || 'secondary'}">${a.icon ? NS.icon(a.icon) : ''}${NS.esc(a.label)}</button>`); b.onclick = () => { const r = a.onClick && a.onClick(api); if (a.close !== false && r !== false) close(); }; foot.appendChild(b); });
    }
    wrap.addEventListener('click', (e) => { if (e.target === wrap && o.dismissible !== false) close(); if (e.target.closest('[data-close]')) close(); });
    doc.body.appendChild(wrap); overlays.push(api); trapFocus(wrap);
    o.mounted && o.mounted(wrap.querySelector('.ns-modal-body'), api);
    return api;
  };
  NS.confirm = (o = {}) => new Promise((res) => {
    NS.modal({ title: o.title || 'Are you sure?', sub: o.sub, size: 'sm', body: `<p class="md ink2">${str(o.body || '')}</p>`, onClose: () => res(false), actions: [{ label: o.cancelLabel || 'Cancel', cls: 'secondary' }, { label: o.confirmLabel || 'Confirm', cls: o.danger ? 'danger' : 'primary', onClick: (m) => { m.el.__ok = true; res(true); } }] });
  });
  NS.drawer = (o = {}) => {
    const wrap = NS.el(`<div class="ns-drawer-wrap" role="dialog" aria-modal="true"><aside class="ns-drawer ${o.size || ''}"><div class="ns-drawer-head"><div class="grow min-w-0">${o.eyebrow ? `<div class="ns-eyebrow">${str(o.eyebrow)}</div>` : ''}<h2>${str(o.title)}</h2>${o.sub ? `<p class="muted sm mt-1">${str(o.sub)}</p>` : ''}</div><button class="ns-icon-btn" data-close aria-label="Close">${NS.icon('x')}</button></div><div class="ns-drawer-body">${str(o.body)}</div>${o.foot ? `<div class="ns-drawer-foot">${str(o.foot)}</div>` : ''}</aside></div>`);
    const close = () => { if (!wrap.isConnected) return; wrap.remove(); overlays.splice(overlays.indexOf(api), 1); o.onClose && o.onClose(); };
    const api = { close, el: wrap, body: wrap.querySelector('.ns-drawer-body') };
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); if (e.target.closest('[data-close]')) close(); });
    doc.body.appendChild(wrap); overlays.push(api); trapFocus(wrap);
    o.mounted && o.mounted(api.body, api);
    return api;
  };
  let openDropdown = null;
  NS.dropdown = (anchor, o = {}) => {
    if (openDropdown) { const same = openDropdown.anchor === anchor; openDropdown.close(); if (same) return null; }
    const items = o.items || [];
    const html = o.html != null ? str(o.html) : items.map((it) => it.sep ? '<div class="ns-dropdown-sep"></div>' : it.head ? `<div class="ns-dropdown-head">${NS.esc(it.head)}</div>` : `<button class="ns-dropdown-item" role="menuitem" ${it.checked != null ? `aria-checked="${!!it.checked}"` : ''} data-i="${items.indexOf(it)}">${it.icon ? NS.icon(it.icon) : it.avatar ? str(it.avatar) : ''}<span class="grow min-w-0"><span class="truncate" style="display:block">${NS.esc(it.label)}</span>${it.sub ? `<span class="sub">${NS.esc(it.sub)}</span>` : ''}</span>${it.checked ? NS.icon('check') : ''}</button>`).join('');
    const el = NS.el(`<div class="ns-dropdown ${o.cls || ''}" role="menu">${html}</div>`);
    doc.body.appendChild(el);
    const r = anchor.getBoundingClientRect();
    const w = el.offsetWidth, h = el.offsetHeight;
    let left = o.align === 'left' ? r.left : r.right - w;
    left = U.clamp(left, 8, innerWidth - w - 8);
    let top = r.bottom + 8; if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 8);
    el.style.left = left + 'px'; el.style.top = top + 'px';
    const close = () => { el.remove(); doc.removeEventListener('mousedown', outside, true); doc.removeEventListener('keydown', esc, true); if (openDropdown && openDropdown.el === el) openDropdown = null; o.onClose && o.onClose(); };
    const outside = (e) => { if (!el.contains(e.target) && !anchor.contains(e.target)) close(); };
    const esc = (e) => { if (e.key === 'Escape') { close(); e.stopPropagation(); } };
    setTimeout(() => { doc.addEventListener('mousedown', outside, true); doc.addEventListener('keydown', esc, true); }, 0);
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) { const it = items[+b.dataset.i]; it.onClick && it.onClick(it); if (it.keep !== true) close(); } });
    openDropdown = { el, close, anchor };
    o.mounted && o.mounted(el, { close });
    return openDropdown;
  };
  doc.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlays.length) { const top = overlays[overlays.length - 1]; if (!top.el.__ok) top.close(); } });

  /* ---------- small renderers ---------- */
  NS.avatar = (p, o = {}) => {
    const name = typeof p === 'string' ? p : (p && p.name) || '?';
    const hue = (typeof p === 'object' && p && p.hue != null) ? p.hue : NS.hashStr(name) % 10;
    return `<span class="ns-avatar h${hue} ${o.size || ''} ${o.cls || ''}" ${o.tip ? `data-tip="${NS.esc(name)}"` : ''} aria-label="${NS.esc(name)}">${NS.esc(F.initials(name))}${o.status ? '<i class="st"></i>' : ''}</span>`;
  };
  NS.badge = (text, cls = '', dot = false) => `<span class="ns-badge ${cls}">${dot ? '<i class="dot"></i>' : ''}${NS.esc(text)}</span>`;
  NS.ring = (o = {}) => {
    const size = o.size || 96, th = o.thickness || 9, r = (size - th) / 2, c = 2 * Math.PI * r, v = U.clamp(o.value ?? 0, 0, 1);
    return `<span class="ns-ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-4)" stroke-width="${th}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${o.color || 'var(--brand)'}" stroke-width="${th}" stroke-linecap="round" stroke-dasharray="${(c * v).toFixed(1)} ${c.toFixed(1)}" style="transition:stroke-dasharray .8s var(--ease)"/></svg><span class="c">${o.label != null ? `<b style="font-size:${Math.round(size * .23)}px">${str(o.label)}</b>` : ''}${o.sub ? `<span>${str(o.sub)}</span>` : ''}</span></span>`;
  };
  NS.spark = (vals, o = {}) => {
    if (!vals || vals.length < 2) return '';
    const w = o.width || 120, h = o.height || 40, p = 3;
    const min = o.min ?? Math.min(...vals), max = o.max ?? Math.max(...vals), span = max - min || 1;
    const pts = vals.map((v, i) => [p + (i / (vals.length - 1)) * (w - 2 * p), h - p - ((v - min) / span) * (h - 2 * p)]);
    const d = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
    const id = U.uid(); const col = o.color || 'var(--brand)';
    const last = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:${h}px;overflow:visible" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".28"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>${o.area !== false ? `<path d="${d} L${last[0].toFixed(1)} ${h} L${pts[0][0].toFixed(1)} ${h}Z" fill="url(#${id})"/>` : ''}<path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${o.dot !== false ? `<circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3" fill="${col}" stroke="var(--surface)" stroke-width="2" vector-effect="non-scaling-stroke"/>` : ''}</svg>`;
  };
  NS.stat = (o = {}) => `<div class="ns-stat ${o.cls || ''}">${o.icon ? `<div class="flex items-center justify-between"><span class="lbl">${NS.esc(o.label)}</span><span class="ic">${NS.icon(o.icon)}</span></div>` : `<div class="lbl"><span>${NS.esc(o.label)}</span>${o.delta ? str(o.delta) : ''}</div>`}<div class="val">${str(o.value)}${o.unit ? `<small>${str(o.unit)}</small>` : ''}</div>${o.sub ? `<div class="sub">${str(o.sub)}</div>` : ''}${o.spark ? `<div class="spark">${NS.spark(o.spark, { color: o.sparkColor })}</div>` : ''}</div>`;
  NS.delta = (n, o = {}) => { const up = n > 0, flat = n === 0 || n == null; const good = o.invert ? !up : up; return `<span class="ns-delta ${flat ? 'flat' : good ? 'up' : 'down'}">${flat ? '' : NS.icon(up ? 'arrow-up-right' : 'arrow-down-right')}${flat ? '—' : (o.fmt ? o.fmt(Math.abs(n)) : Math.abs(n).toFixed(o.d ?? 1) + (o.suf ?? '%'))}</span>`; };
  NS.progress = (v, o = {}) => `<div class="ns-progress ${o.cls || ''}" role="progressbar" aria-valuenow="${Math.round(v)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${U.clamp(v, 0, 100)}%${o.color ? `;background:${o.color}` : ''}"></i></div>`;
  NS.empty = (o = {}) => `<div class="ns-empty"><span class="ns-icon-box lg neutral">${NS.icon(o.icon || 'inbox')}</span><b>${NS.esc(o.title || 'Nothing here yet')}</b><p>${str(o.body || '')}</p>${o.action ? `<div class="mt-2">${str(o.action)}</div>` : ''}</div>`;
  NS.person = (p, o = {}) => `<div class="ns-person">${NS.avatar(p, { size: o.size || 'sm' })}<div class="min-w-0"><div class="nm">${NS.esc(p.name)}</div>${o.sub !== false ? `<div class="sb">${NS.esc(o.sub || p.title || '')}</div>` : ''}</div></div>`;

  window.NS = NS;
})();

/* ==========================================================================
   ns.js · part 2 — charts, table, drag & drop
   ========================================================================== */
(function () {
  'use strict';
  const NS = window.NS, U = NS.util, F = NS.fmt, doc = document;

  /* ---------- shared viz helpers ---------- */
  let tip;
  const tipEl = () => { if (!tip) { tip = NS.el('<div class="ns-viztip" role="tooltip"></div>'); doc.body.appendChild(tip); } return tip; };
  const showTip = (html, x, y) => { const t = tipEl(); t.innerHTML = html; t.classList.add('show'); const w = t.offsetWidth; const cx = U.clamp(x, w / 2 + 8, innerWidth - w / 2 - 8); t.style.left = cx + 'px'; t.style.top = (y < 90 ? y + 24 + t.offsetHeight : y) + 'px'; };
  const hideTip = () => { if (tip) tip.classList.remove('show'); };
  NS.viztip = { show: showTip, hide: hideTip };
  const VIZ = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--viz-6)', 'var(--viz-7)', 'var(--viz-8)'];
  NS.vizColor = (i) => VIZ[i % 8];
  const cssVar = (name) => getComputedStyle(doc.documentElement).getPropertyValue(name).trim();
  NS.cssVar = cssVar;
  const hex2rgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rgb2hex = (r) => '#' + r.map((v) => Math.round(U.clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex([U.lerp(A[0], B[0], t), U.lerp(A[1], B[1], t), U.lerp(A[2], B[2], t)]); };
  const lum = (h) => { const [r, g, b] = hex2rgb(h).map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
  NS.color = { mix, lum, hex2rgb, rgb2hex };
  const niceTicks = (min, max, n = 5) => {
    if (min === max) { max = min + 1; }
    const span = max - min, step0 = span / Math.max(1, n - 1), mag = 10 ** Math.floor(Math.log10(step0)), res = step0 / mag;
    const step = (res >= 5 ? 10 : res >= 2 ? 5 : res >= 1 ? 2 : 1) * mag;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    const t = []; for (let v = lo; v <= hi + step / 2; v += step) t.push(U.round(v, 6));
    return { ticks: t, lo, hi };
  };
  const measure = (el, o) => ({ W: Math.max(240, el.clientWidth || o.width || 600), H: o.height || 240 });
  const register = (el, fn) => { el.__nsRender = fn; el.classList.add('ns-viz'); };
  const legendHtml = (series, colors, o = {}) => series.length < 2 && !o.force ? '' : `<div class="ns-legend ${o.cls || ''}" style="margin:${o.pos === 'top' ? '0 0 10px' : '10px 0 0'}">${series.map((s, i) => `<span><i class="${o.line ? 'line' : ''}" style="background:${colors[i]}"></i>${NS.esc(s.name)}</span>`).join('')}</div>`;
  const tableHtml = (labels, series, fmt) => `<div class="ns-viz-table"><table><thead><tr><th></th>${series.map((s) => `<th>${NS.esc(s.name)}</th>`).join('')}</tr></thead><tbody>${labels.map((l, i) => `<tr><td>${NS.esc(l)}</td>${series.map((s) => `<td>${fmt(s.values[i])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const toggleHtml = () => `<div class="flex justify-end mt-1"><button class="ns-viz-toggle" data-viz-toggle>Table view</button></div>`;
  const bindToggle = (el) => { const b = el.querySelector('[data-viz-toggle]'); if (b) b.onclick = () => { const on = el.dataset.table === '1'; el.dataset.table = on ? '' : '1'; b.textContent = on ? 'Table view' : 'Chart view'; }; };
  const fmtDefault = (v) => (v == null ? '—' : Math.abs(v) >= 1000 ? F.compact(v) : F.num(v, Number.isInteger(v) ? 0 : 1));
  const monoPath = (pts) => { // monotone cubic (Fritsch–Carlson)
    const n = pts.length; if (n < 3) return pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const d = [], m = [];
    for (let i = 0; i < n - 1; i++) d.push((pts[i + 1][1] - pts[i][1]) / ((pts[i + 1][0] - pts[i][0]) || 1e-6));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; } }
    let p = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) { const dx = (pts[i + 1][0] - pts[i][0]) / 3; p += ` C${(pts[i][0] + dx).toFixed(1)} ${(pts[i][1] + m[i] * dx).toFixed(1)} ${(pts[i + 1][0] - dx).toFixed(1)} ${(pts[i + 1][1] - m[i + 1] * dx).toFixed(1)} ${pts[i + 1][0].toFixed(1)} ${pts[i + 1][1].toFixed(1)}`; }
    return p;
  };
  const yAxisWidth = (ticks, fmt) => Math.max(...ticks.map((t) => String(fmt(t)).length)) * 6.6 + 10;

  const C = {};
  /* LINE / AREA — opts: {labels, series:[{name, values, color, dashed}], height, yFormat, yMin, yMax, area, smooth, endLabels, threshold:{value,label}, markers:[{i,label}], xEvery, legend:'top'|'bottom'|false, table:true} */
  C.line = (el, o) => {
    register(el, () => C.line(el, o));
    const { W, H } = measure(el, o);
    const series = o.series.map((s, i) => ({ ...s, color: s.color || VIZ[i % 8] }));
    const fmt = o.yFormat || fmtDefault;
    const all = series.flatMap((s) => s.values.filter((v) => v != null));
    let lo = o.yMin ?? Math.min(...all), hi = o.yMax ?? Math.max(...all);
    if (o.threshold) { lo = Math.min(lo, o.threshold.value); hi = Math.max(hi, o.threshold.value); }
    if (o.yMin == null && lo > 0 && lo < (hi - lo) * .5) lo = 0;
    const T = niceTicks(lo, hi, 5); if (o.yMin != null) T.lo = o.yMin; if (o.yMax != null) T.hi = o.yMax;
    const ticks = T.ticks.filter((t) => t >= T.lo - 1e-9 && t <= T.hi + 1e-9);
    const mL = yAxisWidth(ticks, fmt), mR = o.endLabels ? 48 : 12, mT = 12, mB = 26;
    const pw = W - mL - mR, ph = H - mT - mB, n = o.labels.length;
    const x = (i) => mL + (n > 1 ? (i / (n - 1)) * pw : pw / 2), y = (v) => mT + ph - ((v - T.lo) / ((T.hi - T.lo) || 1)) * ph;
    const every = o.xEvery || Math.ceil(n / Math.max(2, Math.floor(pw / 64)));
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${NS.esc(o.aria || 'Line chart')}"><defs>${series.map((s, i) => `<linearGradient id="g${i}_${el.id || 'x'}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${s.color}" stop-opacity=".22"/><stop offset="1" stop-color="${s.color}" stop-opacity="0"/></linearGradient>`).join('')}</defs>`;
    svg += `<g class="grid">${ticks.map((t) => `<line x1="${mL}" x2="${W - mR}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/>`).join('')}</g>`;
    svg += `<g class="axis"><line x1="${mL}" x2="${W - mR}" y1="${(mT + ph).toFixed(1)}" y2="${(mT + ph).toFixed(1)}"/></g>`;
    svg += ticks.map((t) => `<text x="${mL - 8}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${fmt(t)}</text>`).join('');
    const stepPx = n > 1 ? pw / (n - 1) : pw; const showX = (i) => i === n - 1 || (i % every === 0 && (n - 1 - i) * stepPx >= 60);
    svg += o.labels.map((l, i) => showX(i) ? `<text x="${x(i).toFixed(1)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}">${NS.esc(l)}</text>` : '').join('');
    if (o.threshold) svg += `<line x1="${mL}" x2="${W - mR}" y1="${y(o.threshold.value).toFixed(1)}" y2="${y(o.threshold.value).toFixed(1)}" stroke="var(--ink-4)" stroke-width="1.5" stroke-dasharray="5 5"/><text x="${W - mR}" y="${(y(o.threshold.value) - 6).toFixed(1)}" text-anchor="end" class="lbl">${NS.esc(o.threshold.label || '')}</text>`;
    series.forEach((s, si) => {
      const pts = s.values.map((v, i) => (v == null ? null : [x(i), y(v)])).filter(Boolean);
      const d = o.smooth === false ? pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') : monoPath(pts);
      if (o.area !== false && series.length <= 2) svg += `<path class="mark" d="${d} L${pts[pts.length - 1][0].toFixed(1)} ${(mT + ph).toFixed(1)} L${pts[0][0].toFixed(1)} ${(mT + ph).toFixed(1)}Z" fill="url(#g${si}_${el.id || 'x'})"/>`;
      svg += `<path class="mark" d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${s.dashed ? 'stroke-dasharray="6 5"' : ''}/>`;
      if (o.endLabels) { const p = pts[pts.length - 1]; svg += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="${s.color}" stroke="var(--surface)" stroke-width="2"/><text x="${(p[0] + 8).toFixed(1)}" y="${(p[1] + 4).toFixed(1)}" class="lbl">${fmt(s.values[s.values.length - 1])}</text>`; }
    });
    (o.markers || []).forEach((m) => { const v = series[0].values[m.i]; if (v == null) return; svg += `<circle cx="${x(m.i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="5" fill="var(--surface)" stroke="${series[0].color}" stroke-width="2"/><text x="${x(m.i).toFixed(1)}" y="${(y(v) - 12).toFixed(1)}" text-anchor="middle" class="lbl">${NS.esc(m.label)}</text>`; });
    svg += `<g class="hover" style="opacity:0"><line class="crosshair" y1="${mT}" y2="${mT + ph}" x1="0" x2="0"/>${series.map((s) => `<circle r="5" fill="${s.color}" stroke="var(--surface)" stroke-width="2"/>`).join('')}</g>`;
    svg += `<rect class="hit" x="${mL}" y="${mT}" width="${pw}" height="${ph}"/></svg>`;
    el.innerHTML = (o.legend === 'top' ? legendHtml(series, series.map((s) => s.color), { pos: 'top', line: true }) : '') + svg + (o.legend !== 'top' && o.legend !== false ? legendHtml(series, series.map((s) => s.color), { line: true }) : '') + (o.table !== false ? tableHtml(o.labels, series, fmt) + toggleHtml() : '');
    bindToggle(el);
    const hit = el.querySelector('.hit'), hov = el.querySelector('.hover'), svgEl = el.querySelector('svg');
    const dots = Array.from(hov.querySelectorAll('circle')), cross = hov.querySelector('line');
    const move = (e) => {
      const r = svgEl.getBoundingClientRect(); const sx = W / r.width; const px = (e.clientX - r.left) * sx;
      const i = U.clamp(Math.round(((px - mL) / pw) * (n - 1)), 0, n - 1);
      const cx = x(i); cross.setAttribute('x1', cx); cross.setAttribute('x2', cx);
      series.forEach((s, si) => { const v = s.values[i]; dots[si].style.display = v == null ? 'none' : ''; if (v != null) { dots[si].setAttribute('cx', cx); dots[si].setAttribute('cy', y(v)); } });
      hov.style.opacity = 1;
      showTip(`<b>${NS.esc(o.labels[i])}</b>${series.map((s) => `<div class="r"><span><i style="background:${s.color}"></i>${NS.esc(s.name)}</span><span>${fmt(s.values[i])}</span></div>`).join('')}`, r.left + cx / sx, r.top + mT / sx);
      o.onHover && o.onHover(i);
    };
    hit.addEventListener('mousemove', move); hit.addEventListener('touchmove', (e) => move(e.touches[0]), { passive: true }); hit.addEventListener('touchstart', (e) => move(e.touches[0]), { passive: true });
    hit.addEventListener('mouseleave', () => { hov.style.opacity = 0; hideTip(); }); hit.addEventListener('touchend', () => { hov.style.opacity = 0; hideTip(); });
  };

  /* BARS — opts: {labels, series:[{name, values, color}], stacked, height, yFormat, yMax, showValues, legend, table, colorByIndex(single series, ordinal), onBar(i)} */
  C.bars = (el, o) => {
    register(el, () => C.bars(el, o));
    const { W, H } = measure(el, o);
    const series = o.series.map((s, i) => ({ ...s, color: s.color || VIZ[i % 8] }));
    const fmt = o.yFormat || fmtDefault, n = o.labels.length, stacked = !!o.stacked && series.length > 1;
    const totals = o.labels.map((_, i) => stacked ? U.sum(series.map((s) => s.values[i] || 0)) : Math.max(...series.map((s) => s.values[i] || 0)));
    const minV = Math.min(0, ...series.flatMap((s) => s.values));
    const T = niceTicks(minV, o.yMax ?? Math.max(...totals, 0), 5); if (o.yMax != null) T.hi = o.yMax;
    const ticks = T.ticks.filter((t) => t >= T.lo - 1e-9 && t <= T.hi + 1e-9);
    const mL = yAxisWidth(ticks, fmt), mR = 8, mT = 14, mB = 26, pw = W - mL - mR, ph = H - mT - mB;
    const y = (v) => mT + ph - ((v - T.lo) / ((T.hi - T.lo) || 1)) * ph, y0 = y(0);
    const band = pw / n, inner = band * (n > 12 ? .82 : .66), gcount = stacked ? 1 : series.length, bw = Math.max(2, (inner - (gcount - 1) * 2) / gcount);
    const every = Math.ceil(n / Math.max(2, Math.floor(pw / 56)));
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${NS.esc(o.aria || 'Bar chart')}">`;
    svg += `<g class="grid">${ticks.map((t) => `<line x1="${mL}" x2="${W - mR}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/>`).join('')}</g>`;
    svg += ticks.map((t) => `<text x="${mL - 8}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${fmt(t)}</text>`).join('');
    const rbar = (x, top, w, h, r, color, extra = '') => { r = Math.min(r, w / 2, Math.max(0, h)); return `<path ${extra} d="M${x.toFixed(1)} ${(top + h).toFixed(1)} V${(top + r).toFixed(1)} Q${x.toFixed(1)} ${top.toFixed(1)} ${(x + r).toFixed(1)} ${top.toFixed(1)} H${(x + w - r).toFixed(1)} Q${(x + w).toFixed(1)} ${top.toFixed(1)} ${(x + w).toFixed(1)} ${(top + r).toFixed(1)} V${(top + h).toFixed(1)}Z" fill="${color}"/>`; };
    o.labels.forEach((l, i) => {
      const gx = mL + i * band + (band - inner) / 2;
      let g = `<g class="mark bar-group" data-i="${i}">`;
      if (stacked) {
        let acc = 0;
        series.forEach((s, si) => { const v = s.values[i] || 0; if (v <= 0) return; const top = y(acc + v), bottom = y(acc); const isTop = si === series.length - 1 || series.slice(si + 1).every((q) => !(q.values[i] > 0)); g += rbar(gx, top + (si ? 0 : 0), inner, Math.max(0, bottom - top - (isTop ? 0 : 2)), isTop ? 4 : 0, s.color); acc += v; });
        if (o.showValues && totals[i] > 0) g += `<text x="${(gx + inner / 2).toFixed(1)}" y="${(y(totals[i]) - 6).toFixed(1)}" text-anchor="middle" class="lbl">${fmt(totals[i])}</text>`;
      } else {
        series.forEach((s, si) => { const v = s.values[i] || 0; const x = gx + si * (bw + 2); const top = Math.min(y(v), y0), h = Math.abs(y0 - y(v)); const col = o.colorByIndex && series.length === 1 ? (o.colors ? o.colors[i % o.colors.length] : s.color) : s.color; g += rbar(x, top, bw, h, 4, col); if (o.showValues && (series.length === 1 || o.showValues === 'all') && v) g += `<text x="${(x + bw / 2).toFixed(1)}" y="${(top - 6).toFixed(1)}" text-anchor="middle" class="lbl">${fmt(v)}</text>`; });
      }
      g += `<rect class="hit" x="${(mL + i * band).toFixed(1)}" y="${mT}" width="${band.toFixed(1)}" height="${ph}"/></g>`;
      svg += g;
      if (i === n - 1 || (i % every === 0 && (n - 1 - i) * band >= 60)) svg += `<text x="${(mL + i * band + band / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${NS.esc(l)}</text>`;
    });
    svg += `<g class="axis"><line x1="${mL}" x2="${W - mR}" y1="${y0.toFixed(1)}" y2="${y0.toFixed(1)}"/></g></svg>`;
    el.innerHTML = (o.legend === 'top' ? legendHtml(series, series.map((s) => s.color), { pos: 'top' }) : '') + svg + (o.legend !== 'top' && o.legend !== false ? legendHtml(series, series.map((s) => s.color)) : '') + (o.table !== false ? tableHtml(o.labels, series, fmt) + toggleHtml() : '');
    bindToggle(el);
    const svgEl = el.querySelector('svg');
    el.querySelectorAll('.bar-group').forEach((g) => {
      const i = +g.dataset.i;
      g.addEventListener('mouseenter', (e) => { el.dataset.hover = '1'; g.classList.add('hot'); const r = g.getBoundingClientRect(); showTip(`<b>${NS.esc(o.labels[i])}</b>${series.map((s) => `<div class="r"><span><i style="background:${s.color}"></i>${NS.esc(s.name)}</span><span>${fmt(s.values[i])}</span></div>`).join('')}${stacked && series.length > 1 ? `<div class="r" style="margin-top:4px;border-top:1px solid var(--line);padding-top:4px"><span>Total</span><span>${fmt(totals[i])}</span></div>` : ''}`, r.left + r.width / 2, r.top); });
      g.addEventListener('mouseleave', () => { delete el.dataset.hover; g.classList.remove('hot'); hideTip(); });
      if (o.onBar) { g.style.cursor = 'pointer'; g.addEventListener('click', () => o.onBar(i)); }
    });
    void svgEl;
  };

  /* HBARS — ranked horizontal bars. opts: {items:[{label, value, color, sub}], format, max, height(row), showPct, onItem} */
  C.hbars = (el, o) => {
    register(el, () => C.hbars(el, o));
    const fmt = o.format || fmtDefault, max = o.max ?? (Math.max(...o.items.map((d) => d.value), 0) || 1);
    el.innerHTML = `<div class="grid" style="gap:${o.gap || 10}px">${o.items.map((d, i) => `<div class="hbar-row ${o.onItem ? 'pointer' : ''}" data-i="${i}" style="display:grid;grid-template-columns:${o.labelWidth || 'minmax(90px,32%)'} 1fr auto;gap:12px;align-items:center;font-size:12.5px"><div class="min-w-0"><div class="truncate ink medium">${NS.esc(d.label)}</div>${d.sub ? `<div class="faint xs truncate">${NS.esc(d.sub)}</div>` : ''}</div><div class="ns-progress" style="height:${o.thickness || 10}px"><i style="width:${U.clamp((d.value / max) * 100, 0, 100)}%;background:${d.color || o.color || VIZ[0]}"></i></div><div class="tnum semibold ink" style="min-width:44px;text-align:right">${fmt(d.value)}</div></div>`).join('')}</div>`;
    el.querySelectorAll('.hbar-row').forEach((r) => { const d = o.items[+r.dataset.i]; r.addEventListener('mouseenter', () => { const b = r.getBoundingClientRect(); showTip(`<b>${NS.esc(d.label)}</b><div class="r"><span>${NS.esc(o.valueLabel || 'Value')}</span><span>${fmt(d.value)}</span></div>${d.tip || ''}`, b.left + b.width / 2, b.top); }); r.addEventListener('mouseleave', hideTip); if (o.onItem) r.addEventListener('click', () => o.onItem(d, +r.dataset.i)); });
  };

  /* DONUT — opts: {items:[{label,value,color}], size, thickness, center:{value,label}, format, legend:'right'|'bottom'|false, onItem} */
  C.donut = (el, o) => {
    register(el, () => C.donut(el, o));
    const size = o.size || 180, th = o.thickness || 22, r = (size - th) / 2, c = 2 * Math.PI * r, total = U.sum(o.items, 'value') || 1, fmt = o.format || fmtDefault;
    const items = o.items.map((d, i) => ({ ...d, color: d.color || VIZ[i % 8] }));
    let off = 0; const gap = items.length > 1 ? 2.5 : 0;
    const segs = items.map((d, i) => { const len = (d.value / total) * c; const s = `<circle class="mark seg" data-i="${i}" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${d.color}" stroke-width="${th}" stroke-dasharray="${Math.max(0, len - gap).toFixed(2)} ${c.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" style="transition:stroke-width .2s"/>`; off += len; return s; }).join('');
    const legend = o.legend === false ? '' : `<div class="grid" style="gap:8px;font-size:12.5px;min-width:150px">${items.map((d, i) => `<div class="flex items-center gap-2 legend-i" data-i="${i}"><i style="width:10px;height:10px;border-radius:3px;background:${d.color};flex:none"></i><span class="grow truncate ink2">${NS.esc(d.label)}</span><span class="tnum semibold">${fmt(d.value)}</span><span class="faint tnum" style="min-width:36px;text-align:right">${F.pct((d.value / total) * 100, 0)}</span></div>`).join('')}</div>`;
    el.innerHTML = `<div class="flex items-center gap-5 wrap ${o.legend === 'bottom' ? 'col' : ''}" style="justify-content:${o.legend === 'bottom' ? 'center' : 'flex-start'}"><span class="ns-ring" style="width:${size}px;height:${size}px;flex:none"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="${th}"/>${segs}</svg><span class="c">${o.center ? `<b style="font-size:${Math.round(size * .16)}px">${NS.str(o.center.value)}</b><span>${NS.str(o.center.label || '')}</span>` : ''}</span></span>${legend}</div>` + (o.table !== false ? `<div class="ns-viz-table"><table><thead><tr><th>Segment</th><th>Value</th><th>Share</th></tr></thead><tbody>${items.map((d) => `<tr><td>${NS.esc(d.label)}</td><td>${fmt(d.value)}</td><td>${F.pct((d.value / total) * 100, 1)}</td></tr>`).join('')}</tbody></table></div>` : '');
    const segEls = el.querySelectorAll('.seg');
    const hot = (i, on) => { segEls.forEach((s, k) => { s.style.opacity = on && k !== i ? .4 : 1; s.setAttribute('stroke-width', on && k === i ? th + 4 : th); }); };
    el.querySelectorAll('.seg, .legend-i').forEach((s) => { const i = +s.dataset.i, d = items[i]; s.addEventListener('mouseenter', (e) => { hot(i, true); showTip(`<b>${NS.esc(d.label)}</b><div class="r"><span>Value</span><span>${fmt(d.value)}</span></div><div class="r"><span>Share</span><span>${F.pct((d.value / total) * 100, 1)}</span></div>`, e.clientX, e.clientY - 8); }); s.addEventListener('mousemove', (e) => showTip(tip.innerHTML, e.clientX, e.clientY - 8)); s.addEventListener('mouseleave', () => { hot(i, false); hideTip(); }); if (o.onItem) { s.style.cursor = 'pointer'; s.addEventListener('click', () => o.onItem(d, i)); } });
  };

  /* RADAR — opts: {axes:[...], series:[{name, values, color}], max, size, legend} */
  C.radar = (el, o) => {
    register(el, () => C.radar(el, o));
    const size = Math.min(o.size || 320, Math.max(220, el.clientWidth || 320)), cx = size / 2, cy = size / 2, R = size / 2 - 44, n = o.axes.length, max = o.max || 5, rings = o.rings || 5;
    const series = o.series.map((s, i) => ({ ...s, color: s.color || VIZ[i % 8] }));
    const ang = (i) => -Math.PI / 2 + (i / n) * 2 * Math.PI, pt = (i, v) => [cx + Math.cos(ang(i)) * R * (v / max), cy + Math.sin(ang(i)) * R * (v / max)];
    let svg = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${NS.esc(o.aria || 'Radar chart')}" style="width:${size}px;max-width:100%;height:auto;display:block;margin:0 auto">`;
    for (let k = 1; k <= rings; k++) svg += `<polygon points="${U.range(n).map((i) => pt(i, (max * k) / rings).map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="${k === rings ? 'var(--surface-2)' : 'none'}" stroke="var(--viz-grid)" stroke-width="1" style="${k === rings ? 'opacity:.6' : ''}"/>`;
    U.range(n).forEach((i) => { const p = pt(i, max); svg += `<line x1="${cx}" y1="${cy}" x2="${p[0].toFixed(1)}" y2="${p[1].toFixed(1)}" stroke="var(--viz-axis)"/>`; const lp = pt(i, max * 1.17); const anchor = Math.abs(Math.cos(ang(i))) < .2 ? 'middle' : Math.cos(ang(i)) > 0 ? 'start' : 'end'; svg += `<text x="${lp[0].toFixed(1)}" y="${(lp[1] + 4).toFixed(1)}" text-anchor="${anchor}" class="lbl">${NS.esc(o.axes[i])}</text>`; });
    series.forEach((s, si) => { const pts = s.values.map((v, i) => pt(i, v)); svg += `<polygon class="mark" points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="${s.color}" fill-opacity=".16" stroke="${s.color}" stroke-width="2" stroke-linejoin="round"/>`; pts.forEach((p, i) => svg += `<circle class="mark rpt" data-s="${si}" data-i="${i}" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="${s.color}" stroke="var(--surface)" stroke-width="2"/><circle class="hit" data-s="${si}" data-i="${i}" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="12"/>`); });
    svg += '</svg>';
    el.innerHTML = svg + (o.legend !== false ? legendHtml(series, series.map((s) => s.color), { cls: 'justify-center' }) : '') + (o.table !== false ? tableHtml(o.axes, series, (v) => F.num(v, 1)) + toggleHtml() : '');
    bindToggle(el);
    el.querySelectorAll('.hit').forEach((h) => { h.addEventListener('mouseenter', (e) => { const s = series[+h.dataset.s], i = +h.dataset.i; showTip(`<b>${NS.esc(o.axes[i])}</b>${series.map((q) => `<div class="r"><span><i style="background:${q.color}"></i>${NS.esc(q.name)}</span><span>${F.num(q.values[i], 1)}</span></div>`).join('')}`, e.clientX, e.clientY - 8); void s; }); h.addEventListener('mouseleave', hideTip); });
  };

  /* HEATMAP — opts: {rows, cols, values[[]], format, min, max, diverging, onCell, colWidth} */
  C.heatmap = (el, o) => {
    register(el, () => C.heatmap(el, o));
    const flat = o.values.flat().filter((v) => v != null), min = o.min ?? Math.min(...flat), max = o.max ?? Math.max(...flat), fmt = o.format || ((v) => (v == null ? '' : F.num(v, Number.isInteger(v) ? 0 : 1)));
    const lo = cssVar('--viz-seq-100') || '#cde2fb', hi = cssVar('--viz-seq-700') || '#0d366b', neg = cssVar('--viz-div-neg') || '#d03b3b', mid = cssVar('--viz-div-mid') || '#f0efec', pos = cssVar('--viz-div-pos') || '#2a78d6';
    const color = (v) => { if (v == null) return 'var(--surface-3)'; if (o.diverging) { const m = Math.max(Math.abs(min), Math.abs(max)) || 1; const t = v / m; return t < 0 ? mix(mid, neg, Math.min(1, -t)) : mix(mid, pos, Math.min(1, t)); } const t = (v - min) / ((max - min) || 1); return mix(lo, hi, t); };
    const dark = NS.theme.get() === 'dark';
    const textFor = (bg) => (bg.startsWith('var') ? 'var(--ink-3)' : (dark ? (lum(bg) > .28 ? '#0F172A' : '#F2F5F9') : (lum(bg) > .35 ? '#0F172A' : '#FFFFFF')));
    el.innerHTML = `<div class="ns-heat" style="grid-template-columns:${o.labelWidth || 'minmax(90px,auto)'} repeat(${o.cols.length},minmax(${o.colWidth || 40}px,1fr))"><div></div>${o.cols.map((c) => `<div class="hc">${NS.esc(c)}</div>`).join('')}${o.rows.map((r, ri) => `<div class="hl" title="${NS.esc(r)}">${NS.esc(r)}</div>${o.cols.map((c, ci) => { const v = o.values[ri][ci]; const bg = color(v); return `<div class="cell ${o.onCell ? 'pointer' : ''}" data-r="${ri}" data-c="${ci}" style="background:${bg};color:${textFor(bg)}">${o.showValues === false ? '' : fmt(v)}</div>`; }).join('')}`).join('')}</div>` + (o.table !== false ? `<div class="ns-viz-table"><table><thead><tr><th></th>${o.cols.map((c) => `<th>${NS.esc(c)}</th>`).join('')}</tr></thead><tbody>${o.rows.map((r, ri) => `<tr><td>${NS.esc(r)}</td>${o.cols.map((c, ci) => `<td>${fmt(o.values[ri][ci])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` + toggleHtml() : '');
    bindToggle(el);
    el.querySelectorAll('.cell').forEach((c) => { const ri = +c.dataset.r, ci = +c.dataset.c; c.addEventListener('mouseenter', () => { const b = c.getBoundingClientRect(); showTip(`<b>${NS.esc(o.rows[ri])} · ${NS.esc(o.cols[ci])}</b><div class="r"><span>${NS.esc(o.valueLabel || 'Value')}</span><span>${fmt(o.values[ri][ci])}</span></div>`, b.left + b.width / 2, b.top); }); c.addEventListener('mouseleave', hideTip); if (o.onCell) c.addEventListener('click', () => o.onCell(ri, ci, o.values[ri][ci])); });
  };

  /* SCATTER — opts: {points:[{x,y,label,group,r,sub}], groups:[names], xLabel, yLabel, xFormat, yFormat, height, xMin,xMax,yMin,yMax, quadrants:{x,y,labels:[tl,tr,bl,br]}, onPoint} */
  C.scatter = (el, o) => {
    register(el, () => C.scatter(el, o));
    const { W, H } = measure(el, o);
    const xf = o.xFormat || fmtDefault, yf = o.yFormat || fmtDefault;
    const xs = o.points.map((p) => p.x), ys = o.points.map((p) => p.y);
    const TX = niceTicks(o.xMin ?? Math.min(...xs), o.xMax ?? Math.max(...xs), 6), TY = niceTicks(o.yMin ?? Math.min(...ys), o.yMax ?? Math.max(...ys), 5);
    if (o.xMin != null) TX.lo = o.xMin; if (o.xMax != null) TX.hi = o.xMax; if (o.yMin != null) TY.lo = o.yMin; if (o.yMax != null) TY.hi = o.yMax;
    const tx = TX.ticks.filter((t) => t >= TX.lo - 1e-9 && t <= TX.hi + 1e-9), ty = TY.ticks.filter((t) => t >= TY.lo - 1e-9 && t <= TY.hi + 1e-9);
    const mL = yAxisWidth(ty, yf) + (o.yLabel ? 24 : 0), mR = 14, mT = 12, mB = o.xLabel ? 40 : 26, pw = W - mL - mR, ph = H - mT - mB;
    const x = (v) => mL + ((v - TX.lo) / ((TX.hi - TX.lo) || 1)) * pw, y = (v) => mT + ph - ((v - TY.lo) / ((TY.hi - TY.lo) || 1)) * ph;
    const groups = o.groups || U.uniq(o.points.map((p) => p.group).filter((g) => g != null));
    const colorOf = (p) => p.color || (p.group != null && groups.length ? VIZ[groups.indexOf(p.group) % 8] : VIZ[0]);
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${NS.esc(o.aria || 'Scatter plot')}">`;
    svg += `<g class="grid">${ty.map((t) => `<line x1="${mL}" x2="${W - mR}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/>`).join('')}${tx.map((t) => `<line y1="${mT}" y2="${mT + ph}" x1="${x(t).toFixed(1)}" x2="${x(t).toFixed(1)}"/>`).join('')}</g>`;
    if (o.quadrants) { const q = o.quadrants; svg += `<line x1="${x(q.x).toFixed(1)}" x2="${x(q.x).toFixed(1)}" y1="${mT}" y2="${mT + ph}" stroke="var(--ink-4)" stroke-dasharray="5 5"/><line y1="${y(q.y).toFixed(1)}" y2="${y(q.y).toFixed(1)}" x1="${mL}" x2="${W - mR}" stroke="var(--ink-4)" stroke-dasharray="5 5"/>`; if (q.labels) { const L = q.labels; svg += `<text x="${mL + 8}" y="${mT + 14}" class="lbl" style="opacity:.7">${NS.esc(L[0] || '')}</text><text x="${W - mR - 8}" y="${mT + 14}" text-anchor="end" class="lbl" style="opacity:.7">${NS.esc(L[1] || '')}</text><text x="${mL + 8}" y="${mT + ph - 8}" class="lbl" style="opacity:.7">${NS.esc(L[2] || '')}</text><text x="${W - mR - 8}" y="${mT + ph - 8}" text-anchor="end" class="lbl" style="opacity:.7">${NS.esc(L[3] || '')}</text>`; } }
    svg += ty.map((t) => `<text x="${mL - 8}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${yf(t)}</text>`).join('') + tx.map((t) => `<text x="${x(t).toFixed(1)}" y="${mT + ph + 16}" text-anchor="middle">${xf(t)}</text>`).join('');
    if (o.xLabel) svg += `<text x="${mL + pw / 2}" y="${H - 4}" text-anchor="middle" class="lbl">${NS.esc(o.xLabel)}</text>`;
    if (o.yLabel) svg += `<text transform="translate(12 ${mT + ph / 2}) rotate(-90)" text-anchor="middle" class="lbl">${NS.esc(o.yLabel)}</text>`;
    svg += `<g class="axis"><line x1="${mL}" x2="${W - mR}" y1="${(mT + ph).toFixed(1)}" y2="${(mT + ph).toFixed(1)}"/><line x1="${mL}" x2="${mL}" y1="${mT}" y2="${(mT + ph).toFixed(1)}"/></g>`;
    o.points.forEach((p, i) => { const px = x(p.x), py = y(p.y); svg += `<circle class="mark pt" data-i="${i}" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${p.r || 5}" fill="${colorOf(p)}" fill-opacity=".85" stroke="var(--surface)" stroke-width="2"/>`; });
    o.points.forEach((p, i) => { svg += `<circle class="hit" data-i="${i}" cx="${x(p.x).toFixed(1)}" cy="${y(p.y).toFixed(1)}" r="12"/>`; });
    svg += '</svg>';
    el.innerHTML = svg + (groups.length > 1 ? legendHtml(groups.map((g) => ({ name: g })), groups.map((g, i) => VIZ[i % 8])) : '');
    el.querySelectorAll('.hit').forEach((h) => { const p = o.points[+h.dataset.i], dot = el.querySelector(`.pt[data-i="${h.dataset.i}"]`); h.addEventListener('mouseenter', (e) => { dot.setAttribute('r', (p.r || 5) + 3); showTip(`<b>${NS.esc(p.label || '')}</b>${p.sub ? `<div class="faint xs" style="margin-bottom:4px">${NS.esc(p.sub)}</div>` : ''}<div class="r"><span>${NS.esc(o.xLabel || 'x')}</span><span>${xf(p.x)}</span></div><div class="r"><span>${NS.esc(o.yLabel || 'y')}</span><span>${yf(p.y)}</span></div>${p.tip || ''}`, e.clientX, e.clientY - 10); }); h.addEventListener('mouseleave', () => { dot.setAttribute('r', p.r || 5); hideTip(); }); if (o.onPoint) { h.style.cursor = 'pointer'; h.addEventListener('click', () => o.onPoint(p)); } });
  };

  /* FUNNEL — opts: {stages:[{label,value,color}], format} */
  C.funnel = (el, o) => {
    register(el, () => C.funnel(el, o));
    const fmt = o.format || F.int, max = o.stages[0].value || 1;
    el.innerHTML = `<div class="grid" style="gap:8px">${o.stages.map((s, i) => { const prev = i ? o.stages[i - 1].value : s.value; const conv = prev ? (s.value / prev) * 100 : 0; return `<div class="fn-row" data-i="${i}" style="display:grid;grid-template-columns:minmax(150px,34%) 1fr 64px 52px;gap:12px;align-items:center;font-size:12.5px"><div class="ink medium truncate">${NS.esc(s.label)}</div><div style="height:26px;border-radius:6px;background:var(--surface-3);overflow:hidden"><div style="height:100%;width:${(s.value / max) * 100}%;background:${s.color || o.color || VIZ[0]};border-radius:6px;opacity:${1 - i * .08}"></div></div><div class="tnum semibold ink right">${fmt(s.value)}</div><div class="tnum faint right">${i ? F.pct(conv, 0) : '100%'}</div></div>`; }).join('')}</div>`;
    el.querySelectorAll('.fn-row').forEach((r) => { const s = o.stages[+r.dataset.i]; r.addEventListener('mouseenter', () => { const b = r.getBoundingClientRect(); showTip(`<b>${NS.esc(s.label)}</b><div class="r"><span>Count</span><span>${fmt(s.value)}</span></div><div class="r"><span>Of top</span><span>${F.pct((s.value / max) * 100, 1)}</span></div>`, b.left + b.width / 2, b.top); }); r.addEventListener('mouseleave', hideTip); });
  };
  NS.chart = C;

  /* re-render charts on container resize */
  let rw = 0;
  const ro = new ResizeObserver(U.debounce(() => { const w = innerWidth; if (Math.abs(w - rw) < 24) return; rw = w; doc.querySelectorAll('.ns-viz').forEach((el) => el.__nsRender && el.isConnected && el.__nsRender()); }, 160));
  ro.observe(doc.documentElement); rw = innerWidth;

  /* ---------- TABLE component ----------
     NS.table(el, {columns:[{key,label,render(row),sort(row)|false,align:'right',width,cls,tip}], rows, pageSize, sort:{key,dir}, search, searchKeys, rowKey, onRow, rowCls, empty, dense, footer, selectable, idKey}) */
  NS.table = (el, o) => {
    const st = { rows: o.rows || [], sortKey: o.sort ? o.sort.key : null, sortDir: o.sort ? (o.sort.dir || 1) : 1, page: 1, search: o.search || '', filter: o.filter || null, selected: new Set() };
    const pageSize = o.pageSize || 12;
    const colBy = (k) => o.columns.find((c) => c.key === k);
    const view = () => {
      let r = st.rows;
      if (st.filter) r = r.filter(st.filter);
      if (st.search) { const q = st.search.toLowerCase(); const keys = o.searchKeys || o.columns.map((c) => c.key); r = r.filter((row) => keys.some((k) => String(typeof k === 'function' ? k(row) : row[k] ?? '').toLowerCase().includes(q))); }
      if (st.sortKey) { const c = colBy(st.sortKey); const sv = c && c.sort ? c.sort : (row) => row[st.sortKey]; r = r.slice().sort((a, b) => { const va = sv(a), vb = sv(b); if (va == null) return 1; if (vb == null) return -1; return (va > vb ? 1 : va < vb ? -1 : 0) * st.sortDir; }); }
      return r;
    };
    const render = () => {
      const rows = view(), total = rows.length, pages = Math.max(1, Math.ceil(total / pageSize)); st.page = U.clamp(st.page, 1, pages);
      const slice = o.paginate === false ? rows : rows.slice((st.page - 1) * pageSize, st.page * pageSize);
      const head = o.columns.map((c) => `<th class="${c.sort === false ? '' : 'sortable'} ${c.align === 'right' ? 'num' : c.align === 'center' ? 'ctr' : ''} ${c.cls || ''}" ${c.width ? `style="width:${c.width}"` : ''} data-k="${c.key}" ${st.sortKey === c.key ? `aria-sort="${st.sortDir > 0 ? 'ascending' : 'descending'}"` : ''}>${NS.esc(c.label)}${c.sort === false ? '' : `<svg class="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m18 15-6-6-6 6"/></svg>`}</th>`).join('');
      const body = slice.length ? slice.map((row, i) => { const id = o.rowKey ? row[o.rowKey] : i; return `<tr class="${o.onRow ? 'clickable' : ''} ${o.rowCls ? o.rowCls(row) : ''}" data-id="${NS.esc(id)}" ${st.selected.has(id) ? 'aria-selected="true"' : ''}>${o.columns.map((c) => `<td class="${c.align === 'right' ? 'num' : c.align === 'center' ? 'ctr' : ''} ${c.cls || ''}">${c.render ? NS.str(c.render(row, i)) : NS.esc(row[c.key] ?? '')}</td>`).join('')}</tr>`; }).join('') : `<tr><td colspan="${o.columns.length}">${NS.empty(o.empty || { icon: 'search', title: 'No matching rows', body: 'Try a different search or clear the filters.' })}</td></tr>`;
      const from = total ? (st.page - 1) * pageSize + 1 : 0, to = Math.min(total, st.page * pageSize);
      const pager = pages > 1 && o.paginate !== false ? `<div class="ns-pager"><button data-p="prev" ${st.page === 1 ? 'disabled' : ''}>${NS.icon('chevron-left', { size: 14 })}</button>${pageBtns(st.page, pages)}<button data-p="next" ${st.page === pages ? 'disabled' : ''}>${NS.icon('chevron-right', { size: 14 })}</button></div>` : '';
      el.innerHTML = `<div class="ns-table-wrap"><table class="ns-table ${o.dense ? 'dense' : ''}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>${o.footer === false ? '' : `<div class="ns-table-foot"><span>${o.paginate === false ? `${F.int(total)} ${total === 1 ? 'row' : 'rows'}` : `Showing <b class="ink">${from}–${to}</b> of ${F.int(total)}`}</span>${pager}</div>`}</div>`;
      el.querySelectorAll('th.sortable').forEach((th) => th.onclick = () => { const k = th.dataset.k; if (st.sortKey === k) st.sortDir *= -1; else { st.sortKey = k; st.sortDir = 1; } render(); });
      el.querySelectorAll('[data-p]').forEach((b) => b.onclick = () => { const p = b.dataset.p; st.page = p === 'prev' ? st.page - 1 : p === 'next' ? st.page + 1 : +p; render(); });
      if (o.onRow) el.querySelectorAll('tbody tr.clickable').forEach((tr) => tr.onclick = (e) => { if (e.target.closest('button,a,input,select')) return; const id = tr.dataset.id; const row = st.rows.find((r, i) => String(o.rowKey ? r[o.rowKey] : i) === id); if (o.selectable) { st.selected.clear(); st.selected.add(o.rowKey ? row[o.rowKey] : id); render(); } o.onRow(row, tr); });
    };
    const pageBtns = (p, n) => { const set = new Set([1, n, p, p - 1, p + 1].filter((x) => x >= 1 && x <= n)); const arr = Array.from(set).sort((a, b) => a - b); let out = '', prev = 0; arr.forEach((x) => { if (x - prev > 1) out += '<span class="faint" style="padding:0 4px">…</span>'; out += `<button data-p="${x}" ${x === p ? 'aria-current="page"' : ''}>${x}</button>`; prev = x; }); return out; };
    render();
    return { el, state: st, refresh: render, setRows(r) { st.rows = r; st.page = 1; render(); }, setSearch(q) { st.search = q; st.page = 1; render(); }, setFilter(f) { st.filter = f; st.page = 1; render(); }, setSort(k, d) { st.sortKey = k; st.sortDir = d || 1; render(); }, rows: view };
  };

  /* ---------- Drag & drop helper ----------
     NS.dnd(container, {item:'.ns-kcard', zone:'.ns-kanban-col', onDrop(itemEl, zoneEl, beforeEl), canDrop(itemEl, zoneEl)}) */
  NS.dnd = (root, o) => {
    let dragging = null;
    root.querySelectorAll(o.item).forEach((it) => { it.setAttribute('draggable', 'true'); });
    root.addEventListener('dragstart', (e) => { const it = e.target.closest(o.item); if (!it) return; dragging = it; it.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', it.dataset.id || ''); } catch (x) { } });
    root.addEventListener('dragend', () => { if (dragging) dragging.classList.remove('dragging'); dragging = null; root.querySelectorAll(o.zone).forEach((z) => z.classList.remove('over')); });
    root.addEventListener('dragover', (e) => { const z = e.target.closest(o.zone); if (!z || !dragging) return; if (o.canDrop && !o.canDrop(dragging, z)) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; root.querySelectorAll(o.zone).forEach((q) => q.classList.toggle('over', q === z)); });
    root.addEventListener('dragleave', (e) => { const z = e.target.closest(o.zone); if (z && !z.contains(e.relatedTarget)) z.classList.remove('over'); });
    root.addEventListener('drop', (e) => { const z = e.target.closest(o.zone); if (!z || !dragging) return; e.preventDefault(); z.classList.remove('over'); const before = Array.from(z.querySelectorAll(o.item)).find((it) => it !== dragging && e.clientY < it.getBoundingClientRect().top + it.offsetHeight / 2); o.onDrop && o.onDrop(dragging, z, before || null); });
  };
})();

/* ==========================================================================
   ns.js · part 3 — app shell, router, command palette
   ========================================================================== */
(function () {
  'use strict';
  const NS = window.NS, U = NS.util, F = NS.fmt, doc = document;

  /* ---------- routing ---------- */
  const parseHash = () => {
    const h = (location.hash || '').replace(/^#/, '') || '/';
    const [path, qs] = h.split('?');
    const query = {}; if (qs) qs.split('&').forEach((p) => { const [k, v = ''] = p.split('='); if (k) query[decodeURIComponent(k)] = decodeURIComponent(v); });
    return { path: path.startsWith('/') ? path : '/' + path, query };
  };
  NS.link = (path, query) => '#' + path + (query && Object.keys(query).length ? '?' + Object.entries(query).filter(([, v]) => v != null && v !== '').map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&') : '');
  NS.go = (path, query) => { const next = NS.link(path, query); if (location.hash === next) NS.refresh(); else location.hash = next; };
  NS.route = { path: '/', params: {}, query: {} };

  const matchRoute = (routes, path) => {
    const segs = path.split('/').filter(Boolean);
    for (const pattern of Object.keys(routes)) {
      const ps = pattern.split('/').filter(Boolean);
      if (ps.length !== segs.length) continue;
      const params = {}; let ok = true;
      for (let i = 0; i < ps.length; i++) { if (ps[i].startsWith(':')) params[ps[i].slice(1)] = decodeURIComponent(segs[i]); else if (ps[i] !== segs[i]) { ok = false; break; } }
      if (ok) return { pattern, params, def: routes[pattern] };
    }
    return null;
  };

  /* ---------- app shell ---------- */
  let APP = null;
  NS.app = (cfg) => {
    APP = cfg;
    const store = NS.store(cfg.id);
    NS.appStore = store;
    doc.documentElement.dataset.brand = cfg.brand || 'indigo';
    doc.title = cfg.name;
    const personas = cfg.personas || [{ id: 'user', label: 'User', name: 'Demo user', title: '' }];
    let persona = personas.find((p) => p.id === store.get('persona')) || personas.find((p) => p.id === cfg.defaultPersona) || personas[0];
    NS.persona = persona;
    const notifs = (cfg.notifications || []).map((n, i) => ({ ...n, id: i, read: false }));
    let collapsed = store.get('collapsed', false) && innerWidth > 960;

    /* boot splash */
    if (cfg.splash !== false && !sessionStorage.getItem('ns:boot:' + cfg.id)) {
      sessionStorage.setItem('ns:boot:' + cfg.id, '1');
      const sp = NS.el(`<div class="ns-boot" style="position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:var(--bg);transition:opacity .45s var(--ease)"><div style="display:grid;justify-items:center;gap:14px;animation:ns-fade .5s var(--ease-out) both"><span class="ns-brand-mark" style="width:64px;height:64px;border-radius:20px">${cfg.mark ? `<span style="display:contents">${cfg.mark}</span>` : NS.icon('northstar', { size: 30 })}</span><div style="font-family:var(--font-display);font-weight:700;font-size:20px;letter-spacing:-.02em">${NS.esc(cfg.name)}</div><div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-3)">${NS.esc(cfg.sub || 'Northstar Labs')}</div><div style="width:140px;height:3px;border-radius:99px;background:var(--surface-4);overflow:hidden;margin-top:6px"><i style="display:block;height:100%;width:0;background:var(--brand);border-radius:99px;animation:ns-boot-bar .9s var(--ease) forwards"></i></div></div></div>`);
      const st = doc.createElement('style'); st.textContent = '@keyframes ns-boot-bar{to{width:100%}}'; doc.head.appendChild(st);
      doc.body.appendChild(sp);
      setTimeout(() => { sp.style.opacity = 0; setTimeout(() => sp.remove(), 480); }, 950);
    }

    /* build shell DOM */
    const navItems = () => (typeof cfg.nav === 'function' ? cfg.nav(persona) : cfg.nav || []).map((g) => ({ ...g, items: g.items.filter((it) => !it.personas || it.personas.includes(persona.id)) })).filter((g) => g.items.length);
    const navHtml = () => navItems().map((g) => `${g.group ? `<div class="ns-nav-group">${NS.esc(g.group)}</div>` : ''}${g.items.map((it) => `<a class="ns-nav-item" href="${NS.link(it.route || '/' + it.id)}" data-nav="${it.id}" data-tip-pos="right"><span style="display:contents">${NS.icon(it.icon || 'circle-dot')}</span><span class="ns-nav-label">${NS.esc(it.label)}</span>${it.badge != null && it.badge !== '' ? `<span class="ns-nav-badge ${it.badgeCls || ''}">${NS.esc(it.badge)}</span>` : ''}</a>`).join('')}`).join('');
    const promoHtml = () => { const p = typeof cfg.promo === 'function' ? cfg.promo(persona) : cfg.promo; if (!p) return ''; return `<div class="ns-sidebar-promo"><b>${NS.esc(p.title)}</b><p>${NS.esc(p.body || '')}</p>${p.progress != null ? NS.progress(p.progress) : ''}${p.cta ? `<a class="ns-btn sm" href="${NS.link(p.cta.route)}">${NS.esc(p.cta.label)} →</a>` : ''}</div>`; };
    const root = NS.el(`<div class="ns-app" id="nsApp" data-collapsed="${collapsed ? 1 : 0}">
      <aside class="ns-sidebar" aria-label="Primary">
        <a class="ns-brand" href="${NS.link(cfg.default || '/')}"><span class="ns-brand-mark">${cfg.mark || NS.icon('northstar')}</span><span><div class="ns-brand-name">${NS.esc(cfg.name)}</div><div class="ns-brand-sub">${NS.esc(cfg.sub || 'Northstar Labs')}</div></span></a>
        <nav class="ns-nav" id="nsNav">${navHtml()}</nav>
        <div class="ns-sidebar-foot" id="nsFoot">${promoHtml()}<button class="ns-collapse-btn" id="nsCollapse">${NS.icon('chevrons-left')}<span>Collapse</span></button></div>
      </aside>
      <div class="ns-backdrop" id="nsBackdrop"></div>
      <div class="ns-main">
        <header class="ns-topbar">
          <button class="ns-icon-btn ns-menu-btn" id="nsMenu" aria-label="Open navigation">${NS.icon('menu')}</button>
          <div class="ns-crumbs" id="nsCrumbs"></div>
          <button class="ns-search-btn" id="nsSearch" aria-label="Search">${NS.icon('search')}<span>Search ${NS.esc(cfg.searchHint || 'pages, people, actions')}…</span><kbd>⌘K</kbd></button>
          <div class="ns-topbar-actions">
            <span class="ns-demo-badge" data-tip="Illustrative data · fictional tenant" id="nsDemo">DEMO</span>
            <button class="ns-icon-btn" id="nsTheme" aria-label="Toggle theme" data-tip="Toggle theme">${NS.icon(NS.theme.get() === 'dark' ? 'sun' : 'moon')}</button>
            <button class="ns-icon-btn" id="nsBell" aria-label="Notifications" data-tip="Notifications">${NS.icon('bell')}${notifs.length ? '<i class="dot"></i>' : ''}</button>
            <button class="ns-user-btn" id="nsUser" aria-haspopup="menu"></button>
          </div>
        </header>
        <main class="ns-content ${cfg.wide ? 'wide' : ''}" id="nsContent"></main>
      </div></div>`);
    doc.body.appendChild(root);
    const content = root.querySelector('#nsContent'), crumbs = root.querySelector('#nsCrumbs');
    const userBtn = root.querySelector('#nsUser');
    const renderUser = () => { userBtn.innerHTML = `${NS.avatar(persona, { size: 'sm' })}<span class="who"><b>${NS.esc(persona.name)}</b><span>${NS.esc(persona.label)}</span></span>${NS.icon('chevron-down')}`; };
    renderUser();

    /* collapse / mobile nav */
    root.querySelector('#nsCollapse').onclick = () => { collapsed = !collapsed; root.dataset.collapsed = collapsed ? 1 : 0; store.set('collapsed', collapsed); setTimeout(() => doc.querySelectorAll('.ns-viz').forEach((el) => el.__nsRender && el.__nsRender()), 340); };
    root.querySelector('#nsMenu').onclick = () => { root.dataset.navOpen = '1'; };
    root.querySelector('#nsBackdrop').onclick = () => { delete root.dataset.navOpen; };
    root.querySelector('#nsNav').addEventListener('click', () => { delete root.dataset.navOpen; });
    const applyNavTips = () => root.querySelectorAll('.ns-nav-item').forEach((a) => { if (collapsed && innerWidth > 960) a.setAttribute('data-tip', a.querySelector('.ns-nav-label').textContent); else a.removeAttribute('data-tip'); });

    /* theme */
    root.querySelector('#nsTheme').onclick = (e) => NS.theme.toggle(e);
    NS._onTheme = (t) => { root.querySelector('#nsTheme').innerHTML = NS.icon(t === 'dark' ? 'sun' : 'moon'); setTimeout(() => NS.refresh(), 60); };

    /* notifications */
    root.querySelector('#nsBell').onclick = (e) => {
      const btn = e.currentTarget;
      const list = notifs.length ? notifs.map((n) => `<div class="ns-notif-item" style="${n.read ? 'opacity:.6' : ''}"><span class="ic">${NS.icon(n.icon || 'bell')}</span><div><b>${NS.esc(n.title)}</b><p>${NS.esc(n.body || '')}</p><time>${NS.esc(n.time || '')}</time></div></div>`).join('') : NS.empty({ icon: 'bell', title: 'You’re all caught up', body: 'Nothing needs your attention right now.' });
      NS.dropdown(btn, { cls: 'ns-notif', html: `<div class="ns-notif-head"><b>Notifications</b><button class="ns-btn xs ghost" data-readall>Mark all read</button></div><div class="ns-notif-list">${list}</div>`, mounted: (el, d) => { const b = el.querySelector('[data-readall]'); if (b) b.onclick = () => { notifs.forEach((n) => n.read = true); const dot = btn.querySelector('.dot'); if (dot) dot.remove(); d.close(); NS.toast('All notifications marked as read'); }; el.querySelectorAll('.ns-notif-item').forEach((it, i) => { it.style.cursor = 'pointer'; it.onclick = () => { const n = notifs[i]; n.read = true; d.close(); if (n.route) NS.go(n.route); }; }); } });
    };

    /* persona menu */
    const setPersona = (p, silent) => { persona = p; NS.persona = p; store.set('persona', p.id); renderUser(); root.querySelector('#nsNav').innerHTML = navHtml(); root.querySelector('#nsFoot').innerHTML = promoHtml() + root.querySelector('#nsCollapse').outerHTML; root.querySelector('#nsCollapse').onclick = () => { collapsed = !collapsed; root.dataset.collapsed = collapsed ? 1 : 0; store.set('collapsed', collapsed); }; cfg.onPersona && cfg.onPersona(p); if (!silent) NS.toast(`Now viewing as ${p.name}`, { desc: p.label, type: 'info' }); render(); };
    NS.setPersona = (id) => { const p = personas.find((x) => x.id === id); if (p) setPersona(p); };
    userBtn.onclick = (e) => {
      NS.dropdown(e.currentTarget, { items: [{ head: 'View as' }, ...personas.map((p) => ({ label: p.name, sub: `${p.label}${p.title ? ' · ' + p.title : ''}`, avatar: NS.avatar(p, { size: 'sm' }), checked: p.id === persona.id, onClick: () => setPersona(p) })), { sep: true }, { label: 'About this prototype', icon: 'info', onClick: () => NS.about() }, { label: 'Reset demo data', icon: 'refresh', onClick: () => NS.resetDemo() }, { label: 'Back to portfolio', icon: 'arrow-left', onClick: () => { location.href = cfg.portfolioUrl || '../../#work'; } }] });
    };

    /* about + reset */
    NS.about = () => NS.modal({
      title: `<span class="flex items-center gap-3"><span class="ns-brand-mark">${cfg.mark || NS.icon('northstar')}</span><span>${NS.esc(cfg.name)} <span class="ns-badge outline" style="vertical-align:middle;margin-left:6px">v${NS.esc(cfg.version || '1.0')}</span></span></span>`,
      sub: cfg.about && cfg.about.tagline,
      size: 'lg',
      body: `<div class="grid gap-4">${cfg.about && cfg.about.description ? `<p class="md ink2">${NS.str(cfg.about.description)}</p>` : ''}${cfg.about && cfg.about.highlights ? `<div class="ns-grid c2" style="gap:10px">${cfg.about.highlights.map((h) => `<div class="flex gap-3 items-start" style="padding:12px;border:1px solid var(--line);border-radius:12px"><span class="ns-icon-box sm">${NS.icon(h.icon || 'check')}</span><div><b class="md">${NS.esc(h.title)}</b><p class="sm muted">${NS.esc(h.body || '')}</p></div></div>`).join('')}</div>` : ''}<div class="ns-alert info">${NS.icon('info')}<div><b>Concept prototype with illustrative data</b><p>Northstar Labs is a fictional tenant. All people, numbers and events are generated for demonstration — nothing here describes a real company or person.</p></div></div><div class="flex items-center justify-between wrap gap-3" style="padding-top:6px;border-top:1px solid var(--line-2)"><div class="sm muted">Designed &amp; built by <b class="ink">Ronak Mehta</b> · Part of the Northstar people-tools family · no frameworks, no backend</div><div class="flex gap-2"><a class="ns-btn sm secondary" href="${cfg.portfolioUrl || '../../#work'}">${NS.icon('arrow-left')}Portfolio</a><a class="ns-btn sm secondary" href="../index.html">${NS.icon('grid')}All tools</a></div></div></div>`,
    });
    NS.resetDemo = async () => { if (await NS.confirm({ title: 'Reset demo data?', body: 'This clears every change you made in this prototype and restores the seeded dataset.', confirmLabel: 'Reset', danger: true })) { store.clear(); sessionStorage.removeItem('ns:boot:' + cfg.id); cfg.onReset && cfg.onReset(); NS.toast('Demo data reset', { type: 'info' }); setTimeout(() => location.reload(), 300); } };

    /* command palette */
    const commands = () => {
      const nav = navItems().flatMap((g) => g.items.map((it) => ({ group: 'Go to', label: it.label, icon: it.icon, hint: it.route || '/' + it.id, run: () => NS.go(it.route || '/' + it.id) })));
      const custom = (typeof cfg.commands === 'function' ? cfg.commands(persona) : cfg.commands || []).map((c) => ({ group: c.group || 'Actions', ...c }));
      const builtin = [
        { group: 'Preferences', label: `Switch to ${NS.theme.get() === 'dark' ? 'light' : 'dark'} mode`, icon: NS.theme.get() === 'dark' ? 'sun' : 'moon', run: () => NS.theme.toggle() },
        ...personas.filter((p) => p.id !== persona.id).map((p) => ({ group: 'View as', label: `${p.name} — ${p.label}`, icon: 'user', run: () => setPersona(p) })),
        { group: 'Help', label: 'About this prototype', icon: 'info', run: () => NS.about() },
        { group: 'Help', label: 'Reset demo data', icon: 'refresh', run: () => NS.resetDemo() },
        { group: 'Help', label: 'Back to portfolio', icon: 'arrow-left', run: () => { location.href = cfg.portfolioUrl || '../../#work'; } },
      ];
      return [...nav, ...custom, ...builtin];
    };
    const fuzzy = (q, s) => { q = q.toLowerCase(); s = s.toLowerCase(); if (!q) return 1; if (s.includes(q)) return 3 + (s.startsWith(q) ? 2 : 0); let i = 0, score = 0; for (const ch of s) { if (ch === q[i]) { i++; score++; if (i === q.length) return 1 + score / s.length; } } return 0; };
    NS.palette = { open() {
      if (doc.querySelector('.ns-palette')) return;
      const all = commands();
      const wrap = NS.el(`<div class="ns-overlay"><div class="ns-palette" role="dialog" aria-label="Command palette"><div class="ns-palette-input">${NS.icon('search')}<input type="text" placeholder="Type a page, person or action…" autocomplete="off" spellcheck="false"></div><div class="ns-palette-list"></div><div class="ns-palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> select</span><span><kbd>esc</kbd> close</span></div></div></div>`);
      const input = wrap.querySelector('input'), list = wrap.querySelector('.ns-palette-list');
      let results = [], sel = 0;
      const close = () => { wrap.remove(); overlaysIdx(); };
      const overlaysIdx = () => { };
      const draw = () => {
        const q = input.value.trim();
        const dyn = cfg.search ? (cfg.search(q) || []).map((c) => ({ group: c.group || 'Results', ...c })) : [];
        results = [...all, ...dyn].map((c) => ({ c, s: fuzzy(q, c.label + ' ' + (c.hint || '') + ' ' + (c.keywords || '')) })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s).slice(0, 14).map((r) => r.c);
        sel = 0;
        if (!results.length) { list.innerHTML = `<div class="ns-palette-empty">No matches for “${NS.esc(q)}”</div>`; return; }
        let lastGroup = null;
        list.innerHTML = results.map((c, i) => `${c.group !== lastGroup ? `<div class="ns-palette-group">${NS.esc(lastGroup = c.group)}</div>` : ''}<button class="ns-palette-item" data-i="${i}" aria-selected="${i === sel}">${c.avatar ? c.avatar : NS.icon(c.icon || 'arrow-right')}<span class="grow truncate">${NS.esc(c.label)}</span>${c.hint ? `<span class="hint">${NS.esc(c.hint)}</span>` : ''}</button>`).join('');
      };
      const mark = () => { list.querySelectorAll('.ns-palette-item').forEach((b, i) => { b.setAttribute('aria-selected', i === sel); if (i === sel) b.scrollIntoView({ block: 'nearest' }); }); };
      const run = (i) => { const c = results[i]; if (!c) return; close(); c.run && c.run(); };
      input.addEventListener('input', draw);
      input.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { sel = Math.min(results.length - 1, sel + 1); mark(); e.preventDefault(); } else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); mark(); e.preventDefault(); } else if (e.key === 'Enter') run(sel); else if (e.key === 'Escape') close(); });
      list.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) run(+b.dataset.i); });
      list.addEventListener('mousemove', (e) => { const b = e.target.closest('[data-i]'); if (b && +b.dataset.i !== sel) { sel = +b.dataset.i; mark(); } });
      wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
      doc.body.appendChild(wrap); draw(); input.focus();
    } };
    root.querySelector('#nsSearch').onclick = () => NS.palette.open();
    doc.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); NS.palette.open(); } if (e.key === '/' && !/input|textarea|select/i.test(e.target.tagName) && !e.target.isContentEditable) { e.preventDefault(); NS.palette.open(); } });

    /* render current route */
    let lastPath = null;
    const render = () => {
      const { path, query } = parseHash();
      let m = matchRoute(cfg.routes, path);
      if (!m || (m.def.personas && !m.def.personas.includes(persona.id))) { const d = (typeof cfg.default === 'function' ? cfg.default(persona) : cfg.default) || '/'; if (path !== d) { location.replace(NS.link(d)); return; } m = matchRoute(cfg.routes, d); if (!m) { content.innerHTML = NS.empty({ title: 'Route not found', body: path }); return; } }
      NS.route = { path, params: m.params, query, pattern: m.pattern };
      const ctx = { persona, route: NS.route, params: m.params, query, store, go: NS.go, refresh: NS.refresh, app: cfg };
      const def = m.def;
      const title = typeof def.title === 'function' ? def.title(ctx) : def.title || '';
      doc.title = `${title ? title + ' · ' : ''}${cfg.name}`;
      const cr = def.crumbs ? def.crumbs(ctx) : [{ label: title }];
      crumbs.innerHTML = `<a href="${NS.link(cfg.default || '/')}">${NS.esc(cfg.name)}</a>` + cr.map((c) => `${NS.icon('chevron-right')}${c.href ? `<a href="${c.href}">${NS.esc(c.label)}</a>` : `<b>${NS.esc(c.label)}</b>`}`).join('');
      const navId = (typeof def.nav === 'function' ? def.nav(ctx) : def.nav) || m.pattern.split('/').filter(Boolean)[0];
      root.querySelectorAll('.ns-nav-item').forEach((a) => { if (a.dataset.nav === navId) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      applyNavTips();
      let html;
      try { html = def.render(ctx); } catch (err) { console.error(err); html = `<div class="ns-alert bad">${NS.icon('alert-triangle')}<div><b>This view failed to render</b><p>${NS.esc(err.message)}</p></div></div>`; }
      content.innerHTML = NS.str(html);
      content.style.animation = 'none'; void content.offsetWidth; content.style.animation = '';
      if (path !== lastPath) { window.scrollTo({ top: 0 }); lastPath = path; }
      try { def.mounted && def.mounted(ctx, content); } catch (err) { console.error(err); NS.toast('Something went wrong on this view', { type: 'bad', desc: err.message }); }
      cfg.onRoute && cfg.onRoute(ctx);
    };
    NS.refresh = render;
    window.addEventListener('hashchange', render);
    window.addEventListener('resize', U.debounce(applyNavTips, 200));
    if (!location.hash) location.replace(NS.link((typeof cfg.default === 'function' ? cfg.default(persona) : cfg.default) || '/'));
    render();
    cfg.ready && cfg.ready({ persona, store });
    return { render, setPersona, store };
  };

  /* helpers for building pages */
  NS.pageHead = (o = {}) => `<div class="ns-page-head"><div>${o.eyebrow ? `<div class="ns-eyebrow">${NS.esc(o.eyebrow)}</div>` : ''}<h1>${NS.str(o.title)}</h1>${o.sub ? `<p>${NS.str(o.sub)}</p>` : ''}</div>${o.actions ? `<div class="ns-page-actions">${NS.str(o.actions)}</div>` : ''}</div>`;
  NS.tabs = (tabs, active, o = {}) => `<div class="ns-tabs" role="tablist">${tabs.map((t) => `<a class="ns-tab" role="tab" href="${NS.link(o.path || NS.route.path, { ...(o.query || NS.route.query), [o.key || 'tab']: t.id })}" aria-selected="${t.id === active}">${t.icon ? NS.icon(t.icon) : ''}${NS.esc(t.label)}${t.n != null ? `<span class="n">${NS.esc(t.n)}</span>` : ''}</a>`).join('')}</div>`;
  NS.card = (o = {}) => `<div class="ns-card ${o.cls || ''}" ${o.id ? `id="${o.id}"` : ''}>${o.title || o.actions ? `<div class="ns-card-head"><div><h3>${NS.str(o.title || '')}</h3>${o.sub ? `<p>${NS.str(o.sub)}</p>` : ''}</div>${o.actions ? `<div class="ns-page-actions">${NS.str(o.actions)}</div>` : ''}</div>` : ''}<div class="ns-card-body ${o.bodyCls || ''}">${NS.str(o.body || '')}</div>${o.foot ? `<div class="ns-card-foot">${NS.str(o.foot)}</div>` : ''}</div>`;
  NS.greeting = () => { const h = new Date().getHours(); return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
  NS.today = () => new Date();
  NS.aiTyping = (el, text, o = {}) => new Promise((res) => { // simulated AI streaming into an element
    el.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    setTimeout(() => { let i = 0; el.textContent = ''; const step = () => { i += Math.max(2, Math.round(text.length / 60)); el.textContent = text.slice(0, i); if (i < text.length) setTimeout(step, 16); else res(); }; step(); }, o.delay ?? 700);
  });
})();
