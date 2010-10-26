#!/usr/bin/env python

# makepolys.py

import codecs
import json
import math
import os
import random
import re
import shutil
import stat
import sys
import time

from geo import Geo
import shpUtils

import states
#states = json.load( open('states.json') )

jsonpath = 'json'
shapespath = 'shapefiles'

geo = Geo()
keysep = '|'
states.byNumber = {}

useOther = {
	'CT': ( 'towns', 'cs09_d00' ),
	'MA': ( 'towns', 'cs25_d00' ),
	'NH': ( 'towns', 'cs33_d00' ),
	'VT': ( 'towns', 'cs50_d00' ),
	
	'KS': ( 'congressional', 'cd20_110' ),
	'NE': ( 'congressional', 'cd31_110' ),
	'NM': ( 'congressional', 'cd35_110' ),
}

districtNames = {
	'CD1': 'First Congressional District',
	'CD2': 'Second Congressional District',
	'CD3': 'Third Congressional District',
	'CD4': 'Fourth Congressional District',
}

def loadshapefile( filename ):
	print 'Loading shapefile %s' % filename
	t1 = time.time()
	shapefile = shpUtils.loadShapefile( '%s/%s' %( shapespath, filename ) )
	t2 = time.time()
	print '%0.3f seconds load time' %( t2 - t1 )
	return shapefile
	
#def randomColor():
#	def hh(): return '%02X' %( random.random() *128 + 96 )
#	return hh() + hh() + hh()

featuresByName = {}
def featureByName( feature ):
	info = feature['info']
	name = info['NAME']
	if name not in featuresByName:
		featuresByName[name] = {
			'feature': feature #,
			#'color': randomColor()
		}
	return featuresByName[name]

#def filterCONUS( features ):
#	result = []
#	for feature in features:
#		shape = feature['shape']
#		if shape['type'] != 5: continue
#		info = feature['info']
#		state = int(info['STATE'])
#		if state == 2: continue  # Alaska
#		if state == 15: continue  # Hawaii
#		if state == 72: continue  # Puerto Rico
#		result.append( feature )
#	return result

def featuresBounds( features ):
	bounds = [ [ None, None ], [ None, None ] ]
	for feature in features:
		shape = feature['shape']
		if shape['type'] == 5:
			for part in shape['parts']:
				bounds = geo.extendBounds( bounds, part['bounds'] )
	return bounds

def writeFile( filename, data ):
	f = open( filename, 'wb' )
	f.write( data )
	f.close()

def readShapefile( filename ):
	print '----------------------------------------'
	print 'Loading %s' % filename
	
	shapefile = loadshapefile( filename )
	features = shapefile['features']
	print '%d features' % len(features)
	
	#conus = filterCONUS( features )
	#conusBounds = featuresBounds( conus )
	
	#stateFeatures = filterCONUS( stateFeatures )
	#print '%d features in CONUS states' % len(stateFeatures)
	
	#writeFile( 'features.csv', shpUtils.dumpFeatureInfo(features) )
	
	nPoints = nPolys = 0
	places = {}
	for feature in features:
		shape = feature['shape']
		if shape['type'] != 5: continue
		info = feature['info']
		name = info['NAME'].decode( 'cp850' ).encode( 'utf-8' )
		name = re.sub( '^(\d+)\x00.*$', 'CD\\1', name )  # congressional district
		name = districtNames.get( name, name )
		state = info['STATE']
		key = name + keysep + state
		if key not in places:
			places[key] = {
				'name': name,
				'state': state,
				'maxarea': 0.0,
				'bounds': [ [ None, None ], [ None, None ] ],
				'shapes': []
			}
		place = places[key]
		shapes = place['shapes']
		for part in shape['parts']:
			nPolys += 1
			points = part['points']
			n = len(points) - 1
			nPoints += n
			pts = []
			area = part['area']
			if area == 0: continue
			bounds = part['bounds']
			place['bounds'] = geo.extendBounds( place['bounds'], bounds )
			centroid = part['centroid']
			if area > place['maxarea']:
				place['centroid'] = centroid
				place['maxarea'] = area
			points = part['points']
			for j in xrange(n):
				point = points[j]
				#pts.append( '[%.4f,%.4f]' %( float(point[0]), float(point[1]) ) )
				pts.append( '{x:%.4f,y:%.4f}' %( float(point[0]), float(point[1]) ) )
			#shapes.append( '{area:%.4f,bounds:[[%.4f,%.4f],[%.4f,%.4f]],centroid:[%.4f,%.4f],points:[%s]}' %(
			shapes.append( '{points:[%s]}' %(
				#area,
				#bounds[0][0], bounds[0][1], 
				#bounds[1][0], bounds[1][1], 
				#centroid[0], centroid[1],
				','.join(pts)
			) )
	print '%d points in %d places' %( nPoints, len(places) )
	return shapefile, places

def writeUS( places, path ):
	json = []
	keys = places.keys()
	keys.sort()
	for key in keys:
		abbr = states.byNumber[ places[key]['state'] ]['abbr'].lower()
		writeJSON( '%s.js' % abbr, getPlaceJSON( places, key, abbr, 'state' ) )

#def writeStates( places, path ):
#	p = {}
#	for k in places:
#		if places[k] != None:
#			p[k] = places[k]
#	places = p
#	keys = places.keys()
#	keys.sort()
#	for key in keys:
#		name, number = key.split(keysep)
#		state = states.byNumber[number]
#		state['json'].append( getPlaceJSON( places, key, state['abbr'].lower(), 'county' ) )
#	for state in states.array:
#		writeJSON( path, state['abbr'].lower(), state['json'] )

def writeJSON( path, json ):
	file = '%s/%s' %( jsonpath, path )
	print 'Writing %s' % file
	writeFile( file, 'GoogleElectionMap.shapeReady(%s)' %( json ) )

def getPlaceJSON( places, key, state, type ):
	place = places[key]
	if not place: return ''
	bounds = place['bounds']
	centroid = place['centroid']
	return '{name:"%s", type:"%s",state:"%s",bounds:[[%.4f,%.4f],[%.4f,%.4f]],centroid:[%.4f,%.4f],shapes:[%s]}' %(
		key.split(keysep)[0],
		type, state,
		bounds[0][0], bounds[0][1], 
		bounds[1][0], bounds[1][1], 
		centroid[0], centroid[1],
		','.join(place['shapes'])
	)

def generateUS( detail, path='' ):
	shapefile, places = readShapefile( 'states/st99_d00_shp-%s/st99_d00.shp' % detail )
	for key in places:
		name, number = key.split(keysep)
		state = states.byName[name]
		state['json'] = []
		state['counties'] = []
		state['number'] = number
		states.byNumber[number] = state
	writeUS( places, path )

#def generateStates( detail, path ):
#	shapefile, places = readShapefile( 'counties/co99_d00_shp-%s/co99_d00.shp' % detail )
#	for key, place in places.iteritems():
#		name, number = key.split(keysep)
#		state = states.byNumber[number]
#		abbr = state['abbr']
#		if abbr not in useOther:
#			state['counties'].append( place )
#		else:
#			places[key] = None
#	for abbr, file in useOther.iteritems():
#		state = states.byAbbr[abbr]
#		number = state['number']
#		othershapefile, otherplaces = readShapefile(
#			'%(base)s/%(name)s_shp-%(detail)s/%(name)s.shp' %{
#				'base': file[0],
#				'name': file[1],
#				'detail': detail
#			} )
#		for key, place in otherplaces.iteritems():
#			name, number = key.split(keysep)
#			state = states.byNumber[number]
#			state['counties'].append( place )
#			places[key] = place
#	writeStates( places, path )

#generateUS( 0, 'full' )
#generateUS( 25, '25' )

generateUS( '00' )
#generateStates( 80, 'detailed' )

print 'Done!'
