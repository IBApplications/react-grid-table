import React, { useMemo } from 'react';
import { css } from 'goober';

//
// Helper to build dynamic & static/predictible CSS class(names) for 'nested' grids
//
// NOTE: used instead of inline style(s) to obtain the same 'grid layout' for rows
// (without polluting DOM and freeing up 'style' attr for any custom/hard overrides)
//
// WHY?: Because 'display: subgrid' is not supported cross-browser. #sad #chewy :(
// More here: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Subgrid#browser_compatibility
//
const getGridClassname = ({ templateAreas, templateColumns }) => css`
    display: grid;

    /* accept optional template areas & columns */
    ${templateAreas && `grid-template-areas: ${templateAreas};`}
    ${templateColumns && `grid-template-columns: ${templateColumns};`}
`;

// WARN: DO NOT transform to a 'styled' component, use as React:FC helper
// (this way you can use any implementation of styled-components / emotion / etc.)
const Columns = ({ className, children, areas, sizes, style, ...rest }) => {
    const classNames = useMemo(() => {
        // create CSS template layout based on columns names & sizes
        const gridTemplateClassname = getGridClassname({
            templateAreas: areas,
            templateColumns: sizes
        });

        return `${className || ''} ${gridTemplateClassname}`.trim();   
    }, [className, areas, sizes]);
    
    return (
        <div className={classNames} style={style} {...rest}>{children}</div>
    );
};

export default Columns;