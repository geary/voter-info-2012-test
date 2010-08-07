// Copyright 2008-2010 Michael Geary
// http://mg.to/
// Free Beer and Free Speech License (any OSI license)
// http://freebeerfreespeech.org/

//window.console && typeof console.log == 'function' && console.log( location.href );

(function() {

var key = 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRTZqGWfQErE9pT-IucjscazSdFnjBSzjqfxm1CQj7RDgG-OoyNfebJK0w';

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

var mapplet = opt.mapplet;
var baseUrl = opt.baseUrl;
var dataUrl = opt.dataUrl || baseUrl;

var $window = $(window);

function writeScript( url ) {
	document.write( '<script type="text/javascript" src="', url, '"></script>' );
}

writeScript( 'http://www.google.com/jsapi?key=' + key );

function parseQuery( query ) {
	var params = {};
	if( query ) {
		var array = query.split( '&' );
		for( var i = 0, n = array.length;  i < n;  ++i ) {
			var p = array[i].split( '=' ),
				k = decodeURIComponent(p[0]),
				v = decodeURIComponent(p[1]);
			if( k ) params[k] = v;
		}
	}
	return params;
}

var params = parseQuery(
	unescape(location.search)
		.replace( /^\?[^?]*\?/, '' )
		.replace( '#', '&' )
);

//params.state = 'or';

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
	return ! href ? text : S(
		'<a target="_blank" href="', href, '" title="', title || text, '">',
			text,
		'</a>'
	);
}

function fetch( url, callback, cache ) {
	if( cache === false ) {
		$.getJSON( url, callback );
	}
	else {
		_IG_FetchContent( url, callback, {
			refreshInterval: cache != null ? cache : opt.nocache ? 1 : opt.cache || 600
		});
	}
}

T = function( name, values, give) {
	name = name.split(':');
	var file = name[1] ? name[0] : T.file;
	var url = T.baseUrl + file + '.html', part = name[1] || name[0];
	if( T.urls[url] )
		return ready();
	
	fetch( url, function( data ) {
		var a = data.replace( /\r\n/g, '\n' ).split( /\n::/g );
		var o = T.urls[url] = {};
		for( var i = 1, n = a.length;  i < n;  ++i ) {
			var s = a[i], k = s.match(/^\S+/), v = s.replace( /^.*\n/, '' );
			o[k] = $.trim(v);
		}
		ready();
	});
	
	function ready() {
		var text = T.urls[url][part].replace(
			/\{\{(\w+)\}\}/g,
			function( match, name ) {
				var value = values[name];
				return value != null ? value : match;
			});
		give && give(text);
		return text;
	}
	
	return null;
};
T.urls = {};

T.baseUrl = dataUrl;
T.file = 'voter-info-templates';

function htmlEscape( str ) {
	var div = document.createElement( 'div' );
	div.appendChild( document.createTextNode( str ) );
	return div.innerHTML;
}

function adjustHeight() {
	if( mapplet ) _IG_AdjustIFrameHeight();
}

function cacheUrl( url, cache, always ) {
	if( opt.nocache  &&  ! always ) return url + '?q=' + new Date().getTime();
	if( opt.nocache ) cache = 0;
	if( typeof cache != 'number' ) cache = 3600;
	url = _IG_GetCachedUrl( url, { refreshInterval:cache } );
	if( ! url.match(/^http:/) ) url = 'http://' + location.host + url;
	return url;
}

function imgUrl( url, cache, always ) {
	return cacheUrl( baseUrl + 'images/' + url, cache, always );
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

$.extend( $.fn, {
	
	setClass: function( cls, add ) {
		return this[ add ? 'addClass' : 'removeClass' ]( cls );
	},
	
	toggleSlide: function( speed, callback ) {
		return this[ this.is(':hidden') ? 'slideDown' : 'slideUp' ]( speed, callback );
	}
	
});

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
		path = ( maker ? '/creator/' : params.home ? '/onebox/' : mapplet ? '/mapplet/' : inline ? '/inline/' : '/gadget/' ) + fixHttp(path);
		path = '/' + fixHttp(document.referrer) + '/' + path;
		//console.log( 'analytics', path );
		_IG_Analytics( 'UA-5730550-1', path );
	}
}

// GAsync v2 by Michael Geary
// Commented version and description at:
// http://mg.to/2007/06/22/write-the-same-code-for-google-mapplets-and-maps-api
// Free beer and free speech license. Enjoy!

function GAsync( obj ) {
	
	function callback() {
		args[nArgs].apply( null, results );
	}
	
	function queue( iResult, name, next ) {
		
		function ready( value ) {
			results[iResult] = value;
			if( ! --nCalls )
				callback();
		}
		
		var a = [];
		if( next.join )
			a = a.concat(next), ++iArg;
		if( mapplet ) {
			a.push( ready );
			obj[ name+'Async' ].apply( obj, a );
		}
		else {
			results[iResult] = obj[name].apply( obj, a );
		}
	}
	
	//var mapplet = ! window.GBrowserIsCompatible;
	
	var args = arguments, nArgs = args.length - 1;
	var results = [], nCalls = 0;
	
	for( var iArg = 1;  iArg < nArgs;  ++iArg ) {
		var name = args[iArg];
		if( typeof name == 'object' )
			obj = name;
		else
			queue( nCalls++, name, args[iArg+1] );
	}
	
	if( ! mapplet )
		callback();
}

var userAgent = navigator.userAgent.toLowerCase(),
	msie = /msie/.test( userAgent ) && !/opera/.test( userAgent );

var prefs = new _IG_Prefs();
var pref = {
	gadgetType: 'iframe',
	details: 'tab',
	example: ( mapplet ? '' : 'Ex: ' ) + '1600 Pennsylvania Ave 20500',
	address: '',
	fontFamily: 'Arial,sans-serif',
	fontSize: '16',
	fontUnits: 'px',
	logo: '',
	state: '',
	statePrompt: 'Select your state for statewide election info:',
	stateSelector: true,
	addrPrompt: 'Or enter your *home* address for local info:',
	electionId: '',
	logo: ''
};
for( var name in pref ) pref[name] = prefs.getString(name) || pref[name];
pref.ready = prefs.getBool('submit');

var maker = decodeURIComponent(location.href).indexOf('source=http://www.gmodules.com/ig/creator?') > -1;

var fontStyle = S( 'font-family:', escape(pref.fontFamily), '; font-size:', pref.fontSize, pref.fontUnits, '; ' );

var width = $(window).width(), height = $(window).height();

var variables = {
	width: width - 8,
	height: height - 80,
	statePrompt: minimarkdown(pref.statePrompt),
	addrPrompt: minimarkdown(pref.addrPrompt),
	example: pref.example,
	fontFamily: pref.fontFamily.replace( "'", '"' ),
	fontSize: pref.fontSize,
	fontUnits: pref.fontUnits,
	gadget: opt.gadgetUrl
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

////  Date tester
//if( 0 ) {
//	today = new Date( 2008,  9, 6 );
//	document.write(
//		'<div style="font-weight:bold;">',
//			'Test date: ', formatDayDate( today ),
//		'</div>'
//	);
//}
////

// State data

var stateUS = {
	abbr: 'US',
	name: 'United States',
	gsx$north: { $t: '49.3836' },
	gsx$south: { $t: '24.5457' },
	gsx$east: { $t: '-66.9522' },
	gsx$west: { $t: '-124.7284' }
};

var states = [];
var statesByAbbr = {};
var statesByName = {};

function stateByAbbr( abbr ) {
	if( typeof abbr != 'string' ) return abbr;
	return statesByAbbr[abbr.toUpperCase()] || stateUS;
}

function indexSpecialStates() {
	var special = {
		'N Carolina': 'North Carolina',
		'N Dakota': 'North Dakota',
		'S Carolina': 'South Carolina',
		'S Dakota': 'South Dakota',
		'W Virginia': 'West Virginia'
	};
	for( var abbr in special )
		statesByName[abbr] = statesByName[ special[abbr] ];
}

var inline = ! mapplet  &&  pref.gadgetType == 'inline';
var iframe = ! mapplet  &&  ! inline;
var balloon = mapplet  ||  ( $(window).width() >= 450 && $(window).height() >= 400 );

function initialMap() {
	return balloon && vote && vote.info && vote.info.latlng;
}

var map;
var home, vote, interpolated;

// HTML snippets

var electionHeader = S(
	'<div>',
		'<strong>June, 2010 Election</strong>',
	'</div>'
);

function includeMap() {
	return vote && vote.info && vote.info.latlng;
}

function tabLinks( active ) {
	function tab( id, label ) {
		return id == active ? S(
			'<span class="', id, '">', label, '</span>'
		) : S(
			'<a href="', id, '">', label, '</a>'
		);
	}
	return S(
		'<div id="tablinks">',
			tab( '#detailsbox', 'Details' ),
			includeMap() ? tab( '#mapbox', 'Map' ) : '',
			pref.ready ? '' : tab( '#Poll411Gadget', 'Search' ),
		'</div>'
	);
}

function infoLinks() {
	var info = home && home.info;
	if( ! info ) return '';
	return S(
		'<div style="', fontStyle, '">',
			'<div style="margin-top:0.5em;">',
				'<a target="_blank" href="http://spreadsheets.google.com/viewform?formkey=dG5rTHNRNWVYdGYwMmFjbDBydzlLR2c6MA">',
					'Report an error',
				'</a>',
			'</div>',
			//'<div style="margin-top:1em; border-top:1px solid #BBB; padding-top:1em;">',
			//	'Full election coverage:<br />',
			//	'<a target="_blank" href="http://www.google.com/2008election">',
			//		'Google 2008 Election Site',
			//	'</a>',
			//'</div>',
			//'<div style="margin-top:1em;">',
			//	'More election maps:<br />',
			//	'<a target="_blank" href="http://maps.google.com/elections">',
			//		'Google Elections Map Gallery',
			//	'</a>',
			//'</div>',
			//'<div style="margin-top:1em;">',
			//	'Get election info on your phone:<br />',
			//	'<a target="_blank" href="http://m.google.com/elections">',
			//		'http://m.google.com/elections',
			//	'</a>',
			//'</div>',
			//'<div style="margin:1em 0 1em 0;">',
			//	'Help others find their voter information:<br />',
			//	'<a target="_blank" href="http://gmodules.com/ig/creator?synd=open&url=http://election-gadgets.googlecode.com/hg/voter-info/voter-info-gadget.xml">',
			//		'Get this gadget for your website',
			//	'</a>',
			//'</div>',
		'</div>'
	);
}

function attribution() {
	//var fullvips = 'state and local election officials from Iowa, Kansas, Maryland, Minnesota, Missouri, Montana, North Carolina, North Dakota, Ohio, Virginia, and Los Angeles County,';
	
	var special = {
		VA: S(
			'<a style="font-size:100%;" target="_blank" href="http://www.sbe.virginia.gov/">',
				'Virginia State Board of Elections',
			'</a>'
		)
	}[ home && home.info && home.info.state && home.info.state.abbr ] || '';
	if( special ) special += ' and the ';

	return S(
		'<div style="margin-bottom:0.5em;', fontStyle, ' color:#333;">',
			'<div style="font-size:85%; margin-top:0.5em; border-top:1px solid #BBB; padding-top:1em;">',
				'Developed with ',
				//'<span id="vips" style="font-size:100%;">',
				//	'<a style="font-size:100%;" href="#" onclick="$(\'#vips\').html(fullvips); return false;">',
				//		'state and local election officials',
				//	'</a>',
				//'</span>',
				'the ',
				special,
				'<a style="font-size:100%;" target="_blank" href="http://www.votinginfoproject.org/">',
					'Voting Information Project',
				'</a>',
				'.',
			'</div>',
			//'<div style="font-size:85%; margin-top:0.75em;">',
			//	'In conjunction with the ',
			//	'<a style="font-size:100%;" target="_blank" href="http://www.lwv.org/">',
			//		'League of Women Voters',
			//	'</a>',
			//	'.',
			//'</div>',
		'</div>'
	);
}

// Maker inline initialization

function makerWrite() {
	if( msie ) $('body')[0].scroll = 'no';
	$('body').css({ margin:0, padding:0 });
	
	var overlays = pref.gadgetType == 'iframe' ? '' : S(
		'<div id="getcode" class="popupOuter">',
			'<div class="popupInner" style="width:225px;">',
				'<div style="text-align:center; margin-bottom:10px;">',
					'<button type="button" id="btnGetCode" style="font-size:24px;">',
						'Get the Code',
					'</button>',
				'</div>',
				'<div style="font-size:14px;">',
					'<div style="margin-bottom:8px;">',
						'Click this button for an <strong>inline</strong> gadget using HTML and JavaScript. ',
					'</div>',
					'<div style="margin-bottom:8px;">',
						'The inline gadget initially displays only the search input form, without taking extra space on your page. When you click the <strong>Search</strong> button, the gadget expands to its full height.',
					'</div>',
					'<div style="margin-bottom:8px;">',
						'Not all websites support the inline gadget. ',
						'For a simpler gadget, change the <strong>Gadget Type</strong> below to Standard Gadget.',
					'</div>',
				'</div>',
			'</div>',
		'</div>',
		'<div id="havecode" class="popupOuter" style="width:95%; height:90%;">',
			'<div class="popupInner">',
				'<div>',
					'<div style="font-size:16px; margin-bottom:6px;">',
						'<strong>Copy and paste this HTML to include the gadget on your website.</strong><br />',
					'</div>',
					'<div style="font-size:15px; margin-bottom:8px;">',
						'Or click <strong>Get the Code</strong> below for a simpler fixed-height <strong><code>&lt;iframe&gt;</code></strong> gadget.',
					'</div>',
					'<div style="font-size:12px;">',
						'<form id="codeform" name="codeform" style="margin:0; padding:0;">',
							'<textarea id="codearea" name="codearea" style="width:100%; height:80%; font-family: Consolas,Courier New,Courier,monospace;" value="">',
							'</textarea>',
						'</form>',
					'</div>',
				'</div>',
			'</div>',
		'</div>'
	);
	
	document.write(
		'<style type="text/css">',
			'.popupOuter { z-index:1; position:absolute; background-color:white; display:none; }',
			'.popupInner { background-color:#E5ECF9; border:1px solid #3366CC; padding:8px; margin:4px; }',
		'</style>',
		'<div id="outerlimits">',
		'</div>',
		overlays
	);
}

// Gadget inline initialization

function gadgetWrite() {
	
	//backLink = params.cnn || params.state ? S(
	//	'<div style="margin:0.5em 0 0 6px; ', fontStyle, '">',
	//		'<a target="_blank" alt="Return to CNN&#146;s Election Center 2008" href="http://www.cnn.com/ELECTION/2008/">',
	//			'Return to CNN&#146;s Election Center 2008',
	//		'</a>',
	//	'</div>'
	//) : '';
	
	document.write(
		'<style type="text/css">',
			'body.gadget { margin:0; padding:0; }',
			'#wrapper, #wrapper td { ', fontStyle, ' }',
			'#previewmap, #mapbox { overflow: auto; }',
			'.heading { font-weight:bold; }',
			'.orange { padding:6px; width:95%; background-color:#FFEAC0; border:1px solid #FFBA90; }',
			'.pink { padding:6px; width:95%; background-color:#FFD0D0; border:1px solid #FF9090; }',
			params.home ? '.removehelp { display:none; }' : '',
		'</style>'
	);
	
	if( mapplet ) {
		document.write(
			'<style type="text/css">',
				'#Poll411Search, #Poll411Search td { font-size:16px; margin:0; padding:0; }',
				'#Poll411Search { background-color:#E8ECF9; margin:0; padding:6px; width:95%; }',
				'.Poll411SearchForm { margin:0; padding:0; }',
				'.Poll411SearchTitle { /*font-weight:bold;*/ /*font-size:110%;*/ /*padding-bottom:4px;*/ }',
				//'.Poll411SearchLabelBox { position:relative; float:left; margin-right:6px; }',
				'.Poll411SearchInput { width:100%; }',
				'#detailsbox { margin-top:12px; }',
			'</style>'
		);
	}
	else {
		document.write(
			'<style type="text/css">',
				'body { height:', height, 'px; }',
				'#spinner { z-index: 1; position:absolute; width:100%; height:100%; background-image:url(', imgUrl('spinner.gif'), '); background-position:center; background-repeat:no-repeat; opacity:0.30; -moz-opacity:0.30;', pref.ready ? '' : 'display:none;', '}',
				'#spinner { filter:alpha(opacity=30); }',
				'#tabs { width:100%; background-color:#E8ECF9; }',
				'#tablinks { padding:4px; }',
				'#tablinks span, #tablinks a { margin-right:1em; }',
				'#tablinks span { font-weight:bold; }',
				'#tablinks a { color:#0000CC; }',
				'#previewmap, #mapbox { width:100%; }',
				'#detailsbox { width:100%; overflow:scroll; overflow-x:auto; overflow-y:scroll; }',
			'</style>'
		);
	}
	
	if( mapplet ) {
		document.write(
			'<div id="outerlimits" style="margin-right:8px;">',
				'<div id="Poll411Search">',
					'<!--<div id="Poll411SearchSpinner" class="Poll411SearchSpinner">-->',
					'<!--</div>-->',
					'<div>',
						'<form id="Poll411SearchForm" class="Poll411SearchForm" onsubmit="return Poll411Search.submit()">',
							'<div class="Poll411SearchTitle removehelp">',
								'<div style="margin-bottom:4px;">',
									//'Find your 2010 voting location and more.<br />',
									'Select your state for statewide election info:',
								'</div>',
							'</div>',
							'<div style="margin-bottom:4px;">',
								'<select id="Poll411SelectState" style="width:100%;">',
									'<option value="">',
										'&nbsp;',
									'</option>',
								'</select>',
							'</div>',
							'<div class="Poll411SearchTitle removehelp">',
								'<div style="margin:8px 0 4px;">',
									'Or enter your <strong>home</strong> address for local info:',
								'</div>',
							'</div>',
							'<table cellpadding="0" cellspacing="0" style="width:100%;">',
								'<tr>',
									'<td style="width:99%;">',
										'<div>',
											'<input id="Poll411SearchInput" class="Poll411SearchInput" type="text" value="',
												htmlEscape( ( params.home || '' ).replace( /!/g, ' ' ) ),
											'" />',
										'</div>',
									'</td>',
									'<td style="width:1%; padding-left:4px;">',
										'<div>',
											'<button type="submit" id="Poll411SearchButton" class="Poll411SearchButton">Search</button>',
										'</div>',
									'</td>',
								'</tr>',
							'</table>',
						'</form>',
					'</div>',
					'<div class="removehelp">',
						'<div style="margin-top:0.25em; font-size:90%;">',
							'Example: ',
							'<a style="" href="#" onclick="return Poll411Search.sample();">',
								htmlEscape( pref.example ),
							'</a>',
						'</div>',
					'</div>',
				'</div>',
				//backLink,
				'<div id="spinner">',
				'</div>',
				'<div id="wrapper">',
					'<div id="detailsbox">',
						attribution(),
					'</div>',
					'<div id="mapbox">',
					'</div>',
				'</div>',
			'</div>'
		);
	}
	else {
		document.write(
			'<div id="spinner">',
			'</div>',
			'<div id="wrapper">',
				'<div id="tabs" style="display:none;">',
				'</div>',
				'<div id="previewmap">',
				'</div>',
				'<div id="mapbox">',
				'</div>',
				'<div id="detailsbox" style="display:none;">',
				'</div>',
			'</div>'
		);
		
		document.body.scroll = 'no';
	}
}

// Document ready code

function makerReady() {
	analytics( 'creator' );
	
	var $getcode = $('#getcode'), $havecode = $('#havecode'), $codearea = $('#codearea');
	$codearea.height( height - 150 );
	center( $getcode );
	center( $havecode );
	
	function center( $item ) {
		$item.css({
			left: ( width - $item.width() ) / 2,
			top: ( height - $item.height() ) / 2
		});
	}
	
	T( 'style', variables, function( head ) {
		$('head').append( $(head) );
		var body =
			T( 'html', variables ) + '\n\n' +
			T( 'script', variables );
		$('#outerlimits').html( body ).height( height );
		$getcode.show();
		adjustHeight();
		$('#btnGetCode').click( function() {
			$codearea.val( head + '\n\n' + body + '\n' );
			$havecode.show();
			document.codeform.codearea.focus()
			document.codeform.codearea.select()
		});
	});
}

function gadgetReady() {
	
	function stateLocator() {
		var state = home.info.state;
		if( ! state  ||  state == stateUS ) return '';
		var url = state.gsx$wheretovote.$t;
		return url ? S(
			'<div style="margin:0.5em 0">',
				'Check your voting location on your<br />',
				'<a target="_blank" href="', url, '">',
					'State voting place locator',
				'</a>',
			'</div>'
		) : '';
	}
	
	function locationWarning() {
		var registered = home.info.state.abbr == 'ND' ? '' : S(
			'You must be registered in order to vote. '
		);
		var warning = interpolated ? S(
			registered,
			'Verify your voting location with your local election officials. ',
			//'This voting location is for the November 3 election only (not for early voting), and it is an estimate based on nearby addresses. ',
			//'This voting location is for the November 3 election only, and it is an estimate based on nearby addresses. ',
			'It may be incorrect and may change before election day.'
		) : S(
			registered,
			//'This voting location is for the March 2 election only, and it is only for voters registered at the home address entered. ',
			'This voting location is only for voters registered at the home address entered. ',
			'Please verify this voting location with your local election officials to ensure that it is correct.'
		);
		return S(
			'<div style="padding-top:.75em; font-size:90%;">',
				'<span style="font-weight:bold;">',
					'Important: ',
				'</span>',
				warning,
			'</div>'
		);
	}
	
	//function expander( link, body ) {
	//	return S(
	//		'<div>',
	//			'<div>',
	//				'<a href="#" onclick="return expandit(this);">',
	//					link,
	//				'</a>',
	//			'</div>',
	//			'<div style="display:none; margin:8px;">',
	//				body,
	//			'</div>',
	//		'</div>'
	//	);
	//}
	
	//expandit = function( node ) {
	//	 $(node).parent().next().slideDown('slow');
	//	 return false;
	//}
	
	function electionInfo() {
		var elections = [];
		var state = home && home.info && home.info.state;
		if( state  &&  state != stateUS ) {
			for( var i = 1;  i < 9;  ++i ) {
				var date = state['gsx$date'+i];
				if( date ) date = date.$t;
				if( date ) {
					date = dateFromMDY( date );
					if( date >= today )
						elections.push( perElectionInfo( state, date, state['gsx$type'+i].$t ) );
				}
			}
		}
		return S(
			generalInfo( state ),
			elections.join(''),
			infoLinks(),
			attribution()
		);
	}
	
	function generalInfo( state ) {
		
		var comments = state.gsx$comments.$t;
		if( comments ) comments = S(
			'<div style="margin-bottom:0.5em;">',
				comments,
			'</div>'
		);
		
		var absenteeLinkTitle = {
			//'Early': 'Absentee ballot and early voting information',
			'Early': 'Absentee ballot information',
			'Mail': 'Vote by mail information'
		}[state.gsx$absentee.$t] || 'Get an absentee ballot';
		
		var absentee = S(
			'<div style="margin-bottom:0.5em;">',
				fix( state.gsx$absenteeautomatic.$t == 'TRUE' ?
					'Any %S voter may vote by mail.' :
					'Some %S voters may qualify to vote by mail.'
				),
			'</div>',
			infolink( 'gsx$absenteeinfo', absenteeLinkTitle )
		);
		
		return S(
			'<div style="margin-bottom:0.5em;">',
				'<div class="heading" style="margin-bottom:0.75em;">',
					fix( 'How to vote in %S' ),
				'</div>',
				infolink( 'gsx$electionwebsite', '%S election website' ),
				infolink( 'gsx$areyouregistered', 'Are you registered to vote?' ),
				absentee,
				//infolink( 'gsx$registrationinfo', state.abbr == 'ND' ? '%S voter qualifications' : 'How to register in %S', true ),
				'<div style="margin:1.0em 0 0.5em 0;">',
					state.name, ' voter hotline: ',
					'<span style="white-space:nowrap;">',
						state.gsx$hotline.$t,
					'</span>',
				'</div>',
				comments,
				formatLeo(),
			'</div>'
		);
		
		function fix( text, prefix ) {
			return( text
				.replace( '%S', S(
					prefix && state.prefix ? state.prefix  + ' ' : '',
					state.name
				) )
				//.replace( '%C', S(
				//	home.info.county // TODO?
				//) )
			);
		}
		
		function infolink( key, text, prefix ) {
			var url = state[key].$t;
			return ! url ? '' : S(
				'<div style="margin-bottom:0.5em;">',
					'<a target="_blank" href="', url, '">',
						fix( text, prefix ),
					'</a>',
				'</div>'
			);
		}
		
		function formatLeo() {
			var leo = home.leo;
			return(
				! leo ? '' :
				leo.locality ? formatLeoList([ leo.locality ]) :
				formatLeoList([ leo.city, leo.county ])
			);
		}
		
		function formatLeoList( ids ) {
			var out = [];
			ids && ids.forEach( function( id ) {
				var leo = home.leo.leo.localities[id];
				if( ! leo ) return;
				var a = leo.address || {}, o = leo.official || {};
				out.push( S(
					'<div>',
						'<div style="margin-bottom:0.15em;">',
							linkIf( leo.name || '', leo.elections_url || '' ),
						'</div>',
						'<div>',
							a.location_name || '',
						'</div>',
						'<div>',
							a.line1 || '',
						'</div>',
						'<div>',
							a.line2 || '',
						'</div>',
						'<div>',
							a.city && a.state ? S( a.city, ', ', a.state, ' ', a.zip || '' ) : '',
						'</div>',
						'<div>',
							'<table cellspacing="0" cellpadding="0">',
								o.phone ? '<tr><td>Phone:&nbsp;</td><td>' + o.phone + '</td></tr>' : '',
								o.fax ? '<tr><td>Fax:&nbsp;</td><td>' + o.fax + '</td></tr>' : '',
							'</table>',
						'</div>',
						//leo.email ? S( '<div>', 'Email: ', linkto(leo.email), '</div>' ) : '',
						!( a.line1 && a.city && a.state && a.zip ) ? '' : S(
							'<div style="margin-top:0.1em;">',
							'</div>',
							directionsLink( home, {
								info: {
									accuracy: Accuracy.address,
									address: S(
										a.line1 ? a.line1 + ', ' : '',
										a.city, ', ', a.state, ' ', a.zip
									)
								}
							})
						),
					'</div>'
				) );
			});
			if( ! out.length ) return '';
			return S(
				'<div style="padding:0.5em 0 0.75em 0;">',
					'<div class="heading" style="margin-bottom:0.75em">',
						'Your Local Election Office',
					'</div>',
					out.length < 2 ? '' : S(
						'<div style="font-style:italic; margin-bottom:0.75em;">',
							'Your local election office is listed below, but we were unable to determine which one serves your location. Please contact both offices for more information:',
						'</div>'
					),
					out.join('<div style="padding:0.5em;"></div>'),
				'</div>'
			);
		}
	}
	
	function perElectionInfo( state, electionDay, electionName ) {
		
		var sameDay = state.gsx$sameday.$t != 'TRUE' ? '' : S(
			'<div style="margin-bottom:0.5em;">',
				state.name, ' residents may register to vote at their polling place on Election Day:<br />',
				formatDayDate( electionDay ),
			'</div>'
		);
		
		var deadlineText = {
			mail: {
				type: 'registration',
				mustbe: 'Registration must be postmarked by:<br />'
			},
			receive: {
				type: 'registration',
				mustbe: 'Election officials must receive your registration by:<br />'
			},
			inperson: {
				type: 'registration',
				mustbe: 'In person registration allowed through:<br />'
			},
			armail: {
				type: 'absentee ballot request',
				mustbe: 'Absentee ballot requests must be postmarked by:<br />'
			},
			arreceive: {
				type: 'absentee ballot request',
				mustbe: 'Election officials must receive your absentee ballot request by:<br />'
			},
			avmail: {
				type: 'completed absentee ballot',
				mustbe: 'Completed absentee ballots must be postmarked by:<br />'
			},
			avreceive: {
				type: 'completed absentee ballot',
				mustbe: 'Election officials must receive your completed absentee ballot by:<br />'
			}
		};
		
		var absentee = S(
			deadline( state, 'gsx$absrequestpostmark', 'armail' ),
			deadline( state, 'gsx$absrequestreceive', 'arreceive' ),
			deadline( state, 'gsx$absvotepostmark', 'avmail' ),
			deadline( state, 'gsx$absvotereceive', 'avreceive' )
		);
		var deadlines = (
			deadline( state, 'gsx$postmark', 'mail' )  || deadline( state, 'gsx$receive', 'receive' )
		) + deadline( state, 'gsx$inperson', 'inperson' );
		//if( ! deadlines  &&  state.abbr != 'ND'  &&  state.gsx$sameday.$t != 'TRUE' )
		//	deadlines = S(
		//		'<div style="margin-bottom:0.75em;">',
		//			'The deadline to mail your registration for the November 3, 2009 general election has passed. ',
		//			//state.gsx$regcomments.$t || '',
		//		'</div>'
		//	);
		return S(
			'<div style="margin-bottom:0.5em;">',
				'<div class="heading" style="margin:0.75em 0;">',
					formatDate(electionDay), ' ', electionName,
				'</div>',
				deadlines || '',
				'<div style="margin-bottom:1em;">',
					absentee,
				'</div>',
				sameDay,
				candidates(),
			'</div>'
		);
		
		function fix( text, prefix ) {
			return( text
				.replace( '%S', S(
					prefix && state.prefix ? state.prefix  + ' ' : '',
					state.name
				) )
				//.replace( '%C', S(
				//	home.info.county // TODO?
				//) )
			);
		}
		
		//function biglist() {
		//	return S(
		//		'<div style="margin-bottom:0.5em;">',
		//			states.mapjoin( function( state ) {
		//				return S(
		//					'<div>',
		//						'<b>', state.name, '</b>',
		//					'</div>',
		//					deadline( state, 'gsx$postmark', '' )
		//				);
		//			}),
		//		'</div>'
		//	);
		//}
		
		function deadline( state, key, type ) {
			var before = +state[key].$t;
			if( before == '' ) return '';
			if( before == -999 ) before = 0;
			var dt = deadlineText[type];
			var date = electionDay - before*days;
			var remain = Math.floor( ( date - today ) / days );
			if( remain < 0 ) return '';
			var sunday = type == 'mail'  &&  new Date(date).getDay() == 0;
			
			var sundayNote =
				! sunday ? '' :
				remain > 1 ?
					'Note: Most post offices are closed Sunday. Mail your ' + dt.type + ' by Saturday to be sure of a timely postmark.' :
				remain == 1 ?
					'Note: Most post offices are closed Sunday. Mail your ' + dt.type + ' today to be sure of a timely postmark.' :
				remain == 0 ?
					"Note: Most post offices are closed today. You can still mail your ' + dt.type + ' if your post office is open and has a collection today." :
					'';
			
			sundayNote = sundayNote && S(
				'<div style="margin-bottom:0.75em;">',
					sundayNote,
				'</div>'
			);
			
			var left = remain < 1 /* ||  sunday && remain < 2 */ ? S(
				' (Today!)'
			) : remain < 2 ? S(
				' (Tomorrow!)'
			) : remain < 31 ? S(
				' (', remain, ' days from now)'
			) : '';
			return S(
				'<div style="margin-bottom:0.75em;">',
					dt.mustbe, formatDayDate(date), left,
				'</div>',
				sundayNote
			);
		}
		
		function candidates() {
			var contests = vote && vote.poll && vote.poll.contests && vote.poll.contests[0];
			if( ! contests  ||  ! contests.length ) return '';
			contests = sortArrayBy( contests, 'ballot_placement', { numeric:true } );
			return S(
				'<div style="padding:0.5em 0;">',
					'<div class="heading" style="">',
						'Special Election Candidates',
					'</div>',
					'<div style="font-size:85%; font-style:italic; margin-top:0.5em">',
						'Candidates are listed in random order',
					'</div>',
					contests.mapjoin( function( contest ) {
						return S(
							'<div class="heading" style="xfont-size:110%; margin-top:0.5em">',
								contest.office,
							'</div>',
							contest.ballot.candidate.randomized().mapjoin( function( candidate ) {
								function party() {
									return candidate.party && ({
										'Governor': true,
										'Lieutenant Governor': true,
										'Attorney General': true,
										'Member House of Delegates': true
									})[contest.office] ? S(
										'<span style="color:#444; font-size:85%;">',
											' - ',
											candidate.party,
										'</span>'
									) : '';
								}
								return S(
									'<div>',
										linkIf( candidate.name, candidate.url ),
										party(),
									'</div>'
								);
							})
						);
					}),
				'</div>'
			);
		}
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
	
	function setVoteHtml() {
		if( ! vote.info ) {
			$details.append( log.print() );
			adjustHeight();
			return;
		}
		//var largeMapLink = mapplet ? '' : S(
		//	'<div style="padding-top:0.5em;">',
		//		'<a target="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=', encodeURIComponent( a.address.replace( / /g, '+' ) ), '&ie=UTF8&ll=', latlng, '&z=15&iwloc=addr">',
		//			'Large map and directions &#187;',
		//		'</a>',
		//	'</div>'
		//);
		var extra = home.info.latlng && vote.info.latlng ? directionsLink( home, vote ) : '';
		function location( infowindow ) {
			return formatLocation( vote.info,
				infowindow
					? { url:'vote-icon-50.png', width:50, height:50 }
					: { url:'vote-pin-icon.png', width:29, height:66 },
				'Your Voting Location', infowindow, extra
			);
		}
		if( mapplet ) {
			$details.append( longInfo() );
			vote.html = S(
				'<div style="', fontStyle, '">',
					location( true ),
					locationWarning(),
				'</div>'
			);
			adjustHeight();
		}
		else {
			$tabs.show();
			$details.html( longInfo() ).show();
			vote.html = infoWrap( S(
				log.print(),
				electionHeader,
				homeAndVote()//,
				//'<div style="padding-top:1em">',
				//'</div>',
				//electionInfo()
			) );
		}
		
		function homeAndVote() {
			return vote.info.latlng ? S(
				location( true ),
				'<div style="padding-top:0.75em;">',
					'<a href="#detailsbox" onclick="return selectTab(\'#detailsbox\');">View Candidates and Details</a>',
				'</div>'
				//stateLocator(),
				//locationWarning(),
				//'<div style="padding-top:0.75em">',
				//'</div>',
				//formatHome()
			) : S(
				formatHome(),
				//'<div style="padding-top:0.75em">',
				//'</div>',
				location()/*,
				locationWarning()*/
			);
		}
		
		function longInfo() {
			return S(
				log.print(),
				'<div>',
					electionHeader,
					'<div style="padding-top:0.75em">',
					'</div>',
					formatHome(),
					'<div style="padding-top:0.75em">',
					'</div>',
					location(),
					stateLocator(),
					locationWarning(),
					'<div style="padding-top:1em">',
					'</div>',
					electionInfo(),
				'</div>'
			);
		}
	}
	
	function infoWrap( html ) {
		return S(
			'<div style="', fontStyle, ' margin-top:12px; padding-right:4px; overflow:auto;">',
				html,
			'</div>'
		)
	}
	
	function initMap( go ) {
		if( mapplet ) {
			map = new GMap2;
			go();
		}
		else {
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
					map.addControl( new GSmallMapControl );
					map.addControl( new GMapTypeControl );
					go();
				}
			} });
		}
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
					html: mapplet || ! only ? formatHome(true) : vote.html || infoWrap( sorryHtml() )
				});
				if( vote.info  &&  vote.info.latlng )
					setMarker({
						place: vote,
						html: vote.html,
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
				maxWidth: mapplet ? 350 : Math.min( $map.width() - 100, 350 )
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
			
			if( ! mapplet ) {
				$tabs.html( tabLinks( initialMap() ? '#mapbox' : '#detailsbox' ) );
				$map.css({ visibility:'hidden' });
				setHeights();
				if( initialMap() ) {
					$map.show().css({ visibility:'visible' });
					$details.hide();
				}
				else {
					$map.hide();
					$details.show();
				}
			}
			
			if( ! hi ) return;
			if( vi  &&  vi.latlng ) {
				var directions = new GDirections( null/*, $directions[0]*/ );
				GEvent.addListener( directions, 'load', function() {
					GAsync( directions, 'getBounds', 'getPolyline', function( bounds, polyline ) {
						var ne = bounds.getNorthEast();
						var sw = bounds.getSouthWest();
						var n = ne.lat(), e = ne.lng(), s = sw.lat(), w = sw.lng();
						var  latpad = ( n - s ) / 4;
						var lngpad = ( e - w )  / 4;
						bounds = new GLatLngBounds(
							new GLatLng( s - latpad, w - lngpad ),
							new GLatLng( n + latpad*2, e + lngpad )
						);
						GAsync( map, 'getBoundsZoomLevel', [ bounds ], function( zoom ) {
							map.setCenter( bounds.getCenter(), Math.min(zoom,16) );
							map.addOverlay( polyline );
						});
					});
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
			
			if( mapplet ) {
				GEvent.addListener( map, 'click', function( overlay, point ) {
					if( !( overlay || point ) )
						analytics( 'directions' );
				});
			}
			else {
				// Move map down a bit
				//var point = map.fromLatLngToDivPixel( latlng );
				//point = new GPoint(
				//	point.x /*- width * .075*/,
				//	point.y - height * .275
				//);
				//map.setCenter( map.fromDivPixelToLatLng(point), a.zoom );
			}
			
			ready();
			spin( false );
		}
	}
	
	function formatLocation( info, icon, title, infowindow, extra ) {
		var special =
			info.address != '703 E Grace St, Richmond, VA 23219' ? '' :
			'<div style="font-size:90%; margin-bottom:0.25em;">GOVERNOR\'S MANSION</div>';
		var locality = info.city ? info.city : info.county ? info.county + ' County' : '';
		var addr = S(
			'<div>',
				special,
				info.location ? '<strong>' + htmlEscape(info.location) + '</strong><br />' : '',
				info.description ? '<span style="font-size:90%">' + htmlEscape(info.description) + '</span><br />' : '',
				'<div style="margin-top:', info.location || info.description ? '0.25' : '0', 'em;">',
					info.street,
				'</div>',
			'</div>',
			'<div>',
				locality ? locality  + ', ' + info.state.abbr : info.address.length > 2 ? info.address : info.state.name,
				info.zip ? ' ' + info.zip : '',
			'</div>'
		);
		var select = includeMap() ? ' onclick="return maybeSelectTab(\'#mapbox\',event);" style="cursor:pointer;"' : ''
		return S(
			'<div', select, '>',
				'<div style="font-weight:bold; font-size:110%;">',
					title,
				'</div>',
				'<div style="padding:0.5em 0;">',
					'<table cellpadding="0" cellspacing="0">',
						'<tr valign="top">',
							'<td style="width:20px; padding:2px .75em 0 0;">',
								'<img src="', imgUrl(icon.url), '" style="width:', icon.width, 'px; height:', icon.height, 'px;" />',
							'</td>',
							'<td>',
								addr,
								'<div>',
									info.directions || '',
								'</div>',
								'<div>',
									info.hours ? 'Hours: ' + info.hours : '',
								'</div>',
								extra,
							'</td>',
						'</tr>',
					'</table>',
					info.latlng ? '' : S(
						'<div style="padding-top: 0.5em">',
							'We were unable to locate this voting place on the map. ',
							'Please check with your election officals for the exact address.',
						'</div>'
					),
				'</div>',
			'</div>'
		);
	}
	
	function spin( yes ) {
		//console.log( 'spin', yes );
		$('#spinner').css({ visibility: yes ? 'visible' : 'hidden' });
	}
	
	function geocode( address, callback ) {
		var geocoder = new GClientGeocoder();
		geocoder[ mapplet ? 'getLocationsAsync' : 'getLocations' ]( address, callback );
	}
	
	function getleo( home, callback ) {
		var info = home.info;
		
		gem.leoReady = function( leo ) {
			var city = info.city.toUpperCase(), county = info.county.toUpperCase();
			home.leo = {
				leo: leo,
				city: leo.cities[city],
				county: leo.counties[county] || leo.cities[county]
			};
			if( leo.city == leo.county ) delete leo.county;
			callback();
		};
		
		var url = S( opt.baseUrl, 'leo/', info.state.abbr.toLowerCase(), '-leo.js' );
		$.getScript( cacheUrl( url, 60 ) );
		
	}
	
	function pollingApi( address, normalize, callback ) {
		var url = S(
			'http://pollinglocation.apis.google.com/?',
			normalize ? 'normalize=1&' : '',
			'q=', encodeURIComponent(address)
		);
		getJSON( url, function( poll ) {
			callback( typeof poll == 'object' ? poll : { status:"ERROR" } );
		});
	}
	
	function lookupPollingPlace( inputAddress, info, callback ) {
		function ok( poll ) { return ! poll.status; }
		function countyAddress() {
			return S( info.street, ', ', info.county, ', ', info.state.abbr, ' ', info.zip );
		}
		if( info.place.address == '1600 Pennsylvania Ave NW, Washington, DC 20500, USA' ) {
			callback({
				locations: [
					[{
						address: {
							line1: '600 22nd St NW',
							city: 'Washington',
							state: 'DC',
							zip: '20037',
							location_name: 'George Washington University'
						},
						description: "The Smith Center-80's Club Room"
					}]
				]
			});
			return;
		}
		pollingApi( info.place.address, false, function( poll ) {
			if( ok(poll) )
				callback( poll );
			else
				//pollingApi( countyAddress(), false, function( poll ) {
				//	if( ok(poll)  ||  ! inputAddress  )
				//		callback( poll );
				//	else
						pollingApi( inputAddress, true, callback );
				//});
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
	
	function closehelp( callback ) {
		if( ! mapplet )
			return callback();
		
		var $remove = $('.removehelp');
		if( $remove.is(':hidden') )
			return callback();
		
		if( $.browser.msie ) {
			$remove.hide();
			return callback();
		}
		
		var count = $remove.length;
		$remove.slideUp( 350, function() {
			if( --count == 0 ) callback();
		});
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
				$map.hide().css({ visibility:'hidden' });
				$search.slideUp( 250, function() {
					$spinner.show();
					submit( input.value );
				});
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
			var state = statesByAbbr[ addr.toUpperCase() ];
			if( state ) addr = state.name;
			if( addr == pref.example ) addr = addr.replace( /^.*: /, '' );
			home = {};
			vote = {};
			map && map.clearOverlays();
			$spinner.show();
			$details.empty();
			closehelp( function() {
				geocode( addr, function( geo ) {
					var places = geo && geo.Placemark;
					var n = places && places.length;
					log( 'Number of matches: ' + n );
					if( ! n ) {
						spin( false );
						detailsOnly( S(
							log.print(),
							'We did not find that address. Please check the spelling and try again. Be sure to include your zip code or city and state.'
						) );
					}
					else if( n == 1 ) {
						findPrecinct( geo, places[0], addr );
					}
					else {
						if( places ) {
							detailsOnly( S(
								'<div id="radios">',
									'<div id="radios" style="padding-top:0.5em;">',
										'<strong>Select your address:</strong>',
									'</div>',
								'</div>'
							) );
							var $radios = $('#radios');
							$radios.append( formatPlaces(places) );
							adjustHeight();
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
			});
		}
		
		submitReady();
	}
	
	function setHeights() {
		var formHeight = $('#Poll411Gadget').visibleHeight();
		if( formHeight ) formHeight += 8;  // TODO: WHY DO WE NEED THIS?
		var height = Math.floor(
			$window.height() - formHeight - $tabs.visibleHeight()
		);
		$map.height( height );
		$details.height( height );
	}
	
	$(window).resize( setHeights );
	
	function detailsOnly( html ) {
		if( ! mapplet ) {
			$tabs.html( S(
				'<div id="tablinks">',
					'<span class="#detailsbox" style="display:none;"></span>',
					'<a href="#Poll411Gadget">Search Again</a>',
				'</div>'
			) ).show();
			setHeights();
		}
		$map.hide();
		$details.html( html ).show();
		adjustHeight();
		spin( false );
	}
	
	function formatHome( infowindow ) {
		return S(
			'<div style="', fontStyle, '">',
				formatLocation( home.info,
					infowindow
						? { url:'home-icon-50.png', width:50, height:50 }
						: { url:'home-pin-icon.png', width:29, height:57 },
					'Your ' + home.info.kind, infowindow
				),
				//extra ? electionInfo() : '',
			'</div>'
		);
	}
	
	function findPrecinct( geo, place, inputAddress ) {
		log( 'Getting home map info' );
		home.info = mapInfo( geo, place );
		if( ! home.info  /*||  home.info.accuracy < Accuracy.address*/ ) { sorry(); return; }
		$selectState.val( home.info.state.abbr );
		var location;
		
		getleo( home, function() {
			lookupPollingPlace( inputAddress, home.info, function( poll ) {
				vote.poll = poll;
				log( 'API status code: ' + poll.status || '(OK)' );
				var locations = poll.locations && poll.locations[0];
				var location = locations && locations[0];
				var address = location && location.address;
				if( ! address )
					poll.status = 'TEMP_NO_ADDRESS';
				if( poll.status ) {
					sorry();
				}
				else {
					// TODO:
					//interpolated = ( poll.errorcode == 3 );
					home.leo.locality = '' + poll.locality;
					var addr = S(
						address.line1 ? address.line1 + ', ' : '',
						address.line2 ? address.line2 + ', ' : '',
						address.city, ', ', address.state,
						address.zip ? ' ' + address.zip.slice(0,5) : ''
					);
					log( 'Polling address:', addr );
					geocode( addr, function( geo ) {
						var places = geo && geo.Placemark;
						set( geo, places, location, addr );
					});
				}
			});
		});
		
		function set( geo, places, location, address ) {
			//if( places && places.length == 1 ) {
			if( places && places.length >= 1 ) {
				if( places.length > 1  &&  address != '1500 E Main St  Richmond, VA 23219-3634' ) {
					setNoGeo( location );
					return;
				}
				try {
					var details = places[0].AddressDetails;
					var abbr = details.Country.AdministrativeArea.AdministrativeAreaName;
					var st = statesByName[abbr] || statesByAbbr[ abbr.toUpperCase() ];
					log( 'Polling state: ' + st.name );
					if( st != home.info.state ) {
						log( 'Polling place geocoded to wrong state' );
						setNoGeo( location );
						return;
					}
					if( details.Accuracy < Accuracy.intersection ) {
						log( 'Polling place geocoding not accurate enough' );
						setNoGeo( location );
						return;
					}
				}
				catch( e ) {
					log( 'Error getting polling state' );
				}
				log( 'Getting polling place map info' );
				setMap( vote.info = mapInfo( geo, places[0], location ) );
				return;
			}
			setNoGeo( location );
		}
		
		function setNoGeo( location ) {
			vote.info = {
				address: ( location.address || '' ).replace( / *, */g, '<br />' ),
				location: location.address && location.address.location_name,
				description: location.description,
				directions: location.directions,
				hours: location.hours,
				_:''
			};
			setVoteHtml();
			forceDetails();
		}
	}
	
	function sorry() {
		$details.html( log.print() + sorryHtml() );
		forceDetails();
	}
	
	function forceDetails() {
		setMap( home.info );
		if( ! mapplet ) {
			$map.hide();
			$tabs.html( tabLinks('#detailsbox') ).show();
		}
		$details.show();
		adjustHeight();
		spin( false );
	}
	
	function sorryHtml() {
		return home && home.info ? S(
			'<div>',
				formatHome(),
				//'<div style="padding-top:0.75em">',
				//'</div>',
				//'<div style="margin-bottom:1em;">',
				//	'We are unable to provide voting location information for your address at this time. ',
				//	'Please check with your state or local election officials to find your voting location.',
				//'</div>',
				stateLocator(),
				electionInfo(),
			'</div>'
		) : S(
			'<div>',
				//'This application has information for the November 3 Virginia general election only (not for early voting or elections in other states).',
				'This application has information for the March 2 Virginia special election only, not for elections in other states.',
			'</div>'
		);
	}
	
	function setMap( a ) {
		if( ! a ) return;
		if( ! mapplet ) {
			a.width = $map.width();
			$map.show().height( a.height = Math.floor( $window.height() - $map.offset().top ) );
		}
		loadMap( a );
	}
	
	function formatAddress( address ) {
		return htmlEscape( ( address || '' ).replace( /, USA$/, '' ) );
	}
	
	function formatPlaces( places ) {
		if( ! places ) return sorryHtml();
		
		var checked = '';
		if( places.length == 1 ) checked = 'checked="checked" ';
		else spin( false );
		var list = places.map( function( place, i ) {
			var id = 'Poll411SearchPlaceRadio-' + i;
			place.extra = { index:i, id:id };
			return S(
				'<tr class="Poll411SearchPlace" style="vertical-align:top;">',
					'<td style="width:1%; padding:2px 0;">',
						'<input type="radio" ', checked, 'name="Poll411SearchPlaceRadio" class="Poll411SearchPlaceRadio" id="', id, '" />',
					'</td>',
					'<td style="width:99%; padding:5px 0 2px 2px;">',
						'<div>',
							'<label for="', id, '" class="Poll411SearchPlaceAddress">',
								formatAddress(place.address),
							'</label>',
						'</div>',
					'</td>',
				'</tr>'
			);
		});
		
		return S(
			'<table id="Poll411SearchPlaces" cellspacing="0">',
				list.join(''),
			'</table>'
		);
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
			location: extra.location,
			description: extra.description,
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
	
	function setFiller() {
		function makePaths( poly ) {
			return 'path=weight:2|color:0x000000B0|fillcolor:0x00000010|enc:' + poly.encoded;
		}
		var filler = '';
		if( iframe ) {
			var w = $map.width(), h = Math.floor( $window.height() - $map.offset().top );
			if( w * h == 0 ) return;
			filler = S(
				'<div style="position:relative;">',
					// US:
					//'<img style="width:', w, 'px; height:', h, 'px; border:none;" src="http://maps.google.com/staticmap?center=38,-95.9&span=26.9,52.7&size=', w, 'x', h, '&key=', key, '" />'
					// VA:
					// TODO: Get encoded polyline working!
					'<img style="width:', w, 'px; height:', h, 'px; border:none;" src="http://maps.google.com/maps/api/staticmap?sensor=false&size=', w, 'x', h, '&key=', key, '&', stateOutlinePolys.map(makePaths).join('&'), '" />',
					pref.logo ?
						'<img style="position:absolute; left:0; top:0;" src="' + _IG_GetCachedUrl(pref.logo) + '" />' : '',
				'</div>'
			);
			$previewmap.html( filler );
		}
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
	
	selectTab = function( tab ) {
		if( mapplet ) return false;
		analytics( tab );
		$( $tabs.find('span')[0].className ).hide();
		if( tab == '#Poll411Gadget' ) {
			$details.empty();
			$tabs.hide();
			$spinner.css({ display:'none' });
			$map.hide();
			$search.slideDown( 250, function() {
				//$previewmap.show();
				setHeights();
				$map.show();
			});
		}
		else {
			$(tab).show().css({ visibility:'visible' });
			$tabs.html( tabLinks(tab) );
		}
		return false;
	};
	
	maybeSelectTab = function( tab, event ) {
		event = event || window.event;
		var target = event.target || event.srcElement;
		if( target.tagName.toLowerCase() != 'a' ) return selectTab( tab );
		return true;
	};
	
	var $search,
		$selectState,
		$tabs = $('#tabs'),
		$previewmap = $('#previewmap'),
		$map = $('#mapbox'),
		$details = $('#detailsbox'),
		$spinner = $('#spinner'),
		$directions = $('#directions');
	
	T( 'style', variables, function( head ) {
		if( ! mapplet ) {
			$('head').append( $(head) );
			$('body').prepend( T( 'html', variables ) );
			$search = $('#Poll411Gadget');
			if( pref.ready ) $search.hide();
			else setGadgetPoll411();
			setHeights();
		}
		
		$selectState = $('#Poll411SelectState');
		
		// http://spreadsheets.google.com/feeds/list/p9CuB_zeAq5X-twnx_mdbKg/2/public/values?alt=json
		var stateSheet = dataUrl + 'leo/states-spreadsheet.json';
		
		getJSON( stateSheet, sheetReady, 300 );
		function sheetReady( json ) {
			json.feed.entry.forEach( function( state ) {
				statesByAbbr[ state.abbr = state.gsx$abbr.$t ] = state;
				statesByName[ state.name = state.gsx$name.$t ] = state;
				states.push( state );
				$selectState.append( S(
					'<option value="', state.abbr, '">',
						state.name,
					'</option>'
				) );
			});
			
			indexSpecialStates();
			
			function polyState( abbr ) {
				gem.currentAbbr = abbr = abbr.toLowerCase();
				gem.shapeReady = function( json ) {
					if( json.state != gem.currentAbbr ) return;
					map.clearOverlays();
					json.shapes.forEach( function( poly ) {
						poly.points.push( poly.points[0] );
						var polygon = new GPolygon( poly.points, '#000000', 2, .7, '#000000', .07 );
						map.addOverlay( polygon );
					});
				};
				$.getScript( cacheUrl( S( opt.baseUrl, 'shapes/json/', abbr, '.js' ) ) );
			}
			
			zoomTo = function( abbr ) {
				if( ! abbr ) return;
				abbr = abbr.toUpperCase();
				var state = abbr == 'US' ? stateUS : statesByAbbr[abbr];
				if( ! state ) return;
				$('#Poll411SearchInput').val('');
				$selectState.val( abbr );
				home = { info:{ state:state }, leo:{ leo:{ localities:{} } } };
				vote = null;
				if( state != stateUS ) $details.html( electionInfo() );
				adjustHeight();
				function latlng( lat, lng ) { return new GLatLng( +lat.$t, +lng.$t ) }
				var bounds = new GLatLngBounds(
					latlng( state.gsx$south, state.gsx$west ),
					latlng( state.gsx$north, state.gsx$east )
				);
				GAsync( map, 'getBoundsZoomLevel', [ bounds ], function( zoom ) {
					map.setCenter( bounds.getCenter(), zoom );
					polyState( abbr );
				});
			}
			
			var abbr = pref.state;
			if( ! abbr ) {
				var loc = google.loader && google.loader.ClientLocation;
				var address = loc && loc.address;
				if( address  &&  address.country == 'USA' ) abbr = address.region;
			}
			
			initMap( function() {
				$selectState.bind( 'change keyup', function( event ) {
					zoomTo( $selectState.val() );
				});
				
				if( mapplet ) {
					zoomTo( abbr );
					
					(function() {
						function e( id ) { return document.getElementById('Poll411Search'+id); }
						var /*spinner = e('Spinner'),*/ /*label = e('Label'),*/ input = e('Input'), button = e('Button');
						button.disabled = false;
						
						window.Poll411Search = {
							
							focus: function() {
								//label.style.textIndent = '-1000px';
							},
							
							blur: function() {
								//if( input.value === '' )
								//	label.style.textIndent = '0px';
							},
							
							sample: function() {
								input.value = pref.example;
								this.submit();
								return false;
							},
							
							submit: function() {
								//spinner.style.backgroundPosition = '0px 0px';
								if( ! input.value ) input.value = pref.example;
								submit( input.value );
								return false;
							}
						};
						
						Poll411Search.focus();
						Poll411Search.blur();
						if( params.home )
							Poll411Search.submit();
						else
							input.focus();
					})();
				}
				else {
					setupTabs();
					if( pref.ready )
						submit( pref.address || pref.example );
					else
						zoomTo( abbr );
				}
			});
		}
	});
	
	analytics( 'view' );
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
	return log.yes ? S( '<div style="padding:4px; margin-bottom:4px; border:1px solid red;">', log.log.join('<br />'), '</div>' ) : '';
}

// Final initialization

maker && inline ? makerWrite() : gadgetWrite();
$(function() {
	maker && inline ? makerReady() : gadgetReady();
	$('body').click( function( event ) {
		var target = event.target;
		if( $(target).is('a') )
			analytics( $(target).attr('href') );
	});
});

})();
