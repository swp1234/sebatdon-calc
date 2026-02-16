/* calc-data.js - Relationship types & recommended sebatdon amounts */
;(function() {
  'use strict';

  // Relationship categories with KRW ranges and metadata
  var RELATIONS = [
    {
      id: 'young_nephew',
      emoji: '\uD83D\uDC76',
      i18nKey: 'relation.youngNephew',
      fallback: '\uC5B4\uB9B0 \uC870\uCE74',
      min: 5000,
      max: 20000,
      presets: [5000, 10000, 20000],
      avgGiven: 10000,
      category: 'child'
    },
    {
      id: 'niece',
      emoji: '\uD83E\uDDD2',
      i18nKey: 'relation.niece',
      fallback: '\uC870\uCE74',
      min: 10000,
      max: 50000,
      presets: [10000, 20000, 30000, 50000],
      avgGiven: 25000,
      category: 'child'
    },
    {
      id: 'elementary',
      emoji: '\uD83C\uDF92',
      i18nKey: 'relation.elementary',
      fallback: '\uCD08\uB4F1\uD559\uC0DD',
      min: 10000,
      max: 30000,
      presets: [10000, 20000, 30000],
      avgGiven: 20000,
      category: 'child'
    },
    {
      id: 'middle',
      emoji: '\uD83D\uDCDA',
      i18nKey: 'relation.middle',
      fallback: '\uC911\uD559\uC0DD',
      min: 30000,
      max: 50000,
      presets: [30000, 50000],
      avgGiven: 40000,
      category: 'teen'
    },
    {
      id: 'high',
      emoji: '\uD83C\uDF93',
      i18nKey: 'relation.high',
      fallback: '\uACE0\uB4F1\uD559\uC0DD',
      min: 50000,
      max: 100000,
      presets: [50000, 70000, 100000],
      avgGiven: 65000,
      category: 'teen'
    },
    {
      id: 'college',
      emoji: '\uD83C\uDFEB',
      i18nKey: 'relation.college',
      fallback: '\uB300\uD559\uC0DD',
      min: 50000,
      max: 100000,
      presets: [50000, 70000, 100000],
      avgGiven: 70000,
      category: 'young_adult'
    },
    {
      id: 'parents',
      emoji: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67',
      i18nKey: 'relation.parents',
      fallback: '\uBD80\uBAA8\uB2D8',
      min: 100000,
      max: 500000,
      presets: [100000, 200000, 300000, 500000],
      avgGiven: 200000,
      category: 'elder'
    },
    {
      id: 'grandparents',
      emoji: '\uD83D\uDC74\uD83D\uDC75',
      i18nKey: 'relation.grandparents',
      fallback: '\uC870\uBD80\uBAA8\uB2D8',
      min: 100000,
      max: 300000,
      presets: [100000, 200000, 300000],
      avgGiven: 150000,
      category: 'elder'
    },
    {
      id: 'inlaws',
      emoji: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC66',
      i18nKey: 'relation.inlaws',
      fallback: '\uC2DC\uBD80\uBAA8/\uC7A5\uC778',
      min: 100000,
      max: 500000,
      presets: [100000, 200000, 300000, 500000],
      avgGiven: 200000,
      category: 'elder'
    }
  ];

  // National average spending (approximate, KRW)
  var NATIONAL_AVG = {
    totalExpense: 250000,
    perChild: 30000,
    perElder: 200000,
    description: 'calc.avgDesc'
  };

  // Fun fact comparisons (amount -> what you can buy)
  var FUN_FACTS = [
    { minAmount: 10000, emoji: '\u2615', i18nKey: 'funFact.coffee', fallback: '\uCEE4\uD53C {count}\uC794', unitPrice: 5000 },
    { minAmount: 20000, emoji: '\uD83C\uDF5C', i18nKey: 'funFact.ramen', fallback: '\uB77C\uBA74 {count}\uADF8\uB987', unitPrice: 4500 },
    { minAmount: 30000, emoji: '\uD83C\uDF5A', i18nKey: 'funFact.meal', fallback: '\uBC31\uBC18 {count}\uB07C', unitPrice: 9000 },
    { minAmount: 50000, emoji: '\uD83C\uDF7F', i18nKey: 'funFact.movie', fallback: '\uC601\uD654 \uAD00\uB78C {count}\uD68C', unitPrice: 15000 },
    { minAmount: 100000, emoji: '\uD83D\uDC5F', i18nKey: 'funFact.shoes', fallback: '\uC6B4\uB3D9\uD654 {count}\uCF24\uB808', unitPrice: 89000 },
    { minAmount: 200000, emoji: '\uD83D\uDCF1', i18nKey: 'funFact.airpods', fallback: '\uC5D0\uC5B4\uD31F {count}\uAC1C', unitPrice: 199000 },
    { minAmount: 300000, emoji: '\u2708\uFE0F', i18nKey: 'funFact.travel', fallback: '\uC81C\uC8FC\uB3C4 \uC655\uBCF5 \uD56D\uACF5\uAD8C {count}\uC7A5', unitPrice: 150000 },
    { minAmount: 500000, emoji: '\uD83D\uDCBB', i18nKey: 'funFact.tablet', fallback: '\uD0DC\uBE14\uB9BF {count}\uB300', unitPrice: 450000 },
    { minAmount: 1000000, emoji: '\uD83C\uDFD6\uFE0F', i18nKey: 'funFact.trip', fallback: '\uD574\uC678\uC5EC\uD589 {count}\uD68C', unitPrice: 800000 }
  ];

  // Estimated income per child by age group
  var INCOME_PER_CHILD = {
    young: 80000,
    elementary: 120000,
    middle: 180000,
    high: 250000,
    college: 300000
  };

  // Chart colors for breakdown
  var CHART_COLORS = [
    '#ca8a04', '#eab308', '#f59e0b', '#d97706',
    '#dc2626', '#22c55e', '#3b82f6', '#8b5cf6',
    '#ec4899'
  ];

  // Export to window
  window.SEBATDON_DATA = {
    relations: RELATIONS,
    nationalAvg: NATIONAL_AVG,
    funFacts: FUN_FACTS,
    incomePerChild: INCOME_PER_CHILD,
    chartColors: CHART_COLORS
  };
})();
