// voter-info-usa.js
// By Michael Geary - http://mg.to/
// See UNLICENSE or http://unlicense.org/ for public domain notice.

// Language and prefs

var defaultLanguage = 'en';
var supportedLanguages = {
	en: 'English',
	//es: 'Español',
	_: null
};

var prefs = new _IG_Prefs();
var pref = {
	country: prefs.getString( '.country' ),
	lang: prefs.getString( '.lang' )
};

if( ! supportedLanguages[pref.lang] )
	pref.lang = defaultLanguage;

function loadStrings( strings ) {
	pref.strings = strings;
}

opt.writeScript( 'locale/lang-' + pref.lang + '.js' );

function localPrefs( pref ) {
	if( pref.example in {
		'Enter your home address':1  // onebox sends us this on a no-entry click
	}) {
		pref.example = 'Ex: 1600 Pennsylvania Ave, Washington DC';
		pref.ready = false;
	}
}

// State data

var _states = [
	'AL|Alabama',
	'AK|Alaska',
	'AZ|Arizona',
	'AR|Arkansas',
	'CA|California',
	'CO|Colorado',
	'CT|Connecticut',
	'DE|Delaware',
	'DC|District of Columbia',
	'FL|Florida',
	'GA|Georgia',
	'HI|Hawaii',
	'ID|Idaho',
	'IL|Illinois',
	'IN|Indiana',
	'IA|Iowa',
	'KS|Kansas',
	'KY|Kentucky',
	'LA|Louisiana',
	'ME|Maine',
	'MD|Maryland',
	'MA|Massachusetts',
	'MI|Michigan',
	'MN|Minnesota',
	'MS|Mississippi',
	'MO|Missouri',
	'MT|Montana',
	'NE|Nebraska',
	'NV|Nevada',
	'NH|New Hampshire',
	'NJ|New Jersey',
	'NM|New Mexico',
	'NY|New York',
	'NC|North Carolina',
	'ND|North Dakota',
	'OH|Ohio',
	'OK|Oklahoma',
	'OR|Oregon',
	'PA|Pennsylvania',
	'RI|Rhode Island',
	'SC|South Carolina',
	'SD|South Dakota',
	'TN|Tennessee',
	'TX|Texas',
	'UT|Utah',
	'VT|Vermont',
	'VA|Virginia',
	'WA|Washington',
	'WV|West Virginia',
	'WI|Wisconsin',
	'WY|Wyoming'
];

var stateUS = {
	abbr: 'US',  name: 'United States',
	coord_south: 24.5457,  coord_west: -124.7284,
	coord_north: 49.3836,  coord_east: -66.9522
};

var states = [];
var statesByAbbr = {};
var statesByName = {};
var statesByUpperName = {};

function stateByAbbr( abbr ) {
	if( typeof abbr != 'string' ) return abbr;
	abbr = $.trim( abbr ).toUpperCase();
	return(
		statesByAbbr[abbr] ||
		statesByUpperName[abbr] ||
		stateUS
	);
}

function initStates() {
	for( var str, i = -1;  str = _states[++i]; ) {
		var s = str.split('|');
		var state = { abbr:s[0], name:s[1] };
		statesByAbbr[state.abbr] = state;
		statesByName[state.name] = state;
		statesByUpperName[state.name.toUpperCase()] = state;
		states.push( state );
	}
	
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

function getPlaceState( place ) {
	if( ! place ) return null;
	var component =
		getAddressComponent( place, 'administrative_area_level_1' );
	var abbr = component && component.short_name || '';
	return statesByAbbr[ abbr.toUpperCase() ];
}

function loadState( abbr, callback ) {
	if( ! abbr ) return;
	abbr = abbr.toUpperCase();
	if( abbr == 'US' ) { callback(stateUS);  return; }
	var state = statesByAbbr[abbr];
	if( ! state ) return;
	if( state.state_abbr ) { callback(state);  return; }
	
	// TEMP HACK
	if( state.abbr == 'KS' )
		abbr = 'KS 66050';
	// END HACK
	
	pollingApiState( abbr, function( poll ) {
		if( pollOK(poll) )
			callback( state );
	}, {
		electionId: 1766,  // TEMP TEST
		noaddress: true
	});
}

// Output formatters

function attribution() {
	var special = {
		VA: T('attributionVA')
	}[ home && home.info && home.info.state && home.info.state.abbr ] || '';

	return T( 'attribution', { special: special });
}

function stateLocator() {
	var state = home && home.info && home.info.state;
	if( ! state  ||  state == stateUS ) return '';
	var url = state.where_to_vote;
	return url ? T( 'stateLocator', { url:url } ) : '';
}

function locationWarning() {
	return home && home.info && vote.locations && vote.locations.length ?
		T('locationWarning') :
		'';
}

function electionInfo() {
	var elections = [];
	var state = home && home.info && home.info.state;
	return S(
		generalInfo( state ),
		elections.join(''),
		infoLinks(),
		attribution()
	);
}

function generalInfo( state ) {
	if( ! state ) return '';
	
	var comments = state.comments;  // TODO
	if( comments ) comments = S(
		'<div style="margin-bottom:0.5em;">',
			comments,
		'</div>'
	);
	
	var absenteeLinkTitle = {
		//'Early': 'Absentee ballot and early voting information',
		'Early': 'Absentee ballot information',
		'Mail': 'Vote by mail information'
	}[state.absentee] || 'Get an absentee ballot';
	
	var absentee = S(
		'<div style="margin-bottom:0.5em;">',
			fix( state.absentee_auto == 'TRUE' ?
				'Any %S voter may vote by mail.' :
				'Some %S voters may qualify to vote by mail.'
			),
		'</div>',
		infolink( 'absentee_info', absenteeLinkTitle )
	);
	
	return S(
		'<div style="margin-bottom:0.5em;">',
			'<div class="heading" style="margin-bottom:0.75em;">',
				fix( 'How to vote in %S' ),
			'</div>',
			infolink( 'election_website', '%S election website' ),
			infolink( 'are_you_registered', 'Are you registered to vote?' ),
			absentee,
			//infolink( 'registration_info', state.abbr == 'ND' ? '%S voter qualifications' : 'How to register in %S', true ),
			'<div style="margin:1.0em 0 0.5em 0;">',
				state.name, ' voter hotline: ',
				'<span style="white-space:nowrap;">',
					state.hotline,
				'</span>',
			'</div>',
			comments,
			formatLeos(),
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
		var url = state[key];
		return ! url ? '' : S(
			'<div style="margin-bottom:0.5em;">',
				'<a target="_blank" href="', url, '">',
					fix( text, prefix ),
				'</a>',
			'</div>'
		);
	}
	
	function formatLeos() {
		var leos = vote && vote.poll && vote.poll.leoInfo || {};
		
		var out = [];
		leos.city_leo && leos.city_leo.forEach( function( leo ) {
			addLeo( out, leo );
		});
		addLeo( out, leos.county_leo );
		
		return ! out.length ? '' : S(
			'<div style="padding:0.5em 0 0.75em 0;">',
				'<div class="heading" style="margin-bottom:0.75em">',
					'Your Local Election Office',
				'</div>',
				out.length < 2 ? '' : S(
					'<div style="font-style:italic; margin-bottom:0.75em;">',
						'Your local election offices are listed below, but we were unable to determine which one serves your location. Please contact each office for more information:',
					'</div>'
				),
				out.join('<div style="padding:0.5em;"></div>'),
			'</div>'
		);
	}
	
	function addLeo( out, leo ) {
		//if( ! leo  ||  ! leo.authority_name ) return;
		//
		//var a = {
		//	name: H( leo.authority_name ),
		//	place: H( leo.municipality_name || leo.county_name ),
		//	line1: H( leo.street || leo.mailing_street ),
		//	city: H( leo.city || leo.mailing_city ),
		//	state: H( leo.state || leo.mailing_state || vote.poll.stateInfo.state_abbr ),
		//	zip: H( leo.zip || leo.mailing_zip ),
		//	hours: H( leo.hours ),
		//	phone: H( leo.phone ),
		//	fax: H( leo.fax ),
		//	email: H( leo.email ),
		//	url: H( leo.website )
		//}
		//if( /^\d/.test(a.url) ) a.url = '';  // weed out phone numbers
		//
		//var directions =
		//	a.line1 && a.city && a.state && a.zip &&
		//	! /^PO /i.test(a.line1) &&
		//	! /^P\.O\. /i.test(a.line1) &&
		//	! /^BOX /i.test(a.line1);
		//
		//out.push( S(
		//	'<div>',
		//		'<div style="margin-bottom:0.15em;">',
		//			linkIf( a.name, a.url ),
		//		'</div>',
		//		'<div>',
		//			a.line1,
		//		'</div>',
		//		'<div>',
		//			a.city ? S( a.city, ', ', a.state, ' ', a.zip || '' ) : '',
		//		'</div>',
		//		'<div>',
		//			'<table cellspacing="0" cellpadding="0">',
		//				a.phone ? '<tr><td>Phone:&nbsp;</td><td>' + a.phone + '</td></tr>' : '',
		//				a.fax ? '<tr><td>Fax:&nbsp;</td><td>' + a.fax + '</td></tr>' : '',
		//			'</table>',
		//		'</div>',
		//		//a.email ? S( '<div>', 'Email: ', linkto(a.email), '</div>' ) : '',
		//		'<div>',
		//			a.hours ? S( 'Hours: ', a.hours ) : '',
		//		'</div>',
		//		! directions ? '' : S(
		//			'<div style="margin-top:0.1em;">',
		//			'</div>',
		//			directionsLink( home, {
		//				info: {
		//					accuracy: Accuracy.address,
		//					address: oneLineAddress( a )
		//				}
		//			})
		//		),
		//	'</div>'
		//) );
	}
}

function perElectionInfo( state, electionDay, electionName ) {
	
	var sameDay = state.same_day != 'TRUE' ? '' : S(
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
		deadline( state, 'abs_request_postmark', 'armail' ),
		deadline( state, 'abs_request_receive', 'arreceive' ),
		deadline( state, 'abs_vote_postmark', 'avmail' ),
		deadline( state, 'abs_vote_receive', 'avreceive' )
	);
	var deadlines = (
		deadline( state, 'postmark', 'mail' )  || deadline( state, 'receive', 'receive' )
	) + deadline( state, 'in_person', 'inperson' );
	//if( ! deadlines  &&  state.abbr != 'ND'  &&  state.same_day != 'TRUE' )
	//	deadlines = S(
	//		'<div style="margin-bottom:0.75em;">',
	//			'The deadline to mail your registration for the November 3, 2009 general election has passed. ',
	//			//state.reg_comments || '',
	//		'</div>'
	//	);
	var cands = candidates();
	return deadlines || absentee || sameDay || cands ? S(
		'<div style="margin-bottom:0.5em;">',
			'<div class="heading" style="margin:0.75em 0;">',
				formatDate(electionDay), ' ', electionName,
			'</div>',
			deadlines || '',
			'<div style="margin-bottom:1em;">',
				absentee,
			'</div>',
			sameDay,
			cands,
		'</div>'
	) : '';
	
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
	
	function deadline( state, key, type ) {
		var before = +state[key];
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
				'Note: Most post offices are closed today. You can still mail your ' + dt.type + ' if your post office is open and has a collection today.' :
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
		var contests = getContests();
		if( ! contests ) return '';
		contests = sortArrayBy( contests, 'ballot_placement', { numeric:true } );
		var randomize = contests[0].ballot.candidate[0].order_on_ballot == null;
		var randomizedMessage = ! randomize ? '' : S(
			'<div style="font-size:85%; font-style:italic; margin-top:0.5em">',
				T('candidateRandomOrder'),
			'</div>'
		);
		var linkText = 'Sample Ballot'
		var ballotLink = ! vote.ballotLink ? '' : S(
			'<div style="padding:0 0 0.75em 0;">',
				'<a target="_blank" href="', vote.ballotLink, '" title="', linkText, '">',
					'<img style="border:0; width:17px; height:17px; margin-right:6px;" src="', imgUrl('pdficon_small.gif'), '" />',
					linkText,
				'</a>',
			'</div>'
		);
		return S(
			ballotLink,
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
	
	var extra =
		home.info && home.info.latlng &&
		vote.info && vote.info.latlng &&
		directionsLink( home, vote );
	
	function voteLocation( infowindow ) {
		var loc = T('yourVotingLocation');
		if( !( vote.locations && vote.locations.length ) )
			return '';
		if( vote.info )
			return formatLocations( vote.locations, null,
				infowindow
					? { url:'vote-icon-50.png', width:50, height:50 }
					: { url:'vote-pin-icon.png', width:29, height:66 },
				loc, infowindow, extra, true
			);
		return infowindow ? '' : formatLocations( vote.locations, null,
			{ url:'vote-icon-32.png', width:32, height:32 },
			loc + ( vote.locations.length > 1 ? 's' : '' ), false, extra, false
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
			//stateLocator(),
			//locationWarning(),
			//'<div style="padding-top:0.75em">',
			//'</div>',
			//formatHome()
		) : S(
			formatHome(),
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
			home: formatHome(),
			location: voteLocation(),
			stateLocator: stateLocator(),
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

function formatHome( infowindow ) {
	return !( home && home.info ) ? '' : S(
		'<div style="', fontStyle, '">',
			formatLocations(
				null,
				home.info,
				infowindow
					? { url:'home-icon-50.png', width:50, height:50 }
					: { url:'home-pin-icon.png', width:29, height:57 },
				T('yourHome'), infowindow
			),
			//extra ? electionInfo() : '',
		'</div>'
	);
}

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
			if( home && home.info ) {
				var km = getDistance(
					place.geometry.location,
					home.info.place.geometry.location
				);
				log( km.toFixed(2) + ' kilometers to polling place' );
				if( km > 50 ) {
					log( 'Polling place is too far away' );
					setVoteNoGeo();
					return;
				}
				var st = getPlaceState( place );
				log( 'Polling state: ' + st.name );
				if( st != getPlaceState(home.info.place) ) {
					log( 'Polling place geocoded to wrong state' );
					setVoteNoGeo();
					return;
				}
				//if( details.Accuracy < Accuracy.intersection ) {
				//	log( 'Polling place geocoding not accurate enough' );
				//	setVoteNoGeo();
				//	return;
				//}
			}
		}
		catch( e ) {
			log( 'Error getting polling state' );
		}
		log( 'Getting polling place map info' );
		setMap( vote.info = mapInfoState( place, vote.locations[0] ) );
		return;
	}
	setVoteNoGeo();
}

function setVoteNoGeo() {
	setVoteHtml();
	forceDetails();
}

function oneLineAddress( address ) {
	if( ! address )
		return '';
	if( typeof address == 'string' )
		return H(address).replace( /, USA$/, '' );
	return H( S(
		address.line1 ? address.line1 + ', ' : '',
		address.line2 ? address.line2 + ', ' : '',
		address.city, ', ', address.state,
		address.zip ? ' ' + address.zip.slice(0,5) : ''
	) );
}

function multiLineAddress( address ) {
	if( ! address )
		return '';
	if( typeof address == 'string' )
		return H(address)
			.replace( /, USA$/, '' )
			.replace( /, (\w\w) /, '\| $1 ' )
			.replace( /, /g, '<br>' )
			.replace( /\|/g, ',' );
	return S(
		address.line1 ? H(address.line1) + '<br>' : '',
		address.line2 ? H(address.line2) + '<br>' : '',
		H(address.city), ', ', H(address.state),
		address.zip ? ' ' + H(address.zip.slice(0,5)) : ''
	);
}

function fixInputAddress( addr ) {
	if( addr == pref.example )
		addr = addr.replace( /^.*: /, '' );
	var state = statesByAbbr[ addr.toUpperCase() ];
	return state ? state.name : addr;
}

// Geocoding and Election Center API

function lookupPollingPlace( inputAddress, info, callback ) {
	
	function countyAddress() {
		return S( info.street, ', ', info.county, ', ', info.state.abbr, ' ', info.zip );
	}
	
	var state = stateByAbbr( info && info.address || inputAddress );
	if( state != stateUS ) {
		zoomTo( state.abbr );
		return;
	}
	
	// BEGIN DEMO CODE
	if( ! info  ||  /1600 Pennsylvania Ave NW.* 20500/.test( info.address ) ) {
		callback({
			status: 'SUCCESS',
			locations: [
				[{
					address: {
						line1: '2130 G ST NW',
						city: 'Washington',
						state: 'DC',
						zip: '20006',
						location_name: 'THE SCHOOL WITHOUT WALLS'
					}
				}]
			]
		});
		return;
	}
	// END DEMO CODE
	pollingApiState( info.place.formatted_address, function( poll ) {
		if( pollOK(poll) )
			callback( poll );
		else
			pollingApiState( inputAddress, callback );
	});
}

function findPrecinct( place, inputAddress ) {
	if( place ) {
		log( 'Getting home map info' );
		home.info = mapInfoState( place );
		if( ! home.info  /*||  home.info.accuracy < Accuracy.address*/ ) { sorry(); return; }
		var state = getPlaceState( home.info.place )
		if( state ) $selectState.val( state.abbr );
	}
	
	lookupPollingPlace( inputAddress, home.info, function( poll ) {
		log( 'API status code: ' + poll.status || '(OK)' );
		vote.poll = poll;
		var norm = poll.normalized_input;
		//if( norm ) {
		//	home.info.street = norm.line1;
		//	if( norm.line2 ) home.info.street += '<br>' + norm.line2;
		//	home.info.city = norm.city.replace( 'Washington D.C.', 'Washington' );
		//	home.info.state = stateByAbbr( norm.state );
		//	home.info.zip = norm.zip;
		//}
		var locations = vote.locations = poll.locations && poll.locations[0];
		if( ! pollOK(poll)  ||  ! locations  ||  ! locations.length ) {
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

function gadgetReady() {
	initStates();
	
	var abbr = pref.state;
	if( ! abbr ) {
		var loc = google.loader && google.loader.ClientLocation;
		var address = loc && loc.address;
		if( address  &&  address.country == 'USA' ) abbr = address.region;
	}
	abbr = abbr || 'US';
	
	initMap( function() {
		$selectState.bind( 'change keyup', function( event ) {
			zoomTo( $selectState.val() );
		});
		
		setupTabs();
		if( pref.ready )
			submit( pref.address || pref.example );
		else
			zoomTo( abbr );
	});
}

function polyState( abbr ) {
	GoogleElectionMap.currentAbbr = abbr = abbr.toLowerCase();
	GoogleElectionMap.shapeReady = function( json ) {
		if( json.state != GoogleElectionMap.currentAbbr ) return;
		clearOverlays();
		var paths = new gm.MVCArray;
		json.shapes.forEach( function( poly ) {
			var path = new gm.MVCArray;
			paths.push( path );
			var points = poly.points;
			for( var point, i = -1;  point = points[++i]; )
				path.push( new gm.LatLng( point.y, point.x ) );
			path.push( new gm.LatLng( points[0].y, points[0].x ) );
		});
		var polygon = new gm.Polygon({
			paths: paths,
			strokeColor: '#000000',
			strokeWeight: 2,
			strokeOpacity: .7,
			fillColor: '#000000',
			fillOpacity: .07
		});
		addOverlay( polygon );
	};
	$.getScript( cacheUrl( S( opt.codeUrl, 'shapes/json/', abbr, '.js' ) ) );
}

function zoomTo( abbr ) {
	loadState( abbr, function( state ) {
		$('#Poll411SearchInput').val('');
		$selectState.val( abbr );
		home = { info:{ state:state }, leo:{ leo:{ localities:{} } } };
		vote = null;
		if( state != stateUS ) $details.html( electionInfo() );
		function latlng( lat, lng ) { return new gm.LatLng( +lat, +lng ) }
		var bounds = new gm.LatLngBounds(
			latlng( state.coord_south, state.coord_west ),
			latlng( state.coord_north, state.coord_east )
		);
		map.fitBounds( bounds );
		polyState( abbr );
		spin( false );
	});
}

function pollingApiState( addr, callback, options ) {
	pollingApi( addr, function( poll ) {
		if( pollOK(poll)  &&  poll.stateInfo ) {
			var state = stateByAbbr( poll.stateInfo.state_abbr );
			if( state ) $.extend( state, poll.stateInfo );
		}
		callback( poll );
	}, options );
}

function pollOK( poll ) {
	return poll.status == 'SUCCESS';
}

function mapInfoState( place, extra ) {
	return $.extend( mapInfo( place, extra ), {
		state: stateFromPlace( place )
	});
}

function stateFromPlace( place ) {
	var component = getAddressComponent( place, 'administrative_area_level_1' );
	var abbr = component && component.short_name;
	return abbr && stateByAbbr( abbr );
}
