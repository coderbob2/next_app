import React from 'react';
import Spinner, { EmptyPlaceholder } from '@/components/ui/spinner';
import { TableRow, TableCell } from '@/components/ui/table';

interface RenderContentProps<T> {
    isLoading: boolean;
    error: { message: string } | null | undefined;
    data: T[] | undefined;
    columns: any[];
    renderRow: (item: T, index: number) => React.ReactNode;
}

export function RenderContent<T>({ isLoading, error, data, columns, renderRow }: RenderContentProps<T>) {
    if (isLoading) {
        return (
            <TableRow>
                <TableCell colSpan={columns.length} className="h-96">
                    <div className="flex justify-center items-center h-full">
                        <Spinner />
                    </div>
                </TableCell>
            </TableRow>
        );
    }

    if (error) {
        return (
            <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-red-500">
                    {error?.message || 'An unexpected error occurred'}
                </TableCell>
            </TableRow>
        );
    }

    if (!data || data.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={columns.length} className="h-96">
                    <EmptyPlaceholder />
                </TableCell>
            </TableRow>
        );
    }

    return <>{data.map(renderRow)}</>;
}