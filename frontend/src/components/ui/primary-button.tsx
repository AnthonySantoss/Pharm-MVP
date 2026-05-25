import * as React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "./button";
import { cn } from "@/lib/utils";
import type { ButtonProps } from "./button";

// Componentes pequenos que servem como atalhos reutilizáveis para botões primários/outline
// Usados principalmente em landing pages ou CTAs para manter consistência de estilo

type PrimaryButtonProps = ButtonProps & {
  asLink?: boolean;
  href?: string;
};

export function PrimaryButton({ asLink, href, children, className, variant, size, ...props }: PrimaryButtonProps) {
  const classes = cn(buttonVariants({ variant, size, className }));

  if (asLink && href) {
    // Render Link as an anchor with the same styling as Button
    // Cast props to anchor attributes when rendering as link
    const anchorProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return (
    <Button variant={variant} size={size} className={className} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </Button>
  );
}

export function OutlineButton(props: PrimaryButtonProps) {
  const { asLink, href, size, className, children, ...rest } = props;
  if (asLink && href) {
    const classes = cn(buttonVariants({ variant: "outline", size, className }));
    const anchorProps = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return <Button variant="outline" size={size} className={className} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</Button>;
}

export default PrimaryButton;
