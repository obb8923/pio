import { useOnboardingStore } from "../../store/onboardingStore";
export const useOnboarding = () => {
 const {isOnboardingCompleted,isLoading,checkOnboardingStatus,completeOnboarding} = useOnboardingStore();
  return {
    isOnboardingCompleted,
    isLoading,
    checkOnboardingStatus,
    completeOnboarding,
  };
};
