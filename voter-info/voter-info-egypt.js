// voter-info-egypt.js
// By Michael Geary - http://mg.to/
// See UNLICENSE or http://unlicense.org/ for public domain notice.

// Language and prefs

var defaultLanguage = 'ar';
var supportedLanguages = {
	ar: 'عربي',
	en: 'English',
	fr: 'Français',
	_: null
};

var prefs = new _IG_Prefs();
var pref = {
	lang: prefs.getString( '.lang' )
};

if( ! supportedLanguages[pref.lang] )
	pref.lang = defaultLanguage;

function loadStrings( strings ) {
	pref.strings = strings;
}

opt.writeScript( 'locale/lang-' + pref.lang + '.js' );

function localPrefs( pref ) {
}

var initialBbox = [ 22.6066970, 21.61291460, 38.9982990, 31.79954240 ];

// Output formatters

function attribution() {
	return T( 'attribution' );
}

function locationWarning() {
	return vote.locations && vote.locations.length ?
		T('locationWarning') :
		'';
}

function electionInfo() {
	var elections = [];
	return S(
		generalInfo(),
		elections.join(''),
		infoLinks(),
		attribution()
	);
}

function generalInfo() {
	return S(
		'<div style="margin-bottom:0.5em;">',
		'</div>'
	);
}

function perElectionInfo( state, electionDay, electionName ) {
	
	var cands = candidates();
	return cands ? S(
		'<div style="margin-bottom:0.5em;">',
			'<div class="heading" style="margin:0.75em 0;">',
				formatDate(electionDay), ' ', electionName,
			'</div>',
			cands,
		'</div>'
	) : '';
	
	function candidates() {
		var contests = getContests();
		if( ! contests ) return '';
		contests = sortArrayBy( contests, 'ballot_placement', { numeric:true } );
		var randomize = contests[0].ballot.candidate[0].order_on_ballot == null;
		var randomizedMessage = ! randomize ? '' : S(
			'<div style="font-size:85%; font-style:italic; margin-top:0.5em">',
				T('candidateRandomOrder'),
			'</div>'
		);
		return S(
			'<div>',
				randomizedMessage,
				contests.mapjoin( function( contest ) {
					var candidates = contest.ballot.candidate;
					candidates = randomize ?
						candidates.randomized() :
						sortArrayBy( candidates, 'order_on_ballot', { numeric:true } );
						
					return S(
						'<div class="heading" style="xfont-size:110%; margin-top:0.5em">',
							contest.office,
						'</div>',
						candidates.mapjoin( function( candidate ) {
							function party() {
								return candidate.party ? S(
									'<span style="color:#444; font-size:85%;">',
										' - ',
										candidate.party,
									'</span>'
								) : '';
							}
							return S(
								'<div>',
									linkIf( candidate.name, candidate.candidate_url ),
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

function setVoteHtml() {
	if( !( vote.info || vote.locations ) ) {
		$details.append( log.print() );
		return;
	}
	//var largeMapLink = S(
	//	'<div style="padding-top:0.5em;">',
	//		'<a target="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=', encodeURIComponent( a.address.replace( / /g, '+' ) ), '&ie=UTF8&ll=', latlng, '&z=15&iwloc=addr">',
	//			'Large map and directions &#187;',
	//		'</a>',
	//	'</div>'
	//);
	
	function voteLocation( infowindow ) {
		var loc = T('yourVotingLocation');
		if( !( vote.locations && vote.locations.length ) )
			return '';
		if( vote.info )
			return formatLocations( vote.locations, null,
				infowindow
					? { url:'vote-icon-50.png', width:50, height:50 }
					: { url:'vote-pin-icon.png', width:29, height:66 },
				loc, infowindow, '', true
			);
		return infowindow ? '' : formatLocations( vote.locations, null,
			{ url:'vote-icon-32.png', width:32, height:32 },
			loc + ( vote.locations.length > 1 ? 's' : '' ), false, '', false
		);
	}
	
	if( ! sidebar ) $tabs.show();
	$details.html( longInfo() ).show();
	vote.html = infoWrap( S(
		log.print(),
		electionHeader(),
		homeAndVote()//,
		//'<div style="padding-top:1em">',
		//'</div>',
		//electionInfo()
	) );
	vote.htmlInfowindow = infoWrap( S(
		log.print(),
		electionHeader(),
		homeAndVote( true )//,
		//'<div style="padding-top:1em">',
		//'</div>',
		//electionInfo()
	) );
	
	function homeAndVote( infowindow ) {
		var viewMessage = getContests() ?
			T('viewCandidates') :
			T('viewDetails');
		var viewLink = sidebar ? '' : S(
			'<div style="padding-top:0.75em;">',
				'<a href="#detailsbox" onclick="return selectTab(\'#detailsbox\');">',
					viewMessage,
				'</a>',
			'</div>'
		);
		return vote.info && vote.info.latlng ? S(
			voteLocation( true ),
			viewLink
			//locationWarning(),
			//'<div style="padding-top:0.75em">',
			//'</div>',
		) : S(
			//'<div style="padding-top:0.75em">',
			//'</div>',
			voteLocation( infowindow )/*,
			locationWarning()*/
		);
	}
	
	function longInfo() {
		return T( 'longInfo', {
			log: log.print(),
			header: electionHeader(),
			location: voteLocation(),
			warning: locationWarning(),
			info: electionInfo()
		});
	}
}

function getContests() {
	var contests = vote && vote.poll && vote.poll.contests && vote.poll.contests[0];
	return contests && contests.length && contests;
}

function formatLocations( locations, info, icon, title, infowindow, extra, mapped ) {
	
	function formatLocationRow( info ) {
		var address = T( 'address', {
			location: H( info.location ),
			address: multiLineAddress( info.address )
		});
		return T( 'locationRow', {
			iconSrc: imgUrl(icon.url),
			iconWidth: icon.width,
			iconHeight: icon.height,
			address: address,
			directions: info.directions || '',
			hours: info.hours ? 'Hours: ' + info.hours : '',
			extra: extra || ''
		});
	}
	
	var rows = info ?
		[ formatLocationRow(info) ] :
		locations.map( function( location ) {
			var a = location.address;
			return formatLocationRow({
				location: a && a.location_name || '',
				directions: location.directions || '',
				hours: location.pollinghours || '',
				address: a
			});
		});
	
	return S(
		T( 'locationHead', {
			select: includeMap() ? 'onclick="return maybeSelectTab(\'#mapbox\',event);" style="cursor:pointer;"' : '',
			title: title
		}),
		rows.join(''),
		T( 'locationFoot', {
			unable: info && info.latlng || mapped ? '' : T('locationUnable')
		})
	);
}

// Set up map and sidebar when the polling place location is known
function setVoteGeo( places, address, location) {
	//if( places && places.length == 1 ) {
	if( places && places.length >= 1 ) {
		// More than one place, use first match only if it has address
		// accuracy and the remaining matches don't
		//if( places.length > 1 ) {
		//	if( places[0].AddressDetails.Accuracy < Accuracy.address ) {
		//		setVoteNoGeo();
		//		return;
		//	}
		//	for( var place, i = 0;  place = places[++i]; ) {
		//		if( places[i].AddressDetails.Accuracy >= Accuracy.address ) {
		//			setVoteNoGeo();
		//			return;
		//		}
		//	}
		//}
		try {
			var place = places[0];
			if( location.latitude && location.longitude )
				place.geometry.location =
					new gm.LatLng( location.latitude, location.longitude );
		}
		catch( e ) {
			log( 'Error getting polling state' );
		}
		log( 'Getting polling place map info' );
		setMap( vote.info = mapInfo( place, vote.locations[0] ) );
		return;
	}
	setVoteNoGeo();
}

// Set up map and sidebar with no polling place location
function setVoteNoGeo() {
	setVoteHtml();
	forceDetails();
}

// Return a single line formatted address, from either a string or
// an address object
function oneLineAddress( address ) {
	if( ! address )
		return '';
	//if( typeof address == 'string' )
	//	return H(address).replace( /, USA$/, '' );
	return H( S(
		address.line1 ? address.line1 + ', ' : '',
		address.line2 ? address.line2 + ', ' : '',
		address.city, ', ', address.state,
		address.zip ? ' ' + address.zip : ''
	) );
}

// Return a multiline formatted address, from either a string or
// an address object
function multiLineAddress( address ) {
	if( ! address )
		return '';
	if( typeof address == 'string' )
		return H(address)
			//.replace( /, USA$/, '' )
			.replace( /, (\w\w) /, '\| $1 ' )
			.replace( /, /g, '<br>' )
			.replace( /\|/g, ',' );
	return S(
		address.line1 ? H(address.line1) + '<br>' : '',
		address.line2 ? H(address.line2) + '<br>' : '',
		H(address.city), ', ', H(address.state),
		address.zip ? ' ' + H(address.zip) : ''
	);
}

// Apply any local fixups to an address
function fixInputAddress( addr ) {
	//if( addr == pref.example )
	//	addr = addr.replace( /^.*: /, '' );
	return addr;
}

// Geocoding and Election Center API

function lookupPollingPlace( inputAddress, info, callback ) {
	function ok( poll ) { return poll.status == 'SUCCESS'; }
	function countyAddress() {
		return S( info.street, ', ', info.county, ', ', info.state.abbr, ' ', info.zip );
	}
	pollingApi( info.place.formatted_address, function( poll ) {
		if( ok(poll) )
			callback( poll );
		else
			pollingApi( inputAddress, callback );
	});
}

function findPrecinct( place, inputAddress ) {
	lookupPollingPlace( inputAddress, home.info, function( poll ) {
		log( 'API status code: ' + poll.status || '(OK)' );
		vote.poll = poll;
		var norm = poll.normalized_input;
		var locations = vote.locations = poll.locations && poll.locations[0];
		if( poll.status != 'SUCCESS'  ||  ! locations  ||  ! locations.length ) {
			sorry();
			return;
		}
		if( locations.length > 1 ) {
			log( 'Multiple polling locations' );
			setVoteNoGeo();
			return;
		}
		var location = locations[0], address = location.address;
		if(
			( address.line1 || address.line2 )  &&
			( ( address.city && address.state ) || address.zip )
		) {
			var addr = oneLineAddress( address );
			log( 'Polling address:', addr );
			geocode( addr, function( places ) {
				setVoteGeo( places, addr, location );
			});
		}
		else {
			log( 'No polling address' );
			setVoteNoGeo();
		}
	});
}

// Gadget initialization

function zoomTo( bbox ) {
	var bounds = new gm.LatLngBounds(
		new gm.LatLng( bbox[1], bbox[0] ),
		new gm.LatLng( bbox[3], bbox[2] )
	);
	map.fitBounds( bounds );
}

function gadgetReady( json ) {
	initMap( function() {
		setupTabs();
		if( pref.ready )
			submit( pref.address || pref.example );
		else
			zoomTo( initialBbox );
	});
}
