function renderRadar() {
  const size = 680;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 280;
  const topics = [...new Set(GLIMMER_DATA.entities.flatMap(e => e.topics))].sort();
  const sectorAngle = 360 / topics.length;
  let svg = `<svg viewBox="0 0 ${size} ${size}" class="radar" role="img" aria-label="Topic radar">`;

  for (let i = 0; i < topics.length; i++) {
    const startAngle = i * sectorAngle;
    const endAngle = (i + 1) * sectorAngle;
    const p1 = polarToCartesian(cx, cy, maxR, startAngle);
    const p2 = polarToCartesian(cx, cy, maxR, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${maxR} ${maxR} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;
    svg += `<path d="${d}" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1" />`;
    const labelAngle = startAngle + sectorAngle / 2;
    const lp = polarToCartesian(cx, cy, maxR + 24, labelAngle);
    svg += `<text x="${lp.x}" y="${lp.y}" class="radar-sector-label" dominant-baseline="middle">${esc(topics[i])}</text>`;
  }

  const byTopic = {};
  GLIMMER_DATA.entities.forEach(e => {
    const t = e.topics[0] || 'Uncategorized';
    byTopic[t] = byTopic[t] || [];
    byTopic[t].push(e);
  });

  for (const [topic, list] of Object.entries(byTopic)) {
    const tIndex = topics.indexOf(topic);
    const startAngle = tIndex === -1 ? 0 : tIndex * sectorAngle;
    const mid = startAngle + sectorAngle / 2;
    list.forEach((e, i) => {
      const { score } = glimmerScore(e);
      const r = 45 + (score / 100) * (maxR - 45);
      const offset = (i % 5) * 12 - ((Math.min(list.length, 5) - 1) * 6);
      const angle = mid + offset;
      const pos = polarToCartesian(cx, cy, r, angle);
      const dotR = clamp(2.5 + Math.sqrt(e.stars) / 120, 3, 8);
      const color = score >= 75 ? 'var(--good)' : score >= 50 ? 'var(--accent)' : 'var(--warn)';
      svg += `<circle class="radar-entity-dot" cx="${pos.x}" cy="${pos.y}" r="${dotR}" fill="${color}" data-id="${esc(e.id)}" onclick="openDetail('${esc(e.id)}')" onmouseover="showRadarTooltip(this, '${esc(e.owner)}/${esc(e.name)}', ${score})" onmouseout="hideRadarTooltip()">
        <title>${esc(e.owner)}/${esc(e.name)} — ${formatNum(e.stars)} stars — Glimmer ${score}</title>
      </circle>`;
    });
  }

  svg += '</svg>';
  const container = document.getElementById('radar-canvas');
  if (container) container.innerHTML = svg;
}

function showRadarTooltip(el, name, score) {
  const tip = document.getElementById('radar-tooltip');
  if (!tip) return;
  tip.innerHTML = `${esc(name)} <span class="mono" style="color:var(--accent)">${score}</span>`;
  tip.style.display = 'block';
}

function hideRadarTooltip() {
  const tip = document.getElementById('radar-tooltip');
  if (tip) tip.style.display = 'none';
}
