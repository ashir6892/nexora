/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Nexora IDE Contributors. Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { localize } from 'vs/nls';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { Registry } from 'vs/platform/registry/common/platform';
import { IViewsRegistry, IViewDescriptor, Extensions as ViewExtensions } from 'vs/workbench/common/views';
import { VIEW_CONTAINER } from 'vs/workbench/contrib/files/browser/explorerViewlet';
import { NexoraChatView } from 'vs/workbench/contrib/nexora/browser/nexoraChatView';
import { ViewPaneContainer } from 'vs/workbench/browser/parts/views/viewPaneContainer';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';

export const NEXORA_VIEW_ID = 'workbench.view.nexora';

const viewDescriptor: IViewDescriptor = {
    id: NEXORA_VIEW_ID,
    name: localize('nexora', "Nexora AI"),
    ctorDescriptor: new SyncDescriptor(NexoraChatView),
    canToggleVisibility: true,
    workspace: true,
    order: 100
};

// Register the Nexora view in the Explorer view container
Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry).registerViews([viewDescriptor], VIEW_CONTAINER);
