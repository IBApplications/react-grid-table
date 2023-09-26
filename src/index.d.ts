//
// Type definitions for: @dimorphic/react-grid-table [1.1.2]
// Original Project: @NadavShaar/react-grid-table [1.0.2]
// Definitions by: @dimorphic <https://github.com/dimorphic>
//
declare module '@dimorphic/react-grid-table' {
    export type GridTableProps = {
        // general
        columns: object[];
        rows?: object[];
        totalRows?: number;

        selectedRowsIds?: unknown[];
        rowIdField?: string;

        editRowId?: any;
        searchText?: string;
        getIsRowSelectable?(...args: unknown[]): boolean;
        getIsRowEditable?(...args: unknown[]): boolean;

        // table config
        additionalProps?: object;
        components?: object;
        
        isPaginated?: boolean;
        isLoading?: boolean;
        isHeaderSticky?: boolean;
        isVirtualScroll?: boolean;
        isSorting?: boolean;

        layout?: string;
        layoutAutoFill?: boolean;
        
        batchSize?: number;
        pageSizes?: number[];
        pageSize?: number;
        page?: number;

        sort?: {
            colId: string | null;
            isAsc: boolean;
        };
        
        enableColumnsReorder?: boolean;
        showSearch?: boolean;
        showRowsInformation?: boolean;
        showColumnVisibilityManager?: boolean;
        
        minColumnResizeWidth?: number;
        minSearchChars?: number;
        highlightSearch?: boolean;

        icons?: object;
        texts?: object;

        requestDebounceTimeout?: number;
        selectAllMode?: string;

        // events (#TODO: fix unknowns)
        onColumnsChange?(cols: any[], tableManager: unknown): void;

        onSelectedRowsChange?(selectedRowsIds: unknown): void
        onSearchTextChange?(searchText: unknown): void;
        onSortChange?({ colId, isAsc }: { colId: string, isAsc: boolean }, tableManager: unknown): void;
        
        onRowClick?({ rowIndex, data, column, isEdit, event }: any, tableManager: unknown): void;
        onRowDblClick?({ rowIndex, data, column, isEdit, event }: any, tableManager: unknown): void;
        onEditRowIdChange?(...args: unknown[]): unknown;

        onPageChange?(nextPage: unknown): void;
        onPageSizeChange?(newPageSize: unknown): void;
        onLoad?(tableManager: unknown): void;

        onColumnResizeStart?({ event, target, column }: any): void;
        onColumnResize?({ event, target, column }: any): void;
        onColumnResizeEnd?({ event, target, column }: any): void;
        onColumnReorderStart?(sortData: unknown, tableManager: unknown): void;
        onColumnReorderEnd?(sortData: unknown, tableManager: unknown): void;

        onRowsRequest?(requestData: unknown, tableManager: unknown): void;
        onRowsReset?(): void;
        onRowsChange?(...args: unknown[]): void;
        onTotalRowsChange?(...args: unknown[]): void;

        style?: React.CSSProperties;
    };

    export function GridTable(props: GridTableProps): JSX.Element;
    export const version: string;
    
    export default GridTable;
}