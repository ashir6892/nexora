/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Nexora IDE Contributors. Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from 'vs/base/common/lifecycle';
import { append, $ } from 'vs/base/browser/dom';
import { IViewPaneOptions, ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IAIService } from 'vs/platform/ai/common/ai';
import { renderMarkdown } from 'vs/base/browser/markdownRenderer';

export class NexoraChatView extends ViewPane {

    private chatContainer!: HTMLElement;
    private messagesContainer!: HTMLElement;
    private inputContainer!: HTMLElement;
    private inputBox!: HTMLTextAreaElement;
    private sendButton!: HTMLButtonElement;

    constructor(
        options: IViewPaneOptions,
        @IKeybindingService keybindingService: IKeybindingService,
        @IContextMenuService contextMenuService: IContextMenuService,
        @IConfigurationService configurationService: IConfigurationService,
        @IContextKeyService contextKeyService: IContextKeyService,
        @IViewDescriptorService viewDescriptorService: IViewDescriptorService,
        @IInstantiationService instantiationService: IInstantiationService,
        @IOpenerService openerService: IOpenerService,
        @IThemeService themeService: IThemeService,
        @ITelemetryService telemetryService: ITelemetryService,
        @IAIService private readonly aiService: IAIService
    ) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
    }

    protected override renderBody(container: HTMLElement): void {
        this.chatContainer = append(container, $('.nexora-chat-container'));

        // Messages container
        this.messagesContainer = append(this.chatContainer, $('.nexora-messages'));
        this.messagesContainer.style.flex = '1';
        this.messagesContainer.style.overflowY = 'auto';
        this.messagesContainer.style.padding = '12px';

        // Input container
        this.inputContainer = append(this.chatContainer, $('.nexora-input-container'));
        this.inputContainer.style.padding = '12px';
        this.inputContainer.style.borderTop = '1px solid var(--vscode-panel-border)';

        // Input box
        this.inputBox = append(this.inputContainer, $('textarea.nexora-input')) as HTMLTextAreaElement;
        this.inputBox.placeholder = 'Ask Nexora AI anything...';
        this.inputBox.rows = 3;
        this.inputBox.style.width = '100%';
        this.inputBox.style.resize = 'none';
        this.inputBox.style.background = 'var(--vscode-input-background)';
        this.inputBox.style.color = 'var(--vscode-input-foreground)';
        this.inputBox.style.border = '1px solid var(--vscode-input-border)';
        this.inputBox.style.padding = '8px';
        this.inputBox.style.fontFamily = 'var(--vscode-font-family)';

        // Send button
        this.sendButton = append(this.inputContainer, $('button.nexora-send-button')) as HTMLButtonElement;
        this.sendButton.textContent = 'Send';
        this.sendButton.style.marginTop = '8px';
        this.sendButton.style.padding = '6px 16px';
        this.sendButton.style.background = 'var(--vscode-button-background)';
        this.sendButton.style.color = 'var(--vscode-button-foreground)';
        this.sendButton.style.border = 'none';
        this.sendButton.style.cursor = 'pointer';

        // Event handlers
        this._register(this.sendButton.addEventListener('click', () => this.sendMessage()));
        this._register(this.inputBox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.sendMessage();
            }
        }));

        // Add welcome message
        this.addMessage('assistant', 'Hello! I\'m Nexora AI, powered by Google Gemini. How can I help you today?');
    }

    private async sendMessage(): Promise<void> {
        const message = this.inputBox.value.trim();
        if (!message) {
            return;
        }

        // Add user message
        this.addMessage('user', message);
        this.inputBox.value = '';

        // Show typing indicator
        const typingElement = this.addMessage('assistant', 'Thinking...');

        try {
            let fullResponse = '';
            const stream = await this.aiService.sendMessage(message);

            for await (const chunk of stream) {
                fullResponse += chunk;
                typingElement.textContent = fullResponse;
            }
        } catch (error) {
            typingElement.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }

    private addMessage(role: 'user' | 'assistant', content: string): HTMLElement {
        const messageDiv = append(this.messagesContainer, $('.nexora-message'));
        messageDiv.style.marginBottom = '16px';

        const roleDiv = append(messageDiv, $('.nexora-message-role'));
        roleDiv.textContent = role === 'user' ? 'You' : 'Nexora AI';
        roleDiv.style.fontWeight = 'bold';
        roleDiv.style.marginBottom = '4px';
        roleDiv.style.color = role === 'user' ? 'var(--vscode-textLink-foreground)' : 'var(--vscode-descriptionForeground)';

        const contentDiv = append(messageDiv, $('.nexora-message-content'));
        contentDiv.textContent = content;
        contentDiv.style.whiteSpace = 'pre-wrap';

        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

        return contentDiv;
    }

    protected override layoutBody(height: number, width: number): void {
        this.chatContainer.style.height = `${height}px`;
        this.chatContainer.style.width = `${width}px`;
        this.chatContainer.style.display = 'flex';
        this.chatContainer.style.flexDirection = 'column';
    }
}
