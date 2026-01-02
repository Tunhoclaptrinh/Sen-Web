import React, { CSSProperties } from "react";

export interface BackgroundProps {
    children?: React.ReactNode;

    /** Background */
    useFullBackground?: boolean;
    showBase?: boolean;

    /** Elements */
    showBird?: boolean;
    showDrum?: boolean;
    showLeaf?: boolean;

    /** Lotus */
    showLotus?: boolean;
    showLotus1?: boolean;
    showLotus2?: boolean;
    showLotus3?: boolean;

    /** Smoke */
    showSmoke?: boolean;
    showSmokeLeft?: boolean;
    showSmokeRight?: boolean;

    /** Custom style */
    wrapperStyle?: CSSProperties;
    contentStyle?: CSSProperties;
}
