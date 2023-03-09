import {
  type InitialFlagState as GenericInitialFlagState,
  createUseFlags,
} from '@happykit/flags/client';
import { createUseFlagBag } from '@happykit/flags/context';

import { type AppFlags, config } from './config';

export type InitialFlagState = GenericInitialFlagState<AppFlags>;
export const useFlags = createUseFlags<AppFlags>(config);
export const useFlagBag = createUseFlagBag<AppFlags>();
