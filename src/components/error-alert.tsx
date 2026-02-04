import { Alert } from "@/components";

export interface ErrorAlertProps extends Alert.RootProps {
  title?: string;
  description: string;
}

export function ErrorAlert({ title, description, ...props }: ErrorAlertProps) {
  return (
    <Alert.Root status="error" {...props}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title ?? "Something went wrong"}</Alert.Title>
        <Alert.Description>{description}</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
