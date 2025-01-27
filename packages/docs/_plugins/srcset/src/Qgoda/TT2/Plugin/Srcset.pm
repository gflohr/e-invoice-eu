#! /bin/false

package Qgoda::TT2::Plugin::Srcset;

use strict;

use File::Spec;

use Qgoda;
use Qgoda::Util qw(trim html_escape);

use base qw(Template::Plugin::Filter);

use constant DEFAULT_SIZES => '(max-width: 575px) calc(100vw - 30px),'
	. ' (max-width: 767px) 510px'
	. ' (max-width: 991px) 396px'
	. ' (max-width: 1199px) 528px'
	. ' (max-width: 1399px) 627px'
	. ' 726px';

sub init {
	my ($self) = @_;

	$self->{_DYNAMIC} = 1;

	return $self;
}

sub filter {
	my ($self, $src, $args, $conf) = @_;

	$src = trim $src;
	next if !length $src;

	my $html = qq{<div class="img"><img src="/e-invoice-eu$src"};
	if ($args && @$args) {
		warn "positional arguments are not supported.\n";
	}

	$conf->{sizes} //= DEFAULT_SIZES;

	foreach my $attr (sort keys %{$conf || {}}) {
		my $value = html_escape $conf->{$attr};
		$html .= qq{ $attr="$value"};
	}

	my $q = Qgoda->new;
	my $srcdir = $q->config->{srcdir};
	my $path = File::Spec->catfile($srcdir, $src);
	if (-e $path) {
		$html .= eval { $self->__addSrcset($srcdir, $src) };
		warn $@ if $@;
	} else {
		warn "invalid path '$path': $!\n";
	}

	$html .= '></img></div>';

	return $html;
}

sub __addSrcset {
	my ($self, $srcdir, $uri) = @_;

	$uri =~ s{^/}{};
	my $path = File::Spec->catfile($srcdir, $uri);

	my (undef, $directory, $filename) = File::Spec->splitpath($path);
	my $stem = $filename;
	my $ext = '';
	$ext = $1 if $stem =~ s/(\.[^.]+)$//;

	my $qstem = quotemeta $stem;
	my $qext = quotemeta $ext;

	my %widths;
	my $config = Qgoda->new->config;
	my $uridir = $uri;
	$uridir =~ s{/[^/]+$}{};
	if (opendir my $dh, $directory) {
		my @files;
		if ($config->{'case-sensitive'}) {
			@files = grep { /^$qstem-([1-9][0-9]*)w$qext$/ } readdir $dh;
		} else {
			@files = grep { /^$qstem-([1-9][0-9]*)w$qext$/i } readdir $dh;
		}
		foreach my $file (@files) {
			if ($config->{'case-sensitive'}
				&& $file =~ /^$qstem-([1-9][0-9]*)w$qext$/) {
				$widths{$1} = html_escape "/$uridir/$file";
			} elsif ($file =~ /^$qstem-([1-9][0-9]*)w$qext$/i) {
				$widths{$1} = html_escape "/$uridir/$file";;
			}
		}
	}

	my @versions;
	foreach my $w (sort { $a <=> $b } keys %widths) {
		push @versions, "/e-invoice-eu/$widths{$w} ${w}w";
	}
	my $versions = join ', ', @versions;

	return qq{ srcset="$versions"};
}

1;
