import type { SVGProps } from "react";

// Ícones de interface (traço 1.75). Ícones de navegação ficam em public/icons.
type IconeProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconeProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="1em"
      height="1em"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconeLupa(props: IconeProps) {
  return (
    <Base {...props}>
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13 13 3.5 3.5" />
    </Base>
  );
}

export function IconeFechar(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="m5 5 10 10M15 5 5 15" />
    </Base>
  );
}

export function IconeSucesso(props: IconeProps) {
  return (
    <Base {...props}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="m6.75 10.25 2.25 2.25 4.25-4.5" />
    </Base>
  );
}

export function IconeErro(props: IconeProps) {
  return (
    <Base {...props}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 6.5v4M10 13.5h.01" />
    </Base>
  );
}

export function IconeAlerta(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M8.6 3.6 2.4 14.4A1.6 1.6 0 0 0 3.8 16.8h12.4a1.6 1.6 0 0 0 1.4-2.4L11.4 3.6a1.6 1.6 0 0 0-2.8 0Z" />
      <path d="M10 8v3M10 14h.01" />
    </Base>
  );
}

export function IconeInfo(props: IconeProps) {
  return (
    <Base {...props}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 9v4.5M10 6.5h.01" />
    </Base>
  );
}

export function IconeCadeado(props: IconeProps) {
  return (
    <Base {...props}>
      <rect x="4.5" y="9" width="11" height="8" rx="1.75" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
    </Base>
  );
}

export function IconeCadeadoAberto(props: IconeProps) {
  return (
    <Base {...props}>
      <rect x="4.5" y="9" width="11" height="8" rx="1.75" />
      <path d="M7 9V6.5a3 3 0 0 1 5.8-1.1" />
    </Base>
  );
}

export function IconeCheck(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </Base>
  );
}

export function IconeOlho(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M1.75 10S4.75 4.25 10 4.25 18.25 10 18.25 10 15.25 15.75 10 15.75 1.75 10 1.75 10Z" />
      <circle cx="10" cy="10" r="2.5" />
    </Base>
  );
}

export function IconeOlhoFechado(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M8.2 4.45A8.6 8.6 0 0 1 10 4.25C15.25 4.25 18.25 10 18.25 10a14.6 14.6 0 0 1-2.1 2.85M5.4 5.95C3.03 7.5 1.75 10 1.75 10S4.75 15.75 10 15.75a8 8 0 0 0 4.1-1.15" />
      <path d="M8.25 8.25a2.5 2.5 0 0 0 3.5 3.5M2.5 2.5l15 15" />
    </Base>
  );
}

export function IconeEmail(props: IconeProps) {
  return (
    <Base {...props}>
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.75" />
      <path d="m3 5.5 7 5.25 7-5.25" />
    </Base>
  );
}

export function IconeSetaEsquerda(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M15.5 10h-11M9 5.5 4.5 10 9 14.5" />
    </Base>
  );
}

export function IconeMais(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M10 4.5v11M4.5 10h11" />
    </Base>
  );
}

export function IconeLixeira(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5 5.5l.75 10.6a1.5 1.5 0 0 0 1.5 1.4h5.5a1.5 1.5 0 0 0 1.5-1.4L15 5.5" />
      <path d="M8.5 9v5M11.5 9v5" />
    </Base>
  );
}

export function IconeChevronDireita(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="m8 5 5 5-5 5" />
    </Base>
  );
}

export function IconeCamera(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M2.75 7.25a1.5 1.5 0 0 1 1.5-1.5h1.9l1.35-2h4.99l1.35 2h1.91a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H4.25a1.5 1.5 0 0 1-1.5-1.5Z" />
      <circle cx="10" cy="10.75" r="2.75" />
    </Base>
  );
}
