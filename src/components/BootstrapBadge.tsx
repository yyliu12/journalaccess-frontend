/** @jsxImportSource @emotion/react */

import React from 'react';
import { css } from '@emotion/react';

const badgeStyle = css`
    display: inline-block;
    padding: 0.35em 0.65em;
    font-size: .75em;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.375rem;
    background-color: RGBA(13, 110, 253, 1);
    color: white;
    margin-left: 0.5em;
`;

export default function BootstrapBadge({ children, onClick = () => { } }: { children: React.ReactNode, onClick: (e: React.MouseEvent<HTMLSpanElement>) => void }) {
    return (
        <span className="badge bg-secondary" css={badgeStyle} onClick={onClick}>
            {children}
        </span>
    );
}