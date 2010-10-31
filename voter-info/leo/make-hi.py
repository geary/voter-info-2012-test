#!/usr/bin/env python
# coding: utf-8

# make-hi.py - special HI processing for 2010
# Copyright (c) 2010 Michael Geary - http://mg.to/
# Use under either the MIT or GPL license
# http://www.opensource.org/licenses/mit-license.php
# http://www.opensource.org/licenses/gpl-2.0.php

import re

def convert( input, output ):
	print 'Converting %s to %s' %( input, output )
	input = open( input, 'r' )
	output = open( output, 'wb' )
	output.write( '{\n' )
	for line in input:
		line = line.rstrip('\n').split('\t')
		if len(line) > 12:
			precinct = line[10]
			url = line[12]
			pdfnum = re.findall( '/(\d+)EN\.pdf$', url )
			if len(pdfnum):
				output.write( '"%s":"%s",\n' %( precinct, pdfnum[0] ) )
	output.write( '}\n' )
	output.close()
	input.close()

def main():
	convert( 'hi-ballot-urls.tsv', 'hi-ballot-urls.json' )
	print 'Done!'

if __name__ == "__main__":
	main()
