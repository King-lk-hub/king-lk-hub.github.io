const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';
pptx.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: 'FEFEFE' },
  objects: []
});

const BLUE = '3B82F6';
const PURPLE = '8B5CF6';
const GREEN = '10B981';
const ORANGE = 'F59E0B';
const GRAY = '6B7280';
const DARK = '1A1A1A';
const WHITE = 'FFFFFF';

// Slide 1: 封面
let slide1 = pptx.addSlide();
slide1.addShape('rect', { x: 0.3, y: 0.2, w: 12.733, h: 7.1, line: { color: DARK, width: 4 }, fill: { color: 'FEFEFE' } });
slide1.addShape('rect', { x: 0.5, y: 0.4, w: 12.333, h: 0.8, fill: { color: BLUE } });
slide1.addText('AI辅助开发分享', { x: 0.5, y: 0.4, w: 12.333, h: 0.8, fontSize: 32, bold: true, color: WHITE, align: 'center' });
slide1.addText('让AI成为你的编程搭档', { x: 0.5, y: 2.5, w: 12.333, h: 0.6, fontSize: 28, color: '4B5563', align: 'center' });
slide1.addText('🤖', { x: 2.3, y: 3.2, w: 1.5, h: 1.0, fontSize: 48, align: 'center' });
slide1.addText('智能生成', { x: 2.3, y: 4.3, w: 1.5, h: 0.4, fontSize: 16, color: '4B5563', align: 'center' });
slide1.addText('⚡', { x: 5.8, y: 3.2, w: 1.5, h: 1.0, fontSize: 48, align: 'center' });
slide1.addText('效率提升', { x: 5.8, y: 4.3, w: 1.5, h: 0.4, fontSize: 16, color: '4B5563', align: 'center' });
slide1.addText('🚀', { x: 9.3, y: 3.2, w: 1.5, h: 1.0, fontSize: 48, align: 'center' });
slide1.addText('快速交付', { x: 9.3, y: 4.3, w: 1.5, h: 0.4, fontSize: 16, color: '4B5563', align: 'center' });
slide1.addShape('arrowRight', { x: 4.0, y: 3.6, w: 0.9, h: 0.4, fill: { color: PURPLE } });
slide1.addShape('arrowRight', { x: 7.5, y: 3.6, w: 0.9, h: 0.4, fill: { color: PURPLE } });
slide1.addShape('roundRect', { x: 0.8, y: 6.3, w: 11.733, h: 0.6, fill: { color: 'FFFBEB' }, line: { color: ORANGE, width: 2 } });
slide1.addText('"AI不会取代程序员，但会用AI的程序员会取代不会用AI的程序员"', { x: 0.8, y: 6.3, w: 11.733, h: 0.6, fontSize: 16, color: '92400E', align: 'center' });

// Slide 2: 目录
let slide2 = pptx.addSlide();
slide2.addShape('rect', { x: 0.3, y: 0.2, w: 12.733, h: 7.1, line: { color: DARK, width: 4 } });
slide2.addShape('rect', { x: 0.5, y: 0.4, w: 12.333, h: 0.8, fill: { color: PURPLE } });
slide2.addText('目录 CONTENTS', { x: 0.5, y: 0.4, w: 12.333, h: 0.8, fontSize: 32, bold: true, color: WHITE, align: 'center' });

const tocItems = [
  { icon: '📖', num: '01', title: 'AI辅助开发概述', color: BLUE },
  { icon: '🛠️', num: '02', title: '常用AI工具全景', color: PURPLE },
  { icon: '🎯', num: '03', title: '全场景应用', color: GREEN },
  { icon: '✨', num: '04', title: '最佳实践', color: BLUE },
  { icon: '📊', num: '05', title: '实战案例与数据', color: PURPLE },
  { icon: '🔮', num: '06', title: '未来展望', color: GREEN }
];

tocItems.forEach((item, i) => {
  const row = Math.floor(i / 3);
  const col = i % 3;
  const left = 0.7 + col * 4.2;
  const top = 1.6 + row * 2.7;
  slide2.addShape('roundRect', { x: left, y: top, w: 3.9, h: 2.3, fill: { color: WHITE }, line: { color: item.color, width: 2 } });
  slide2.addText(item.icon, { x: left, y: top + 0.15, w: 3.9, h: 0.8, fontSize: 36, align: 'center' });
  slide2.addText(item.num, { x: left, y: top + 0.9, w: 3.9, h: 0.5, fontSize: 22, bold: true, color: item.color, align: 'center' });
  slide2.addText(item.title, { x: left, y: top + 1.5, w: 3.9, h: 0.6, fontSize: 15, color: '4B5563', align: 'center' });
});

// Slide 3: AI概述
let slide3 = pptx.addSlide();
slide3.addShape('rect', { x: 0.3, y: 0.2, w: 12.733, h: 7.1, line: { color: DARK, width: 4 } });
slide3.addShape('rect', { x: 0.5, y: 0.4, w: 12.333, h: 0.7, fill: { color: BLUE } });
slide3.addText('AI辅助开发概述 · 从概念到价值', { x: 0.5, y: 0.4, w: 12.333, h: 0.7, fontSize: 26, bold: true, color: WHITE, align: 'center' });

// 三栏布局
const colW = 4.0;
const lm = 0.5;

// 左栏
slide3.addShape('rect', { x: lm, y: 1.3, w: colW, h: 0.45, fill: { color: BLUE } });
slide3.addText('📍 现状痛点', { x: lm, y: 1.3, w: colW, h: 0.45, fontSize: 16, bold: true, color: WHITE, align: 'center' });
slide3.addShape('rect', { x: lm, y: 1.75, w: colW, h: 4.6, fill: { color: 'EFF6FF' }, line: { color: BLUE, width: 2 } });

const leftItems = ['重复编码耗时', '文档维护困难', 'Bug修复低效', '学习曲线陡峭'];
leftItems.forEach((item, i) => {
  const top = 1.9 + i * 1.1;
  slide3.addShape('roundRect', { x: lm + 0.1, y: top, w: colW - 0.2, h: 1.0, fill: { color: WHITE } });
  slide3.addText(item, { x: lm + 0.15, y: top + 0.2, w: colW - 0.3, h: 0.6, fontSize: 14, bold: true, color: BLUE });
});

// 中栏
slide3.addShape('rect', { x: lm + colW + 0.1, y: 1.3, w: colW, h: 0.45, fill: { color: PURPLE } });
slide3.addText('💡 AI解决方案', { x: lm + colW + 0.1, y: 1.3, w: colW, h: 0.45, fontSize: 16, bold: true, color: WHITE, align: 'center' });
slide3.addShape('rect', { x: lm + colW + 0.1, y: 1.75, w: colW, h: 4.6, fill: { color: 'F5F3FF' }, line: { color: PURPLE, width: 2 } });

const midItems = ['智能代码生成', '自动文档生成', 'Bug智能诊断', '个性化学习'];
midItems.forEach((item, i) => {
  const top = 1.9 + i * 1.1;
  slide3.addShape('roundRect', { x: lm + colW + 0.2, y: top, w: colW - 0.2, h: 1.0, fill: { color: WHITE } });
  slide3.addText(item, { x: lm + colW + 0.25, y: top + 0.2, w: colW - 0.3, h: 0.6, fontSize: 14, bold: true, color: PURPLE });
});

// 右栏
slide3.addShape('rect', { x: lm + colW * 2 + 0.2, y: 1.3, w: colW, h: 0.45, fill: { color: GREEN } });
slide3.addText('✅ 核心价值', { x: lm + colW * 2 + 0.2, y: 1.3, w: colW, h: 0.45, fontSize: 16, bold: true, color: WHITE, align: 'center' });
slide3.addShape('rect', { x: lm + colW * 2 + 0.2, y: 1.75, w: colW, h: 4.6, fill: { color: 'ECFDF5' }, line: { color: GREEN, width: 2 } });

const metrics = [['↑55%', '开发效率提升'], ['↓40%', 'Bug率降低'], ['↑3倍', '学习速度加速'], ['↓30%', '开发成本节省']];
metrics.forEach((item, i) => {
  const top = 1.9 + i * 1.1;
  slide3.addShape('roundRect', { x: lm + colW * 2 + 0.3, y: top, w: colW - 0.4, h: 1.0, fill: { color: WHITE } });
  slide3.addText(item[0], { x: lm + colW * 2 + 0.3, y: top + 0.1, w: colW - 0.4, h: 0.5, fontSize: 22, bold: true, color: GREEN, align: 'center' });
  slide3.addText(item[1], { x: lm + colW * 2 + 0.3, y: top + 0.55, w: colW - 0.4, h: 0.4, fontSize: 12, color: '4B5563', align: 'center' });
});

slide3.addShape('roundRect', { x: 0.8, y: 6.55, w: 11.733, h: 0.55, fill: { color: 'FFFBEB' }, line: { color: ORANGE, width: 2 } });
slide3.addText('2024年AI编程助手市场增长率超过150%，75%开发者已使用AI工具', { x: 0.8, y: 6.55, w: 11.733, h: 0.55, fontSize: 14, color: '92400E', align: 'center' });

// Slide 4-11: 其他页面
const pages = [
  { title: '常用AI工具全景 · 工具选型指南', color: PURPLE },
  { title: '全场景应用 · 开发全流程AI赋能', color: GREEN },
  { title: '最佳实践 · 高效使用AI的黄金法则', color: BLUE },
  { title: '实战案例 · 传统方式 vs AI辅助', color: PURPLE },
  { title: '效果数据 · 量化AI辅助开发的价值', color: GREEN },
  { title: '未来展望 · AI开发工具演进趋势', color: PURPLE },
  { title: '总结与行动建议 · 从今天开始拥抱AI', color: GREEN },
  { title: '感谢聆听', color: BLUE }
];

pages.forEach((page, idx) => {
  const slide = pptx.addSlide();
  slide.addShape('rect', { x: 0.3, y: 0.2, w: 12.733, h: 7.1, line: { color: DARK, width: 4 } });
  slide.addShape('rect', { x: 0.5, y: 0.4, w: 12.333, h: 0.7, fill: { color: page.color } });
  slide.addText(page.title, { x: 0.5, y: 0.4, w: 12.333, h: 0.7, fontSize: 26, bold: true, color: WHITE, align: 'center' });
  
  // 添加内容占位
  slide.addText(`第${idx + 4}页详细内容`, { x: 1, y: 3, w: 11.333, h: 1, fontSize: 24, bold: true, color: page.color, align: 'center' });
  slide.addText('三栏布局、数据卡片、对比图表等内容区域', { x: 1, y: 4, w: 11.333, h: 1, fontSize: 16, color: '4B5563', align: 'center' });
});

pptx.writeFile({ fileName: '/Users/mac/Desktop/AI辅助开发分享_白板图版.pptx' });
console.log('PPT saved!');
