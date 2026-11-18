# Constructoralp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Contact form email backend

The contact form submits to `POST /api/contacto`. Local SSR runs the Express API, while the Cloudflare Worker entry point in `src/worker.ts` handles the same route in production and serves the Angular build assets.

1. Copy `.env.example` to `.env` and set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `CONTACT_EMAIL` for your mail provider. For Gmail, use an App Password; do not use your regular account password.
2. Keep the real `.env` file private. It is ignored by Git. In Cloudflare Workers settings, add the same names under **Settings → Variables and Secrets**; save `SMTP_PASS` as a secret. The deploy command must be `npx wrangler deploy` and the build command `npm run build`.
3. Run the local Node SSR server with `npm run build` followed by `npm run serve:ssr:constructoralp`.

The API validates submitted data, limits request sizes, and throttles repeated requests per IP. SMTP credentials stay on the server and are never sent to the browser. Cloudflare Workers' in-memory throttle is per isolate and is best-effort; use a Cloudflare rate limiting binding if a shared production limit is needed.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
