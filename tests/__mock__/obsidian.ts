import type { Plugin } from 'obsidian';
import type { RandomTaskerSettings } from '../../src/settings';
import type {RandomTaskerState} from '../../src/taskState';
//import jest from 'jest-mock';

export const MockPlugin = {
    settings : {} as unknown as RandomTaskerSettings,
    state: {} as unknown as RandomTaskerState
} as unknown as Plugin;
