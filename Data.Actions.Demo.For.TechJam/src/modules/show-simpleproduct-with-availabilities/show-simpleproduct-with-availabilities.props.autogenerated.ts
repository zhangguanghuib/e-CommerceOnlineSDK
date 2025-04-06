/**
 * Copyright (c) Microsoft Corporation
 * All rights reserved. See License.txt in the project root for license information.
 * IShowSimpleproductWithAvailabilities contentModule Interface Properties
 * THIS FILE IS AUTO-GENERATED - MANUAL MODIFICATIONS WILL BE LOST
 */

import * as Msdyn365 from '@msdyn365-commerce/core';

export interface IShowSimpleproductWithAvailabilitiesConfig extends Msdyn365.IModuleConfig {
    productId: number;
}

export interface IShowSimpleproductWithAvailabilitiesResources {
    resourceKey: string;
}

export interface IShowSimpleproductWithAvailabilitiesProps<T> extends Msdyn365.IModule<T> {
    resources: IShowSimpleproductWithAvailabilitiesResources;
    config: IShowSimpleproductWithAvailabilitiesConfig;
}
