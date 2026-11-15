import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-dvh flex-col items-start justify-center gap-4" id="main">
      <h1 className="font-display text-headline">That page doesn’t exist.</h1>
      <p className="text-lead text-muted">Check the address, or head back to the start.</p>
      <ButtonLink href="/">Go to home</ButtonLink>
    </Container>
  );
}
