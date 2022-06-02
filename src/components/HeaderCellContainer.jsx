import React, { useMemo } from "react";
import { SortableElement, SortableHandle } from "../drag-and-drop";
import callOrReturn from '../utils/call-or-return';

const SortableItem = ({ children, columnId, className }, ref) => (
    <div ref={ref} className={className} data-column-id={columnId}>
        {children}
    </div>
);

const SortableElementItem = SortableElement(React.forwardRef(SortableItem));

const DragHandleContainer = ({ children }, ref) => (
    <span ref={ref}>{children}</span>
);

const SortableDragHandle = SortableHandle(
    React.forwardRef(DragHandleContainer)
);

const HeaderCellContainer = ({ index, column, tableManager }) => {
    let {
        config: {
            enableColumnsReorder,
            components: { DragHandle },
            additionalProps: { headerCellContainer: additionalProps = {} },
            icons: {
                sortAscending: sortAscendingIcon,
                sortDescending: sortDescendingIcon,
            },
        },
        sortApi: { isSorting, sort, toggleSort },
        columnsApi: { visibleColumns },
        columnsResizeApi: { useResizeRef },
        rowSelectionApi: { selectAll: selectionProps },
    } = tableManager;

    let resizeHandleRef = useResizeRef(column);

    const classNames = useMemo(() => {
        const { className } = additionalProps;
        let headerClassNames;

        switch (column.id) {
            case "virtual":
                headerClassNames = 'rgt-cell-header-virtual-col';
                break;
            default:
                headerClassNames = `rgt-cell-header-${
                    column.id === "checkbox" ? "checkbox" : column.field
                }${
                    !isSorting &&
                    column.sortable !== false &&
                    column.id !== "checkbox" &&
                    column.id !== "virtual"
                        ? " rgt-clickable"
                        : ""
                }${
                    column.sortable !== false && column.id !== "checkbox"
                        ? " rgt-cell-header-sortable"
                        : " rgt-cell-header-not-sortable"
                }${
                    column.resizable !== false
                        ? " rgt-cell-header-resizable"
                        : " rgt-cell-header-not-resizable"
                }${
                    column.searchable !== false && column.id !== "checkbox"
                        ? " rgt-cell-header-searchable"
                        : " rgt-cell-header-not-searchable"
                }${
                    isPinnedLeft
                        ? " rgt-cell-header-pinned rgt-cell-header-pinned-left"
                        : ""
                }${
                    isPinnedRight
                        ? " rgt-cell-header-pinned rgt-cell-header-pinned-right"
                        : ""
                } ${column.className}`.trim();
        }

        // get custom CSS class for this header cell or fallback to plain value if any
        const customHeaderClass = callOrReturn(className, { colIndex: index, colData: column });

        const cellClassnames = [
            'rgt-cell-header',
            headerClassNames.trim(),
            isSorting && 'rgt-cell-header-sorting',
            customHeaderClass
        ].filter(Boolean).join(' ');

        return cellClassnames;
    }, [additionalProps.className, isSorting, column]);

    const getAdditionalProps = () => {
        let mergedProps = {
            ...additionalProps,
        };
        if (column.sortable) {
            let onClick = additionalProps.onClick;
            mergedProps.onClick = (e) => {
                toggleSort(column.id);
                onClick?.(e);
            };
        }

        return mergedProps;
    };

    let isPinnedRight = column.pinned && index === visibleColumns.length - 1;
    let isPinnedLeft = column.pinned && index === 0;
    let innerCellClassNames = `rgt-cell-header-inner${
        column.id === "checkbox" ? " rgt-cell-header-inner-checkbox" : ""
    }${!isPinnedRight ? " rgt-cell-header-inner-not-pinned-right" : ""}`;
    additionalProps = getAdditionalProps();

    let headerCellProps = { tableManager, column };

    return (
        <div
            data-column-id={column.id.toString()}
            {...additionalProps}
            className={classNames}
        >
            {column.id === "virtual" ? null : (
                <React.Fragment>
                    <SortableElementItem
                        className={innerCellClassNames}
                        index={index}
                        disabled={
                            !enableColumnsReorder ||
                            isPinnedLeft ||
                            isPinnedRight
                        }
                        columnId={column.id.toString()}
                        collection={isPinnedLeft || isPinnedRight ? 0 : 1}
                    >
                        {DragHandle && !isPinnedLeft && !isPinnedRight ? (
                            <SortableDragHandle index={index}>
                                {<DragHandle />}
                            </SortableDragHandle>
                        ) : null}
                        {column.id === "checkbox"
                            ? column.headerCellRenderer({
                                  ...headerCellProps,
                                  ...selectionProps,
                              })
                            : column.headerCellRenderer(headerCellProps)}
                        {sort.colId !== column.id ? null : sort.isAsc ? (
                            <span className="rgt-sort-icon rgt-sort-icon-ascending">
                                {sortAscendingIcon}
                            </span>
                        ) : (
                            <span className="rgt-sort-icon rgt-sort-icon-descending">
                                {sortDescendingIcon}
                            </span>
                        )}
                    </SortableElementItem>
                    {column.resizable ? (
                        <span
                            ref={resizeHandleRef}
                            className="rgt-resize-handle"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                            }}
                        ></span>
                    ) : null}
                </React.Fragment>
            )}
        </div>
    );
};

export default HeaderCellContainer;
