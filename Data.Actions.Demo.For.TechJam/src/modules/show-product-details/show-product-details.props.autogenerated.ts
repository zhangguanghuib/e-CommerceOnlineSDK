/**
 * Copyright (c) Microsoft Corporation
 * All rights reserved. See License.txt in the project root for license information.
 * IShowProductDetails contentModule Interface Properties
 * THIS FILE IS AUTO-GENERATED - MANUAL MODIFICATIONS WILL BE LOST
 */

import * as Msdyn365 from '@msdyn365-commerce/core';

export interface IShowProductDetailsConfig extends Msdyn365.IModuleConfig {
    productId: number;
}

export interface IShowProductDetailsResources {
    resourceKey: string;
}

export interface IShowProductDetailsProps<T> extends Msdyn365.IModule<T> {
    resources: IShowProductDetailsResources;
    config: IShowProductDetailsConfig;
}
