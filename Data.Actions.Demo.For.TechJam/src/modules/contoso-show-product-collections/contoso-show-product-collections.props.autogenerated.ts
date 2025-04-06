/**
 * Copyright (c) Microsoft Corporation
 * All rights reserved. See License.txt in the project root for license information.
 * IContosoShowProductCollections contentModule Interface Properties
 * THIS FILE IS AUTO-GENERATED - MANUAL MODIFICATIONS WILL BE LOST
 */

import * as Msdyn365 from '@msdyn365-commerce/core';

export interface IContosoShowProductCollectionsConfig extends Msdyn365.IModuleConfig {
    productIds?: string;
}

export interface IContosoShowProductCollectionsResources {
    resourceKey: string;
}

export interface IContosoShowProductCollectionsProps<T> extends Msdyn365.IModule<T> {
    resources: IContosoShowProductCollectionsResources;
    config: IContosoShowProductCollectionsConfig;
}
