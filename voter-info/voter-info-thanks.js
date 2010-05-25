// Copyright 2008-2010 Michael Geary
// http://mg.to/
// Free Beer and Free Speech License (any OSI license)
// http://freebeerfreespeech.org/

(function() {

var img = _IG_GetCachedUrl( 'http://election-maps-2008.googlecode.com/svn/trunk/vote-icon-50.png' );

document.write(
	'<div style="margin:.5em; font-family:Arial,sans-serif; font-size:10pt;">',
		'<table>',
			'<tr>',
				'<td>',
				'<img src="', img, '" style="width:50px; height:50px;" />',
				'</td>',
				'<td>',
					'<div style="font-size:11pt; font-weight:bold; padding-left:8px;">',
						'Thank you for voting!',
					'</div>',
				'</td>',
			'</tr>',
		'</table>',
		//'<div style="margin-top:1em;">',
		//	'<a target="_blank" href="http://www.sbe.virginia.gov/cms/Election_Information/Election_Results/2009/November_General_Election.html" title="Virginia Election Results Map">Virginia Election Results Map</a>',
		//'</div>',
		'<div style="margin-top:1em;">',
			'<a target="_blank" href="https://www.voterinfo.sbe.virginia.gov/election/DATA/2009/37C2EDEB-FACB-44C1-AF70-05FB616DCD62/official/2_s.shtml" title="Full Virginia Election Results">Full Virginia Election Results</a>',
		'</div>',
		'<div style="margin-top:1em;">',
			'Learn more about the ',
			'<a target="_blank" href="http://www.votinginformationproject.org/" title="Voting Information Project">Voting Information Project</a>',
		'</div>',
		'<div style="margin-top:1em; font-style:italic; font-size:90%;">',
			'Thanks to the Virginia State Board of Elections for providing ballot data, polling place locations, and local election official information.',
		'</div>',
	'</div>'
);

})();
