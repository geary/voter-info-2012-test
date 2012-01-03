<?php

$jsonp = $_GET['jsonp'];
$file = $_GET['file'];

$ok =
	preg_match( '/^templates\/[^.]+\.html$/', $file ) ||
	preg_match( '/^leo\/states-spreadsheet\.json$/', $file );

if( $ok ) {
	$fh = fopen( $file, 'r' );
	$data = fread( $fh, 1000000 );
	fclose( $fh );
	$result = array( 'result' => $data );
}
else {
	$result = array( 'error' => 'File missing from whitelist' );
}

$result = json_encode( $result );
if( $jsonp ) $result = $jsonp . '(' . $result . ')';

echo $result;

?>
