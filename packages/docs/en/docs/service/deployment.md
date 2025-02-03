---
title: Deployment
name: deployment
section: service
description: You can deploy the service either as a container or run it locally in production or development mode.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Highlight(config.private.copyCode) %]
[% USE CodeGroup %]
<!--/qgoda-no-xgettext-->

The E-Invoice-EU service can be used in one of several ways:

* Run as a (docker) container.
* Build and run it in production mode.
* Run it locally in development mode.

<qgoda-toc/>

## Docker Container

By far, the easiest way to run the E-Invoice-EU service is to run the
containerized version.

<!--qgoda-no-xgettext-->
[% FILTER $CodeGroup %]
[docker]
[% FILTER $Highlight "language-sh" %]docker pull gflohr/e-invoice-eu:latest
docker run --rm -d -p 3000:3000 --name e-invoice-eu gflohr/e-invoice-eu:latest
[% END %] 
[nerdctl]
[% FILTER $Highlight "language-sh" %]nerdctl pull gflohr/e-invoice-eu:latest
nerdctl run --rm -d -p 3000:3000 --name e-invoice-eu gflohr/e-invoice-eu:latest
[% END %] 
[% END %]
<!--/qgoda-no-xgettext-->

## Deploy in Production Mode

You can also build the server and then run it anywhere you like. After
cloning the repository and changing into its root directory, execute the
following commands:

<!--qgoda-no-xgettext-->
[% FILTER $CodeGroup %]
[npm]
[% FILTER $Highlight "language-sh" %]
npm install
npm run build
[% END %]

[yarn]
[% FILTER $Highlight "language-sh" %]
yarn install
yarn run build
[% END %]

[pnpm]
[% FILTER $Highlight "language-sh" %]
pnpm install
pnpm run build
[% END %] 

[bun]
[% FILTER $Highlight "language-sh" %]
bun install
bun run build
[% END %] 

[% END %]
<!--/qgoda-no-xgettext-->

### Run with Node.js

You can then run the application with Node.js like this:

<!--qgoda-no-xgettext-->
[% FILTER $CodeGroup %]
[npm]
[% FILTER $Highlight "language-sh" %]
NODE_ENV=production npm run start:prod
[% END %]

[yarn]
[% FILTER $Highlight "language-sh" %]
NODE_ENV=production yarn run start:prod
[% END %]

[pnpm]
[% FILTER $Highlight "language-sh" %]
NODE_ENV=production pnpm run start:prod
[% END %]

[bun]
[% FILTER $Highlight "language-sh" %]
NODE_ENV=production pnpm run start:prod
[% END %]

[% END %]
<!--/qgoda-no-xgettext-->

See the [NestJS documentation for deployment](https://docs.nestjs.com/deployment)
for more information.

### Run with Bun or Deno

You can also run the application with [`bun`](https://bun.sh/) or
[`deno`](https://deno.com/). But you then have to specify the
complete path to the main JavaScript file:

<!--qgoda-no-xgettext-->
[% FILTER $CodeGroup %]
[bun]
[% FILTER $Highlight "language-sh" %]
NODE_ENV=production bun apps/server/dist/main.js
[% END %]

[deno]
[% FILTER $Highlight "language-sh" %]
NODE_ENV=production deno --allow-env --allow-read --allow-net apps/server/dist/main.js
[% END %]

[node]
[% FILTER $Highlight "language-sh" %]
NODE_ENV=production node apps/server/dist/main.js
[% END %]

[% END %]
<!--/qgoda-no-xgettext-->

## Run in Development Mode

You can also run the application without building it first.

<!--qgoda-no-xgettext-->
[% FILTER $CodeGroup %]
[npm]
[% FILTER $Highlight "language-sh" %]
cd apps/server
npm install
npm run start:dev
[% END %]

[yarn]
[% FILTER $Highlight "language-sh" %]
cd apps/server
yarn install
yarn run start:dev
[% END %]

[pnpm]
[% FILTER $Highlight "language-sh" %]
cd apps/server
pnpm install
pnpm run start:dev
[% END %] 

[bun]
[% FILTER $Highlight "language-sh" %]
cd apps/server
bun install
bun run start:dev
[% END %] 

[% END %]
<!--/qgoda-no-xgettext-->

This will automatically re-compile the source code and re-start the server,
whenever you make changes to the code.

## Environment Variables

The service is configured with environment variables.

You can either pass these environment variables on the commandline or place
a file called `.env` in the directory, where you start the service.  This
file has lines of the form `VARIABLE=VALUE`, see the [dotenv
docs](https://www.npmjs.com/package/dotenv#%EF%B8%8F-usage) for more
information.

The following environment variables are supported:

<!--qgoda-no-xgettext-->
### `NODE_ENV`
<!--/qgoda-no-xgettext-->

To quote the NestJS documentation:

> While there's technically no difference between development and production in Node.js and NestJS, it's a good practice to set the NODE_ENV environment variable to production when running your application in a production environment, as some libraries in the ecosystem may behave differently based on this variable (e.g., enabling or disabling debugging output, etc.).

In brief: Set the environment variable to "production", when running the
service in production mode.

<!--qgoda-no-xgettext-->
### `PORT`
<!--/qgoda-no-xgettext-->

Set this to a valid port number if you are not happy with the default port of
3000.

Note: This has currently no effect, when running the service in a container,
see https://github.com/gflohr/e-invoice-eu/issues/76.

<!--qgoda-no-xgettext-->
### `LIBRE_OFFICE`
<!--/qgoda-no-xgettext-->

Path to [LibreOffice](https://www.libreoffice.org/). E-Invoice-EU uses
LibreOffice in headless mode to generate PDFs from spreadsheet files. It
depends on your usage whether you need that or not.

On macOS, LibreOffice is usually installed as:

<!--qgoda-no-xgettext-->
```
/Applications/LibreOffice.app/Contents/MacOS/soffice
```
<!--/qgoda-no-xgettext-->

On Windows, the path is:

<!--qgoda-no-xgettext-->
```
C:\Program Files\LibreOffice\program\soffice.exe
```
<!--/qgoda-no-xgettext-->

If the location of the LibreOffice executable is not configured, it is searched
in `$PATH`.

<!--qgoda-no-xgettext-->
### `LIBREOFFICE`
<!--/qgoda-no-xgettext-->

An alias for the environment variable [`LIBRE_OFFICE`](#libre_office-code).
