import type { ReactNode } from 'react';

interface TableProps {
  headers: string[];
  children: ReactNode;
  hasData: boolean;
  emptyMessage?: string;
  minWidthClassName?: string;
}

const Table = ({
  headers,
  children,
  hasData,
  emptyMessage = 'No records found.',
  minWidthClassName = 'min-w-[900px]',
}: TableProps) => {
  return (
    <div className="min-w-0 w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-soft">
      <table className={`${minWidthClassName} w-full divide-y divide-slate-200 text-sm`}>
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {hasData ? (
            children
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
