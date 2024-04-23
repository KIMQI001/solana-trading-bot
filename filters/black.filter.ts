import { Filter, FilterResult } from './pool-filters';
import { MintLayout } from '@solana/spl-token';
import { Connection } from '@solana/web3.js';
import { LiquidityPoolKeysV4 } from '@raydium-io/raydium-sdk';
import { logger } from '../helpers';

export class BlackFilter implements Filter {
  constructor(private readonly connection: Connection) {}

  async execute(poolKeys: LiquidityPoolKeysV4): Promise<FilterResult> {
    try {
      const accountInfo = await this.connection.getAccountInfo(poolKeys.baseMint, this.connection.commitment);
      if (!accountInfo?.data) {
        return { ok: false, message: 'RenouncedFreeze -> Failed to fetch account data' };
      }

      const deserialize = MintLayout.decode(accountInfo.data);
      const renounced = deserialize.mintAuthority !== '3ThyYiCggengqU5AX3VVLsqXB6LUWdzDqfzzZ91bM99e';

      const message = [ renounced ? undefined : 'mint' ].filter((e) => e !== undefined);
      const ok = renounced

      return { ok: ok, message: ok ? undefined : `RenouncedFreeze -> Creator can ${message.join(' and ')} tokens` };
    } catch (e) {
      logger.error({ mint: poolKeys.baseMint }, `RenouncedFreeze -> Failed to check if creator can tokens`);
    }

    return { ok: false, message: `RenouncedFreeze -> Failed to check if creator  tokens` };
  }
}
