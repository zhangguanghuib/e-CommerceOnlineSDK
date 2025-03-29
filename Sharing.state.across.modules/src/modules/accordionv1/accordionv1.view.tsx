/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */
import { Module, Node } from '@msdyn365-commerce-modules/utilities';
import * as React from 'react';
import { IAccordionv1ViewProps } from './accordionv1';
const accordionv1View: React.FC<IAccordionv1ViewProps> = props => {
    const { AccordionContainer, accordionItems } = props;
    if (!props.accordionButtons && !props.accordionItems) {
        props.context.telemetry.error('Accordion content is empty, module will not render');
        return null;
    }

    return (
        <Module {...AccordionContainer}>
            <Node {...props.HeaderSection}>
                {props.accordionButtons && <Node {...props.accordionButtonsContainer}>{props.accordionButtons}</Node>}
            </Node>
            <Node {...props.accordionItemContainer}>{accordionItems}</Node>
        </Module>
    );
};

export default accordionv1View;
