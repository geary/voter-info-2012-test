// voter-info-thanks.js
// By Michael Geary - http://mg.to/
// See UNLICENSE or http://unlicense.org/ for public domain notice.

(function() {

var img = 'http://election-gadgets.googlecode.com/hg/voter-info/images/vote-icon-50.png';

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
		//	'Learn more about the ',
		//	'<a target="_blank" href="http://www.votinginformationproject.org/" title="Voting Information Project">Voting Information Project</a>',
		//'</div>',
	'</div>'
);

})();
