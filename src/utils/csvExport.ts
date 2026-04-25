type CsvValue = string | number | null | undefined;

const escapeValue = (value: CsvValue): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const valueString = String(value);
  if (valueString.includes('"') || valueString.includes(',') || valueString.includes('\n')) {
    return `"${valueString.replaceAll('"', '""')}"`;
  }

  return valueString;
};

export const csvExport = (
  rows: Record<string, CsvValue>[],
  filename: string,
): void => {
  if (!rows.length) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const content = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeValue(row[header])).join(',')),
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
