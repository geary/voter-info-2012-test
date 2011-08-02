// voter-info.js
// By Michael Geary - http://mg.to/
// See UNLICENSE or http://unlicense.org/ for public domain notice.

document.write(
	'<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery', opt.debug ? '' : '.min', '.js">',
	'</script>'
);

var prefs = new _IG_Prefs();
var pref = {
	lang: prefs.getString( '.lang' ) || 'en'
};

function loadStrings( strings ) {
	pref.strings = strings;
}

opt.writeScript( 'locale/lang-' + pref.lang + '.js' );

opt.writeScript( 'voter-info-usa.js' );
opt.writeScript( 'voter-info-main.js' );
