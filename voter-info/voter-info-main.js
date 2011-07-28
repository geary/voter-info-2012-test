// voter-info-main.js
// By Michael Geary - http://mg.to/
// See UNLICENSE or http://unlicense.org/ for public domain notice.

//window.console && typeof console.log == 'function' && console.log( location.href );

var key = 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRTZqGWfQErE9pT-IucjscazSdFnjBSzjqfxm1CQj7RDgG-OoyNfebJK0w';

function getWH( what ) {
	return window[ 'inner' + what ] || document.documentElement[ 'offset' + what ];
}

function winWidth() { return getWH('Width'); }
function winHeight() { return getWH('Height'); }

$.fn.visibleHeight = function() {
	return this.is(':visible') ? this.height() : 0;
};

$.fn.visibleWidth = function() {
	return this.is(':visible') ? this.width() : 0;
};

var gem = GoogleElectionMap = {};

// Utility functions and jQuery extensions

// temp?
opt.nocache = opt.debug;

opt.dataUrl = opt.codeUrl;
if( opt.debug ) opt.dataUrl += 'proxy-local.php?jsonp=?&file=';

var $window = $(window), $body = $('body');

function writeScript( url ) {
	document.write( '<script type="text/javascript" src="', url, '"></script>' );
}

writeScript( 'http://www.google.com/jsapi?key=' + key );

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

Array.prototype.random = function() {
	return this[ randomInt(this.length) ];
};

Array.prototype.randomized = function() {
	var from = this.concat();
	var to = [];
	while( from.length )
		to.push( from.splice( randomInt(from.length), 1 )[0] );
	return to;
};

function sortArrayBy( array, key, opt ) {
	opt = opt || {};
	// TODO: use code generation instead of multiple if statements?
	var sep = unescape('%uFFFF');
	
	var i = 0, n = array.length, sorted = new Array( n );
	if( opt.numeric ) {
		if( typeof key == 'function' ) {
			for( ;  i < n;  ++i )
				sorted[i] = [ ( 1000000000000000 + key(array[i]) + '' ).slice(-15), i ].join(sep);
		}
		else {
			for( ;  i < n;  ++i )
				sorted[i] = [ ( 1000000000000000 + array[i][key] + '' ).slice(-15), i ].join(sep);
		}
	}
	else {
		if( typeof key == 'function' ) {
			for( ;  i < n;  ++i )
				sorted[i] = [ key(array[i]), i ].join(sep);
		}
		else if( opt.caseDependent ) {
			for( ;  i < n;  ++i )
				sorted[i] = [ array[i][key], i ].join(sep);
		}
		else {
			for( ;  i < n;  ++i )
				sorted[i] = [ array[i][key].toLowerCase(), i ].join(sep);
		}
	}
	
	sorted.sort();
	
	var output = new Array( n );
	for( i = 0;  i < n;  ++i )
		output[i] = array[ sorted[i].split(sep)[1] ];
	
	return output;
}

function randomInt( n ) {
	return Math.floor( Math.random() * n );
}

function S() {
	return Array.prototype.join.call( arguments, '' );
}

function linkIf( text, href, title ) {
	title = htmlEscape( title || text ).replace( /"/g, '&quot;' );
	text = htmlEscape( text );
	return ! href ? text : S(
		'<a target="_blank" href="', href, '" title="', title, '">',
			text,
		'</a>'
	);
}

function fetch( url, callback, cache ) {
	if( cache === false ) {
		$.getJSON( url, callback );
	}
	else if( opt.debug  &&  url.indexOf(opt.dataUrl) == 0 ) {
		$.getJSON( url, function( data ) {
			if( ! data ) data = { error: 'Null data' };
			if( data.error ) alert( data.error + ':\n' + url );
			else callback( data.result );
		});
	}
	else {
		_IG_FetchContent( url, callback, {
			refreshInterval: cache != null ? cache : opt.nocache ? 1 : opt.cache || 600
		});
	}
}

function T( name, values, give ) {
	name = name.split(':');
	var file = name[1] ? name[0] : T.file;
	var url = T.baseUrl + file + '.html', part = name[1] || name[0];
	if( T.urls[url] )
		return ready();
	
	fetch( url, function( data ) {
		var o = T.urls[url] = {};
		var a = data
			.replace( /\r/g, '' )
			.replace( /([^ ])\n+\s*/g, '$1' )
			.split( /\s*<!--::\s+/g );
		for( var i = 1, n = a.length;  i < n;  ++i ) {
			var s = a[i], k = s.match(/^\S+/), v = s.replace( /^\S+\s+::-->/, '' );
			o[k] = $.trim(v);
		}
		ready();
	}, 60 );
	
	function ready() {
		var text = T.urls[url][part];
		if( ! text ) return T.error && T.error( url, part );
		text = text.replace(
			/(<!--)?\{\{(\w+)\}\}(-->)?/g,
			function( match, ignore, name ) {
				//window.console && console.log( name );
				var value = values && values[name];
				if( value == null ) value = T.variables && T.variables[name];
				if( value == null ) value = match;
				return value;
			});
		give && give(text);
		return text;
	}
	
	return null;
};
T.urls = {};

T.baseUrl = opt.dataUrl;
T.file = 'voter-info-templates';
T.error = function( url, part ) {
	if( part == 'ignore' ) {
		$('#outerlimits').html( S(
			'<div>',
				'Sorry, we are having trouble loading the Google Election Center app.<br>',
				'Please try again later.',
			'</div>'
		) );
	}
	else {
		alert(S( "T('", part, "') missing from ", url ));
	}
};

$.T = function( name, values /* TODO: , give */ ) {
	return $( T( name, values ) );
};

function htmlEscape( str ) {
	var div = document.createElement( 'div' );
	div.appendChild( document.createTextNode( str ) );
	return div.innerHTML;
}

function cacheUrl( url, cache, always ) {
	if( opt.nocache  &&  ! always ) return url + '?q=' + new Date().getTime();
	//if( opt.nocache ) cache = 0;
	//if( typeof cache != 'number' ) cache = 3600;
	//url = _IG_GetCachedUrl( url, { refreshInterval:cache } );
	//if( ! url.match(/^http:/) ) url = 'http://' + location.host + url;
	return url;
}

function imgUrl( url, cache, always ) {
	return cacheUrl( opt.codeUrl + 'images/' + url, cache, always );
}

function url( base, params, delim ) {
	var a = [];
	for( var p in params ) {
		var v = params[p];
		if( v != null ) a[a.length] = [ p, v ].join('=');
	}
	return a.length ? [ base, a.sort().join('&') ].join( delim || '?' ) : base;
}

function linkto( addr ) {
	var a = htmlEscape( addr ), u = a;
	if( addr.match(/@/) )
		u = 'mailto:' + u;
	else if( ! addr.match(/^http:\/\//) )
		u = a = 'http://' + a;
	return S( '<a target="_blank" href="', u, '">', a, '</a>' );
}

function minimarkdown( text ) {
	return text
		.replace( /\*([^*]+)\*/g, '<b>$1</b>' )
		.replace( /_([^_]+)_/g, '<i>$1</i>' );
}

function analytics( path ) {
	function fixHttp( url ) {
		return url.replace( /http:\/\//, 'http/' ).replace( /mailto:/, 'mailto/' );
	}
	function fixAction( url ) {
		return {
			'lookup': 'search_submit',
			'#detailsbox': 'view_detail',
			'#mapbox':  'load_map',
			'#Poll411Gadget': 'find_location'
		}[url];
	}
	if( window._ADS_ReportInteraction ) {
		if( path == 'view'  ||  /^javascript:/.test(path) ) return;
		var action = fixAction( path );
		if( action ) {
			//console.log( 'adaction', action );
			_ADS_ReportInteraction( action );
		}
		else {
			//console.log( 'adclick', path );
			_ADS_ReportInteraction( 'destination_url_1', path );
		}
	}
	else {
		if( path.indexOf( 'http://maps.gmodules.com/ig/ifr' ) == 0 ) return;
		if( path.indexOf( 'http://maps.google.com/maps?f=d' ) == 0 ) path = '/directions';
		path = ( maker ? '/creator/' : pref.onebox ? '/onebox/' : inline ? '/inline/' : '/gadget/' ) + fixHttp(path);
		path = '/' + fixHttp(document.referrer) + '/' + path;
		//console.log( 'analytics', path );
		_IG_Analytics( 'UA-5730550-1', path );
	}
}

var userAgent = navigator.userAgent.toLowerCase(),
	msie = /msie/.test( userAgent ) && !/opera/.test( userAgent );


var prefs = new _IG_Prefs();
var pref = {
	gadgetType: 'iframe',
	details: 'tab',
	example: '',
	address: '',
	fontFamily: 'Arial,sans-serif',
	fontSize: '16',
	fontUnits: 'px',
	logo: false,
	onebox: false,
	state: '',
	homePrompt: '',
	electionId: '',
	sidebar: false
};
for( var name in pref ) pref[name] = prefs.getString(name) || pref[name];
pref.ready = prefs.getBool('submit');

// Override prompt
//pref.homePrompt = 'We are not supporting any current elections. Click the *Search* button for a demo of this app:';

if( pref.logo ) pref.example = pref.example.replace( 'Ex:', 'Example:' );

if( pref.logo ) {
	pref.fontSize = '13';
}

localPrefs( pref );

var maker = decodeURIComponent(location.href).indexOf('source=http://www.gmodules.com/ig/creator?') > -1;

var fontStyle = S( 'font-family:', escape(pref.fontFamily), '; font-size:', pref.fontSize, pref.fontUnits, '; ' );

T.variables = {
	width: winWidth() - 8,
	height: winHeight() - 80,
	heightFull: winHeight(),
	homePrompt: minimarkdown(pref.homePrompt),
	example: pref.example,
	fontFamily: pref.fontFamily.replace( "'", '"' ),
	fontSize: pref.fontSize,
	fontUnits: pref.fontUnits,
	fontStyle: fontStyle,
	gadget: opt.gadgetUrl,
	logoImage: imgUrl('election_center_logo.gif'),
	spinDisplay: pref.ready ? '' : 'display:none;',
	spinImage: imgUrl('spinner.gif')
};

// Date and time

var seconds = 1000, minutes = 60 * seconds, hours = 60 * minutes,
	days = 24 * hours, weeks = 7 * days;

var dayNames = [
	'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

var monthNames = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDate( date ) {
	date = new Date( date );
	return S(
		monthNames[ date.getMonth() ], ' ',
		date.getDate()
	);
}

function formatDayDate( date ) {
	return S(
		dayNames[ new Date(date).getDay() ], ', ',
		formatDate( date )
	);
}

function dateFromMDY( mdy ) {
	mdy = mdy.split('/');
	return new Date( mdy[2], mdy[0]-1, mdy[1] );
}
	
var today = new Date;
today.setHours( 0, 0, 0, 0 );

// Gadget modes

var inline = pref.gadgetType == 'inline';
var iframe = ! inline;
var balloon = pref.sidebar  ||  ( winWidth() >= 450  &&  winHeight() >= 400 );
var sidebar = !!( pref.sidebar  ||  ( winWidth() >= 800  &&  winHeight() >= 500 ) );

$body.toggleClass( 'logo', pref.logo );
$body.toggleClass( 'sidebar', sidebar );

function initialMap() {
	return balloon && vote && vote.info && vote.info.latlng;
}

var map;
var home, vote, interpolated;

// HTML snippets

function electionHeader() {
	return S(
		'<div style="font-weight:bold;">',
		'</div>'
	);
}

function includeMap() {
	return vote && vote.info && vote.info.latlng;
}

function tabLinks( active ) {
	function tab( id, label ) {
		return T( id == active ? 'tabLinkActive' : 'tabLinkInactive', {
			id: id,
			label: label
		});
	}
	return T( 'tabLinks', {
		tab1: tab( '#detailsbox', 'Details' ),
		tab2: includeMap() ? tab( '#mapbox', 'Map' ) : '',
		tab3: pref.ready ? '' : tab( '#Poll411Gadget', 'Search' )
	});
}

function infoLinks() {
	return home && home.info ? T('infoLinks') : '';
}

// Maker inline initialization

function makerWrite() {
	if( msie ) $('body')[0].scroll = 'no';
	$('body').css({ margin:0, padding:0 });
	
	document.write(
		'<div id="outerlimits">',
		'</div>'
	);
}

// Gadget inline initialization

function gadgetWrite() {
	
	document.write(
		'<div id="outerlimits">',
		'</div>'
	);
	
	document.body.scroll = 'no';
}

// Document ready code

function makerSetup() {
	analytics( 'creator' );
	
	var $outerlimits = $('#outerlimits');
	
	function center( $item ) {
		$item.css({
			left: ( winWidth() - $item.width() ) / 2,
			top: ( winHeight() - $item.height() ) / 2
		});
	}
	
	function addCodePopups() {
		$.T('makerOverlays').insertAfter($outerlimits);
		var $getcode = $('#getcode'), $havecode = $('#havecode'), $codearea = $('#codearea');
		$codearea.height( winHeight() - 150 );
		center( $getcode );
		center( $havecode );
		$getcode.show();
		$('#btnGetCode').click( function() {
			$codearea.val( style + '\n\n' + body + '\n' );
			$havecode.show();
			document.codeform.codearea.focus()
			document.codeform.codearea.select()
		});
	}
	
	var style = T('style');
	$(style).appendTo('head');
	$.T('makerStyle').appendTo('head');
	var body = T('html') + '\n\n' + T('script');
	$outerlimits.html( body ).height( winHeight() );
	if( pref.gadgetType != 'iframe' ) addCodePopups( style, body );
}

function directionsLink( from, to ) {
	from = from.info;
	to = to.info;
	//console.log( 'directions', '('+from.accuracy+')', from.address, '-', '('+to.accuracy+')', to.address );
	return to.accuracy < Accuracy.intersection ? '' : S(
		'<div>',
			'<a target="_blank" href="http://maps.google.com/maps?f=d&saddr=',
				from.accuracy < Accuracy.street ? '' : encodeURIComponent(from.address),
				'&daddr=', encodeURIComponent(to.address),
				'&hl=en&mra=ls&ie=UTF8&iwloc=A&iwstate1=dir"',
			'>',
				'Get directions',
			'</a>',
		'</div>'
	);
}

function infoWrap( html ) {
	return T( 'infoWrap', { html:html } );
}

function initMap( go ) {
	google.load( 'maps', '2', { callback: function() {
		if( GBrowserIsCompatible() ) {
			map = new GMap2( $map[0], {
				//googleBarOptions: { showOnLoad: true },
				mapTypes: [
					G_NORMAL_MAP,
					G_SATELLITE_MAP,
					G_SATELLITE_3D_MAP
				]
			});
			map.addControl(
				winWidth() >= 400 && winHeight() >= 300 ?
					new GLargeMapControl3D :
					new GSmallZoomControl
			);
			map.addControl( new GMapTypeControl );
			go();
		}
	} });
}

function loadMap( a ) {
	go();
	
	function ready() {
		setTimeout( function() {
			var only = ! vote.info  ||  ! vote.info.latlng;
			setMarker({
				place: home,
				image: 'marker-green.png',
				open: only,
				html: ! only ? formatHome(true) : vote.htmlInfowindow || formatHome(true)
			});
			if( vote.info  &&  vote.info.latlng )
				setMarker({
					place: vote,
					html: vote.htmlInfowindow,
					open: true
				});
		}, 500 );
	}
	
	function setMarker( a ) {
		var icon = a.icon || new GIcon( G_DEFAULT_ICON );
		if( a.image ) icon.image = imgUrl( a.image );
		var marker = a.place.marker =
			new GMarker( a.place.info.latlng, { icon:icon });
		map.addOverlay( marker );
		var options = {
			maxWidth: Math.min( $map.width() - 100, 350 )
			/*, disableGoogleLinks:true*/
		};
		if( balloon ) {
			marker.bindInfoWindow( $(a.html)[0], options );
			if( a.open ) marker.openInfoWindowHtml( a.html, options );
		}
		else {
			GEvent.addListener( marker, 'click', function() {
				selectTab( '#detailsbox' );
			});
		}
	}
	
	function go() {
		setVoteHtml();
		
		var hi = home.info, vi = vote.info;
		
		$tabs.html( tabLinks( initialMap() ? '#mapbox' : '#detailsbox' ) );
		if( ! sidebar ) $map.css({ visibility:'hidden' });
		setLayout();
		if( initialMap() ) {
			$map.show().css({ visibility:'visible' });
			if( ! sidebar ) $detailsbox.hide();
		}
		else {
			if( ! sidebar ) $map.hide();
			$detailsbox.show();
		}
		
		if( ! hi ) return;
		if( vi  &&  vi.latlng ) {
			var directions = new GDirections( null/*, $directions[0]*/ );
			GEvent.addListener( directions, 'load', function() {
				var bounds = directions.getBounds();
				var ne = bounds.getNorthEast();
				var sw = bounds.getSouthWest();
				var n = ne.lat(), e = ne.lng(), s = sw.lat(), w = sw.lng();
				var  latpad = ( n - s ) / 4;
				var lngpad = ( e - w )  / 4;
				bounds = new GLatLngBounds(
					new GLatLng( s - latpad, w - lngpad ),
					new GLatLng( n + latpad*2, e + lngpad )
				);
				var zoom = map.getBoundsZoomLevel( bounds )
				map.setCenter( bounds.getCenter(), Math.min(zoom,16) );
				var polyline = directions.getPolyline();
				polyline && map.addOverlay( polyline );
			});
			directions.loadFromWaypoints(
				[
					S( 'Your Home (', hi.address, ')@', hi.lat.toFixed(6), ',', hi.lng.toFixed(6) ),
					S( 'Your Voting Location (', vi.address, ')@', vi.lat.toFixed(6), ',', vi.lng.toFixed(6) )
				],
				{
					getPolyline: true
				}
			);
		}
		else {
			// Initial position with marker centered on home, or halfway between home and voting place
			var latlng = hi.latlng;
			if( vi  &&  vi.latlng ) {
				latlng = new GLatLng(
					( hi.lat + vi.lat ) / 2,
					( hi.lng + vi.lng ) / 2
				);
			}
			//var center = latlng;
			//var width = $map.width(), height = $map.height();
			map.setCenter( latlng, a.zoom );
		}
		
		ready();
		spin( false );
	}
}

function spin( yes ) {
	//console.log( 'spin', yes );
	$('#spinner').css({ visibility: yes ? 'visible' : 'hidden' });
}

function geocode( address, callback ) {
	var geocoder = new GClientGeocoder();
	geocoder.getLocations( address, callback );
}

function pollingApi( address, abbr, normalize, callback ) {
	if( ! address ) {
		callback({ status:'ERROR' });
		return;
	}
	var url = S(
		'http://pollinglocation.apis.google.com/?',
		normalize ? 'normalize=1&' : '',
		pref.electionId ? 'electionid=' + pref.electionId + '&' : '',
		'q=', encodeURIComponent(address)
	);
	log( 'Polling API:' );  log( url );
	getJSON( url, function( poll ) {
		callback( typeof poll == 'object' ? poll : { status:"ERROR" } );
	});
}

function getJSON( url, callback, cache ) {
	fetch( url, function( text ) {
		// TEMP
		//if( typeof text == 'string' ) text = text.replace( '"locality": }', '"locality":null }' );
		// END TEMP
		//console.log( 'getJson', url );
		//console.log( text );
		var json =
			typeof text == 'object' ? text :
			text == '' ? {} :
			eval( '(' + text + ')' );
		callback( json );
	}, cache );
}

function setGadgetPoll411() {
	var input = $('#Poll411Input')[0];
	input.value = pref.example;
	Poll411 = {
		
		focus: function() {
			if( input.value == pref.example ) {
				input.className = '';
				input.value = '';
			}
		},
		
		blur: function() {
			if( input.value ==  ''  ||  input.value == pref.example ) {
				input.className = 'example';
				input.value = pref.example;
			}
		},
		
		submit: function() {
			$previewmap.hide();
			if( sidebar ) {
				submit( input.value );
			}
			else {
				$map.hide().css({ visibility:'hidden' });
				$search.slideUp( 250, function() {
					$spinner.show();
					submit( input.value );
				});
			}
			return false;
		}
	};
}

function submit( addr ) {
	submitReady = function() {
		analytics( 'lookup' );
		addr = $.trim( addr );
		log();
		log.yes = /^!!?/.test( addr );
		if( log.yes ) addr = $.trim( addr.replace( /^!!?/, '' ) );
		pref.normalize = /^\*/.test( addr );
		if( pref.normalize ) {
			log.yes = true;
			log( 'Setting normalize=1' );
			addr = $.trim( addr.replace( /^\*/, '' ) );
		}
		log( 'Input address:', addr );
		addr = fixInputAddress( addr );
		if( addr == pref.example ) addr = addr.replace( /^.*: /, '' );
		home = {};
		vote = {};
		map && map.clearOverlays();
		$spinner.show();
		$details.empty();
		geocode( addr, function( geo ) {
			var places = geo && geo.Placemark;
			var n = places && places.length;
			log( 'Number of matches: ' + n );
			if( ! n ) {
				spin( false );
				detailsOnly( S(
					log.print(),
					T('didNotFind')
				) );
			}
			else if( n == 1 ) {
				findPrecinct( geo, places[0], addr );
			}
			else {
				if( places ) {
					detailsOnly( T('selectAddressHeader') );
					var $radios = $('#radios');
					$radios.append( formatPlaces(places) );
					$detailsbox.show();
					$details.find('input:radio').click( function() {
						var radio = this;
						spin( true );
						setTimeout( function() {
							function ready() {
								findPrecinct( geo, places[ radio.id.split('-')[1] ] );
							}
							if( $.browser.msie ) {
								$radios.hide();
								ready();
							}
							else {
								$radios.slideUp( 350, ready );
							}
						}, 250 );
					});
				}
				else {
					sorry();
				}
			}
		});
	}
	
	submitReady();
}

function setLayout() {
	$body.toggleClass( 'sidebar', sidebar );
	var headerHeight = $('#header').visibleHeight();
	if( pref.logo ) {
		$('#Poll411Form > .Poll411SearchTable').css({
			width: $('#Poll411Form > .Poll411SearchTitle > span').width()
		});
	}
	var formHeight = $('#Poll411Gadget').visibleHeight();
	if( formHeight ) formHeight += 8;  // TODO: WHY DO WE NEED THIS?
	var height = winHeight() - headerHeight - formHeight - $tabs.visibleHeight();
	$map.height( height );
	$detailsbox.height( height );
	if( sidebar ) {
		var left = $detailsbox.width();
		$map.css({
			left: left,
			top: 0,
			width: winWidth() - left
		});
	}
}

// TODO: refactor detailsOnly() and forceDetails()
function detailsOnly( html ) {
	if( ! sidebar ) {
		$tabs.html( tabLinks('#detailsbox') ).show();
		setLayout();
		$map.hide();
	}
	$details.html( html ).show();
	spin( false );
}

function sorry() {
	$details.html( log.print() + sorryHtml() );
	forceDetails();
}

function forceDetails() {
	setMap( home.info );
	if( ! sidebar ) {
		$map.hide();
		$tabs.html( tabLinks('#detailsbox') ).show();
	}
	$detailsbox.show();
	spin( false );
}

function sorryHtml() {
	return home && home.info ? S(
		'<div>',
			formatHome(),
			stateLocator(),
			electionInfo(),
		'</div>'
	) : S(
		'<div>',
		'</div>'
	);
}

function setMap( a ) {
	if( ! a ) return;
	a.width = $map.width();
	$map.show().height( a.height = Math.floor( winHeight() - $map.offset().top ) );
	loadMap( a );
}

function formatPlaces( places ) {
	if( ! places ) return sorryHtml();
	
	var checked = '';
	if( places.length == 1 ) checked = 'checked="checked"';
	else spin( false );
	var list = places.map( function( place, i ) {
		var id = 'Poll411SearchPlaceRadio-' + i;
		place.extra = { index:i, id:id };
		return T( 'placeRadioRow', {
			checked: checked,
			id: 'Poll411SearchPlaceRadio-' + i,
			address: formatAddress(place.address)
		});
	});
	
	return T( 'placeRadioTable', { rows:list.join('') } );
}

var Accuracy = {
	country:1, state:2, county:3, city:4,
	zip:5, street:6, intersection:7, address:8, premise:9
};
var Kind = [ '', 'Country', 'State', 'County', 'City', 'Neighborhood', 'Neighborhood', 'Neighborhood', 'Home', 'Home' ];
var Zoom = [ 4, 5, 6, 10, 11, 12, 13, 14, 15, 15 ];

function mapInfo( geo, place, extra ) {
	extra = extra || {};
	var details = place.AddressDetails;
	var accuracy = Math.min( details.Accuracy, Accuracy.address );
	if( accuracy < Accuracy.state ) {
		log( 'Not accurate enough' );
		return null;
	}
	var country = details.Country;
	if( ! country ) {
		log( 'No country' );
		return null;
	}
	var area = country.AdministrativeArea;
	if( ! area ) {
		log( 'No AdministrativeArea' );
		return null;
	}
	var areaname = area.AdministrativeAreaName;
	
	// TODO: USA specific
	var state =
		statesByName[areaname] ||
		statesByAbbr[ areaname.toUpperCase() ] ||
		statesByName[ ( place.address || '' ).replace( /, USA$/, '' ) ];
	if( ! state ) {
		log( 'No state' );
		return null;
	}
	var sub = area.SubAdministrativeArea || area, locality = sub.Locality;
	if( locality ) {
		log( 'Got Locality' );
		var county = sub.SubAdministrativeAreaName || locality.LocalityName;
		var city = locality.LocalityName;
		var street = locality.Thoroughfare;
		var zip = locality.PostalCode;
	}
	else if( area.AddressLine ) {
		log( 'Got AddressLine' );
		var addr = area.AddressLine[0] || '';
		if( addr.match( / County$/ ) )
			county = addr.replace( / County$/, '' );
		else
			city = addr;
	}
	var coord = place.Point.coordinates;
	var lat = coord[1], lng = coord[0];
	var formatted = formatAddress( place.address );
	log( 'Formatted address:', formatted );
	return {
		geo: geo,
		place: place,
		address: formatted,
		location: extra.address && extra.address.location_name,
		directions: extra.directions,
		hours: extra.hours,
		lat: lat,
		lng: lng,
		latlng: new GLatLng( lat, lng ),
		street: street && street.ThoroughfareName || '',
		city: city || '',
		county: county || '',
		state: state,
		zip: zip && zip.PostalCodeNumber || '',
		zoom: Zoom[accuracy],
		accuracy: accuracy,
		kind: Kind[accuracy],
		_:''
	};
}

function setupTabs() {
	var $tabs = $('#tabs');
	$tabs.click( function( event ) {
		var $target = $(event.target);
		if( $target.is('a') ) {
			var tab = $target.attr('href').replace( /^.*#/, '#' );
			selectTab( tab );
		}
		return false;
	});
}

function selectTab( tab ) {
	analytics( tab );
	$( $tabs.find('span')[0].className ).hide();
	if( tab == '#Poll411Gadget' ) {
		$details.empty();
		$tabs.hide();
		$spinner.css({ display:'none' });
		$map.hide();
		$search.slideDown( 250, function() {
			//$previewmap.show();
			setLayout();
			$map.show();
		});
	}
	else {
		$(tab).show().css({ visibility:'visible' });
		$tabs.html( tabLinks(tab) );
	}
	return false;
};

function maybeSelectTab( tab, event ) {
	event = event || window.event;
	var target = event.target || event.srcElement;
	if( target.tagName.toLowerCase() != 'a' ) return selectTab( tab );
	return true;
};

function gadgetSetup() {
	$.T('style').appendTo('head');
	$.T('gadgetStyle').appendTo('head');
	
	$('body').prepend( S(
		pref.logo ? T('header') : '',
		T('html')
	) );
	$.T('gadgetBody').appendTo('#outerlimits');
	
	/*var*/ $search = $('#Poll411Gadget'),
		$selectState = $('#Poll411SelectState'),
		$tabs = $('#tabs'),
		$previewmap = $('#previewmap'),
		$map = $('#mapbox'),
		$details = $('#details'),
		$detailsbox = $('#detailsbox'),
		$spinner = $('#spinner'),
		$directions = $('#directions');
	
	if( pref.ready ) $search.hide();
	else setGadgetPoll411();
	setLayout();
	
	analytics( 'view' );
	gadgetReady();
}

function log() {
	if( arguments.length == 0 )
		log.log = [];
	else for( var i = -1, text;  text = arguments[++i]; ) {
		log.log.push( text );
		window.console && console.log && console.log( text );
	}
}

log.print = function() {
	return log.yes ? T( 'log', { content:log.log.join('<br />') } ) : '';
}

// Final initialization

maker && inline ? makerWrite() : gadgetWrite();
$(function() {
	$window.resize( setLayout );
	T( 'ignore', null, function() {
		maker && inline ? makerSetup() : gadgetSetup();
	});
	$('body').click( function( event ) {
		var target = event.target;
		if( $(target).is('a') )
			analytics( $(target).attr('href') );
	});
});
