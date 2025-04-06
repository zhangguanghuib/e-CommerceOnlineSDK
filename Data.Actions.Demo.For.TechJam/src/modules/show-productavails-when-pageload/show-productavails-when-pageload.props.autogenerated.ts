/**
 * Copyright (c) Microsoft Corporation
 * All rights reserved. See License.txt in the project root for license information.
 * IShowProductavailsWhenPageload contentModule Interface Properties
 * THIS FILE IS AUTO-GENERATED - MANUAL MODIFICATIONS WILL BE LOST
 */

import * as Msdyn365 from '@msdyn365-commerce/core';

export interface IShowProductavailsWhenPageloadConfig extends Msdyn365.IModuleConfig {
    productId: number;
}

export interface IShowProductavailsWhenPageloadResources {
    resourceKey: string;
}

export interface IShowProductavailsWhenPageloadProps<T> extends Msdyn365.IModule<T> {
    resources: IShowProductavailsWhenPageloadResources;
    config: IShowProductavailsWhenPageloadConfig;
}
