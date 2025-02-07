---
title: API Documentation
name: api-documentation
section: service
description: The OpenAPI (Swagger) documentation is built into the server.
styles:
- /site/css/modal-image-popup.css
scripts:
- /site/js/modal-image-popup.js
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Srcset %]
<!--/qgoda-no-xgettext-->

The service uses the [OpenAPI](https://www.openapis.org/) specification to
document its API.

After [starting the service]([% q.llink(name='deployment') %]), the API
documentation is available at http://localhost:8080/api. Hostname, scheme,
and port have to be changed accordingly, depending where you have deployed
the service.

It is also possible to try out the individual endpoints in the browser.

[% FILTER $Srcset alt="API documentation for /api/format/list" %]/images/service/api-documentation/openapi-format-docs.webp[% END %] 
