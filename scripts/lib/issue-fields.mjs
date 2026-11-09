/**
 * Edit top-level fields of an issue file (src/data/issues/{id}.json) as text,
 * so hand-formatted files keep their layout and a diff shows only the change.
 *
 * Values are written as single-line JSON. An existing single-line field is
 * replaced in place; a new field goes on its own line after the first anchor
 * key present (default: sourceDate, then edition).
 */
export function setIssueFields(text, fields, anchors = ['sourceDate', 'edition']) {
  let out = text;
  const pending = [];
  for (const [key, value] of Object.entries(fields)) {
    const line = new RegExp(`^  "${key}": (.*?)(,?)$`, 'm');
    const json = JSON.stringify(value);
    if (line.test(out)) {
      out = out.replace(line, (_, _old, comma) => `  "${key}": ${json}${comma}`);
    } else {
      pending.push(`  "${key}": ${json}`);
    }
  }
  if (pending.length === 0) return out;

  for (const anchor of anchors) {
    const anchorLine = new RegExp(`^  "${anchor}": .*?(,?)$`, 'm');
    const m = out.match(anchorLine);
    if (!m) continue;
    const isLast = m[1] !== ',';
    const head = isLast ? `${m[0]},` : m[0];
    const inserted = pending.map((l, i) => (isLast && i === pending.length - 1 ? l : `${l},`)).join('\n');
    return out.replace(anchorLine, () => `${head}\n${inserted}`);
  }
  throw new Error(`No anchor (${anchors.join(', ')}) found to insert ${Object.keys(fields).join(', ')}`);
}
