import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { getDeploymentStatusMessage, verifyContractsDeployed } from '@/services/contractHelpers';
import { GLOBE_CORE, GLOBE_BUSINESS } from '@/config/contracts';

export const ContractStatus = () => {
  const [status, setStatus] = useState({
    coreDeployed: false,
    businessDeployed: false,
    coreInitialized: false,
  });
  const [message, setMessage] = useState('Checking contracts...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkContracts();
  }, []);

  const checkContracts = async () => {
    setIsLoading(true);
    try {
      const contractStatus = await verifyContractsDeployed();
      const statusMsg = await getDeploymentStatusMessage();
      setStatus(contractStatus);
      setMessage(statusMsg);
    } catch (error) {
      setMessage('❌ Error checking contract status');
    } finally {
      setIsLoading(false);
    }
  };

  const allDeployed = status.coreDeployed && status.businessDeployed && status.coreInitialized;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Info className="w-4 h-4" />
          Smart Contract Status
        </h3>
        {allDeployed ? (
          <Badge variant="default" className="bg-success">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Not Deployed
          </Badge>
        )}
      </div>

      <Alert>
        <AlertDescription className="text-sm">
          {isLoading ? 'Checking contracts...' : message}
        </AlertDescription>
      </Alert>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-foreground-muted">GlobePayXCore:</span>
          <div className="flex items-center gap-2">
            {status.coreDeployed && status.coreInitialized ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <a
              href={`https://explorer.aptoslabs.com/account/${GLOBE_CORE}?network=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline flex items-center gap-1"
            >
              View <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-foreground-muted">GlobePayXBusiness:</span>
          <div className="flex items-center gap-2">
            {status.businessDeployed ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <a
              href={`https://explorer.aptoslabs.com/account/${GLOBE_BUSINESS}?network=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline flex items-center gap-1"
            >
              View <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {!allDeployed && (
        <div className="pt-2 border-t">
          <p className="text-xs text-foreground-muted">
            📚 Need help deploying? Check{' '}
            <a
              href="/DEPLOYMENT.md"
              className="text-accent hover:underline"
              target="_blank"
            >
              DEPLOYMENT.md
            </a>
          </p>
        </div>
      )}
    </Card>
  );
};
