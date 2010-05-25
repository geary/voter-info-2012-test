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
	fields.each { |field|
		f = (root/field)
		result[field] = f.text if f.text != ''
	}
	result
end

def fix_phone text
	text.sub!( /^(\d{3})(\d{3})(\d{4})$/, '(\1) \2-\3' ) if text
end

def convert abbr
	xml_path = "#{abbr.downcase}-leo.xml"
	json_path = "#{abbr.downcase}-leo.json"
	
	localities = {}
	counties = {}
	cities = {}
	admins = {}
	officials = {}

	print "Reading #{xml_path}\n"
	
	begin
		xml = File.open( xml_path, 'r' ).read
	rescue
		xml = nil
	end
	
	if xml
		doc = Hpricot::XML( xml )
		vip = (doc/:vip_object)
		
		print "Getting election officials\n"
		
		(vip/:election_official).each { |official|
			id = official[:id]
			officials[id] = o = make_hash(
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
			admins[id] = a = make_hash(
				admin,
				[ :name, :elections_url ]
			)
			a[:address] = address = make_hash(
				(admin/:physical_address),
				[ :location_name, :line1, :line2,  :city, :state, :zip ]
			)
			address.delete(:line2) if address[:line2] == a[:elections_url]
			a[:official] = officials[ (admin/:eo_id).text ]
		}
		
		print "Getting localities\n"
		
		mixups = []
		
		(vip/:locality).each { |locality|
			name = (locality/:name).text
			type = (locality/:type).text
			#admin = admins[ (locality/:election_administration_id).text ]
			admin_id = (locality/:election_administration_id).text
			admin = admins[admin_id]
			admin_name = admin[:name]
			id = locality[:id]
			localities[id] = admin
			if abbr == 'va'
				oops = false
				if type == 'COUNTY'
					counties[ name.sub( / COUNTY$/, '' ) ] = id
					oops = ! admin_name.match( / County General Registrar$/ )
				elsif type == 'Independent City'
					cities[ name.sub( / CITY$/, '' ) ] = id
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
	end
	
	json = {
		:state => abbr.downcase,
		:localities => localities,
		:cities => cities,
		:counties => counties
	}.to_json
	
	#print json
	
	print "Writing #{json_path}\n"
	
	File.open( json_path, 'w' ) { |f| f.write json }
end

def convert_all
	STATES.each { |state| convert state['abbr'] }
	#convert 'VA'
end

begin
	convert_all
	print "Done!\n"
rescue Quit
	print "Error: #{$!}\n"
end
