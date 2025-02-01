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

## Docker Container

By far, the easiest way to run the E-Invoice-EU service is to run the
containerized version.

<!--qgoda-no-xgettext-->
docker pull gflohr/e-invoice-eu:latest
docker run --rm -d -p 3000:3000 --name e-invoice-eu gflohr/e-invoice-eu:latest
<!--/qgoda-no-xgettext-->

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
