import React, { useMemo } from 'react';
import { css } from 'goober';

// helper to build dynamic & static/predictible CSS class name(s)
// NOTE: used instead of inline style to obtain the same 'layout' for rows
// (without polluting DOM and freeing up 'style' for any overrides)
const getGridClassname = ({ templateAreas, templateColumns }) => css`
    display: grid;

    /* accept optional template areas & columns */
    ${templateAreas && `grid-template-areas: ${templateAreas};`}
    ${templateColumns && `grid-template-columns: ${templateColumns};`}
`;

// WARN: DO NOT transform to a 'styled' component, use as React:FC helper
// (this way you can use any implementation of styled-components / emotion / etc.)
const Columns = ({ className, children, areas, sizes, style }) => {
    const classNames = useMemo(() => {
        // create CSS template layout based on columns names & sizes
        const gridTemplateClassname = getGridClassname({
            templateAreas: areas,
            templateColumns: sizes
        });

        return `${className || ''} ${gridTemplateClassname}`.trim();   
    }, [className, areas, sizes]);
    
    return (
        <div className={classNames} style={style}>{children}</div>
    );
};

export default Columns;