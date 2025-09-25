/**
 * Small helper to build Aptos entry function payloads.
 * These payloads match the shape many wallets expect for signAndSubmit.
 */


export function buildEntryFunctionPayload(functionFQName: string, args: any[] = [], typeArguments: string[] = []) {
  return {
    type: 'entry_function_payload',
    function: functionFQName,
    arguments: args,
    type_arguments: typeArguments,
  };
}

// Helper for GlobePayX payroll batch_pay
export function buildBatchPayPayload(
  employer: string,
  recipients: string[],
  amounts: number[],
  memo: string,
  coinType = '0x1::aptos_coin::AptosCoin'
) {
  // GLOBE_BUSINESS::batch_pay<CoinType>(employer, recipients, amounts, memo)
  return buildEntryFunctionPayload(
    'GLOBE_BUSINESS::batch_pay',
    [employer, recipients, amounts, Array.from(new TextEncoder().encode(memo))],
    [coinType]
  );
}

export function buildTransferPayload(receipient: string, amount: number, coinType = '0x1::aptos_coin::AptosCoin') {
  // Many wallets expect (recipient, amount) as args and coin type as type argument
  return buildEntryFunctionPayload('0x1::coin::transfer', [receipient, amount], [coinType]);
}

export default { buildEntryFunctionPayload, buildTransferPayload };
