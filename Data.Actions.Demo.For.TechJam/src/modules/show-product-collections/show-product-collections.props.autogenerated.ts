/**
 * Copyright (c) Microsoft Corporation
 * All rights reserved. See License.txt in the project root for license information.
 * IShowProductCollections contentModule Interface Properties
 * THIS FILE IS AUTO-GENERATED - MANUAL MODIFICATIONS WILL BE LOST
 */

import * as Msdyn365 from '@msdyn365-commerce/core';

export interface IShowProductCollectionsConfig extends Msdyn365.IModuleConfig {
    productIds?: string;
}

export interface IShowProductCollectionsResources {
    resourceKey: string;
}

export interface IShowProductCollectionsProps<T> extends Msdyn365.IModule<T> {
    resources: IShowProductCollectionsResources;
    config: IShowProductCollectionsConfig;
}
