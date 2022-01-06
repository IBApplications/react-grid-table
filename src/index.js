import React, { useMemo } from "react";
import { SortableContainer } from "./drag-and-drop";
import { Columns, Row, HeaderCellContainer } from "./components/";
import { useTableManager } from "./hooks/";
import PropTypes from "prop-types";
import "./index.css";

const SortableList = SortableContainer(
    ({ forwardRef, className, style, children }) => (
        <div ref={forwardRef} className={className} style={style}>
            {children}
        </div>
    )
);

export const GridTable = (props) => {
    const tableManager = useTableManager(props);

    const {
        id,
        isLoading,
        config: {
            isHeaderSticky,
            isVirtualScroll,
            rowIdField,
            components: { Header, Footer, Loader, NoResults, DragHandle },
            showSearch, showColumnVisibilityManager
        },
        refs: { rgtRef, tableRef },
        columnsApi: { visibleColumns },
        columnsReorderApi: { onColumnReorderStart, onColumnReorderEnd },
        rowVirtualizer: { virtualItems, totalSize },
        paginationApi: { pageRows },
        rowsApi: { totalRows },
    } = tableManager;

    const rest = Object.keys(props).reduce((rest, key) => {
        if (GridTable.propTypes[key] === undefined)
            rest = { ...rest, [key]: props[key] };
        return rest;
    }, {});

    const gridTemplate = useMemo(() => {        
        // get column names & sizes
        const names = visibleColumns.map((column, idx) => column.field ?? (column.id || `col-${idx}`));
        const sizes = visibleColumns.map(column => column.width);
        let layout = props.layout;
        
        // check for custom grid columns layout to use...
        if (layout) {
            const customLayout = layout
                .replaceAll(', ', ',') // support sizes in minmax(x, y) units
                .split(' ');
   
            // ...ALL columns sizes present in layout?
            if (customLayout.length !== sizes.length) {
                // ...check & bypass syntax for responsive layouts?
                if (!(layout.startsWith('repeat(') && customLayout.length === 1)) {
                    // ...broken layout, find missing columns & fill sizes...
                    const missingColumns = names.slice(customLayout.length);
                    const fixableLayout = [...customLayout, ...sizes.slice(customLayout.length)];
    
                    // ...auto fill / fix missing columns?
                    if (props.layoutAutoFill) {
                        layout = fixableLayout.join(' ');
                    } else {
                        console.warn(`[RGT] Missing layout column sizes (${customLayout.length}/${fixableLayout.length}):`, missingColumns);
                        console.warn(`[RGT] Fix layout or enable auto-fix (layoutAutoFill: ${props.layoutAutoFill})`)
                    }
                }
            }
        }

        // convert to 'grid-template-*' style
        const gridAreas = `'${names.join(' ')}'`;
        const gridSizes = layout ?? sizes.join(' ');

        return {
            areas: gridAreas,
            sizes: gridSizes
        };
    }, [visibleColumns, props.layout, props.layoutAutoFill]);

    const classNames = ("rgt-wrapper " + (props.className || "")).trim();
    const showHeader = (showSearch || showColumnVisibilityManager);
    // const rowsSizes = `repeat(${pageRows.length + 1 + (isVirtualScroll ? 1 : 0)}, max-content)`;

    // console.log('[wrapper] render: ', {
    //     totalRows,
    //     rows: (isVirtualScroll ? virtualItems : pageRows),
    //     visibleColumns,
    //     gridTemplate,
    // });
    // console.log(' ');

    return (
        <div {...rest} ref={rgtRef} id={id} className={classNames}>
            {showHeader && <Header tableManager={tableManager} />}
            <SortableList
                forwardRef={tableRef}
                getContainer={() => tableRef}
                className="rgt-container"
                axis="x"
                lockToContainerEdges
                distance={10}
                lockAxis="x"
                useDragHandle={!!DragHandle}
                onSortStart={onColumnReorderStart}
                onSortEnd={onColumnReorderEnd}
            >
                {/* HEADER */}
                <Columns
                    className={!isHeaderSticky
                        ? 'rgt-header-cells'
                        : 'rgt-header-cells rgt-header-cells--sticky'
                    }
                    areas={gridTemplate.areas}
                    sizes={gridTemplate.sizes}
                >
                    {visibleColumns.map((visibleColumn, idx) => (
                        <HeaderCellContainer
                            key={visibleColumn.id}
                            index={idx}
                            column={visibleColumn}
                            tableManager={tableManager}
                        />
                    ))}
                </Columns>

                {/* DATA */}
                <div className="rgt-data-cells">
                    {totalRows && visibleColumns.length > 1
                        ? isVirtualScroll
                            ? [
                                <Row
                                    key={"virtual-start"}
                                    index={"virtual-start"}
                                    tableManager={tableManager}
                                />,
                                ...virtualItems.map((virtualizedRow, virtualIdx) => (
                                    <Row
                                        key={virtualizedRow.index}
                                        index={virtualizedRow.index}
                                        data={pageRows[virtualizedRow.index]}
                                        measureRef={virtualizedRow.measureRef}
                                        tableManager={tableManager}
                                        columnAreas={gridTemplate.areas}
                                        columnSizes={gridTemplate.sizes}
                                        style={{
                                            transform: `translateY(${(virtualizedRow.start + 1 * virtualIdx)}px)`
                                        }}
                                    />
                                )),
                                <Row
                                    key={"virtual-end"}
                                    index={"virtual-end"}
                                    tableManager={tableManager}
                                />,
                            ]
                            : pageRows.map((rowData, index) => (
                                <Row
                                    key={rowData?.[rowIdField]}
                                    index={index}
                                    data={rowData}
                                    tableManager={tableManager}
                                    columnAreas={gridTemplate.areas}
                                    columnSizes={gridTemplate.sizes}
                                />
                            ))
                    : null}
                </div>
            </SortableList>
            {!totalRows || !visibleColumns.length ? (
                <div className="rgt-container-overlay">
                    {isLoading ? (
                        <Loader tableManager={tableManager} />
                    ) : (
                        <NoResults tableManager={tableManager} />
                    )}
                </div>
            ) : null}
            <Footer tableManager={tableManager} />
        </div>
    );
};

GridTable.defaultProps = {
    columns: [],
    rowIdField: "id",
    minColumnResizeWidth: 70,
    pageSizes: [20, 50, 100],
    isHeaderSticky: true,
    highlightSearch: true,
    minSearchChars: 2,
    isPaginated: true,
    isVirtualScroll: true,
    layoutAutoFill: false,
    showSearch: true,
    showRowsInformation: true,
    showColumnVisibilityManager: true,
    enableColumnsReorder: true,
    requestDebounceTimeout: 300,
    getIsRowSelectable: () => true,
    getIsRowEditable: () => true,
    selectAllMode: "page", // ['page', 'all']
};

GridTable.propTypes = {
    // general
    columns: PropTypes.arrayOf(PropTypes.object).isRequired,
    rows: PropTypes.arrayOf(PropTypes.object),
    selectedRowsIds: PropTypes.array,
    searchText: PropTypes.string,
    getIsRowSelectable: PropTypes.func,
    getIsRowEditable: PropTypes.func,
    editRowId: PropTypes.any,

    // table config
    layout: PropTypes.string,
    layoutAutoFill: PropTypes.bool,
    rowIdField: PropTypes.string,
    batchSize: PropTypes.number,
    isPaginated: PropTypes.bool,
    enableColumnsReorder: PropTypes.bool,
    pageSizes: PropTypes.arrayOf(PropTypes.number),
    pageSize: PropTypes.number,
    page: PropTypes.number,
    sort: PropTypes.object,
    minColumnResizeWidth: PropTypes.number,
    highlightSearch: PropTypes.bool,
    showSearch: PropTypes.bool,
    showRowsInformation: PropTypes.bool,
    showColumnVisibilityManager: PropTypes.bool,
    minSearchChars: PropTypes.number,
    isLoading: PropTypes.bool,
    isHeaderSticky: PropTypes.bool,
    isVirtualScroll: PropTypes.bool,
    icons: PropTypes.object,
    texts: PropTypes.object,
    additionalProps: PropTypes.object,
    components: PropTypes.object,
    totalRows: PropTypes.number,
    requestDebounceTimeout: PropTypes.number,
    selectAllMode: PropTypes.string,

    // events
    onColumnsChange: PropTypes.func,
    onSearchTextChange: PropTypes.func,
    onSelectedRowsChange: PropTypes.func,
    onSortChange: PropTypes.func,
    onRowClick: PropTypes.func,
    onEditRowIdChange: PropTypes.func,
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    onLoad: PropTypes.func,
    onColumnResizeStart: PropTypes.func,
    onColumnResize: PropTypes.func,
    onColumnResizeEnd: PropTypes.func,
    onColumnReorderStart: PropTypes.func,
    onColumnReorderEnd: PropTypes.func,
    onRowsRequest: PropTypes.func,
    onRowsReset: PropTypes.func,
    onRowsChange: PropTypes.func,
    onTotalRowsChange: PropTypes.func,
};

export const version = '1.1.2';
export default GridTable;

export * from "./components";
export * from "./hooks";
