// Plano padrão de cada dia. O usuário (ou o professor) pode personalizar no app (tempo, ordem,
// remover, trocar, adicionar); o plano personalizado fica guardado por dia — mesmo mecanismo do
// Treino de Guitarra (js/store.js). Cada dia de treino soma 60 min (exceto domingo, descanso).

export const WEEK = [
  {
    key: 'seg', label: 'SEG', name: 'Segunda-feira', weekday: 1,
    title: 'Fundamentos',
    focus: 'Rufos simples e duplos — a base de tudo: mãos soltas, toques parelhos.',
    plan: [
      { ex: 'single_stroke_roll', min: 10 },
      { ex: 'single_stroke_four', min: 8 },
      { ex: 'single_stroke_seven', min: 8 },
      { ex: 'double_stroke_open_roll', min: 10 },
      { ex: 'triple_stroke_roll', min: 8 },
      { ex: 'multiple_bounce_roll', min: 8 },
      { ex: 'five_stroke_roll', min: 8 },
    ],
  },
  {
    key: 'ter', label: 'TER', name: 'Terça-feira', weekday: 2,
    title: 'Rufos Contados',
    focus: 'Do 6 ao 17 toques — diddles em sequência terminando numa nota acentuada.',
    plan: [
      { ex: 'six_stroke_roll', min: 8 },
      { ex: 'seven_stroke_roll', min: 8 },
      { ex: 'nine_stroke_roll', min: 8 },
      { ex: 'ten_stroke_roll', min: 8 },
      { ex: 'eleven_stroke_roll', min: 8 },
      { ex: 'thirteen_stroke_roll', min: 8 },
      { ex: 'fifteen_stroke_roll', min: 6 },
      { ex: 'seventeen_stroke_roll', min: 6 },
    ],
  },
  {
    key: 'qua', label: 'QUA', name: 'Quarta-feira', weekday: 3,
    title: 'Diddles',
    focus: 'Paradiddle e famí­lia — coordenação entre as mãos.',
    plan: [
      { ex: 'single_paradiddle', min: 15 },
      { ex: 'double_paradiddle', min: 15 },
      { ex: 'triple_paradiddle', min: 15 },
      { ex: 'paradiddle_diddle', min: 15 },
    ],
  },
  {
    key: 'qui', label: 'QUI', name: 'Quinta-feira', weekday: 4,
    title: 'Flams — parte 1',
    focus: 'A nota de apoio (flam): controle de dinâmica entre o apoio e o toque principal.',
    plan: [
      { ex: 'flam', min: 8 },
      { ex: 'flam_accent', min: 8 },
      { ex: 'flam_tap', min: 8 },
      { ex: 'flamacue', min: 8 },
      { ex: 'flam_paradiddle', min: 8 },
      { ex: 'single_flammed_mill', min: 10 },
      { ex: 'flam_paradiddle_diddle', min: 10 },
    ],
  },
  {
    key: 'sex', label: 'SEX', name: 'Sexta-feira', weekday: 5,
    title: 'Flams — parte 2 e Drags',
    focus: 'Fecha os flams e começa os arrastes (dois apoios em vez de um).',
    plan: [
      { ex: 'pataflafla', min: 8 },
      { ex: 'swiss_army_triplet', min: 8 },
      { ex: 'inverted_flam_tap', min: 8 },
      { ex: 'flam_drag', min: 8 },
      { ex: 'drag', min: 8 },
      { ex: 'single_drag_tap', min: 10 },
      { ex: 'double_drag_tap', min: 10 },
    ],
  },
  {
    key: 'sab', label: 'SÁB', name: 'Sábado', weekday: 6,
    title: 'Drags Avançados',
    focus: 'Ratamacues e drag paradiddles — o topo da dificuldade dos 40.',
    plan: [
      { ex: 'lesson_25', min: 10 },
      { ex: 'single_dragadiddle', min: 10 },
      { ex: 'drag_paradiddle_1', min: 10 },
      { ex: 'drag_paradiddle_2', min: 10 },
      { ex: 'single_ratamacue', min: 10 },
      { ex: 'double_ratamacue', min: 5 },
      { ex: 'triple_ratamacue', min: 5 },
    ],
  },
  {
    key: 'dom', label: 'DOM', name: 'Domingo', weekday: 0,
    title: 'Descanso',
    focus: 'Recuperação: importante para o ganho de velocidade.',
    plan: [{ ex: 'rest', min: 15 }],
  },
];
