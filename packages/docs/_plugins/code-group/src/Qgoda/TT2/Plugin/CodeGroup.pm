#! /bin/false

package Qgoda::TT2::Plugin::CodeGroup;

use strict;

use Qgoda;
use Qgoda::Util qw(html_escape);

use Digest::SHA qw(hmac_sha1_hex);

use base qw(Template::Plugin::Filter);

sub init {
	my ($self) = @_;

	$self->{_DYNAMIC} = 1;

	return $self;
}

sub filter {
	my ($self, $src, $args, $conf) = @_;

	my @lines = split /\n/, $src;
	my @groups;
	my $group;
	foreach my $line (@lines) {
		if ($line =~ /^\[(.+)\][ \t\r\n]*$/) {
			my $raw = $1;
			my $label = html_escape $raw;
			my $title = $raw;
			$title =~ s/'/&apos;/g;
			$group = {
				title => $title,
				label => $label,
				content => '',
			};
			push @groups, $group;
		} elsif ($group) {
			# This must not be html-escaped!
			$group->{content} .= "$line\n";
		} elsif (length $line) {
			warn "garbage before first group ($line)";
		}
	}

	my $group_seed = '';
	foreach my $group (@groups) {
		$group->{id} = hmac_sha1_hex $group->{content};
		$group_seed .= $group->{id};
	}

	my $group_name = 'group-' . hmac_sha1_hex $group_seed;

	my $html = <<"EOF";
<div class="code-group"><code-group>
	<code-tabs>
EOF

	my $idx = 0;
	foreach my $group (@groups) {
		my $checked = $idx++ ? '' : ' checked';
		$html .= "\t\t<input type='radio' name='$group_name' id='code-tab-$group->{id}'$checked>\n";
		$html .= "\t\t<label data-title='$group->{title}' for='code-tab-$group->{id}'>$group->{label}</label>\n"
	}

	$html .= <<"EOF";
	</code-tabs>
	<code-blocks>
EOF

	$idx = 0;
	foreach my $group (@groups) {
		if ($idx++) {
			$html .= "\t\t\t<code-block id='code-block-$group->{id}'>";
		} else {
			$html .= "\t\t\t<code-block id='code-block-$group->{id}' class='active'>";
		}
		$html .= $group->{content} . "</code-block>\n";
	}

	$html .= <<"EOF";
	</code-blocks>
</code-group></div>
EOF

	return $html;
}

1;
