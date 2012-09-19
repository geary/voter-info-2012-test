// voter-info.js
// By Michael Geary - http://mg.to/
// See UNLICENSE or http://unlicense.org/ for public domain notice.

// Parse the query string in a URL and return an object of
// the key=value pairs.
// Example:
//     var url = 'http://example.com/test?a=b&c=d'
//     var p = parseQuery(url);
// Now p contains { a:'b', c:'d' }
function parseQuery( query ) {
	if( query == null ) return {};
	if( typeof query != 'string' ) return query;
	if( query.charAt(0) == '{') return eval('(' + query + ')');

	var params = {};
	if( query ) {
		var array = query.replace( /^[#?]/, '' ).split( '&' );
		for( var i = 0, n = array.length;  i < n;  ++i ) {
			var p = array[i].split( '=' ),
				key = decodeURIComponent( p[0] ),
				value = decodeURIComponent( p[1] ).replace( /\+/g, ' ' );
			if( key ) params[key] = value;
		}
	}
	return params;
}

var params = parseQuery( location.search );

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
