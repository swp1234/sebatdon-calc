/* app.js - Sebatdon Calculator main application logic */
;(function() {
  'use strict';

  // State
  var state = {
    recipients: [],
    selectedRelation: null,
    selectedAmount: 0,
    hasKids: false,
    kidsCount: 1,
    kidsAgeGroup: 'young'
  };

  // DOM references
  var dom = {};

  // Wait for DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    initDom();
    initTheme();
    initLanguageSelector();
        initRelatedFunnels();
    buildRelationGrid();
    bindEvents();
    hideLoader();
  });

  function initDom() {
    dom.loader = document.getElementById('app-loader');
    dom.introSection = document.getElementById('intro-section');
    dom.calcSection = document.getElementById('calc-section');
    dom.resultSection = document.getElementById('result-section');
    dom.btnStart = document.getElementById('btn-start');
    dom.btnAdd = document.getElementById('btn-add');
    dom.btnResult = document.getElementById('btn-result');
    dom.btnRestart = document.getElementById('btn-restart');
    dom.relationGrid = document.getElementById('relation-grid');
    dom.amountGroup = document.getElementById('amount-group');
    dom.amountRange = document.getElementById('amount-range');
    dom.customAmount = document.getElementById('custom-amount');
    dom.recipientName = document.getElementById('recipient-name');
    dom.recipientsList = document.getElementById('recipients-list');
    dom.emptyMsg = document.getElementById('empty-msg');
    dom.listCount = document.getElementById('list-count');
    dom.totalAmount = document.getElementById('total-amount');
    dom.listTotal = document.getElementById('list-total');
    dom.hasKids = document.getElementById('has-kids');
    dom.kidsCountGroup = document.getElementById('kids-count-group');
    dom.kidsCount = document.getElementById('kids-count');
    dom.kidsAvgAge = document.getElementById('kids-avg-age');
    dom.themeToggle = document.getElementById('theme-toggle');
    dom.langToggle = document.getElementById('lang-toggle');
    dom.langMenu = document.getElementById('lang-menu');
    // Result elements
    dom.statExpense = document.getElementById('stat-expense');
    dom.statIncome = document.getElementById('stat-income');
    dom.statNet = document.getElementById('stat-net');
    dom.compBarUser = document.getElementById('comp-bar-user');
    dom.compBarAvg = document.getElementById('comp-bar-avg');
    dom.compValueUser = document.getElementById('comp-value-user');
    dom.compValueAvg = document.getElementById('comp-value-avg');
    dom.comparisonText = document.getElementById('comparison-text');
    dom.funFactsList = document.getElementById('fun-facts-list');
    dom.breakdownChart = document.getElementById('breakdown-chart');
  }

  function hideLoader() {
    setTimeout(function() {
      if (dom.loader) {
        dom.loader.classList.add('hidden');
      }
    }, 600);
  }

  // ---- Theme ----
  function initTheme() {
    var saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (dom.themeToggle) dom.themeToggle.textContent = '\uD83C\uDF19';
    }

    if (dom.themeToggle) {
      dom.themeToggle.addEventListener('click', function() {
        var current = document.documentElement.getAttribute('data-theme');
        if (current === 'light') {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', 'dark');
          dom.themeToggle.textContent = '\u2600\uFE0F';
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
          localStorage.setItem('theme', 'light');
          dom.themeToggle.textContent = '\uD83C\uDF19';
        }
      });
    }
  }

  // ---- Language ----
  function initLanguageSelector() {
    if (dom.langToggle) {
      dom.langToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        dom.langMenu.classList.toggle('hidden');
      });
    }

    document.querySelectorAll('.lang-option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var lang = btn.getAttribute('data-lang');
        if (window.i18n) {
          window.i18n.setLanguage(lang).then(function() {
            // Re-render relation grid labels
            updateRelationLabels();
            updateRecipientsList();
            updateTotalDisplay();
            if (typeof initRelatedFunnels === 'function') initRelatedFunnels();
          });
        }
        dom.langMenu.classList.add('hidden');
      });
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (dom.langMenu && !dom.langMenu.contains(e.target) && e.target !== dom.langToggle) {
        dom.langMenu.classList.add('hidden');
      }
    });
  }

  // ---- Relation Grid ----
  function buildRelationGrid() {
    if (!dom.relationGrid || !window.SEBATDON_DATA) return;

    var relations = window.SEBATDON_DATA.relations;
    dom.relationGrid.innerHTML = '';

    relations.forEach(function(rel) {
      var btn = document.createElement('button');
      btn.className = 'relation-btn';
      btn.setAttribute('data-rel-id', rel.id);
      btn.innerHTML = '<span class="rel-emoji">' + rel.emoji + '</span>' +
        '<span class="rel-label">' + getRelationLabel(rel) + '</span>';

      btn.addEventListener('click', function() {
        selectRelation(rel, btn);
      });

      dom.relationGrid.appendChild(btn);
    });
  }

  function getRelationLabel(rel) {
    if (window.i18n) {
      var translated = window.i18n.t(rel.i18nKey);
      if (translated !== rel.i18nKey) return translated;
    }
    return rel.fallback;
  }

  function updateRelationLabels() {
    if (!window.SEBATDON_DATA) return;
    var relations = window.SEBATDON_DATA.relations;
    var buttons = dom.relationGrid.querySelectorAll('.relation-btn');

    buttons.forEach(function(btn, index) {
      if (relations[index]) {
        var labelEl = btn.querySelector('.rel-label');
        if (labelEl) {
          labelEl.textContent = getRelationLabel(relations[index]);
        }
      }
    });
  }

  function selectRelation(rel, btnEl) {
    // Deselect all
    dom.relationGrid.querySelectorAll('.relation-btn').forEach(function(b) {
      b.classList.remove('active');
    });

    btnEl.classList.add('active');
    state.selectedRelation = rel;

    // Show amount selection
    dom.amountGroup.classList.remove('hidden');
    buildAmountButtons(rel);
    updateAddButton();
  }

  function buildAmountButtons(rel) {
    dom.amountRange.innerHTML = '';
    state.selectedAmount = 0;

    rel.presets.forEach(function(amount) {
      var btn = document.createElement('button');
      btn.className = 'amount-btn';
      btn.textContent = formatKRW(amount);
      btn.addEventListener('click', function() {
        dom.amountRange.querySelectorAll('.amount-btn').forEach(function(b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        state.selectedAmount = amount;
        dom.customAmount.value = '';
        updateAddButton();
      });
      dom.amountRange.appendChild(btn);
    });
  }

  // ---- Events ----
  function bindEvents() {
    // Start button
    if (dom.btnStart) {
      dom.btnStart.addEventListener('click', function() {
        dom.introSection.classList.add('hidden');
        dom.calcSection.classList.remove('hidden');
        dom.calcSection.scrollIntoView({ behavior: 'smooth' });
        trackEvent('test_start', {
          app_name: 'sebatdon-calc',
          mode: 'holiday_budget',
          lang: window.i18n ? window.i18n.currentLang : 'en'
        });
      });
    }

    // Custom amount input
    if (dom.customAmount) {
      dom.customAmount.addEventListener('input', function() {
        var val = parseInt(dom.customAmount.value, 10);
        if (val > 0) {
          state.selectedAmount = val;
          dom.amountRange.querySelectorAll('.amount-btn').forEach(function(b) {
            b.classList.remove('active');
          });
        } else {
          state.selectedAmount = 0;
        }
        updateAddButton();
      });
    }

    // Add button
    if (dom.btnAdd) {
      dom.btnAdd.addEventListener('click', addRecipient);
    }

    // Has kids toggle
    if (dom.hasKids) {
      dom.hasKids.addEventListener('change', function() {
        state.hasKids = dom.hasKids.checked;
        if (state.hasKids) {
          dom.kidsCountGroup.classList.remove('hidden');
        } else {
          dom.kidsCountGroup.classList.add('hidden');
        }
      });
    }

    // Kids count
    if (dom.kidsCount) {
      dom.kidsCount.addEventListener('change', function() {
        state.kidsCount = parseInt(dom.kidsCount.value, 10) || 1;
      });
    }

    // Kids age group
    if (dom.kidsAvgAge) {
      dom.kidsAvgAge.addEventListener('change', function() {
        state.kidsAgeGroup = dom.kidsAvgAge.value;
      });
    }

    // Show result
    if (dom.btnResult) {
      dom.btnResult.addEventListener('click', showResults);
    }

    // Restart
    if (dom.btnRestart) {
      dom.btnRestart.addEventListener('click', restart);
    }

    // Share & Story Card buttons
    document.getElementById('saveCardBtn')?.addEventListener('click', generateSebatdonCard);
    document.getElementById('share-twitter')?.addEventListener('click', shareTwitter);
    document.getElementById('share-facebook')?.addEventListener('click', shareFacebook);
    document.getElementById('share-copy')?.addEventListener('click', shareCopyLink);

    document.querySelectorAll('#curated-resources-card a.curated-item').forEach(function(link) {
      link.addEventListener('click', function() {
        trackEvent('curated_resource_click', {
          app_name: 'sebatdon-calc',
          resource_type: link.dataset.resourceType || 'book',
          item_id: link.dataset.itemId || '',
          lang: window.i18n ? window.i18n.currentLang : 'en'
        });
      });
    });
  }

  function updateAddButton() {
    if (dom.btnAdd) {
      dom.btnAdd.disabled = !(state.selectedRelation && state.selectedAmount > 0);
    }
  }

  // ---- Add/Remove Recipients ----
  function addRecipient() {
    if (!state.selectedRelation || state.selectedAmount <= 0) return;

    var name = dom.recipientName.value.trim() || getRelationLabel(state.selectedRelation);

    state.recipients.push({
      id: Date.now(),
      name: name,
      relation: state.selectedRelation,
      amount: state.selectedAmount
    });

    // Reset form
    dom.recipientName.value = '';
    state.selectedRelation = null;
    state.selectedAmount = 0;
    dom.customAmount.value = '';
    dom.amountGroup.classList.add('hidden');
    dom.relationGrid.querySelectorAll('.relation-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    dom.btnAdd.disabled = true;

    updateRecipientsList();
    updateTotalDisplay();
  }

  function removeRecipient(id) {
    state.recipients = state.recipients.filter(function(r) { return r.id !== id; });
    updateRecipientsList();
    updateTotalDisplay();
  }

  function updateRecipientsList() {
    if (!dom.recipientsList) return;

    dom.recipientsList.innerHTML = '';
    dom.listCount.textContent = state.recipients.length;

    if (state.recipients.length === 0) {
      var emptyP = document.createElement('p');
      emptyP.className = 'empty-msg';
      emptyP.setAttribute('data-i18n', 'calc.emptyList');
      emptyP.textContent = window.i18n ? window.i18n.t('calc.emptyList') : '\uC544\uC9C1 \uCD94\uAC00\uB41C \uC0AC\uB78C\uC774 \uC5C6\uC5B4\uC694';
      dom.recipientsList.appendChild(emptyP);
      dom.btnResult.disabled = true;
      return;
    }

    dom.btnResult.disabled = false;

    state.recipients.forEach(function(r) {
      var item = document.createElement('div');
      item.className = 'recipient-item';
      item.innerHTML =
        '<span class="recipient-emoji">' + r.relation.emoji + '</span>' +
        '<div class="recipient-info">' +
          '<div class="recipient-name">' + escapeHtml(r.name) + '</div>' +
          '<div class="recipient-relation">' + getRelationLabel(r.relation) + '</div>' +
        '</div>' +
        '<span class="recipient-amount">' + formatKRW(r.amount) + '</span>' +
        '<button class="recipient-delete" aria-label="Delete">&times;</button>';

      var delBtn = item.querySelector('.recipient-delete');
      delBtn.addEventListener('click', function() {
        removeRecipient(r.id);
      });

      dom.recipientsList.appendChild(item);
    });
  }

  function updateTotalDisplay() {
    var total = calcTotal();
    dom.totalAmount.textContent = formatKRW(total);
  }

  function calcTotal() {
    return state.recipients.reduce(function(sum, r) {
      return sum + r.amount;
    }, 0);
  }

  // ---- Results ----
  function showResults() {
    var totalExpense = calcTotal();
    var totalIncome = 0;

    if (state.hasKids) {
      var incomeData = window.SEBATDON_DATA.incomePerChild;
      var incomePerChild = incomeData[state.kidsAgeGroup] || incomeData.young;
      totalIncome = incomePerChild * state.kidsCount;
    }

    var netBalance = totalIncome - totalExpense;
    var nationalAvg = window.SEBATDON_DATA.nationalAvg.totalExpense;

    // Update stat values
    dom.statExpense.textContent = formatKRW(totalExpense);
    dom.statIncome.textContent = formatKRW(totalIncome);
    dom.statNet.textContent = (netBalance >= 0 ? '+' : '') + formatKRW(netBalance);

    if (netBalance >= 0) {
      dom.statNet.style.color = 'var(--success)';
    } else {
      dom.statNet.style.color = 'var(--danger)';
    }

    // Comparison bars
    var maxVal = Math.max(totalExpense, nationalAvg);
    var userPct = maxVal > 0 ? (totalExpense / maxVal * 100) : 0;
    var avgPct = maxVal > 0 ? (nationalAvg / maxVal * 100) : 0;

    // Animate bars
    setTimeout(function() {
      dom.compBarUser.style.width = userPct + '%';
      dom.compBarAvg.style.width = avgPct + '%';
    }, 200);

    dom.compValueUser.textContent = formatKRW(totalExpense);
    dom.compValueAvg.textContent = formatKRW(nationalAvg);

    // Comparison text
    var diff = totalExpense - nationalAvg;
    var compText = '';
    if (window.i18n) {
      if (diff > 0) {
        compText = window.i18n.t('calc.aboveAvg').replace('{amount}', formatKRW(Math.abs(diff)));
      } else if (diff < 0) {
        compText = window.i18n.t('calc.belowAvg').replace('{amount}', formatKRW(Math.abs(diff)));
      } else {
        compText = window.i18n.t('calc.exactAvg');
      }
    }
    dom.comparisonText.textContent = compText;

    // Fun facts
    buildFunFacts(totalExpense);

    // Breakdown chart
    buildBreakdown();

    // Show result section
    dom.calcSection.classList.add('hidden');
    dom.resultSection.classList.remove('hidden');
    dom.resultSection.scrollIntoView({ behavior: 'smooth' });

    // Clean GA4 telemetry (no raw monetary totals)
    var resultBucket = diff > 0 ? 'above_avg' : (diff < 0 ? 'below_avg' : 'balanced');
    trackEvent('test_complete', {
      app_name: 'sebatdon-calc',
      result_type: resultBucket,
      lang: window.i18n ? window.i18n.currentLang : 'en'
    });
  }

  function buildFunFacts(total) {
    dom.funFactsList.innerHTML = '';
    var facts = window.SEBATDON_DATA.funFacts;
    var shown = 0;

    for (var i = facts.length - 1; i >= 0; i--) {
      if (total >= facts[i].minAmount && shown < 4) {
        var count = Math.floor(total / facts[i].unitPrice);
        if (count < 1) continue;

        var text = '';
        if (window.i18n) {
          text = window.i18n.t(facts[i].i18nKey);
          if (text === facts[i].i18nKey) {
            text = facts[i].fallback;
          }
        } else {
          text = facts[i].fallback;
        }
        text = text.replace('{count}', count.toLocaleString());

        var item = document.createElement('div');
        item.className = 'fun-fact-item';
        item.innerHTML =
          '<span class="fun-fact-emoji">' + facts[i].emoji + '</span>' +
          '<span class="fun-fact-text">' + escapeHtml(text) + '</span>';

        dom.funFactsList.appendChild(item);
        shown++;
      }
    }

    if (shown === 0) {
      var noFact = document.createElement('div');
      noFact.className = 'fun-fact-item';
      noFact.innerHTML =
        '<span class="fun-fact-emoji">\uD83D\uDCB0</span>' +
        '<span class="fun-fact-text">' +
        (window.i18n ? window.i18n.t('funFact.none') : '\uC138\uBC43\uB3C8\uC744 \uCD94\uAC00\uD574 \uBCF4\uC138\uC694!') +
        '</span>';
      dom.funFactsList.appendChild(noFact);
    }
  }

  function buildBreakdown() {
    dom.breakdownChart.innerHTML = '';
    if (state.recipients.length === 0) return;

    var total = calcTotal();
    var colors = window.SEBATDON_DATA.chartColors;

    // Group by relation type
    var groups = {};
    state.recipients.forEach(function(r) {
      var label = getRelationLabel(r.relation);
      if (!groups[label]) {
        groups[label] = { amount: 0, color: colors[Object.keys(groups).length % colors.length] };
      }
      groups[label].amount += r.amount;
    });

    Object.keys(groups).forEach(function(label) {
      var g = groups[label];
      var pct = total > 0 ? (g.amount / total * 100) : 0;

      var row = document.createElement('div');
      row.className = 'breakdown-row';
      row.innerHTML =
        '<span class="breakdown-label">' + escapeHtml(label) + '</span>' +
        '<div class="breakdown-bar-wrap">' +
          '<div class="breakdown-bar" style="width:0%;background:' + g.color + ';"></div>' +
        '</div>' +
        '<span class="breakdown-pct">' + Math.round(pct) + '%</span>';

      dom.breakdownChart.appendChild(row);

      // Animate bar
      setTimeout(function() {
        row.querySelector('.breakdown-bar').style.width = pct + '%';
      }, 300);
    });
  }

  function restart() {
    state.recipients = [];
    state.selectedRelation = null;
    state.selectedAmount = 0;

    dom.resultSection.classList.add('hidden');
    dom.introSection.classList.remove('hidden');
    dom.calcSection.classList.add('hidden');

    // Reset form
    dom.amountGroup.classList.add('hidden');
    dom.customAmount.value = '';
    dom.recipientName.value = '';
    dom.relationGrid.querySelectorAll('.relation-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    dom.btnAdd.disabled = true;
    dom.btnResult.disabled = true;

    // Reset comparison bars
    dom.compBarUser.style.width = '0%';
    dom.compBarAvg.style.width = '0%';

    updateRecipientsList();
    updateTotalDisplay();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- Share ----
  function buildShareUrl() {
    var lang = window.i18n ? window.i18n.currentLang : 'en';
    var url = new URL('https://dopabrain.com/sebatdon-calc/');
    url.searchParams.set('lang', lang);
    url.searchParams.set('utm_source', 'share');
    return url.toString();
  }

  function shareTwitter() {
    var total = calcTotal();
    var lang = window.i18n ? window.i18n.currentLang : 'en';
    var text = window.i18n
      ? window.i18n.t('share.twitterText').replace('{amount}', formatKRW(total)).replace('{count}', state.recipients.length)
      : 'Holiday gift money summary';
    var url = buildShareUrl();
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank', 'noopener,noreferrer');
    trackEvent('share', { method: 'twitter', app_name: 'sebatdon-calc', lang: lang });
  }

  function shareFacebook() {
    var lang = window.i18n ? window.i18n.currentLang : 'en';
    var url = buildShareUrl();
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank', 'noopener,noreferrer');
    trackEvent('share', { method: 'facebook', app_name: 'sebatdon-calc', lang: lang });
  }

  function shareCopyLink() {
    var lang = window.i18n ? window.i18n.currentLang : 'en';
    var url = buildShareUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function() {
        showToast(window.i18n ? window.i18n.t('share.copied') : 'Link copied!');
      }).catch(function() {
        showToast(window.i18n ? window.i18n.t('share.copied') : 'Link copied!');
      });
    } else {
      var input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showToast(window.i18n ? window.i18n.t('share.copied') : 'Link copied!');
    }
    trackEvent('share', { method: 'copy_link', app_name: 'sebatdon-calc', lang: lang });
  }

  function generateSebatdonCard() {
    var canvas = document.getElementById('shareCanvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W = 1080;
    var H = 1920;
    canvas.width = W;
    canvas.height = H;

    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.5, '#2b200d');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(202, 138, 4, 0.16)';
    ctx.beginPath();
    ctx.arc(540, 420, 380, 0, Math.PI * 2);
    ctx.fill();

    var lang = window.i18n ? window.i18n.currentLang : 'en';
    var title = (window.i18n && window.i18n.t('share.cardTitle') !== 'share.cardTitle')
      ? window.i18n.t('share.cardTitle')
      : 'Holiday Gift Budget Summary';
    var sub = (window.i18n && window.i18n.t('share.cardSub') !== 'share.cardSub')
      ? window.i18n.t('share.cardSub')
      : 'Relationship Guide · Household Balance · Benchmarks';

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DOPABRAIN HOLIDAY FINANCE', W / 2, 160);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px sans-serif';
    ctx.fillText(title.slice(0, 32), W / 2, 260);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '32px sans-serif';
    ctx.fillText(sub.slice(0, 50), W / 2, 325);

    var benchmarks = [
      ['Preschool / Elementary', '10,000 - 30,000 KRW benchmark'],
      ['Middle & High School', '50,000 - 100,000 KRW benchmark'],
      ['University / Parents', '100,000 - 300,000 KRW benchmark'],
      ['Total Outlay Planned', formatKRW(calcTotal()) + ' (' + state.recipients.length + ' recipients)']
    ];

    var y = 480;
    benchmarks.forEach(function(item) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.roundRect(80, y, W - 160, 220, 26);
      ctx.fill();
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText(item[0], 120, y + 82);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(item[1], 120, y + 150);
      y += 260;
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('dopabrain.com/sebatdon-calc/?lang=' + lang, W / 2, 1780);

    try {
      var link = document.createElement('a');
      link.download = 'dopabrain-gift-budget-' + lang + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {}

    showToast((window.i18n && window.i18n.t('share.downloadStarted') !== 'share.downloadStarted')
      ? window.i18n.t('share.downloadStarted')
      : 'Saved 1080×1920 gift budget card!');
    trackEvent('save_image', {
      app_name: 'sebatdon-calc',
      result_type: 'budget_summary',
      lang: lang
    });
  }

  // ---- Utilities ----
  function formatKRW(amount) {
    if (amount === 0) return '0\uC6D0';
    var absAmount = Math.abs(amount);
    var prefix = amount < 0 ? '-' : '';

    if (absAmount >= 10000) {
      var man = Math.floor(absAmount / 10000);
      var remainder = absAmount % 10000;
      if (remainder > 0) {
        return prefix + man.toLocaleString() + '\uB9CC ' + remainder.toLocaleString() + '\uC6D0';
      }
      return prefix + man.toLocaleString() + '\uB9CC\uC6D0';
    }
    return prefix + absAmount.toLocaleString() + '\uC6D0';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showToast(msg) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(function() {
      toast.classList.add('show');
    });

    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() { toast.remove(); }, 400);
    }, 2500);
  }

  function trackEvent(name, params) {
    if (typeof gtag === 'function') {
      gtag('event', name, params || {});
    }
  }

})();


// Funnel bridge & language preservation
function initRelatedFunnels() {
    const getLang = () => (window.i18n && window.i18n.currentLang) || new URLSearchParams(window.location.search).get('lang') || 'en';
    const lang = getLang();
    const base = (window.location.origin && window.location.origin !== 'null') ? window.location.origin : 'https://dopabrain.com';
    document.querySelectorAll('.related-grid a').forEach(link => {
        const baseHref = link.getAttribute('data-base-href') || link.getAttribute('href');
        if (!baseHref || baseHref.startsWith('http') || baseHref.startsWith('#')) return;
        try {
            const url = new URL(baseHref, base);
            url.searchParams.set('lang', lang);
            if (!url.searchParams.has('source')) url.searchParams.set('source', 'sebatdon_calc_result');
            link.setAttribute('href', url.pathname + url.search);
        } catch(e) {}
        if (!link.dataset.trackedCta) {
            link.dataset.trackedCta = 'true';
            link.addEventListener('click', () => {
                if (typeof gtag === 'function') {
                    gtag('event', 'content_cta_click', {
                        cta_surface: 'sebatdon_calc_related',
                        destination: link.getAttribute('href'),
                        source: 'sebatdon_calc',
                        lang: getLang()
                    });
                }
            });
        }
    });
}
