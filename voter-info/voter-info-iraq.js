// Copyright 2010 Michael Geary
// http://mg.to/
// Free Beer and Free Speech License (any OSI license)
// http://freebeerfreespeech.org/

(function() {

// Common initialization

var locationStrings = [
	'Arizona - Phoenix|American Banquet Hall~2713 W. Northern Ave~Phoenix, AZ 85051|-112.118337,33.5530682',
	'California - San Diego|1340 Broadway~El Cajon,  CA 92021|-116.93395100000001,32.808245899999996',
	'California - San Francisco|Alameda County Fairgrounds~4501 Pleasanton Avenue~Pleasanton, CA 94566|-121.887367,37.66169',
	'Illinois - Chicago|1919 A Pickwick Ln~Glenview, IL 60026|-87.8384481,42.09045020000001',
	'Michigan - Detroit|Dearborn Tree Manor (Banquet Centre)~5101 Oakman~Dearborn, MI 48126|-83.1688923,42.3245607',
	'Michigan - Detroit|Bella Banquets Hall~4100 E. 14 Mile Road~Warren, MI 48092|-83.0672744,42.5354603',
	'Tennessee - Nashville|4527 Nolensville Pike~Nashville, TN 37211|-86.72571599999999,36.070606999999995',
	'Texas - Dallas|Crossroads Hotel and Suites~3135 E. John Carpenter Fwy~Irving, TX 75062|-96.89966299999999,32.836512899999995',
	'Washington DC|Hilton Arlington Hotel~950 N. Stafford St~Arlington, VA 22203|-77.1104784,38.881823399999995'
];

var locations = [];

// Utility functions and jQuery extensions

var $window = $(window);

if( ! Array.prototype.forEach ) {
	Array.prototype.forEach = function( fun /*, thisp*/ ) {
		if( typeof fun != 'function' )
			throw new TypeError();
		
		var thisp = arguments[1];
		for( var i = 0, n = this.length;  i < n;  ++i ) {
			if( i in this )
				fun.call( thisp, this[i], i, this );
		}
	};
}

if( ! Array.prototype.map ) {
	Array.prototype.map = function( fun /*, thisp*/ ) {
		var len = this.length;
		if( typeof fun != 'function' )
			throw new TypeError();
		
		var res = new Array( len );
		var thisp = arguments[1];
		for( var i = 0;  i < len;  ++i ) {
			if( i in this )
				res[i] = fun.call( thisp, this[i], i, this );
		}
		
		return res;
	};
}

Array.prototype.mapjoin = function( fun, delim ) {
	return this.map( fun ).join( delim || '' );
};

function S() {
	return Array.prototype.join.call( arguments, '' );
}

function analytics( path ) {
	function fixHttp( url ) {
		return url.replace( /http:\/\//, 'http/' ).replace( /mailto:/, 'mailto/' );
	}
	if( path.indexOf( 'http://maps.gmodules.com/ig/ifr' ) == 0 ) return;
	if( path.indexOf( 'http://maps.google.com/maps?f=d' ) == 0 ) path = '/directions';
	//path = ( opt.maker ? '/creator/' : opt.home ? '/onebox/' : opt.mapplet ? '/mapplet/' : opt.inline ? '/inline/' : '/gadget/' ) + fixHttp(path);
	path = '/iraq/' + fixHttp(path);
	path = '/' + fixHttp(document.referrer) + '/' + path;
	path = path.replace( /\/+/g, '/' );
	if( opt.debug ) window.console && console.log( 'analytics', path );
	else _IG_Analytics( 'UA-5730550-1', path );
}

// Main mapplet code

var map = new GMap2;

document.write(
	'<style type="text/css">',
		'body.gadget { margin:0; padding:0; }',
		'#locations .address { margin-bottom:12px; }',
	'</style>',
	
	'<div style="font:10pt Arial,sans-serif">',
	
		'<div style="font-size:140%; margin-bottom:10px;">',
			'Iraq Out of Country Voter Info',
		'</div>',
		
		'<div style="margin:12px 0;">',
			'In partnership with the ',
			'<a target="_blank" href="http://ocv-ihec.com/EnglishHome.asp">',
				'Iraq High Electoral Commission',
			'</a>',
			'.',
		'</div>',
		
		'<div style="font-weight:bold; font-size:125%; margin-bottom:4px;">',
			'OCV Office',
		'</div>',
		'<div>',
			'Manager: Sarbest Mohamed Tahr<br />',
			'Phone: 937-608-7897<br />',
			'Email: <a target="_blank" href="mailto:ocv_usa@yahoo.com">ocv_usa@yahoo.com</a><br />',
			'14000 Thunderbolt Place<br />',
			'Chantilly, VA  20151<br />',
		'</div>',
		
		'<div style="font-weight:bold; font-size:125%; margin:16px 0 4px 0;">',
			'Voting Locations',
		'</div>',
		
		'<div id="locations" style="margin-top:12px;">',
		'</div>',
		
		'<div style="margin-top:12px;">',
			'<b>Important: </b>',
			'The Out-of-Country eligibility criteria as listed by the Iraq High Electoral Commission are:',
			'<ol>',
				'<li>The voter identification (identification documents)</li>',
				'<li>Born on or before 31/12/1992 (age identification documents)</li>',
				'<li>Iraqi nationality (nationality documents)</li>',
				'<li>Governorate (governorate identification documents)</li>',
			'</ol>',
			'You can find more information on the Iraq High Electoral Commission Out of Country Voting website: ',
			'<a target="_blank" href="http://ocv-ihec.com/EnglishHome.asp">',
				'http://ocv-ihec.com/EnglishHome.asp',
			'</a>',
		'</div>',
		
	'</div>'
);

function formatLocation( location, link ) {
	var address = location.address.replace( /~/g, '<br />' );
	if( link ) address = S(
		'<a href="#', location.index, '">', address.replace( /~/g, '<br />' ), '</a>'
	);
	return S(
		'<div style="font:10pt Arial,sans-serif">',
			'<div style="font-weight:bold; font-size:110%;">',
				location.city,
			'</div>',
			'<div class="address">',
				address,
			'</div>',
		'</div>'
	);
}

function addMarker( location ) {
	var latlng = new GLatLng( location.lat, location.lng );
	var icon = new GIcon( G_DEFAULT_ICON );
	var marker = new GMarker( latlng, { icon:icon } );
	map.addOverlay( marker );
	var options = {
		maxWidth: 350
		/*, disableGoogleLinks:true*/
	};
	var html = formatLocation( location );
	marker.bindInfoWindowHtml( html, options );
	GEvent.addListener( marker, 'click', function() { analytics( 'location/' + location.city ); } );
	return marker;
}
	
function getJSON( url, callback, cache ) {
	fetch( url, function( text ) {
		var json = typeof text == 'object' ? text : eval( '(' + text + ')' );
		callback( json );
	}, cache );
}

function zoom() {
	var bounds = [
		[ -124.72846051, 24.54570037 ],
		[ -66.95221658, 49.38362494 ]
	];
	var latlngbounds = new GLatLngBounds(
		new GLatLng( bounds[0][1], bounds[0][0] ),
		new GLatLng( bounds[1][1], bounds[1][0] )
	);
	map.getBoundsZoomLevelAsync( latlngbounds, function( zoom ) {
		map.setCenter( latlngbounds.getCenter(), zoom );
	});
}

$(function() {
	
	zoom();
	
	$('a').click( function() {
		analytics( 'click/' + this.href );
	});
	
	$('#locations')
		.html(
			locationStrings.mapjoin( function( string, index ) {
				var loc = string.split('|');
				var ll = loc[2].split(',');
				var location = locations[index] = {
					index: index,
					city: loc[0],
					address: loc[1],
					lat: +ll[1],
					lng: +ll[0]
				};
				location.marker = addMarker( location );
				return formatLocation( location, true );
			})
		)
		.click( function( event ) {
			var $target = $(event.target);
			if( $target.is('a') ) {
				var index = $target.attr('href').split('#')[1];
				var location = locations[index];
				location.marker.openInfoWindowHtml( formatLocation(location) );
				analytics( 'location/' + location.city );
			}
			return false;
		});
		
	_IG_AdjustIFrameHeight();
	
	analytics( 'view' );
});
	
})();
