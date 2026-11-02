'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Typy dla uniwersalnej tabeli
export interface TableColumn {
  key: string;
  header: string;
  className?: string;
  type?: 'text' | 'list';
}

export interface TableData {
  [key: string]: unknown;
}

export interface ContentTableProps {
  data: TableData[];
  columns: TableColumn[];
  className?: string;
}

export function ContentTable({ data, columns, className = 'my-6' }: ContentTableProps) {
  const renderCell = (value: unknown, column: TableColumn) => {
    if (column.type === 'list' && Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, index) => (
            <li key={index} className="text-sm">
              {item as string}
            </li>
          ))}
        </ul>
      );
    }

    return value as React.ReactNode;
  };

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={column.className || 'font-semibold text-foreground'}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {renderCell(row[column.key], column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
