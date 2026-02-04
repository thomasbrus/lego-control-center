import { useShallow } from "zustand/react/shallow";
import { hubStore } from "./store";

export const useHubIds = () => {
  return hubStore(useShallow((state) => Array.from(state.getHubIds())));
};
