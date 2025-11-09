import React, { useState } from 'react';
import { useMFA } from '@/hooks/use-mfa';
import { useAuth } from '@/hooks/use-auth'; // Assuming useAuth is your primary auth hook
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface MFAVerificationFormProps {
  onVerified: () => Promise<boolean> | boolean; // Callback after successful MFA verification
  onCancel: () => void; // Callback to cancel MFA verification
}

export const MFAVerificationForm = ({ onVerified, onCancel }: MFAVerificationFormProps) => {
  const { loading, mfaFactors, verifyTotp /*, verifySms*/ } = useMFA();
  const { pendingMfaFactors } = useAuth();
  // Assume useAuth has a method to re-sign in after MFA, or provides necessary session data
  // const { signInWithMfa } = useAuth(); // This will be handled by the login flow directly

  const [code, setCode] = useState('');
  const [selectedFactorId, setSelectedFactorId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!code) {
      toast.error('Enter the 6-digit code from your authenticator app.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      let factor = availableFactors.find(f => f.id === selectedFactorId);
      if (!factor && availableFactors.length > 0) {
        factor = availableFactors[0];
        setSelectedFactorId(factor.id);
      }

      if (!factor) {
        toast.error('No MFA factors available for verification.');
        return;
      }
      console.info('[MFAVerification] Submitting code', { factorId: factor.id, factorType: factor.factor_type });

      let success = false;
      if (factor.factor_type === 'totp') {
        success = await verifyTotp(factor.id, code);
      } else if (factor.factor_type === 'sms') {
        // Future: You'd need to handle sending SMS challenge dynamically here or earlier
        // success = await verifySms(factor.id, 'CHALLENGE_ID_HERE', code);
        toast.info('SMS verification is not yet fully implemented for login.');
      }

      console.info('[MFAVerification] verifyTotp returned', { success });
      if (success) {
        toast.success('MFA verified successfully!');
        setCode('');
        const verified = await onVerified();
        if (verified === false) {
          setErrorMessage('Verification succeeded, but we could not refresh your session. Please sign in again.');
        }
      } else {
        setErrorMessage('That code did not work. Check the time on your device and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // If multiple factors are enabled, you might provide a dropdown to select
  const availableFactors = React.useMemo(
    () => {
      const source = mfaFactors.length > 0 ? mfaFactors : pendingMfaFactors;
      console.info('[MFAVerification] Available factors', source);
      return source.filter(f => f.status === 'verified' || f.status === 'unverified');
    },
    [mfaFactors, pendingMfaFactors]
  );

  React.useEffect(() => {
    if (!selectedFactorId && availableFactors.length > 0) {
      setSelectedFactorId(availableFactors[0].id);
      console.info('[MFAVerification] Auto-selected factor', { factorId: availableFactors[0].id });
    }
  }, [availableFactors, selectedFactorId]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Verify It’s Really You</h3>
      <p className="text-sm text-muted-foreground">
        Open authenticator app you paired with Bill Algo, generate the latest 6-digit passcode, and enter it below. Codes refresh every 30 seconds, so make sure you submit the current value. If you’ve lost access to your app, contact an administrator for a recovery option.
      </p>

      {availableFactors.length > 1 && (
        <div>
          <Label htmlFor="mfa-factor-select">Choose MFA Method</Label>
          <select
            id="mfa-factor-select"
            value={selectedFactorId || ''}
            onChange={(e) => setSelectedFactorId(e.target.value)}
            className="block w-full p-2 mt-1 border rounded-md"
          >
            <option value="">Select a method</option>
            {availableFactors.map(factor => (
              <option key={factor.id} value={factor.id}>
                {factor.factor_type === 'totp' ? 'Authenticator App (TOTP)' : `SMS (${factor.phone_number})`}
              </option>
            ))}
          </select>
        </div>
      )}
      <Label htmlFor="mfa-code">Verification Code</Label>
      <Input
        id="mfa-code"
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter 6-digit code"
        disabled={submitting || loading}
        inputMode="numeric"
        autoComplete="one-time-code"
      />
      {availableFactors.length === 0 && !loading ? (
        <p className="text-sm text-muted-foreground">
          No registered MFA factors were found for this account. Refresh or contact an administrator if this persists.
        </p>
      ) : null}
      {errorMessage ? (
        <p className="text-sm text-red-400">{errorMessage}</p>
      ) : null}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={loading || submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleVerify}
          disabled={availableFactors.length === 0 || code.trim().length < 6 || submitting || loading}
        >
          {submitting ? 'Verifying…' : 'Verify'}
        </Button>
      </div>
    </div>
  );
};
