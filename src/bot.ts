export type Decision = { kind: 'handoff' } | { kind: 'reply' }

const HANDOFF_PATTERN = /(?:מחיר|כמה.*עולה|עלות|הצעת מחיר|החזר|תלונה|נציג|אדם|משפטי|רפואי|הזמנה|ביטול|refund|price|human|agent|complaint)/i

export function decide(message: string): Decision {
  return HANDOFF_PATTERN.test(message) ? { kind: 'handoff' } : { kind: 'reply' }
}

export function createReply(message: string): string {
  if (/מה.*אלפי|מי.*אלפי|מה אתם עושים/i.test(message)) {
    return 'אלפי מסייעת לעסקים להטמיע סוכני AI ותהליכים חכמים. אשמח להסביר על השירותים ולחבר אותך לנציג לצורך התאמה.'
  }
  return 'בשמחה. אלפי מסייעת לעסקים עם פתרונות AI. ספר/י לי מה מעניין אותך, ואם צריך אחבר אותך לנציג.'
}
