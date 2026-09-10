/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'react-icons' {
  export interface IconBaseProps {
    className?: string;
  }
}

declare module 'react-icons/lib' {
  export interface IconBaseProps {
    className?: string;
  }
}
