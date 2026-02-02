/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Nexora IDE Contributors. Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';

export const IAIService = createDecorator<IAIService>('aiService');

export interface IAIAccount {
    readonly id: string;
    readonly email: string;
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly quotaUsed: number;
    readonly quotaLimit: number;
    readonly isActive: boolean;
}

export interface IAIMessage {
    readonly role: 'user' | 'assistant' | 'system';
    readonly content: string;
    readonly timestamp: number;
}

export interface IAIConversation {
    readonly id: string;
    readonly messages: IAIMessage[];
    readonly createdAt: number;
    readonly updatedAt: number;
}

export interface IAICompletionRequest {
    readonly prompt: string;
    readonly context?: string;
    readonly maxTokens?: number;
    readonly temperature?: number;
    readonly stream?: boolean;
}

export interface IAICompletionResponse {
    readonly text: string;
    readonly finishReason: 'stop' | 'length' | 'error';
    readonly usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface IAIService {
    readonly _serviceBrand: undefined;

    /**
     * Event fired when accounts change
     */
    readonly onDidChangeAccounts: Event<void>;

    /**
     * Event fired when the active account changes
     */
    readonly onDidChangeActiveAccount: Event<IAIAccount | undefined>;

    /**
     * Get all AI accounts
     */
    getAccounts(): Promise<IAIAccount[]>;

    /**
     * Get the currently active account
     */
    getActiveAccount(): Promise<IAIAccount | undefined>;

    /**
     * Add a new AI account
     */
    addAccount(email: string): Promise<IAIAccount>;

    /**
     * Remove an AI account
     */
    removeAccount(accountId: string): Promise<void>;

    /**
     * Set the active account
     */
    setActiveAccount(accountId: string): Promise<void>;

    /**
     * Refresh account quota
     */
    refreshQuota(accountId: string): Promise<void>;

    /**
     * Send a chat message and get response
     */
    sendMessage(message: string, conversationId?: string): AsyncIterable<string>;

    /**
     * Get inline code completion
     */
    getCompletion(request: IAICompletionRequest): Promise<IAICompletionResponse>;

    /**
     * Get conversation history
     */
    getConversations(): Promise<IAIConversation[]>;

    /**
     * Delete a conversation
     */
    deleteConversation(conversationId: string): Promise<void>;
}
