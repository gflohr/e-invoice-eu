---
title: Client-Side Syntax Highlighting
name: client side syntax-highlighting
view: docs.html
date: 2018-11-05
category: Tutorial
tags:
  - Syntax Highlighting
  - JavaScript
  - Tutorial
  - Howto
---

<!--qgoda-no-xgettext-->

[%- USE q = Qgoda -%]
[%- USE Highlight -%]

<!--/qgoda-no-xgettext-->

A very common requirement is to have syntax-highlighting applied to code blocks. Best
practice with Qgoda is to just mark code blocks semantically correct and let the client
do the highlighting when rendering the generated pages.

<!--qgoda-no-xgettext-->

[% TAGS [@ @] %]
<qgoda-toc />

<!--/qgoda-no-xgettext-->

## How Should Code Blocks Be Marked?

Code blocks should be wrapped into a `<code>` element that is in turn wrapped into a
`<pre>` element. The programming language of the code block should be added as a
CSS class in the format `language-PROGRAMMING-LANGUAGE`:

<!--qgoda-no-xgettext-->

[@ FILTER $Highlight "language-html" "line-numbers" css.prism.line_numbers @]
&lt;pre&gt;&lt;code class=&quot;language-javascript&quot;&gt;if (options.debug) {
console.log("Options: ", options);
}&lt;/code&gt;&lt;/pre&gt;
[@ END @]

<!--/qgoda-no-xgettext-->

It is advisable to put the enclosing `<pre>` and `<code>` tags on the same line as
the enclosed code. Otherwise ugly line feeds are added to the beginning and the end
of the block.

## Creating Semantically Correct Code Blocks

### Manually Creating Semantically Correct Code Blocks

Remember that (almost) all markup goes through unchanged in Markdown. Nobody stops
you from entering your code blocks manually with HTML, as we have just seen:

<!--qgoda-no-xgettext-->

[@ FILTER $Highlight "language-html" "line-numbers" css.prism.line_numbers @]
&lt;pre&gt;&lt;code class=&quot;language-javascript&quot;&gt;if (options.debug) {
console.log("Options: ", options);
}&lt;/code&gt;&lt;/pre&gt;
[@ END @]

<!--/qgoda-no-xgettext-->

### Using Fenced Code Blocks

So-called _fenced_ code blocks are supported by many markdown processors.
Fenced code blocks are surrounded by triple backticks ```:

<!--qgoda-no-xgettext-->

[@ FILTER $Highlight "language-markdown" "line-numbers" css.prism.line_numbers @]
&#x60;&#x60;&#x60;
if (options.debug) {
console.log(&quot;Options: &quot;, options);
}
&#x60;&#x60;&#x60;
[@ END @]

<!--/qgoda-no-xgettext-->

This creates exactly the construct we want, the code inside of a `<code>` element
inside of a `<pre>` element. But none of the tags has any attributes, more
specifically the `class="language-javascript"` is not present. But you can
specify the language immediately following the opening "fence":

<!--qgoda-no-xgettext-->

[@ FILTER $Highlight "language-markdown" "line-numbers" css.prism.line_numbers @]
&#x60;&#x60;&#x60;javascript
if (options.debug) {
console.log(&quot;Options: &quot;, options);
}
&#x60;&#x60;&#x60;
[@ END @]

<!--/qgoda-no-xgettext-->

There is a caveat, though. Qgoda's default Markdown processor
[Text::Markdown](https://metacpan.org/release/Text-Markdown) does not support fenced code blocks with a language specifier.
It erroneously interprets it as part of the code. You can therefore only
use the language specifier, when you use `Text::Markdown::Hoedown` as your
markdown processor.

[@ WRAPPER components/infobox.html
type='info' title='Compatibility Note!' @]

<p>There are plans to replace <a href="https://metacpan.org/release/Text-Markdown">
<code>Text::Markdown</code><a> with
<a href="https://metacpan.org/release/Text-MultiMarkdown">
<code>Text::MultiMarkdown</code><a> as Qgoda's default markdown processor,
see
<a href="https://github.com/gflohr/qgoda/issues/55">https://github.com/gflohr/qgoda/issues/55</a>.
<code>Text::MultiMarkdown</code> supports fenced code blocks with a language specifier.
[@ END @]

## Syntax-Highlighting With PrismJS

[PrismJS](https://prismjs.com/) is a very popular syntax highlighter written in
Javascript that supports an impressive [list of
languages](https://prismjs.com/#languages-list).

[@ WRAPPER components/infobox.html
type='info' title='Did you know ...' @]

<p>... that PrismJS can also highlight Template Toolkit source code? Use
<code>tt2</code> as the language name and you're all done.
</p>
[@ END @]

### Basic Usage

You can see the minimum required JavaScript and css files in the following code
snippet:

<!--qgoda-no-xgettext-->

[@ FILTER $Highlight "language-html" "line-numbers" css.prism.line_numbers @]
&lt;!doctype html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;link href=&quot;/assets/css/prismjs/themes/prism.css&quot; rel=&quot;stylesheet&quot; /&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;script href=&quot;/assets/js/prismjs/prism.js&quot;&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;
[@ END @]

<!--/qgoda-no-xgettext-->

The default stylesheet gets included in line 4 and the core library in line 7.
Make sure that they are found at the locations specified.

### Using a PrismJS Theme

PrismJS ships with a number of themes. You can override the default theme by
loading an _additional_ stylesheet:

<!--qgoda-no-xgettext-->

[@ FILTER $Highlight "language-html" "line-numbers" css.prism.line_numbers "data-start"=4 @]
&lt;link href=&quot;/assets/css/prismjs/themes/prism.css&quot; rel=&quot;stylesheet&quot; /&gt;
&lt;link href=&quot;/assets/css/prismjs/themes/prism-coy.css&quot; rel=&quot;stylesheet&quot; /&gt;
[@ END @]

<!--/qgoda-no-xgettext-->

That will change the style to the "coy" theme.

### Loading Highlighters and PrismJS Plug-Ins

In order to save memory and band-width, PrismJS does not load all of its highlighters
and plug-ins automatically but you have to explicitely specify them.

The complete example below would load support for highlighting JavaScript and also
load the `line-numbers` plug-in that uses CSS to prepend every line with a line
number:

<!--qgoda-no-xgettext-->

[@ FILTER $Highlight "language-html" "line-numbers" css.prism.line_numbers @]
&lt;!doctype html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;link href=&quot;/assets/css/prismjs/themes/prism.css&quot; rel=&quot;stylesheet&quot; /&gt;
&lt;link href=&quot;/assets/css/prismjs/themes/prism-coy.css&quot; rel=&quot;stylesheet&quot; /&gt;
&lt;link href=&quot;/assets/css/prismjs/plugins/line-numbers/prism-line-numbers.css&quot; rel=&quot;stylesheet&quot; /&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;script href=&quot;/assets/js/prismjs/prism.js&quot;&gt;&lt;/script&gt;
&lt;script href=&quot;/assets/js/prismjs/plugins/line-numbers/prism-line-numbers&quot;&gt;&lt;/script&gt;
&lt;script href=&quot;/assets/js/prismjs/components/prism-javascript.js&quot;&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;
[@ END @]

<!--/qgoda-no-xgettext-->

If you want to have syntax highlighting for more
languages, just add the corresponding PrismJS
_component_ after line 11.

## Using the Qgoda Syntax Highlighter Plug-In

Fenced code-blocks are not always enough:

1. The markdown processor may not support them, or not support a language specification.
2. You want to set additional attributes on the html elements, especially classes.

### Installation

You can install the
[Qgoda highlighter plug-in](https://github.com/gflohr/qgoda-plugin-tt2-highlight)
like any other Qgoda plug-in. Normally:

<!--qgoda-no-xgettext-->

```bash
$ cd /path/to/your/project
$ npm install gflohr/qgoda-plugin-tt2-highlight
```

<!--/qgoda-no-xgettext-->

You can use `yarn add gflohr/qgoda-plugin-tt2-highlight` if you prefer `yarn` over
`npm`.

### Usage

Now you have to use
[Template Toolkit](http://www.template-toolkit.org/)
directives in order to activate the highlighting:

<!--qgoda-no-xgettext-->

[@ FILTER $Highlight "language-tt2" "line-numbers" css.prism.line_numbers @]
[% USE Highlight %]
[% FILTER $Highlight &quot;language-javascript&quot; &quot;line-numbers&quot;
&quot;data-start&quot;=42 %]
if (options.debug) {
console.log(&quot;Options: &quot;, options);
}
[% END %]
[@ END @]

<!--/qgoda-no-xgettext-->

All positional arguments to the filter plug-in (line 2) are added to the CSS
class of the surrounding `<pre>` element. The named arguments are converted
to HTML attributes and their corresponding values.

[@ WRAPPER components/infobox.html
type='info' title='Positional and Named Arguments' @]

<p>Positional arguments in Template Toolkit are standalone arguments, as opposed
to named arguments which have the form <code>key=value</code>.
</p>
<p>
Note that you have to quote all keys that contain non-alphanumeric characters!
Values always have to be quoted (unless they refer to a variable).
</p>
[@ END @]

The above example will result in the following HTML code:

<!--qgoda-no-xgettext-->

[@ FILTER $Highlight "language-html" "line-numbers" css.prism.line_numbers @]
&lt;pre class=&quot;language-html line-numbers&quot; data-start=&quot;5&quot;&gt;if (options.debug) {
console.log(&quot;Options: &quot;, options);
}&lt;/code&gt;&lt;/pre&gt;
[@ END @]

<!--/qgoda-no-xgettext-->

Provided that you have correctly loaded the PrismJS `line-numbers` plug-in, this
will highlight the code as JavaScript in the browser, add line numbers in front of every
line and start the line numbering with line 5. For
instance, the code examples on this very page are
produced with directives like this:

### Page-wide Defaullts

It is quite likely that all code blocks on a page are in
the same programming language and should share their
settings. You can therefore pass global arguments in
the `USE` directive, when you load the filter.

<!--qgoda-no-xgettext-->

[@ FILTER $Highlight "language-tt2" "line-numbers" css.prism.line_numbers @]
[% USE Highlight &quot;language-javascript&quot; &quot;line-numbers&quot; %]
...
[% FILTER $Highlight %]
if (options.debug) {
console.log(&quot;Options: &quot;, options);
}
...
[% END %]
[@ END @]

<!--/qgoda-no-xgettext-->

All `FILTER` invocations will now share the same settings,
respectively, they will receive the sum of the arguments
that you specified for `USE` and those for `FILTER`.

If you want to disable a certain CSS class for an
individual `FILTER`, just pass the class name with a
minus sign (-) prepended:

<!--qgoda-no-xgettext-->

[@ FILTER $Highlight "language-tt2" "line-numbers" css.prism.line_numbers @]
...
[% FILTER $Highlight &quot;-language-javascript&quot; &quot;language-html&quot; %]
&lt;link href=&quot;styles.css&quot; rel=&quot;stylesheet&quot;>
...
[% END %]
[@ END @]

<!--/qgoda-no-xgettext-->

This code block will now as an exception not be
highlighted as JavaScript but as HTML.

## Alternative: Use a JavaScript Hack

[Using the Qgoda syntax highlighter plug-in](#using-the-qgoda-syntax-highlighter-plug-in)
is very flexible but involves a lot of typing compared to [fenced code
blocks](#using-fenced-code-blocks). On this side we use a little JavaScript
hack that allows us to enable the `line-numbers` plug-in with fenced
code blocks like this:

<!--qgoda-no-xgettext-->

[@ FILTER $Highlight "language-markdown" "line-numbers" css.prism.line_numbers @]
&#x60;&#x60;&#x60;javascript;line-numbers
if (options.debug) {
console.log(&quot;Options: &quot;, options);
}
&#x60;&#x60;&#x60;
[@ END @]

<!--/qgoda-no-xgettext-->

See the [JavaScript source code](https://github.com/gflohr/qgoda-c/blob/master/_assets/js/line-numbers.js)
for details!

## Caveats

There are two little gotchas that you have to keep in mind.

### Code Blocks Without Language Specification

If you use a fenced
code block or the qgoda highlighter plug-in without a language specification,
PrismJS will not highlight the code block. This will be fixed in a later
version of the highlighter plug-in (see
https://github.com/gflohr/qgoda-plugin-tt2-highlight/issues/1
and https://github.com/gflohr/qgoda/issues/51). Until then, you either have to
mark every affected code block as language "none" (or with the class "language-none") or
you have to resort to a little bit of JavaScript:

<!--qgoda-no-xgettext-->

[@ FILTER $Highlight "language-javascript" "line-numbers" css.prism.line_numbers @]
var codes = document.querySelectorAll('pre>code');
for (var i = 0; i < codes.length; ++i) {
var parent = codes[i].parentElement;
if (!parent.hasAttribute('class'))
parent.setAttribute('class', 'language-none');
}
[@ END @]

<!--/qgoda-no-xgettext-->

You may argue that the check in line 4 will miss `pre` elements that have a class attribute
but miss a `language-*` specification. This cannot happen because all of the blocks
are generated, and they will _not_ have any class attribute set.

Well, not 100 % true. If you created such a block with the highlighter plug-in,
it could have a class attribute but no language specification. But that's your own
fault then, and you know how to fix it.

### Using the CSS-Modules And Line-Numbers Plug-In Simultaneously

The other glitch is rather esoteric and caused by a little flaw in the plug-in system
of PrismJS. Its `css-modules` plug-in can be used to automatically use the
[BEM methodology](https://en.bem.info/) for automatically namespacing all CSS
class names and id attributes.

The `line-numbers` plug-in on the other hand ignores BEM. It searches for code blocks
that have the exact class `line-numbers`. The workaround is to use both classes,
the BEM-style class for styling and the literal one for the JavaScript code.

You can see how this is done in the
[source code of this page](https://github.com/gflohr/qgoda-site/blame/master/[@ asset.relpath @]).

The BEM-style class name is stored in the variable `css.prism.line_numbers`. The hash
containing that variable is read in
https://github.com/gflohr/qgoda-site/blob/master/_views/functions/css-modules.tt
and that function is included at the top of
[source code of this page](https://github.com/gflohr/qgoda-site/blame/master/[@ asset.relpath @]).
