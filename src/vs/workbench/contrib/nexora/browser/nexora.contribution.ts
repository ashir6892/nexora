/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Nexora IDE Contributors. Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import * as nls from 'vs/nls';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { Registry } from 'vs/platform/registry/common/platform';
import { IViewsRegistry, IViewDescriptor, Extensions as ViewExtensions } from 'vs/workbench/common/views';
import { VIEW_CONTAINER } from 'vs/workbench/contrib/files/browser/explorerViewlet';
import { NexoraChatView } from 'vs/workbench/contrib/nexora/browser/nexoraChatView';

export const NEXORA_VIEW_ID = 'workbench.view.nexora';

const viewDescriptor: IViewDescriptor = {
    id: NEXORA_VIEW_ID,
    name: nls.localize2('nexora', "Nexora AI"),
    ctorDescriptor: new SyncDescriptor(NexoraChatView),
    canToggleVisibility: true,
    workspace: true,
    order: 100
};

// Register the Nexora view in the Explorer view container
Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry).registerViews([viewDescriptor], VIEW_CONTAINER);
