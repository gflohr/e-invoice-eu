use strict;

my $dir = __FILE__;
$dir =~ s/\index.pl$/src/;
unshift @INC, $dir;
