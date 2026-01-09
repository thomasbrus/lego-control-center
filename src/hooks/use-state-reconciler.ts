import { useCallback, useRef, useState } from "react";

export function useStateReconciler<State>(commitCallback: (state: State) => Promise<void>) {
  const [isReconciling, setIsConverging] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [committedAt, setCommittedAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const latestStateRef = useRef<State | null>(null);
  const isRunningRef = useRef(false);

  const reconcileState = useCallback(
    async (state: State) => {
      latestStateRef.current = state;

      if (isRunningRef.current) {
        setIsStale(true);
        return;
      }

      isRunningRef.current = true;
      setIsConverging(true);
      setError(null);

      try {
        while (latestStateRef.current !== null) {
          const stateToSync = latestStateRef.current;
          latestStateRef.current = null;

          setIsStale(false);

          await commitCallback(stateToSync);

          if (latestStateRef.current === null) {
            setCommittedAt(new Date());
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        isRunningRef.current = false;
        setIsConverging(false);
        setIsStale(false);
      }
    },
    [commitCallback]
  );

  return { reconcileState, isReconciling, isStale, committedAt, error };
}
