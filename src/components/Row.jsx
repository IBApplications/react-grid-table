import React, { useMemo } from "react";
import { Columns, CellContainer } from "./";
import callOrReturn from '../utils/call-or-return';

const Row = ({ index, data, tableManager, measureRef, columnAreas, columnSizes, style }) => {
    const {
        config: {
            isVirtualScroll,
            rowIdField,
            additionalProps: { row: additionalProps = {} }
        },
        rowEditApi: { editRow, getIsRowEditable },
        rowSelectionApi: { getIsRowSelectable, selectedRowsIds },
        columnsApi: { visibleColumns },
        paginationApi: { page, pageSize },
        rowVirtualizer: { virtualItems, totalSize },
    } = tableManager;

    // console.log('[row] additional props: ', additionalProps, data);

    if (isVirtualScroll) {
        if (index === "virtual-start") {
            return (
                <div
                    key={index}
                    style={{ minHeight: virtualItems[0]?.start }}
                />
            );
        }
        if (index === "virtual-end") {
            return (
                <div
                    key={index}
                    style={{ minHeight: totalSize - virtualItems[virtualItems.length - 1]?.end || 0 }}
                />
            );
        }
    }

    let rowIndex = index + 1 + pageSize * (page - 1);
    let rowId = data?.[rowIdField] || rowIndex;
    let disableSelection = !data || !getIsRowSelectable(data);
    let isSelected =
        !!data &&
        !!selectedRowsIds.find((selectedRowId) => selectedRowId === rowId);
    let isEdit =
        !!data && editRow?.[rowIdField] === rowId && !!getIsRowEditable(data);

    const classNames = useMemo(() => {
        const { className } = additionalProps;

        // get custom CSS class for this row or fallback to plain value if any
        const customRowClass = callOrReturn(className, { rowIndex: index, rowData: data });

        return [
            'rgt-row',
            isVirtualScroll && 'rgt-row--virtual',
            customRowClass
        ].filter(Boolean).join(' ');
    }, [additionalProps.className, isVirtualScroll]);

    return (
        <Columns
            {...additionalProps}
            className={classNames}
            data-row-id={`${rowId}`}
            areas={columnAreas}
            sizes={columnSizes}
            style={style}
        >
            {visibleColumns.map((visibleColumn, colIndex) => (
                <CellContainer
                    key={`${visibleColumn.id}-${rowId}`}
                    rowId={rowId}
                    data={rowId && editRow?.[rowIdField] === rowId ? editRow : data}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                    column={visibleColumn}
                    isSelected={isSelected}
                    isEdit={isEdit}
                    disableSelection={disableSelection}
                    forwardRef={colIndex === 0 ? measureRef : undefined}
                    tableManager={tableManager}
                />
            ))}
        </Columns>
    );
};

export default Row;
