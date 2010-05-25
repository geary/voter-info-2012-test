// Copyright 2010 Michael Geary
// http://mg.to/
// Free Beer and Free Speech License (any OSI license)
// http://freebeerfreespeech.org/

document.write(
	'<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery', opt.debug ? '' : '.min', '.js">',
	'</script>'
);

opt.writeScript( opt.old ? 'voter-info-main.js' : 'voter-info-iraq.js' );
