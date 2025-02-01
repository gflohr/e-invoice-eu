---
title: Deployment
name: deployment
section: service
description: You can deploy the service either as a container, as a web application, or run it locally.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Highlight(config.private.copyCode) %]
[% USE CodeGroup %]
<!--/qgoda-no-xgettext-->

The E-Invoice-EU service can be used in one of several ways:

* Run as a (docker) container.
* Build and run as a web application.
* Run it locally.

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
cloning the repository, change to the root directory and execute these
commands:

<!--qgoda-no-xgettext-->
[% FILTER $CodeGroup %]
[npm]
[% FILTER $Highlight "language-sh" %]
cd apps/server
npm install
npm run build
[% END %]

[yarn]
[% FILTER $Highlight "language-sh" %]
cd apps/server
yarn install
yarn run build
[% END %]

[pnpm]
[% FILTER $Highlight "language-sh" %]
cd apps/server
pnpm install
pnpm run build
[% END %] 

[bun]
[% FILTER $Highlight "language-sh" %]
cd apps/server
bun install
bun run build
[% END %] 

[% END %]
<!--/qgoda-no-xgettext-->

You can then run the application with your favourite JavaScript runtime
environment.

<!--qgoda-no-xgettext-->
[% FILTER $CodeGroup %]
[node]
[% FILTER $Highlight "language-sh" %]
cd apps/server
NODE_ENV=production node dist/main.js
[% END %]

[bun]
[% FILTER $Highlight "language-sh" %]
cd apps/server
NODE_ENV=production bun dist/main.js
[% END %]

[deno]
[% FILTER $Highlight "language-sh" %]
cd apps/server
NODE_ENV=production deno --allow-env --allow-read --allow-net dist/main.js
[% END %]

[% END %]
<!--/qgoda-no-xgettext-->

See the [NestJS documentation for deployment](https://docs.nestjs.com/deployment)
for more information.

## Deploy in Development Mode

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

The following environment variables are supported:

### `NODE_ENV`

To quote the NestJS documentation:

> While there's technically no difference between development and production in Node.js and NestJS, it's a good practice to set the NODE_ENV environment variable to production when running your application in a production environment, as some libraries in the ecosystem may behave differently based on this variable (e.g., enabling or disabling debugging output, etc.).

In brief: Set the environment variable to "production", when running the
service in production mode.

### `PORT`

Set this to a valid port number if you are not happy with the default port of
3000.

Note: This has currently no effect, when running the service in a container,
see https://github.com/gflohr/e-invoice-eu/issues/76.
