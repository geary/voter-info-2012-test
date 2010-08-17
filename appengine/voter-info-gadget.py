#print 'Content-Type: application/xml'
#print ''
#
#f = open( 'voter-info-gadget.xml', 'r' )
#xml = f.read()
#f.close()
#
#print xml

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

class GadgetHandler( webapp.RequestHandler ):
	def get( self, debug ):
		self.response.headers['Content-Type'] = 'application/xml'
		if debug == None: debug = ''
		f = open( 'voter-info-gadget.xml', 'r' )
		xml = f.read()
		xml = xml.replace( '{{debug}}', debug )  # poor man's template
		f.close()
		self.response.out.write( xml )

application = webapp.WSGIApplication([
	( r'/(.+)?voter-info-gadget\.xml', GadgetHandler )
], debug = True )

def main():
	run_wsgi_app( application )

if __name__ == '__main__':
	main()
