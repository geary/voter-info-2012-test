// voter-info.js
// By Michael Geary - http://mg.to/
// See UNLICENSE or http://unlicense.org/ for public domain notice.

var opt = {
	writeScript: function( name, seconds ) {
		document.write(
			'<script type="text/javascript" src="', name, '">',
			'<\/script>'
		);
	}
};

document.write(
	'<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery', opt.debug ? '' : '.min', '.js">',
	'</script>'
);

opt.writeScript( opt.localJS || 'voter-info-usa.js' );
opt.writeScript( 'voter-info-main.js' );
