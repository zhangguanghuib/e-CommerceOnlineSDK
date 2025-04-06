/**
 * Copyright (c) Microsoft Corporation
 * All rights reserved. See License.txt in the project root for license information.
 * IGetProductinfoWhenPageload contentModule Interface Properties
 * THIS FILE IS AUTO-GENERATED - MANUAL MODIFICATIONS WILL BE LOST
 */

import * as Msdyn365 from '@msdyn365-commerce/core';

export interface IGetProductinfoWhenPageloadConfig extends Msdyn365.IModuleConfig {
    productId: number;
}

export interface IGetProductinfoWhenPageloadResources {
    resourceKey: string;
}

export interface IGetProductinfoWhenPageloadProps<T> extends Msdyn365.IModule<T> {
    resources: IGetProductinfoWhenPageloadResources;
    config: IGetProductinfoWhenPageloadConfig;
}
