#print 'Content-Type: application/xml'
#print ''
#
#f = open( 'voter-info-gadget.xml', 'r' )
#xml = f.read()
#f.close()
#
#print xml

#import re
#from pprint import pformat, pprint

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

#def dumpRequest( req ):
#	return pformat({
#		'environ': req.environ,
#		'url': req.url,
#		'headers': req.headers,
#	})

#def addDump( xml, req ):
#	dr = dumpRequest( req )
#	dr = re.sub( r'\}', '\n}', dr )
#	dr = re.sub( r"'wsgi[^\n]+\n", '', dr )
#	dr = re.sub ( r'\n\s*', ' ', dr )
#	dr = re.sub ( r',\s*\}', '}', dr )
#	return xml.replace( 'var opt =', 'alert( (' + dr + ').toSource() );\n\n\tvar opt =' )  # poor man's template
	
class GadgetHandler( webapp.RequestHandler ):
	def get( self, dump, debug ):
		self.response.headers['Content-Type'] = 'application/xml'
		if debug == None: debug = ''
		f = open( 'voter-info-gadget.xml', 'r' )
		xml = f.read()
		f.close()
		xml = xml.replace( '{{debug}}', debug )  # poor man's template
		#if dump:
		#	xml = addDump( xml, self.request )
		self.response.out.write( xml )

application = webapp.WSGIApplication([
	( r'/(dump-)?(.+)?voter-info-gadget\.xml', GadgetHandler )
], debug = True )

def main():
	run_wsgi_app( application )

if __name__ == '__main__':
	main()
