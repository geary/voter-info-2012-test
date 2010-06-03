#!/usr/bin/env ruby

#require 'rubygems'
require 'hpricot'
require 'json'

def read_json name
	return JSON.parse( File.open( name, 'r' ).read )
end

STATES = read_json 'states.json'

class Quit < Exception
end

def make_hash( root, fields )
	result = {}
	fields.each { |field| add_hash( result, field, root, field ) }
	result
end

def add_hash( hash, key, root, field )
	f = (root/field)
	hash[key] = f.text if f.text != ''
end

def fix_phone text
	text.sub!( /^(\d{3})(\d{3})(\d{4})$/, '(\1) \2-\3' ) if text
end

class Converter
	
	def initialize abbr
		@abbr = abbr
		@xml_path = "#{abbr}.xml"
		@json_path = "#{abbr.downcase}-leo.js"
		
		@localities = {}
		@counties = {}
		@cities = {}
		@admins = {}
		@officials = {}
	end
	
	def convert
		print "Reading #{@xml_path}\n"
		
		begin
			xml = File.open( @xml_path, 'r' ).read
		rescue
			xml = nil
		end
		
		if xml
			@doc = Hpricot::XML( xml )
			convert_vip || convert_old || error
		end
		
		json = {
			:state => @abbr.downcase,
			:localities => @localities,
			:cities => @cities,
			:counties => @counties
		}.to_json
		#print json
		
		js = "GoogleElectionMap.leoReady(#{json})"
		
		print "Writing #{@json_path}\n"
		File.open( @json_path, 'w' ) { |f| f.write js }
	end
	
	def convert_vip
		vip = (@doc/:vip_object)
		return false if vip.length == 0
		
		print "Getting election officials\n"
		
		(vip/:election_official).each { |official|
			id = official[:id]
			@officials[id] = o = make_hash(
				official,
				#[ :name, :title, :phone, :fax, :email ]
				[ :phone, :fax ]
			)
			fix_phone o[:phone]
			fix_phone o[:fax]
		}
		
		print "Getting election administrations\n"
		
		(vip/:election_administration).each { |admin|
			id = admin[:id]
			next if id.to_i < 10000  # skip state
			@admins[id] = a = make_hash(
				admin,
				[ :name, :elections_url ]
			)
			a[:address] = address = make_hash(
				(admin/:physical_address),
				[ :location_name, :line1, :line2,  :city, :state, :zip ]
			)
			address.delete(:line2) if address[:line2] == a[:elections_url]
			a[:official] = @officials[ (admin/:eo_id).text ]
		}
		
		print "Getting localities\n"
		
		mixups = []
		
		(vip/:locality).each { |locality|
			name = (locality/:name).text
			type = (locality/:type).text
			#admin = @admins[ (locality/:election_administration_id).text ]
			admin_id = (locality/:election_administration_id).text
			admin = @admins[admin_id]
			admin_name = admin[:name]
			id = locality[:id]
			@localities[id] = admin
			if @abbr == 'VA'
				oops = false
				if type == 'COUNTY'
					@counties[ name.sub( / COUNTY$/, '' ) ] = id
					oops = ! admin_name.match( / County General Registrar$/ )
				elsif type == 'Independent City'
					@cities[ name.sub( / CITY$/, '' ) ] = id
					oops = ! admin_name.match( / City General Registrar$/ )
				else
					print "#{name} is a #{type}, not a city or a county!\n"
				end
				if oops
						mixups.push "#{name} registrar is #{admin_name} in #{admin[:address][:city]} (id:#{admin_id})\n"
				end
			end
		}
		
		print mixups.sort.join('')
		
		true
	end
	
	def convert_old
		print "Getting election officials\n"
		
		eo = (@doc/:election_official)
		return false if eo.length == 0
		
		eo.each { |official|
			id = official[:id]
			next if id == ''
			county = (official/:county_name).text
			next if county == ''
			@counties[county] = id
			@localities[id] = locality = {}
			add_hash( locality, :name, official, :title )
			locality[:official] = o = make_hash(
				official,
				#[ :name, :title, :phone, :fax, :email ]
				[ :phone, :fax ]
			)
			fix_phone o[:phone]
			fix_phone o[:fax]
		}
		
		true
	end
	
	def error
		print 'Failed'
	end
	
end

def convert_all
	STATES.each { |state| Converter.new( state['abbr'] ).convert }
	#convert 'VA'
end

begin
	convert_all
	print "Done!\n"
rescue Quit
	print "Error: #{$!}\n"
end
