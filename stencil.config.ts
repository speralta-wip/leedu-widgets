import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'leedu-widgets',
  plugins: [
    sass(),
  ],
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  testing: {
    browserHeadless: "shell",
  },
  devServer: {
    // Aprire il dev server da http://widgets.leedu.local.gd:8080 (host in whitelist TenantCors: *.leedu.local.gd).
    // Bind di default (0.0.0.0): raggiungibile via il sottodominio, che risolve a 127.0.0.1.
    port: 8080,
    openBrowser: false,            // aprire a mano il sottodominio sopra, non localhost
    reloadStrategy: 'pageReload',  // Strategia di reload
  }
};
