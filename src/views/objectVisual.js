// SVG illustrations per object type, drawn into the canvas rect for an object.
export function objectVisualSVG(item, obj) {
  const uid = String(item.id).replace(/[^a-zA-Z0-9_-]/g, '');
  const wrap = (content, preserve = 'none') =>
    `<svg class="gp-obj-svg" viewBox="0 0 100 100" preserveAspectRatio="${preserve}" aria-hidden="true">${content}</svg>`;

  switch (obj.id) {
    case 'apple-tree': return wrap(`
      <defs><radialGradient id="g${uid}" cx="50%" cy="42%" r="58%">
        <stop offset="0%" stop-color="#b6d595"/><stop offset="100%" stop-color="#5e8a4d"/>
      </radialGradient></defs>
      <circle cx="50" cy="50" r="49" fill="url(#g${uid})" stroke="#3e6b36" stroke-width="1.2"/>
      <g fill="#3e6b36" opacity=".22">
        <circle cx="30" cy="35" r="7"/><circle cx="68" cy="30" r="8"/><circle cx="45" cy="68" r="7"/>
        <circle cx="74" cy="62" r="6"/><circle cx="22" cy="63" r="6"/><circle cx="55" cy="50" r="5"/>
      </g>
      <g fill="#c0392b"><circle cx="35" cy="46" r="2.6"/><circle cx="56" cy="38" r="2.6"/>
        <circle cx="66" cy="55" r="2.6"/><circle cx="28" cy="55" r="2.2"/><circle cx="48" cy="62" r="2.6"/>
        <circle cx="62" cy="68" r="2.2"/></g>`);

    case 'cherry-tree': return wrap(`
      <defs><radialGradient id="g${uid}" cx="50%" cy="42%" r="58%">
        <stop offset="0%" stop-color="#b6d595"/><stop offset="100%" stop-color="#5e8a4d"/>
      </radialGradient></defs>
      <circle cx="50" cy="50" r="49" fill="url(#g${uid})" stroke="#3e6b36" stroke-width="1.2"/>
      <g fill="#3e6b36" opacity=".2">
        <circle cx="30" cy="35" r="7"/><circle cx="68" cy="30" r="8"/><circle cx="45" cy="68" r="7"/>
        <circle cx="74" cy="62" r="6"/><circle cx="22" cy="63" r="6"/>
      </g>
      <g fill="#f7c6d2"><circle cx="35" cy="46" r="3"/><circle cx="56" cy="38" r="3"/>
        <circle cx="66" cy="55" r="3"/><circle cx="28" cy="55" r="2.5"/><circle cx="48" cy="62" r="3"/>
        <circle cx="40" cy="30" r="2.5"/><circle cx="60" cy="68" r="2.5"/></g>`);

    case 'ornamental-tree': return wrap(`
      <defs><radialGradient id="g${uid}" cx="50%" cy="42%" r="58%">
        <stop offset="0%" stop-color="#9bc275"/><stop offset="100%" stop-color="#4f7a3a"/>
      </radialGradient></defs>
      <circle cx="50" cy="50" r="49" fill="url(#g${uid})" stroke="#3a5e30" stroke-width="1.2"/>
      <g fill="#3a5e30" opacity=".24">
        <circle cx="30" cy="35" r="8"/><circle cx="68" cy="30" r="9"/><circle cx="45" cy="68" r="8"/>
        <circle cx="74" cy="62" r="7"/><circle cx="22" cy="63" r="7"/><circle cx="52" cy="50" r="6"/>
      </g>`);

    case 'shrub': return wrap(`
      <defs><radialGradient id="g${uid}" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stop-color="#a8c878"/><stop offset="100%" stop-color="#5e8a4d"/>
      </radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill="url(#g${uid})" stroke="#3e6b36" stroke-width="1.1"/>
      <g fill="#3e6b36" opacity=".22">
        <circle cx="28" cy="40" r="10"/><circle cx="65" cy="32" r="11"/>
        <circle cx="38" cy="66" r="11"/><circle cx="72" cy="65" r="9"/>
      </g>`);

    case 'hedge': return wrap(`
      <defs><linearGradient id="g${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6a9656"/><stop offset="100%" stop-color="#3e6b36"/>
      </linearGradient></defs>
      <path d="M0,18 Q5,3 10,18 Q15,3 20,18 Q25,3 30,18 Q35,3 40,18 Q45,3 50,18 Q55,3 60,18 Q65,3 70,18 Q75,3 80,18 Q85,3 90,18 Q95,3 100,18 L100,82 Q95,97 90,82 Q85,97 80,82 Q75,97 70,82 Q65,97 60,82 Q55,97 50,82 Q45,97 40,82 Q35,97 30,82 Q25,97 20,82 Q15,97 10,82 Q5,97 0,82 Z"
            fill="url(#g${uid})" stroke="#2d4a2e" stroke-width=".7"/>
      <g stroke="#2d4a2e" stroke-width=".4" opacity=".3">
        <line x1="15" y1="35" x2="15" y2="65"/><line x1="35" y1="35" x2="35" y2="65"/>
        <line x1="55" y1="35" x2="55" y2="65"/><line x1="75" y1="35" x2="75" y2="65"/>
        <line x1="95" y1="35" x2="95" y2="65"/></g>`);

    case 'lawn': return wrap(`
      <rect width="100" height="100" fill="#a8c878"/>
      <g stroke="#7ba858" stroke-width=".6" stroke-linecap="round" opacity=".6">
        <line x1="10" y1="100" x2="10" y2="95"/><line x1="20" y1="100" x2="20" y2="93"/>
        <line x1="30" y1="100" x2="30" y2="96"/><line x1="40" y1="100" x2="40" y2="94"/>
        <line x1="50" y1="100" x2="50" y2="95"/><line x1="60" y1="100" x2="60" y2="93"/>
        <line x1="70" y1="100" x2="70" y2="96"/><line x1="80" y1="100" x2="80" y2="94"/>
        <line x1="90" y1="100" x2="90" y2="95"/>
        <line x1="15" y1="65" x2="15" y2="60"/><line x1="35" y1="65" x2="35" y2="61"/>
        <line x1="55" y1="65" x2="55" y2="59"/><line x1="75" y1="65" x2="75" y2="60"/>
        <line x1="25" y1="30" x2="25" y2="24"/><line x1="65" y1="30" x2="65" y2="25"/>
        <line x1="85" y1="30" x2="85" y2="24"/><line x1="45" y1="30" x2="45" y2="25"/>
      </g>`);

    case 'patio': return wrap(`
      <rect width="100" height="100" fill="#bdab92"/>
      <g stroke="#8a7860" stroke-width=".6" fill="none" opacity=".75">
        <line x1="0" y1="33" x2="100" y2="33"/><line x1="0" y1="66" x2="100" y2="66"/>
        <line x1="33" y1="0" x2="33" y2="100"/><line x1="66" y1="0" x2="66" y2="100"/>
      </g>
      <g fill="#7d6b53" opacity=".18">
        <circle cx="20" cy="20" r="1"/><circle cx="50" cy="48" r="1"/>
        <circle cx="80" cy="20" r="1"/><circle cx="48" cy="78" r="1"/></g>`);

    case 'path': return wrap(`
      <rect width="100" height="100" fill="#c8bb9e"/>
      <g fill="#8a7860" opacity=".55">
        <circle cx="12" cy="20" r="1.5"/><circle cx="30" cy="35" r="1.2"/>
        <circle cx="50" cy="25" r="1.5"/><circle cx="70" cy="40" r="1.2"/>
        <circle cx="85" cy="20" r="1.5"/><circle cx="20" cy="55" r="1.2"/>
        <circle cx="40" cy="65" r="1.5"/><circle cx="60" cy="55" r="1.2"/>
        <circle cx="80" cy="65" r="1.5"/><circle cx="15" cy="80" r="1.2"/>
        <circle cx="45" cy="85" r="1.5"/><circle cx="75" cy="80" r="1.2"/>
      </g>`);

    case 'decking': return wrap(`
      <rect width="100" height="100" fill="#a08768"/>
      <g stroke="#6e573a" stroke-width=".7" fill="none">
        <line x1="0" y1="20" x2="100" y2="20"/><line x1="0" y1="40" x2="100" y2="40"/>
        <line x1="0" y1="60" x2="100" y2="60"/><line x1="0" y1="80" x2="100" y2="80"/>
      </g>
      <g stroke="#6e573a" stroke-width=".4" opacity=".4">
        <line x1="30" y1="0" x2="30" y2="20"/><line x1="70" y1="20" x2="70" y2="40"/>
        <line x1="40" y1="40" x2="40" y2="60"/><line x1="60" y1="60" x2="60" y2="80"/>
        <line x1="25" y1="80" x2="25" y2="100"/></g>`);

    case 'pond': return wrap(`
      <defs><radialGradient id="g${uid}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#b8dde8"/><stop offset="100%" stop-color="#5a8fa3"/>
      </radialGradient></defs>
      <ellipse cx="50" cy="50" rx="48" ry="48" fill="url(#g${uid})" stroke="#3e7388" stroke-width="1.2"/>
      <g fill="none" stroke="#ffffff" stroke-width=".7" opacity=".5">
        <ellipse cx="50" cy="50" rx="18" ry="18"/><ellipse cx="50" cy="50" rx="30" ry="30"/>
        <ellipse cx="50" cy="50" rx="40" ry="40"/></g>
      <g transform="translate(28 28)">
        <ellipse cx="0" cy="0" rx="9" ry="8" fill="#4a7d4a" opacity=".9"/>
        <path d="M0,0 L0,8" stroke="#3a5e30" stroke-width="1.3"/></g>
      <g transform="translate(72 65)">
        <ellipse cx="0" cy="0" rx="6" ry="5.5" fill="#4a7d4a" opacity=".8"/></g>`);

    case 'shed': return wrap(`
      <rect x="2" y="28" width="96" height="70" fill="#8b6f47" stroke="#5d4a30" stroke-width="1.2"/>
      <polygon points="0,30 50,4 100,30" fill="#6d533a" stroke="#3a2a18" stroke-width="1"/>
      <line x1="50" y1="4" x2="50" y2="30" stroke="#3a2a18" stroke-width=".5" opacity=".4"/>
      <rect x="40" y="52" width="20" height="46" fill="#5d4a30"/>
      <line x1="50" y1="52" x2="50" y2="98" stroke="#3a2a18" stroke-width=".5"/>
      <circle cx="56" cy="76" r="1.5" fill="#fbd96a"/>
      <rect x="14" y="50" width="14" height="14" fill="#c8e0e8" stroke="#3a2a18" stroke-width=".7"/>
      <line x1="21" y1="50" x2="21" y2="64" stroke="#3a2a18" stroke-width=".4"/>
      <line x1="14" y1="57" x2="28" y2="57" stroke="#3a2a18" stroke-width=".4"/>`);

    case 'greenhouse': return wrap(`
      <polygon points="2,98 2,30 50,4 98,30 98,98" fill="#d8eae0" stroke="#5a8a73" stroke-width="1.2" opacity=".85"/>
      <g stroke="#5a8a73" stroke-width=".6" fill="none">
        <line x1="33" y1="22" x2="33" y2="98"/><line x1="66" y1="22" x2="66" y2="98"/>
        <line x1="2" y1="55" x2="98" y2="55"/><line x1="2" y1="78" x2="98" y2="78"/>
        <line x1="50" y1="4" x2="50" y2="30"/></g>
      <rect x="42" y="65" width="16" height="33" fill="#a8c8b5" stroke="#5a8a73" stroke-width=".7"/>`);

    case 'compost': return wrap(`
      <rect width="100" height="100" fill="#6e5a44" stroke="#3a2e22" stroke-width="1.2"/>
      <g stroke="#3a2e22" stroke-width=".9" fill="none">
        <line x1="0" y1="25" x2="100" y2="25"/><line x1="0" y1="50" x2="100" y2="50"/>
        <line x1="0" y1="75" x2="100" y2="75"/>
      </g>
      <g stroke="#3a2e22" stroke-width=".5" opacity=".35">
        <line x1="25" y1="0" x2="25" y2="100"/><line x1="50" y1="0" x2="50" y2="100"/>
        <line x1="75" y1="0" x2="75" y2="100"/></g>`);

    case 'bench': return wrap(`
      <rect width="100" height="100" fill="#a08664" stroke="#5d4a30" stroke-width="1"/>
      <g stroke="#5d4a30" stroke-width=".7" fill="none">
        <line x1="0" y1="28" x2="100" y2="28"/><line x1="0" y1="55" x2="100" y2="55"/>
        <line x1="0" y1="82" x2="100" y2="82"/>
      </g>
      <g fill="#5d4a30">
        <rect x="8" y="0" width="3" height="100" opacity=".5"/>
        <rect x="89" y="0" width="3" height="100" opacity=".5"/></g>`);

    case 'water-butt': return wrap(`
      <defs><radialGradient id="g${uid}" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#6a8ea0"/><stop offset="100%" stop-color="#2e5468"/>
      </radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill="url(#g${uid})" stroke="#1f3e50" stroke-width="1.2"/>
      <g fill="none" stroke="#1f3e50" stroke-width="1.5" opacity=".7">
        <ellipse cx="50" cy="32" rx="46" ry="6"/><ellipse cx="50" cy="68" rx="46" ry="6"/></g>
      <ellipse cx="50" cy="50" rx="38" ry="6" fill="#1f3e50" opacity=".25"/>`);

    case 'fence': return wrap(`
      <rect width="100" height="100" fill="#8a7458"/>
      <g stroke="#5d4a30" stroke-width="1">
        <line x1="6" y1="0" x2="6" y2="100"/><line x1="16" y1="0" x2="16" y2="100"/>
        <line x1="26" y1="0" x2="26" y2="100"/><line x1="36" y1="0" x2="36" y2="100"/>
        <line x1="46" y1="0" x2="46" y2="100"/><line x1="56" y1="0" x2="56" y2="100"/>
        <line x1="66" y1="0" x2="66" y2="100"/><line x1="76" y1="0" x2="76" y2="100"/>
        <line x1="86" y1="0" x2="86" y2="100"/><line x1="96" y1="0" x2="96" y2="100"/>
      </g>
      <line x1="0" y1="20" x2="100" y2="20" stroke="#5d4a30" stroke-width="1.5"/>
      <line x1="0" y1="80" x2="100" y2="80" stroke="#5d4a30" stroke-width="1.5"/>`);

    case 'arch': return wrap(`
      <path d="M8,98 L8,42 Q8,6 50,6 Q92,6 92,42 L92,98 L82,98 L82,42 Q82,16 50,16 Q18,16 18,42 L18,98 Z"
            fill="#b8a47e" stroke="#7a6448" stroke-width="1"/>
      <g fill="#e84393" opacity=".85">
        <circle cx="20" cy="24" r="3.5"/><circle cx="35" cy="14" r="3.5"/>
        <circle cx="50" cy="10" r="3.5"/><circle cx="65" cy="14" r="3.5"/>
        <circle cx="80" cy="24" r="3.5"/></g>
      <g fill="#3e6b36" opacity=".75">
        <circle cx="22" cy="35" r="2.5"/><circle cx="40" cy="22" r="2.5"/>
        <circle cx="60" cy="22" r="2.5"/><circle cx="78" cy="35" r="2.5"/>
        <circle cx="50" cy="20" r="2"/></g>`);

    default: return '';
  }
}
