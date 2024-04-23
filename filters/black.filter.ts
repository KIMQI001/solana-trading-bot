import { Filter, FilterResult } from './pool-filters';
import { MintLayout } from '@solana/spl-token';
import { Connection } from '@solana/web3.js';
import { LiquidityPoolKeysV4 } from '@raydium-io/raydium-sdk';
import { logger } from '../helpers';
import fs from 'fs';

const blacklist = fs.readFileSync('blacklist.txt', 'utf-8').split('\n').map(entry => entry.trim());

export class BlackFilter implements Filter {
  constructor(private readonly connection: Connection) {}

  async execute(poolKeys: LiquidityPoolKeysV4): Promise<FilterResult> {
    try {
      const accountInfo = await this.connection.getAccountInfo(poolKeys.baseMint, this.connection.commitment);
      if (!accountInfo?.data) {
        return { ok: false, message: 'BlackFilter -> Failed to fetch account data' };
      }

      const deserialize = MintLayout.decode(accountInfo.data);
      //const renounced = deserialize.mintAuthority.toString() !== '3ThyYiCggengqU5AX3VVLsqXB6LUWdzDqfzzZ91bM99e';
      const renounced = !blacklist.includes(deserialize.mintAuthority.toString());

      logger.info(
        { mint: deserialize.mintAuthority.toString() },
        `xxxddddd`,
      );
      const message = [ renounced ? undefined : 'mint' ].filter((e) => e !== undefined);
      const ok = renounced

      return { ok: ok, message: ok ? undefined : `BlackFilter -> Creator is in blacklist` };
    } catch (e) {
      logger.error({ mint: poolKeys.baseMint }, `BlackFilter -> Failed to check if blackcreator  1`);
    }

    return { ok: false, message: `BlackFilter -> Failed to check if blackcreator  2` };
  }
}
