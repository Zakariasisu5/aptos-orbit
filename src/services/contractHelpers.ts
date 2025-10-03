/**
 * Contract Helper Functions
 * Utility functions for interacting with GlobePayX smart contracts
 */

import { aptos } from './aptosService';
import { 
  GLOBE_CORE, 
  GLOBE_BUSINESS, 
  CONTRACT_MODULES, 
  CONTRACT_FUNCTIONS 
} from '@/config/contracts';

/**
 * Check if contracts are deployed and initialized
 */
export const verifyContractsDeployed = async (): Promise<{
  coreDeployed: boolean;
  businessDeployed: boolean;
  coreInitialized: boolean;
}> => {
  try {
    // Check if GlobePayXCore is deployed and initialized
    let coreDeployed = false;
    let coreInitialized = false;
    
    try {
      const swapFee = await aptos.view({
        payload: {
          function: `${GLOBE_CORE}::GlobePayXCore::${CONTRACT_FUNCTIONS.GET_SWAP_FEE}` as `${string}::${string}::${string}`,
          typeArguments: [],
          functionArguments: [],
        },
      });
      coreDeployed = true;
      coreInitialized = swapFee !== undefined;
    } catch (error) {
      console.warn('GlobePayXCore not found or not initialized');
    }

    // Check if GlobePayXBusiness is deployed
    let businessDeployed = false;
    try {
      // Try to get account resources (this will fail if module doesn't exist)
      const resources = await aptos.getAccountResources({
        accountAddress: GLOBE_BUSINESS,
      });
      businessDeployed = resources.length > 0;
    } catch (error) {
      console.warn('GlobePayXBusiness not found');
    }

    return {
      coreDeployed,
      businessDeployed,
      coreInitialized,
    };
  } catch (error) {
    console.error('Error verifying contracts:', error);
    return {
      coreDeployed: false,
      businessDeployed: false,
      coreInitialized: false,
    };
  }
};

/**
 * Get swap fee in basis points (100 = 1%)
 */
export const getSwapFee = async (): Promise<number> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${GLOBE_CORE}::GlobePayXCore::${CONTRACT_FUNCTIONS.GET_SWAP_FEE}` as `${string}::${string}::${string}`,
        typeArguments: [],
        functionArguments: [],
      },
    });
    return Number(result[0]);
  } catch (error) {
    console.error('Error fetching swap fee:', error);
    return 25; // Default 0.25%
  }
};

/**
 * Get swap request details by ID
 */
export const getSwapInfo = async (swapId: number) => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${GLOBE_CORE}::GlobePayXCore::${CONTRACT_FUNCTIONS.GET_SWAP_INFO}` as `${string}::${string}::${string}`,
        typeArguments: [],
        functionArguments: [swapId],
      },
    });
    
    return {
      user: result[0] as string,
      amountIn: Number(result[1]),
      amountOut: Number(result[2]),
      rate: BigInt(result[3] as string),
      fee: Number(result[4]),
      executed: result[5] as boolean,
    };
  } catch (error) {
    console.error('Error fetching swap info:', error);
    return null;
  }
};

/**
 * Get treasury balance for a specific tag
 */
export const getTreasuryTagBalance = async (
  orgAddress: string,
  tag: string,
  coinType: string
): Promise<number> => {
  try {
    const tagBytes = new TextEncoder().encode(tag);
    const result = await aptos.view({
      payload: {
        function: `${GLOBE_BUSINESS}::GlobePayXBusiness::${CONTRACT_FUNCTIONS.GET_TREASURY_BALANCE}` as `${string}::${string}::${string}`,
        typeArguments: [coinType as any],
        functionArguments: [orgAddress, Array.from(tagBytes)],
      },
    });
    return Number(result[0]);
  } catch (error) {
    console.error('Error fetching treasury balance:', error);
    return 0;
  }
};

/**
 * Check if user is organization admin
 */
export const isOrgAdmin = async (
  orgAddress: string,
  userAddress: string
): Promise<boolean> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${GLOBE_BUSINESS}::GlobePayXBusiness::is_org_admin` as `${string}::${string}::${string}`,
        typeArguments: [],
        functionArguments: [orgAddress, userAddress],
      },
    });
    return result[0] as boolean;
  } catch (error) {
    console.error('Error checking org admin status:', error);
    return false;
  }
};

/**
 * Create organization (must be called by org account)
 */
export const createOrganization = async (walletProvider: any) => {
  try {
    const payload = {
      function: `${CONTRACT_MODULES.BUSINESS}::${CONTRACT_FUNCTIONS.CREATE_ORG}`,
      type_arguments: [],
      arguments: [],
    };
    
    console.log('🏢 Creating organization...');
    const response = await walletProvider.signAndSubmitTransaction(payload);
    await aptos.waitForTransaction({ transactionHash: response.hash });
    console.log('✅ Organization created:', response.hash);
    
    return response;
  } catch (error) {
    console.error('❌ Error creating organization:', error);
    throw error;
  }
};

/**
 * Initialize treasury for a coin type
 */
export const initializeTreasury = async (
  walletProvider: any,
  coinType: string
) => {
  try {
    const payload = {
      function: `${CONTRACT_MODULES.BUSINESS}::${CONTRACT_FUNCTIONS.INIT_TREASURY}`,
      type_arguments: [coinType],
      arguments: [],
    };
    
    console.log('💰 Initializing treasury for:', coinType);
    const response = await walletProvider.signAndSubmitTransaction(payload);
    await aptos.waitForTransaction({ transactionHash: response.hash });
    console.log('✅ Treasury initialized:', response.hash);
    
    return response;
  } catch (error) {
    console.error('❌ Error initializing treasury:', error);
    throw error;
  }
};

/**
 * Format address for display (0x1234...5678)
 */
export const formatAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Validate Aptos address format
 */
export const isValidAptosAddress = (address: string): boolean => {
  if (!address) return false;
  // Aptos addresses are 0x followed by 64 hex characters (or shorter with leading zeros omitted)
  return /^0x[a-fA-F0-9]{1,64}$/.test(address);
};

/**
 * Get contract deployment status message
 */
export const getDeploymentStatusMessage = async (): Promise<string> => {
  const status = await verifyContractsDeployed();
  
  if (!status.coreDeployed && !status.businessDeployed) {
    return '⚠️ Contracts not deployed. Please deploy contracts first.';
  }
  
  if (!status.coreInitialized) {
    return '⚠️ GlobePayXCore not initialized properly.';
  }
  
  if (!status.coreDeployed) {
    return '⚠️ GlobePayXCore not deployed.';
  }
  
  if (!status.businessDeployed) {
    return '⚠️ GlobePayXBusiness not deployed.';
  }
  
  return '✅ All contracts deployed and initialized.';
};
