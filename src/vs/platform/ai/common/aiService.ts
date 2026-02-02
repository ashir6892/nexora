/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Nexora IDE Contributors. Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { IStorageService, StorageScope, StorageTarget } from 'vs/platform/storage/common/storage';
import { IAIService, IAIAccount, IAIConversation, IAICompletionRequest, IAICompletionResponse } from 'vs/platform/ai/common/ai';
import { ILogService } from 'vs/platform/log/common/log';

const STORAGE_KEY_ACCOUNTS = 'nexora.ai.accounts';
const STORAGE_KEY_ACTIVE_ACCOUNT = 'nexora.ai.activeAccount';
const STORAGE_KEY_CONVERSATIONS = 'nexora.ai.conversations';

export class AIService extends Disposable implements IAIService {
    declare readonly _serviceBrand: undefined;

    private readonly _onDidChangeAccounts = this._register(new Emitter<void>());
    readonly onDidChangeAccounts: Event<void> = this._onDidChangeAccounts.event;

    private readonly _onDidChangeActiveAccount = this._register(new Emitter<IAIAccount | undefined>());
    readonly onDidChangeActiveAccount: Event<IAIAccount | undefined> = this._onDidChangeActiveAccount.event;

    private accounts: IAIAccount[] = [];
    private activeAccount: IAIAccount | undefined;

    constructor(
        @IStorageService private readonly storageService: IStorageService,
        @ILogService private readonly logService: ILogService
    ) {
        super();
        this.loadAccounts();
    }

    private loadAccounts(): void {
        const accountsJson = this.storageService.get(STORAGE_KEY_ACCOUNTS, StorageScope.APPLICATION);
        if (accountsJson) {
            try {
                this.accounts = JSON.parse(accountsJson);
            } catch (e) {
                this.logService.error('Failed to load AI accounts', e);
            }
        }

        const activeAccountId = this.storageService.get(STORAGE_KEY_ACTIVE_ACCOUNT, StorageScope.APPLICATION);
        if (activeAccountId) {
            this.activeAccount = this.accounts.find(a => a.id === activeAccountId);
        }
    }

    private saveAccounts(): void {
        this.storageService.store(STORAGE_KEY_ACCOUNTS, JSON.stringify(this.accounts), StorageScope.APPLICATION, StorageTarget.MACHINE);
        this._onDidChangeAccounts.fire();
    }

    async getAccounts(): Promise<IAIAccount[]> {
        return this.accounts;
    }

    async getActiveAccount(): Promise<IAIAccount | undefined> {
        return this.activeAccount;
    }

    async addAccount(email: string): Promise<IAIAccount> {
        // TODO: Implement OAuth flow using openauth
        const account: IAIAccount = {
            id: `account-${Date.now()}`,
            email,
            accessToken: '', // Will be filled by OAuth
            refreshToken: '',
            quotaUsed: 0,
            quotaLimit: 1000000, // 1M tokens default
            isActive: false
        };

        this.accounts.push(account);
        this.saveAccounts();

        if (this.accounts.length === 1) {
            await this.setActiveAccount(account.id);
        }

        return account;
    }

    async removeAccount(accountId: string): Promise<void> {
        this.accounts = this.accounts.filter(a => a.id !== accountId);
        if (this.activeAccount?.id === accountId) {
            this.activeAccount = this.accounts[0];
            this.storageService.store(STORAGE_KEY_ACTIVE_ACCOUNT, this.activeAccount?.id || '', StorageScope.APPLICATION, StorageTarget.MACHINE);
            this._onDidChangeActiveAccount.fire(this.activeAccount);
        }
        this.saveAccounts();
    }

    async setActiveAccount(accountId: string): Promise<void> {
        const account = this.accounts.find(a => a.id === accountId);
        if (account) {
            this.activeAccount = account;
            this.storageService.store(STORAGE_KEY_ACTIVE_ACCOUNT, accountId, StorageScope.APPLICATION, StorageTarget.MACHINE);
            this._onDidChangeActiveAccount.fire(this.activeAccount);
        }
    }

    async refreshQuota(accountId: string): Promise<void> {
        // TODO: Call Gemini API to get current quota
        this.logService.info('Refreshing quota for account', accountId);
    }

    async *sendMessage(message: string, conversationId?: string): AsyncIterable<string> {
        if (!this.activeAccount) {
            throw new Error('No active account');
        }

        // TODO: Implement streaming Gemini API call
        yield 'This is a placeholder response. ';
        yield 'Gemini integration will be implemented next. ';
        yield message;
    }

    async getCompletion(request: IAICompletionRequest): Promise<IAICompletionResponse> {
        if (!this.activeAccount) {
            throw new Error('No active account');
        }

        // TODO: Implement Gemini completion API
        return {
            text: '// Completion placeholder\n',
            finishReason: 'stop',
            usage: {
                promptTokens: 10,
                completionTokens: 5,
                totalTokens: 15
            }
        };
    }

    async getConversations(): Promise<IAIConversation[]> {
        const conversationsJson = this.storageService.get(STORAGE_KEY_CONVERSATIONS, StorageScope.APPLICATION);
        if (conversationsJson) {
            try {
                return JSON.parse(conversationsJson);
            } catch (e) {
                this.logService.error('Failed to load conversations', e);
            }
        }
        return [];
    }

    async deleteConversation(conversationId: string): Promise<void> {
        const conversations = await this.getConversations();
        const filtered = conversations.filter(c => c.id !== conversationId);
        this.storageService.store(STORAGE_KEY_CONVERSATIONS, JSON.stringify(filtered), StorageScope.APPLICATION, StorageTarget.MACHINE);
    }
}
