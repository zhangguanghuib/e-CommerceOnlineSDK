/**
 * Copyright (c) Microsoft Corporation
 * All rights reserved. See License.txt in the project root for license information.
 * ICustomSearch contentModule Interface Properties
 * THIS FILE IS AUTO-GENERATED - MANUAL MODIFICATIONS WILL BE LOST
 */

import * as Msdyn365 from '@msdyn365-commerce/core';

export interface ICustomSearchConfig extends Msdyn365.IModuleConfig {
    suggestionTypeCriterion?: ISuggestionTypeCriterionData[];
    topResultsCount?: number;
    imageSettings?: Msdyn365.IImageSettings;
    hideSearchLabel?: boolean;
    disableSubmitSearch?: boolean;
    searchplaceholderText?: string;
    shouldShowFullCategoryPath?: boolean;
    className?: string;
    clientRender?: boolean;
}

export interface ICustomSearchResources {
    searchtext: string;
    searchLabelArialLabel: string;
    cancelBtnAriaLabel: string;
    searchBtnAriaLabel: string;
    submitBtnAriaLabel: string;
    autoSuggestFoundMessage: string;
    noAutoSuggestionMessage: string;
    productSuggestionHeading: string;
    categorySuggestionHeading: string;
    autoSuggestResultLoadingMessage: string;
    freePriceText: string;
}

export const enum SuggestionTypeCriterionSuggestionType {
    product = 'product',
    keyword = 'keyword',
    scopedCategory = 'scopedCategory'
}

export interface ISuggestionTypeCriterionData {
    SuggestionType?: SuggestionTypeCriterionSuggestionType;
}

export interface ICustomSearchProps<T> extends Msdyn365.IModule<T> {
    resources: ICustomSearchResources;
    config: ICustomSearchConfig;
}
